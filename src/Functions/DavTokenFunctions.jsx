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
import toast from "react-hot-toast";

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
  const [users, setUsers] = useState([]);
  const [names, setNames] = useState([]);
  const [Emojies, setEmojies] = useState([]);
  const [TokenStatus, setTokenStatus] = useState([]);
  const [isUsed, setisUsed] = useState([]);
  const [isProcessing, setIsProcessing] = useState(null);
  const [isProcessingToken, setProcessToken] = useState(false);

  const [data, setData] = useState({
    Supply: "0.0",
    stateHolding: "0.0",
    ReferralCodeOfUser: "0.0",
    ReferralAMount: "0.0",
    totalStateBurned: "0.0",
    pendingToken: "0.0",
    claimableAmount: "0.0",
    usableTreasury: "0.0",
    tokenEntries: null,
	expectedClaim:"0.0",
    CanClaimNow: "false",
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
      let value;

      if (label === "UserPercentage") {
        value = (Number(res) / 100).toFixed(fixed);
      } else {
        value = format
          ? parseFloat(ethers.formatUnits(res, 18)).toFixed(fixed)
          : res.toString();
      }

      setData((prev) => ({
        ...prev,
        [label]: value,
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
        fetchAndSet("userBurnedAmount", () =>
          AllContracts.davContract.userBurnedAmount(address)
        ),

        fetchAndSet(
          "UserPercentage",
          () => AllContracts.davContract.getUserSharePercentage(address),
          true, // Enable formatting
          2 // Keep 2 decimal places
        ),
        fetchAndSet(
          "AllUserPercentage",
          () => AllContracts.davContract.getAllUsersBurnedPercentageSum(),
          false,
          0
        ),

        fetchAndSet("totalStateBurned", () =>
          AllContracts.davContract.totalStateBurned()
        ),
        fetchAndSet("davHolds", () =>
          AllContracts.davContract.balanceOf(address)
        ),

        fetchAndSet(
          "pendingToken",
          () => AllContracts.davContract.getPendingTokenNames(address),
          false
        ),

        fetchAndSet(
          "davPercentage",
          () => AllContracts.davContract.getUserHoldingPercentage(address),
          false
        ),
        fetchAndSet("stateHolding", () =>
          AllContracts.stateContract.balanceOf(address)
        ),
        fetchAndSet("stateHoldingOfSwapContract", () =>
          AllContracts.stateContract.balanceOf(Auction_TESTNET)
        ),
        fetchAndSet(
          "tokenEntries",
          () => AllContracts.davContract.getAllTokenEntries(),
          false
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
  console.log("dav entries", data.tokenEntries);
  const fetchAndStoreTokenEntries = async () => {
    try {
      // Fetch token entries from the contract
      const tokenEntries = await AllContracts.davContract.getAllTokenEntries();

      // Extract addresses and token names
      const addresses = tokenEntries.map((entry) => entry.user);
      const tokenNames = tokenEntries.map((entry) => entry.tokenName);
      const tokenEmojis = tokenEntries.map((entry) => entry.emoji);
      const tokenStatus = tokenEntries.map((entry) => entry.TokenStatus);
      console.log("token status:,", tokenEntries);
      // Update state
      setUsers(addresses); // e.g., ["0x3Bdbb84B90aBAf52814aAB54B9622408F2dCA483"]
      setNames(tokenNames); // e.g., ["rutvik"]
      setEmojies(tokenEmojis); // e.g., ["rutvik"]
      setTokenStatus(tokenStatus); // e.g., ["rutvik"]
    } catch (error) {
      console.error("Error fetching token entries:", error);
    }
  };

  const isTokenDeployed = async () => {
    try {
      const results = await Promise.all(
        names.map((name) => AllContracts.AuctionContract.isTokenNameUsed(name))
      );

      // Store the results directly as an array of booleans in the state
      setisUsed(results); // Assuming setisUsed accepts an array of booleans
    } catch (error) {
      console.log("Error getting deployed details", error);
    }
  };

  useEffect(() => {
    if (address && AllContracts?.davContract) fetchData();
  }, [address, AllContracts?.davContract]);

  isTokenDeployed();
  console.log("from entry", users); // e.g., "0x3Bdbb84B90aBAf52814aAB54B9622408F2dCA483"
  console.log("from entry", names[0]);
  const fetchTimeUntilNextClaim = useCallback(async () => {
    if (!AllContracts?.davContract || !address) return;
    try {
      await fetchAndSet(
        "TimeUntilNextClaim",
        () => AllContracts.davContract.getTimeUntilNextClaim(),
        false,
        0
      );
      fetchAndSet("claimableAmountForBurn", () =>
        AllContracts.davContract.getClaimablePLS(address)
      ),
      fetchAndSet("expectedClaim", () =>
        AllContracts.davContract.getExpectedClaimablePLS(address)
      ),
        fetchAndSet("usableTreasury", () =>
          AllContracts.davContract.getAvailableCycleFunds()
        ),
        fetchAndSet("ContractPls", () =>
          AllContracts.davContract.getContractPLSBalance()
        ),
        fetchAndSet(
          "CanClaimNow",
          async () =>
            (await AllContracts.davContract.canClaim(address))
              ? "true"
              : "false",
          false
        );
    } catch (error) {
      console.error("Error fetching time until next claim:", error);
    }
  }, [AllContracts, address]);

  useEffect(() => {
    if (!AllContracts?.davContract || !address) return;

    const interval = setInterval(() => {
      fetchTimeUntilNextClaim();
      fetchAndStoreTokenEntries();
    }, 1000); // run every second

    return () => clearInterval(interval); // clean up on unmount
  }, [fetchTimeUntilNextClaim, AllContracts?.davContract, address]);

  useEffect(() => {
    console.log("tim left:", data.TimeUntilNextClaim);
    if (data.TimeUntilNextClaim === 0) {
      fetchData();
    }
  }, [data.TimeUntilNextClaim]);

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
      (amount * (chainId === 146 ? 100 : 10000)).toString()
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
  const AddYourToken = async (amount, Emoji) => {
    if (!AllContracts?.davContract) return;

    // Define the cost based on the chainId
    const cost = ethers.parseEther((chainId === 146 ? 100 : 10).toString());

    try {
      // Check if the address is the VITE_AUTH_ADDRESS, if so, pass no value for ether

      setProcessToken(true);
      const tx =
        address == import.meta.env.VITE_AUTH_ADDRESS
          ? await AllContracts.davContract.ProcessYourToken(amount, Emoji)
          : await AllContracts.davContract.ProcessYourToken(amount, Emoji, {
              value: cost,
            });

      // Wait for the transaction to be mined
      await tx.wait();

      // Fetch updated data
      await fetchData();

      // Return the transaction object
      return tx;
    } catch (error) {
      console.error("Minting error:", error);
      setProcessToken(false);
      throw error;
    } finally {
      setProcessToken(false);
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
  const deployWithMetaMask = async (name, symbol, emoji, five, swap, gov) => {
    if (!AllContracts?.AuctionContract) return;
    try {
      setIsProcessing(name); // Start processing
      const tx = await AllContracts.AuctionContract.deployUserToken(
        name,
        symbol,
        emoji,
        five,
        swap,
        gov
      );
      await tx.wait();
      await fetchData();
      await isTokenDeployed();
    } catch (err) {
      console.error("Claim error:", err);
    } finally {
      setIsProcessing(null);
    }
  };

  const claimBurnAmount = async () => {
    if (!AllContracts?.davContract) return;
    try {
      setClaiming(true);
      const tx = await AllContracts.davContract.claimPLS();
      await tx.wait();
      await fetchData();
      toast.success("Claimed PLS!", {
        position: "top-center", // Centered
        autoClose: 6000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
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
      if (err?.reason && err.reason.includes("Claim your PLS before burning")) {
        toast.error("Claim your pending PLS first!", {
          position: "top-center",
          autoClose: 7000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
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
        AddYourToken,
        fetchData,
        deployWithMetaMask,
        users,
        isProcessingToken,
        names,
        Emojies,
        TokenStatus,
        isProcessing,
        isUsed,
      }}
    >
      {children}
    </DAVContext.Provider>
  );
};

export const useDAvContract = () => useContext(DAVContext);
