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

export const DAVContext = createContext();

export const DavProvider = ({ children }) => {
  const { AllContracts } = useContext(ContractContext);
  const { address } = useAccount();
  const chainId = useChainId();

  const [davHolds, setDavHoldings] = useState("0.0");
  const [isLoading, setIsLoading] = useState(true);
  const [DavBalance, setDavBalance] = useState(null);
  const [davPercentage, setDavPercentage] = useState("0.0");
  const [Supply, setSupply] = useState("0.0");
  const [ReferralCodeOfUser, setReferralCode] = useState("0.0");
  const [ReferralAMount, setReferralAmount] = useState("0.0");
  const [claimableAmount, setClaimableAmount] = useState("0.0");

  /*** Fetch User's Holdings ***/
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

  /*** Fetch Holding Percentage ***/
  const DavHoldingsPercentage = useCallback(async () => {
    if (!AllContracts?.davContract || !address) return;
    try {
      const balance = await AllContracts.davContract.balanceOf(address);
      const bal = ethers.formatUnits(balance, 18);
      setDavBalance(bal);
      setDavPercentage(parseFloat(bal / 5000000).toFixed(8));
    } catch (error) {
      console.error("Error fetching DAV holdings percentage:", error);
    }
  }, [AllContracts, address]);

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

  /*** Mint DAV Tokens ***/
  const mintDAV = async (amount, amount2) => {
    if (!AllContracts?.davContract) return;
    try {
      const value = ethers.parseEther(amount.toString());
      let cost;
      if (chainId === 146) {
        cost = ethers.parseEther((amount * 100).toString());
      } else {
        cost = ethers.parseEther((amount * 500000).toString());
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
        DavHoldingsPercentage(),
        DavHoldings(),
        ReferralCode(),
        ReferralAmountReceived(),
      ]);
    } catch (error) {
      console.error("Error fetching contract data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [
    AllContracts,
    address,
    DavSupply,
    ClaimableAmount,
    DavHoldingsPercentage,
    DavHoldings,
  ]);
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
  }, [isConnected, AllContracts, address]);

  DavProvider.propTypes = {
    children: PropTypes.node.isRequired,
  };

  return (
    <DAVContext.Provider
      value={{
        mintDAV,
        davHolds,
        isLoading,
        ReferralAMount,
        DavBalance,
        davPercentage,
        Supply,
        ReferralCodeOfUser,
        claimableAmount,
        claimAmount,
      }}
    >
      {children}
    </DAVContext.Provider>
  );
};

export const useDAvContract = () => useContext(DAVContext);
