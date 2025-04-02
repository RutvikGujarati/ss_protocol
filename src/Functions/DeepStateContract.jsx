import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import PropTypes from "prop-types";
import { ContractContext } from "./ContractInitialize";
import { ethers } from "ethers";

export const DeepStateFunctions = createContext();

export const DeepStateProvider = ({ children }) => {
  const { AllContracts, signer, account } = useContext(ContractContext);

  const [PLSPrice, setPLSPrice] = useState("0");
  const [balanceOfContract, setBalanceOfContract] = useState("0");
  const [PLSUSD, setPLSUSD] = useState("0");
  const [DividendsUSD, setDividendsUSD] = useState("0");
  const [EstimatedAmount, setEstimatedAmount] = useState("0");
  const [UsersTokens, setUsersTokens] = useState("0");
  const [CurrentBuyPrice, setCurrentBuyPrice] = useState("0");
  const [CurrentSellPrice, setCurrentSellPrice] = useState("0");
  const [UsersDividends, setUsersDividends] = useState("0");
  const [TotalInvested, setTotalInvested] = useState("0");
  const [SellLoading, setSellLoading] = useState(false);
  const [WithdrawLoading, setWithdrawLoading] = useState(false);
  const [totalBuyCounts, setTotalBuyCounts] = useState(0);
  const [totalStuckEth, setTotalStuckETH] = useState(0);
  const [TotalUserProfit, setUserProfit] = useState(0);

  // Fetch PLS price from API
  const fetchPLSPrice = useCallback(async () => {
    try {
      const response = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=pulsechain&vs_currencies=usd"
      );
      const data = await response.json();
      setPLSPrice(data.pulsechain.usd);
    } catch (error) {
      console.error("Error fetching PLS price:", error);
    }
  }, []);

  // Fetch contract balance
  const fetchContractBalance = useCallback(async () => {
    if (!AllContracts?.DeepStateContract) return;
    try {
      const balance = await AllContracts.DeepStateContract.getContractBalance();
      setBalanceOfContract(ethers.formatEther(balance));
    } catch (error) {
      console.error("Error fetching contract balance:", error);
    }
  }, [AllContracts]);

  // Fetch user-specific data (tokens, dividends, invested, etc.)
  const fetchUserData = useCallback(async () => {
    if (!AllContracts?.DeepStateContract || !account) return;
    try {
      const [tokens, dividends, invested, buyCounts, stuckEth, profit] =
        await Promise.all([
          AllContracts.DeepStateContract.balanceOf(account),
          AllContracts.DeepStateContract.dividendsOf(account),
          AllContracts.DeepStateContract.getInvestedEth(account),
          AllContracts.DeepStateContract.getUserBuyCount(account),
          AllContracts.DeepStateContract.getReinvestableFunds(account),
          AllContracts.DeepStateContract.getUserProfit(account),
        ]);
      setUsersTokens(Math.trunc(Number(ethers.formatEther(tokens))));
      setUsersDividends(parseFloat(ethers.formatEther(dividends)).toFixed(4));
      setTotalInvested(parseFloat(ethers.formatEther(invested)).toFixed(1));
      setTotalBuyCounts(parseFloat(buyCounts));
      setTotalStuckETH(parseFloat(ethers.formatEther(stuckEth)).toFixed(4));
      setUserProfit(parseFloat(ethers.formatEther(profit)).toFixed(2));
	  console.log("all data",tokens, dividends, invested, buyCounts, stuckEth, profit)
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  }, [AllContracts, account]);

  // Fetch buy/sell price
  const fetchBuySellPrice = useCallback(async () => {
    if (!AllContracts?.DeepStateContract) return;
    try {
      const [buyPrice, sellPrice] = await Promise.all([
        AllContracts.DeepStateContract.buyPrice(),
        AllContracts.DeepStateContract.sellPrice(),
      ]);
      console.log("all set values", ethers.formatEther(buyPrice));

      setCurrentBuyPrice(ethers.formatEther(buyPrice));
      setCurrentSellPrice(ethers.formatEther(sellPrice));
    } catch (error) {
      console.error("Error fetching buy/sell price:", error);
    }
  }, [AllContracts]);

  // Calculate USD values
  const calculateUSDValues = useCallback(() => {
    setPLSUSD((parseFloat(balanceOfContract) * PLSPrice).toFixed(8));
    setDividendsUSD((parseFloat(UsersDividends) * PLSPrice).toFixed(8));
  }, [balanceOfContract, PLSPrice, UsersDividends]);

  useEffect(() => {
    fetchPLSPrice();
    fetchContractBalance();
    fetchUserData();
    fetchBuySellPrice();
  }, [fetchPLSPrice, fetchContractBalance, fetchUserData, fetchBuySellPrice]);

  useEffect(() => {
    calculateUSDValues();
  }, [balanceOfContract, PLSPrice, UsersDividends, calculateUSDValues]);

  // Sell tokens
  const SellTokens = async (amount) => {
    try {
      setSellLoading(true);
      const tx = await AllContracts.DeepStateContract.sell(amount);
      await tx.wait();
      await fetchContractBalance();
      await fetchUserData();
    } catch (error) {
      console.error("Error selling tokens:", error);
    } finally {
      setSellLoading(false);
    }
  };
  const ReinvestETH = async (amount) => {
    try {
      setSellLoading(true);
      const amountInWei = ethers.parseUnits(amount.toString(), 18);
      const tx = await AllContracts.DeepStateContract.reinvest(amountInWei);
      await tx.wait();
      await fetchContractBalance();
      await fetchUserData();
    } catch (error) {
      console.error("Error selling tokens:", error);
    } finally {
      setSellLoading(false);
    }
  };

  // Buy tokens
  const BuyTokens = async (amount) => {
    try {
      const amountInWei = ethers.parseUnits(amount.toString(), 18);
      const tx = await signer.sendTransaction({
        to: AllContracts.DeepStateContract.target,
        value: amountInWei,
      });
      await tx.wait();
      await fetchContractBalance();
      await fetchUserData();
      await fetchBuySellPrice();
    } catch (error) {
      console.error("Error buying tokens:", error);
    }
  };

  // Withdraw dividends
  const WithdrawDividends = async (amount) => {
    try {
      setWithdrawLoading(true);
      const amountInWei = ethers.parseUnits(amount.toString(), 18);
      const tx = await AllContracts.DeepStateContract.withdraw(amountInWei);
      await tx.wait();
      await fetchUserData();
    } catch (error) {
      console.error("Error withdrawing dividends:", error);
    } finally {
      setWithdrawLoading(false);
    }
  };

  // Estimate token amount
  const CalculateEstimateTokenAmount = async (amount) => {
    try {
      const amountInWei = ethers.parseUnits(amount.toString(), 18);
      const estimatedTokens =
        await AllContracts.DeepStateContract.estimateTokensToBuy(amountInWei);
      setEstimatedAmount(estimatedTokens);
    } catch (error) {
      console.error("Error estimating token amount:", error);
    }
  };

  return (
    <DeepStateFunctions.Provider
      value={{
        balanceOfContract,
        PLSUSD,
        UsersTokens,
        UsersDividends,
        DividendsUSD,
        SellTokens,
        PLSPrice,
        BuyTokens,
        totalBuyCounts,
		ReinvestETH,
        SellLoading,
        WithdrawDividends,
        TotalUserProfit,
        TotalInvested,
        totalStuckEth,
        CurrentSellPrice,
        CurrentBuyPrice,
        WithdrawLoading,
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
