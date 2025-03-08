import { createContext, useContext, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { ContractContext } from "./ContractInitialize";
import { DeepState } from "../ContractAddresses";
import { ethers } from "ethers";

export const DeepStateFunctions = createContext();

export const DeepStateProvider = ({ children }) => {
  const { provider, AllContracts } = useContext(ContractContext);
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
      const formattedBalance = ethers.formatEther(await userAmount);

      console.log("deepstate balance:", formattedBalance);
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
      setLoading(false);
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
      setSellLoading(false);
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
      const userAmount = await AllContracts.DeepStateContract.myDividends(); // Get amount in Wei
      const formattedAmount = parseFloat(ethers.formatEther(userAmount)); // Convert to number
      const fixedAmount = formattedAmount.toFixed(4); // Round to 4 decimal places

      setUsersDividends(fixedAmount); // Store in state

      console.log("User's total dividends in ETH:", fixedAmount);
    } catch (error) {
      console.log("Error fetching dividends amount:", error);
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

  const fetchAllData = async () => {
    const tasks = [
      contractBalance(),
      CalculateBalanceInUSD(),
      fetchPLSPrice(),
      UsersTotalTokens(),
      UsersTotalDividends(),
      CalculateDividendsInUSD(),
    ];

    await Promise.allSettled(tasks); // Runs all functions and ignores failures
  };

  useEffect(() => {
    fetchAllData();
  }, [balanceOfContract]); // Re-runs when balance changes

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
