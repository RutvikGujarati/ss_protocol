import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import PropTypes from "prop-types";
import { ethers } from "ethers";
import { useAccount, useChainId } from "wagmi";
import { ContractContext } from "./ContractInitialize";
import {
  Auction_TESTNET,
  DAV_TESTNET,
  STATE_TESTNET,
} from "../ContractAddresses";

export const DAVContext = createContext();

const ERC20_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
];

export const DavProvider = ({ children }) => {
  const { AllContracts, signer } = useContext(ContractContext);
  const { address, isConnected } = useAccount();
  const chainId = useChainId();

  const [isLoading, setLoading] = useState(true);
  const [BurnClicked, setClicked] = useState(false);
  const [Claiming, setClaiming] = useState(false);

  const [data, setData] = useState({
    Supply: "0.0",
    stateHolding: "0.0",
    ReferralCodeOfUser: "0.0",
    ReferralAMount: "0.0",
    claimableAmount: "0.0",
    claimableAmountForBurn: "0.0",
    UserPercentage: "0.0",
    TimeUntilNextClaim: "0.0",
    AllUserPercentage: "0.0",
    stateHoldingOfSwapContract: "0.0",
    ContractPls: "0.0",
    davHolds: "0.0",
    davPercentage: "0.0",
  });

  const fetchAndSet = async (label, fn, format = true, fixed = 2) => {
    try {
      const res = await fn();
      setData((prev) => ({
        ...prev,
        [label]: format
          ? parseFloat(ethers.formatUnits(res, 18)).toFixed(fixed)
          : res.toString(),
      }));
    } catch (err) {
      console.error(`Error fetching ${label}:`, err);
    }
  };

  const fetchData = useCallback(async () => {
    if (!AllContracts?.davContract || !address) return;

    setLoading(true);
    try {
      await Promise.all([
        fetchAndSet("Supply", () => AllContracts.davContract.totalSupply()),
        fetchAndSet("claimableAmount", () =>
          AllContracts.davContract.earned(address)
        ),
        fetchAndSet("claimableAmountForBurn", () =>
          AllContracts.davContract.getClaimablePLS(address)
        ),
        fetchAndSet(
          "UserPercentage",
          () => AllContracts.davContract.getUserSharePercentage(address),
          false,
          0
        ),
        fetchAndSet(
          "AllUserPercentage",
          () => AllContracts.davContract.getAllUsersBurnedPercentageSum(),
          false,
          0
        ),

        fetchAndSet("ContractPls", () =>
          AllContracts.davContract.stateLpTotalShare()
        ),
        fetchAndSet("davHolds", () =>
          AllContracts.davContract.balanceOf(address)
        ),
        fetchAndSet("davPercentage", () =>
          AllContracts.davContract.getUserHoldingPercentage(address)
        ),
        fetchAndSet("stateHolding", () =>
          AllContracts.stateContract.balanceOf(address)
        ),
        fetchAndSet("stateHoldingOfSwapContract", () =>
          AllContracts.stateContract.balanceOf(Auction_TESTNET)
        ),

        fetchAndSet(
          "ReferralCodeOfUser",
          () => AllContracts.davContract.getUserReferralCode(address),
          false
        ),
        fetchAndSet("ReferralAMount", () =>
          AllContracts.davContract.referralRewards(address)
        ),
      ]);
    } catch (error) {
      console.error("Error fetching contract data:", error);
    } finally {
      setLoading(false);
    }
  }, [AllContracts, address]);

  useEffect(() => {
    if (address && AllContracts?.davContract) fetchData();
  }, [address, AllContracts?.davContract]);

  const fetchTimeUntilNextClaim = useCallback(async () => {
    if (!AllContracts?.davContract || !address) return;
    try {
      await fetchAndSet(
        "TimeUntilNextClaim",
        () => AllContracts.davContract.getTimeUntilNextClaim(address),
        false,
        0
      );
    } catch (error) {
      console.error("Error fetching time until next claim:", error);
    }
  }, [AllContracts, address]);

  useEffect(() => {
    if (!AllContracts?.davContract || !address) return;

    const interval = setInterval(() => {
      fetchTimeUntilNextClaim();
    }, 1000); // run every second

    return () => clearInterval(interval); // clean up on unmount
  }, [fetchTimeUntilNextClaim, AllContracts?.davContract, address]);

  console.log("user percentage", data.UserPercentage);
  console.log("all user percentage", data.AllUserPercentage);
  useEffect(() => {
    if (isConnected && AllContracts?.davContract) {
      fetchData();
    }
  }, [isConnected, AllContracts]);

  const mintDAV = async (amount, ref = "") => {
    if (!AllContracts?.davContract) return;
    const ethAmount = ethers.parseEther(amount.toString());
    const cost = ethers.parseEther(
      (amount * (chainId === 146 ? 100 : 1000000)).toString()
    );
    const referral = ref.trim() || "0x0000000000000000000000000000000000000000";

    try {
      const tx = await AllContracts.davContract.mintDAV(ethAmount, referral, {
        value: cost,
      });
      await tx.wait();
      await fetchData();
      return tx;
    } catch (error) {
      console.error("Minting error:", error);
      throw error;
    }
  };

  const claimAmount = async () => {
    if (!AllContracts?.davContract) return;
    try {
      const tx = await AllContracts.davContract.claimReward();
      await tx.wait();
      await fetchData();
    } catch (err) {
      console.error("Claim error:", err);
    }
  };

  const claimBurnAmount = async () => {
    if (!AllContracts?.davContract) return;
    try {
      setClaiming(true);
      const tx = await AllContracts.davContract.claimPLS();
      await tx.wait();
	  await fetchData();
    } catch (err) {
      console.error("Burn claim error:", err);
    } finally {
      setClaiming(false);
    }
  };

  const BurnStateTokens = async (amount) => {
    if (!AllContracts?.davContract) return;
    try {
      setClicked(true);
      const weiAmount = ethers.parseUnits(amount.toString(), 18);
      const tokenContract = new ethers.Contract(
        STATE_TESTNET,
        ERC20_ABI,
        signer
      );

      await (await tokenContract.approve(DAV_TESTNET, weiAmount)).wait();
      await (await AllContracts.davContract.burnState(weiAmount)).wait();

      setClicked(false);
      await fetchData();
      await fetchTimeUntilNextClaim();
    } catch (err) {
      console.error("Burn error:", err);
      setClicked(false);
    }
  };

  DavProvider.propTypes = {
    children: PropTypes.node.isRequired,
  };

  return (
    <DAVContext.Provider
      value={{
        ...data,
        isLoading,
        BurnClicked,
        Claiming,
        mintDAV,
        BurnStateTokens,
        claimAmount,
        claimBurnAmount,
        fetchData,
      }}
    >
      {children}
    </DAVContext.Provider>
  );
};

export const useDAvContract = () => useContext(DAVContext);
