import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { ethers } from "ethers";
import { ContractContext } from "./ContractInitialize";
import PropTypes from "prop-types";
import { useAccount, useChainId } from "wagmi";
import { DAV_TESTNET, STATE_TESTNET } from "../ContractAddresses";

export const DAVContext = createContext();

export const DavProvider = ({ children }) => {
  const { AllContracts } = useContext(ContractContext);
  const { address } = useAccount();
  const chainId = useChainId();
  const { signer } = useContext(ContractContext);

  const [isLoading, setIsLoading] = useState(true);
  const [BurnClicked, setIsClicked] = useState(false);
  const [Claiming, setClaiming] = useState(false);
  const [Supply, setSupply] = useState("0.0");
  const [stateHolding, setStateHolding] = useState("0.0");
  const [ReferralCodeOfUser, setReferralCode] = useState("0.0");
  const [ReferralAMount, setReferralAmount] = useState("0.0");
  const [claimableAmount, setClaimableAmount] = useState("0.0");
  const [claimableAmountForBurn, setClaimableAmountForBurn] = useState("0.0");
  const [UserPercentage, setBurnUserPercentage] = useState("0.0");
  const [ContractPls, setContractPls] = useState("0.0");
  const [davHolds, setDavHoldings] = useState("0.0");

  /*** Fetch Total Supply ***/
  const DavSupply = useCallback(async () => {
    if (!AllContracts?.davContract) return;
    try {
      const supply = await AllContracts.davContract.totalSupply();
      setSupply(ethers.formatUnits(supply, 18));
    } catch (error) {
      console.error("Error fetching total supply:", error);
    }
  }, [AllContracts]);

  const DavHoldings = useCallback(async () => {
    if (!AllContracts?.davContract) {
      console.log("DAV contract or address not initialized...");
      return;
    }
    try {
      const holdings = await AllContracts.davContract.balanceOf(address);
      setDavHoldings(ethers.formatUnits(holdings, 18));
    } catch (error) {
      console.error("Error fetching DAV holdings:", error);
    }
  }, [AllContracts, address]);
  const StateHoldings = useCallback(async () => {
    if (!AllContracts?.davContract) {
      console.log("DAV contract or address not initialized...");
      return;
    }
    try {
      const holdings = await AllContracts.stateContract.balanceOf(address);
      setStateHolding(ethers.formatUnits(holdings, 18));
    } catch (error) {
      console.error("Error fetching DAV holdings:", error);
    }
  }, [AllContracts, address]);
  /*** Fetch Claimable Amount ***/
  const ClaimableAmount = useCallback(async () => {
    if (!AllContracts?.davContract || !address) return;
    try {
      const supply = await AllContracts.davContract.earned(address);
      setClaimableAmount(parseFloat(ethers.formatUnits(supply, 18)).toFixed(2));
    } catch (error) {
      console.error("Error fetching claimable amount:", error);
    }
  }, [AllContracts, address]);

  const ClaimableAmountInBurn = useCallback(async () => {
    if (!AllContracts?.davContract || !address) return;

    try {
      const burnInfo = await AllContracts.davContract.getRemainingClaimablePLS(
        address
      );
      const amountInEth = ethers.formatUnits(burnInfo, 18);
      setClaimableAmountForBurn(parseFloat(amountInEth).toFixed(2));
    } catch (error) {
      console.error("Error fetching claimable amount:", error);
    }
  }, [AllContracts, address]);

  const PercentageOfBurn = useCallback(async () => {
    if (!AllContracts?.davContract || !address) return;

    try {
      const burnInfo = await AllContracts.davContract.getUserSharePercentage(
        address
      );

      console.log("user burn percentage", ethers.formatUnits(burnInfo, 2));
      setBurnUserPercentage(ethers.formatUnits(burnInfo, 0)); // adjust decimals if needed
    } catch (error) {
      console.error("Error fetching claimable amount:", error);
    }
  }, [AllContracts, address]);

  const TreasuryBalance = useCallback(async () => {
    if (!AllContracts?.davContract || !address) return;

    try {
      const burnInfo = await AllContracts.davContract.getContractPLSBalance();
      const amountInEth = ethers.formatUnits(burnInfo, 18);
      setContractPls(parseFloat(amountInEth).toFixed(2));
    } catch (error) {
      console.error("Error fetching claimable amount:", error);
    }
  }, [AllContracts]);

  /*** Mint DAV Tokens ***/
  const mintDAV = async (amount, amount2) => {
    if (!AllContracts?.davContract) return;
    try {
      const value = ethers.parseEther(amount.toString());
      let cost;
      if (chainId === 146) {
        cost = ethers.parseEther((amount * 100).toString());
      } else {
        cost = ethers.parseEther((amount * 1000000).toString());
      }

      if (!amount2 || amount2.trim() === "") {
        amount2 = "0x0000000000000000000000000000000000000000";
      }

      const transaction = await AllContracts.davContract.mintDAV(
        value,
        amount2,
        {
          value: cost,
        }
      );
      await transaction.wait();
      await fetchData();
      return transaction;
    } catch (error) {
      console.error("Minting error:", error);
      throw error;
    }
  };

  /*** Claim Rewards ***/
  const claimAmount = async () => {
    if (!AllContracts?.davContract) return;
    try {
      const transaction = await AllContracts.davContract.claimReward();
      await transaction.wait();
      await ClaimableAmount();
    } catch (error) {
      console.error("Error claiming rewards:", error);
    }
  };
  const claimBurnAmount = async () => {
    if (!AllContracts?.davContract) return;

    try {
      setClaiming(true);
      const transaction = await AllContracts.davContract.claimPLS();
      await transaction.wait();
      setClaiming(false);
    } catch (error) {
      console.error("Error claiming rewards:", error);
      setClaiming(false);
    } finally {
      setClaiming(false);
    }
  };

  const ERC20_ABI = [
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function allowance(address owner, address spender) external view returns (uint256)",
  ];
  const BurnStateTokens = async (amount) => {
    if (!AllContracts?.davContract) return;
    try {
      setIsClicked(true);
      const amountInWei = ethers.parseUnits(amount.toString(), 18);
      const tokenContract = new ethers.Contract(
        STATE_TESTNET,
        ERC20_ABI,
        signer
      );
      const approveTx = await tokenContract.approve(DAV_TESTNET, amountInWei);
      await approveTx.wait();
      console.log("Approval successful");
      const transaction = await AllContracts.davContract.burnState(amountInWei);
      await transaction.wait();
      setIsClicked(false);
    } catch (error) {
      console.error("Error burning state tokens:", error);
      setIsClicked(false);
    } finally {
      setIsClicked(false);
    }
  };

  const ReferralCode = async () => {
    if (!AllContracts?.davContract) return;
    try {
      const transaction = await AllContracts.davContract.getUserReferralCode(
        address
      );
      setReferralCode(transaction);
    } catch (error) {
      console.log("referral fetching error", error);
    }
  };
  const ReferralAmountReceived = async () => {
    if (!AllContracts?.davContract) return;
    try {
      const transaction = await AllContracts.davContract.referralRewards(
        address
      );
      const amountInEth = ethers.formatEther(transaction); // convert wei to eth
      console.log("referral rewards:", amountInEth);
      setReferralAmount(amountInEth);
    } catch (error) {
      console.log("referral fetching error", error);
    }
  };

  /*** Fetch All Data in Parallel ***/
  const fetchData = useCallback(async () => {
    if (!AllContracts?.davContract || !address) {
      console.log("Cannot fetch data: Contract or address not initialized");
      return;
    }
    setIsLoading(true);
    try {
      await Promise.all([
        DavSupply(),
        ClaimableAmount(),
        ClaimableAmountInBurn(),
        PercentageOfBurn(),
        StateHoldings(),
        TreasuryBalance(),
        ReferralCode(),
        DavHoldings(),
        ReferralAmountReceived(),
      ]);
    } catch (error) {
      console.error("Error fetching contract data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [AllContracts, address, DavSupply, ClaimableAmount]);
  useEffect(() => {
    if (!address || !AllContracts?.davContract) return;
    fetchData();
  }, [address, AllContracts?.davContract]); // ✅ only run when this is ready

  // New useEffect to check wallet and contract initialization
  useEffect(() => {
    if (!address) {
      console.log("Wallet not connected");
      setIsLoading(false);
      return;
    }
    if (!AllContracts?.davContract) {
      console.log("DAV contract not initialized yet");
      setIsLoading(true);
      return;
    }
    console.log("Wallet and contract initialized, fetching data...");
    fetchData();
  }, [address, AllContracts, fetchData]);
  const { isConnected } = useAccount();

  useEffect(() => {
    if (!isConnected) return;
    if (!AllContracts?.davContract) return;
    fetchData();
    PercentageOfBurn();
  }, [isConnected, AllContracts, address]);

  DavProvider.propTypes = {
    children: PropTypes.node.isRequired,
  };

  return (
    <DAVContext.Provider
      value={{
        mintDAV,
        isLoading,
        ReferralAMount,
        Supply,
        stateHolding,
        ReferralCodeOfUser,
        claimableAmount,
        BurnStateTokens,
        UserPercentage,
        claimableAmountForBurn,
        BurnClicked,
        ContractPls,
        claimBurnAmount,
		Claiming,
        davHolds,
        claimAmount,
      }}
    >
      {children}
    </DAVContext.Provider>
  );
};

export const useDAvContract = () => useContext(DAVContext);
