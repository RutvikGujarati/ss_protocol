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
  const [claimableAmount, setClaimableAmount] = useState("0.0");
  const [DAVTokensWithdraw, setDAvTokens] = useState("0.0");
  const [DAVTokensFiveWithdraw, setFiveAvTokens] = useState("0.0");
  const [claiming, setClaiming] = useState(false);

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

  /*** Fetch Development and Liquidity Funds ***/
  const DAVTokenAmount = useCallback(async () => {
    if (!AllContracts?.davContract) return;
    try {
      const balance = await AllContracts.davContract.liquidityFunds();
      setDAvTokens(ethers.formatUnits(balance, 18));
    } catch (error) {
      console.error("Error fetching LP tokens:", error);
    }
  }, [AllContracts]);

  const DAVTokenfive_Amount = useCallback(async () => {
    if (!AllContracts?.davContract) return;
    try {
      const balance = await AllContracts.davContract.developmentFunds();
      setFiveAvTokens(ethers.formatUnits(balance, 18));
    } catch (error) {
      console.error("Error fetching development funds:", error);
    }
  }, [AllContracts]);

  /*** Mint DAV Tokens ***/
  const mintDAV = async (amount) => {
    if (!AllContracts?.davContract) return;
    try {
      const value = ethers.parseEther(amount.toString());
      let cost;
      if (chainId === 146) {
        cost = ethers.parseEther((amount * 100).toString());
      } else {
        cost = ethers.parseEther((amount * 500000).toString());
      }
      const transaction = await AllContracts.davContract.mintDAV(value, {
        value: cost,
      });
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
      const transaction = await AllContracts.davContract.claimRewards();
      await transaction.wait();
      await ClaimableAmount();
    } catch (error) {
      console.error("Error claiming rewards:", error);
    }
  };

  /*** Handle Withdraws ***/
  const handleWithdraw = async (methodName) => {
    if (!AllContracts?.davContract) return;
    try {
      setClaiming(true);
      await AllContracts.davContract[methodName]();
    } catch (error) {
      console.error(`Error withdrawing with method ${methodName}:`, error);
    } finally {
      setClaiming(false);
    }
  };

  const withdraw_5 = () => handleWithdraw("withdrawDevelopmentFunds");
  const withdraw_95 = () => handleWithdraw("withdrawLiquidityFunds");

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
        DAVTokenAmount(),
        DavHoldingsPercentage(),
        DavHoldings(),
        DAVTokenfive_Amount(),
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
    DAVTokenAmount,
    DavHoldingsPercentage,
    DavHoldings,
    DAVTokenfive_Amount,
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
        claiming,
        mintDAV,
        davHolds,
        isLoading,
        withdraw_5,
        withdraw_95,
        DavBalance,
        davPercentage,
        Supply,
        DAVTokensWithdraw,
        DAVTokensFiveWithdraw,
        claimableAmount,
        claimAmount,
      }}
    >
      {children}
    </DAVContext.Provider>
  );
};

export const useDAvContract = () => useContext(DAVContext);
