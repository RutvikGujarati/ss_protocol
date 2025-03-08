import { createContext, useContext, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { ContractContext } from "./ContractInitialize";
import { DeepState } from "../ContractAddresses";
import { ethers } from "ethers";

export const DeepStateFunctions = createContext();

export const DeepStateProvider = ({ children }) => {
  const { AllContracts } = useContext(ContractContext);
  const [balanceOfContract, setbalanceOfContract] = useState("0");
  const [PLSPrice, setPLSPrice] = useState("0");
  const [PLSUSD, setPLSUSD] = useState("0");
  const [DividendsUSD, setDividendsUSD] = useState("0");
  const [UsersTokens, setUsersTokens] = useState("0");
  const [UsersDividends, setUsersDividends] = useState("0");
  const [loading, setLoading] = useState(false);
  const [Sellloading, setSellLoading] = useState(false);
  const [Withdrawloading, setWithdrawLoading] = useState(false);

  const contractBalance = async () => {
    try {
      const userAmount =
        await AllContracts.DeepStateContract.getContractBalance();
      const formattedBalance = ethers.formatEther(userAmount);

      console.log("deepstate balance:", userAmount);
      setbalanceOfContract(formattedBalance);
    } catch (error) {
      console.log("error in fetching deepState Balance:", error);
    }
  };
  const fetchPLSPrice = async () => {
    try {
      const response = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=pulsechain&vs_currencies=usd"
      );
      const data = await response.json();
      console.log("PLS price :", data.pulsechain.usd);
      setPLSPrice(data.pulsechain.usd);
    } catch (error) {
      console.log("Error fetching PLS price:", error);
      return 0; // Return 0 in case of an error
    }
  };
  const CalculateBalanceInUSD = async () => {
    try {
      const balanceInUSD = parseFloat(balanceOfContract) * PLSPrice; // Convert to USD
      console.log(
        "DeepState Contract Balance in USD:",
        balanceInUSD.toFixed(8)
      );
      setPLSUSD(balanceInUSD.toFixed(8));
    } catch (error) {
      console.log("Error calculating balance in USD:", error);
      return "0.00";
    }
  };

  const BuyTokens = async (amount) => {
    try {
      setLoading(true);
      const amountInWei = ethers.parseUnits(amount.toString(), 18);
      const tx = await AllContracts.DeepStateContract.buy({
        value: amountInWei,
      });
      await tx.wait();
      await contractBalance(), CalculateBalanceInUSD(), setLoading(false);
    } catch (error) {
      console.log("Error in buying tokens:", error);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };
  const SellTokens = async (amount) => {
    try {
      setSellLoading(true);
      const amountInWei = ethers.parseUnits(amount.toString(), 18);
      const tx = await AllContracts.DeepStateContract.sell(amountInWei);
      await tx.wait();
      await contractBalance(), CalculateBalanceInUSD(), setSellLoading(false);
    } catch (error) {
      console.log("Error in buying tokens:", error);
      setSellLoading(false);
    } finally {
      setSellLoading(false);
    }
  };
  const WithdrawDividends = async () => {
    try {
      setWithdrawLoading(true);
      const tx = await AllContracts.DeepStateContract.withdraw();
      await tx.wait();
      setWithdrawLoading(false);
    } catch (error) {
      console.log("Error in buying tokens:", error);
      setWithdrawLoading(false);
    } finally {
      setWithdrawLoading(false);
    }
  };

  const UsersTotalTokens = async () => {
    try {
      const userAmount = await AllContracts.DeepStateContract.myTokens(); // Get amount in Wei
      const formattedAmount = ethers.formatEther(userAmount); // Convert to ETH
      setUsersTokens(formattedAmount); // Store in state
      console.log("User's total tokens in ETH:", formattedAmount);
    } catch (error) {
      console.log("Error fetching tokens amount:", error);
    }
  };
  const UsersTotalDividends = async () => {
    try {
      if (!AllContracts?.DeepStateContract) return;
      const userAmount = await AllContracts.DeepStateContract.myDividends();
      setUsersDividends(parseFloat(ethers.formatEther(userAmount)).toFixed(4));
    } catch (error) {
      console.error("Error fetching dividends:", error);
      setUsersDividends("0");
    }
  };
  const CalculateDividendsInUSD = async () => {
    try {
      const balanceInUSD = parseFloat(UsersDividends) * PLSPrice; // Convert to USD
      console.log(
        "DeepState Contract Balance in USD:",
        balanceInUSD.toFixed(4)
      );
      setDividendsUSD(balanceInUSD.toFixed(8));
    } catch (error) {
      console.log("Error calculating balance in USD:", error);
      return "0.00";
    }
  };

  useEffect(() => {
	const interval = setInterval(() => {
	  fetchPLSPrice();
	  contractBalance();
	  CalculateBalanceInUSD();
	  UsersTotalTokens();
	  UsersTotalDividends();
	  CalculateDividendsInUSD();
	}, 10000); // Updates every 10 seconds
  
	return () => clearInterval(interval); // Cleanup on unmount
  }, []);
  

  return (
    <DeepStateFunctions.Provider
      value={{
        balanceOfContract,
        PLSUSD,
        BuyTokens,
        loading,
        UsersTokens,
        UsersDividends,
        DividendsUSD,
        SellTokens,
        Sellloading,
        WithdrawDividends,
        Withdrawloading,
      }}
    >
      {children}
    </DeepStateFunctions.Provider>
  );
};

DeepStateProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useDeepStateFunctions = () => useContext(DeepStateFunctions);
