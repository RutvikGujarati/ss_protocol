import { createContext, useContext, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { ContractContext } from "./ContractInitialize";
import { ethers } from "ethers";

export const DeepStateFunctions = createContext();

export const DeepStateProvider = ({ children }) => {
  const { AllContracts, signer, account } = useContext(ContractContext);
  const [PLSPrice, setPLSPrice] = useState("0");
  const [balanceOfContract, setbalanceOfContract] = useState("0");
  const [PLSUSD, setPLSUSD] = useState("0");
  const [DividendsUSD, setDividendsUSD] = useState("0");
  const [EstimatedAmount, setEstimatedAMount] = useState("0");
  const [UsersTokens, setUsersTokens] = useState("0");
  const [CurrentBuyprice, setCurrentBuyPrice] = useState("0");
  const [CurrentSellprice, setCurrentesellPrice] = useState("0");
  const [UsersDividends, setUsersDividends] = useState("0");
  const [TotalInvested, setTotalInvested] = useState("0");
  const [Sellloading, setSellLoading] = useState(false);
  const [Withdrawloading, setWithdrawLoading] = useState(false);
  console.log("AllContracts from deepstate", AllContracts.DeepStateContract);

  const contractBalance = async () => {
    try {
      if (!AllContracts || !AllContracts.DeepStateContract) {
        console.log("DeepStateContract is not initialized.");
        return;
      }

      const userAmount =
        await AllContracts.DeepStateContract.getContractBalance();
      const formattedBalance = ethers.formatEther(userAmount);

      console.log("deepstate balance:", userAmount);
      setbalanceOfContract(formattedBalance);
    } catch (error) {
      console.log("error in fetching deepState Balance:", error);
    }
  };
  const CalculateBalanceInUSD = async () => {
    try {
      const balanceInUSD = parseFloat(balanceOfContract) * PLSPrice; // Convert to USD
      console.log("DeepState Contract Balance in USD:", balanceOfContract);
      setPLSUSD(balanceInUSD.toFixed(8));
    } catch (error) {
      console.log("Error calculating balance in USD:", error);
      return "0.00";
    }
  };

  const SellTokens = async (amount) => {
    try {
      setSellLoading(true);
      const tx = await AllContracts.DeepStateContract.sell(amount);
      await tx.wait();
      await contractBalance(), CalculateBalanceInUSD(), setSellLoading(false);
      userTotalBuyCounts();
    } catch (error) {
      console.log("Error in buying tokens:", error);
      setSellLoading(false);
    } finally {
      setSellLoading(false);
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
      const userAmount = await AllContracts.DeepStateContract.balanceOf(
        account
      ); // Get amount in Wei
      const formattedAmount = Math.trunc(
        Number(ethers.formatEther(userAmount))
      ); // Convert to ETH and remove decimals
      setUsersTokens(formattedAmount); // Store in state
      console.log("User's total tokens in ETH:", formattedAmount);
    } catch (error) {
      console.log("Error fetching tokens amount:", error);
    }
  };
  const CurrentBuySellPrice = async () => {
    try {
      const userAmount = await AllContracts.DeepStateContract.buyPrice(); // Get amount in Wei
      const formattedAmount = ethers.formatEther(userAmount); // Convert to ETH
      setCurrentBuyPrice(formattedAmount); // Store in state

      const SellAMount = await AllContracts.DeepStateContract.sellPrice(); // Get amount in Wei
      const formattedSellAmount = ethers.formatEther(SellAMount); // Convert to ETH
      setCurrentesellPrice(formattedSellAmount); // Store in state
      console.log("User's total tokens in ETH:", formattedAmount);
    } catch (error) {
      console.log("Error fetching tokens amount:", error);
    }
  };
  const UsersTotalDividends = async () => {
    try {
      if (!AllContracts?.DeepStateContract) return;
      const userAmount = await AllContracts.DeepStateContract.dividendsOf(
        account
      );
      console.log("my dividends", userAmount);
      setUsersDividends(parseFloat(ethers.formatEther(userAmount)).toFixed(4));
    } catch (error) {
      console.error("Error fetching dividends:", error);
      setUsersDividends("0");
    }
  };
  const userTotalInvested = async () => {
    try {
      if (!AllContracts?.DeepStateContract) return;
      const userAmount = await AllContracts.DeepStateContract.getInvestedEth(
        account
      );
      setTotalInvested(parseFloat(ethers.formatEther(userAmount)).toFixed(1));
    } catch (error) {
      console.error("Error fetching dividends:", error);
      setTotalInvested("0");
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
  const CalculateEstimateTokenAmount = async (amount) => {
    try {
      const amountInWei = ethers.parseUnits(amount.toString(), 18);
      const userAmount =
        await AllContracts.DeepStateContract.estimateTokensToBuy(amountInWei);
      setEstimatedAMount(userAmount);
    } catch (error) {
      console.log("Error calculating balance in USD:", error);
      return "0.00";
    }
  };
  const [totalBuyCounts, setTotalBuyCounts] = useState(0);

  const userTotalBuyCounts = async () => {
    try {
      if (!AllContracts?.DeepStateContract || !account) return;
      const userAmount = await AllContracts.DeepStateContract.getUserBuyCount(
        account
      );
      console.log("user buy counts", parseFloat(userAmount));
      setTotalBuyCounts(parseFloat(userAmount));
    } catch (error) {
      console.error("Error fetching buy counts:", error);
      setTotalBuyCounts(0);
    }
  };

  const BuyTokens = async (amount) => {
    try {
      //   setLoading(true);
      const amountInWei = ethers.parseUnits(amount.toString(), 18);
      const tx = await signer.sendTransaction({
        to: AllContracts.DeepStateContract.target, // Contract address
        value: amountInWei, // Sending ETH directly
      });
      await tx.wait();
      await contractBalance();
      await CalculateBalanceInUSD();
      await userTotalBuyCounts();
    } catch (error) {
      console.log("Error in buying tokens:", error);
    } finally {
      //   setLoading(false);
    }
  };
  useEffect(() => {
    const fetchData = async () => {
      userTotalBuyCounts();
      userTotalInvested();
      contractBalance();
      await fetchPLSPrice();
      await contractBalance();
      CalculateBalanceInUSD();
      await UsersTotalTokens();
      await UsersTotalDividends();
      CalculateDividendsInUSD();
      UsersTotalDividends();
      userTotalInvested();
      CurrentBuySellPrice();
    };
    fetchData();
  }, [balanceOfContract, PLSPrice, UsersDividends]);

  return (
    <DeepStateFunctions.Provider
      value={{
        balanceOfContract,
        PLSUSD,
        UsersTokens,
        UsersTotalTokens,
        UsersDividends,
        DividendsUSD,
        CalculateBalanceInUSD,
        SellTokens,
        PLSPrice,
        BuyTokens,
        totalBuyCounts,
        userTotalBuyCounts,
        Sellloading,
        WithdrawDividends,
        TotalInvested,
        CurrentSellprice,
        CurrentBuyprice,
        Withdrawloading,
        CalculateEstimateTokenAmount,
        EstimatedAmount,
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
