import { createContext, useContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import { ContractContext } from "./ContractInitialize";
import PropTypes from "prop-types";

export const DAVContext = createContext();

export const DavProvider = ({ children }) => {
  const { AllContracts, account } = useContext(ContractContext);
  const [davHolds, setDavHoldings] = useState("0.0");
  const [isLoading, setIsLoading] = useState(true);
  const [DavBalance, setDavBalance] = useState(null);
  const [davPercentage, setDavPercentage] = useState("0.0");
  const [Supply, setSupply] = useState("0.0");
  const [claimableAmount, setClaimableAmount] = useState("0.0");
  const [DAVTokensWithdraw, setDAvTokens] = useState("0.0");
  const [DAVTokensFiveWithdraw, setFiveAvTokens] = useState("0.0");
  const [claiming, setClaiming] = useState(false);

  const DavHoldings = async () => {
    try {
      if (!AllContracts?.davContract || !account) {
        setDavHoldings("0.0");
        return;
      }

      const holdings = await AllContracts.davContract.getDAVHoldings(account);
      const holds = ethers.formatUnits(holdings, 18);
      console.log("DavHoldings: ", holds);
      setDavHoldings(holds);
    } catch (error) {
      console.error("Error fetching DAV holdings:", error);
      setDavHoldings("0.0");
    } finally {
      setIsLoading(false);
    }
  };

  const mintDAV = async (amount) => {
    try {
      if (!AllContracts?.davContract) {
        throw new Error("Contract is not initialized.");
      }

      const value = ethers.parseEther(amount.toString());
      const cost = ethers.parseEther((amount * 250000).toString());

      console.log("Minting with:", value.toString(), "cost:", cost.toString());

      const transaction = await AllContracts.davContract.mintDAV(value, {
        value: cost,
      });

      await transaction.wait();
      console.log("Minting successful!");
      await DavHoldings();
      return transaction;
    } catch (error) {
      console.error("Minting error:", error);
      throw error;
    }
  };
  const DavHoldingsPercentage = async () => {
    try {
      const balance = await AllContracts.davContract.balanceOf(account);
      const bal = ethers.formatUnits(balance, 18);

      console.log("dav balance.......", bal);
      setDavBalance(bal);

      const totalSupply = 5000000;

      if (bal) {
        const rank = bal / totalSupply;

        setDavPercentage(parseFloat(rank).toFixed(8));
      } else {
        console.error("Failed to fetch holding percentage.");
      }
    } catch (error) {
      console.error("Error fetching DAV holdings percentage:", error);
    }
  };
  const DavSupply = async () => {
    const supply = await AllContracts.davContract.totalSupply();
    const sup = ethers.formatUnits(supply, 18);
    setSupply(sup);
  };
  const claimAmount = async () => {
    try {
      if (!AllContracts?.davContract) {
        throw new Error("Contract is not initialized.");
      }
      const transaction = await AllContracts.davContract.claimRewards();
      await transaction.wait();
      await ClaimableAmount();
    } catch (e) {
      console.error("Error claiming rewards:", e);
    }
  };
  const ClaimableAmount = async () => {
    const supply = await AllContracts.davContract.holderRewards(account);
    const sup = ethers.formatUnits(supply, 18);
    console.log("user claimable balance", supply);
    setClaimableAmount(sup);
  };
  const DAVTokenAmount = async () => {
    try {
      const balance = await AllContracts.davContract.liquidityFunds();
      const bal = ethers.formatUnits(balance, 18);
      setDAvTokens(bal);
    } catch (e) {
      console.error("Error fetching LP tokens:", e);
    }
  };
  const DAVTokenfive_Amount = async () => {
    try {
      const balance = await AllContracts.davContract.developmentFunds();
      const bal = ethers.formatUnits(balance, 18);
      setFiveAvTokens(bal);
    } catch (e) {
      console.error("Error fetching LP tokens:", e);
    }
  };

  const handleWithdraw = async (methodName) => {
    try {
      setClaiming(true);
      await AllContracts.davContract[methodName]();
    } catch (e) {
      console.error(`Error withdrawing with method ${methodName}:`, e);
    } finally {
      setClaiming(false);
    }
  };

  const withdraw_5 = () => handleWithdraw("withdrawDevelopmentFunds");
  const withdraw_95 = () => handleWithdraw("withdrawLiquidityFunds");

  useEffect(() => {
    if (AllContracts?.davContract && account) {
      const functions = [
        DavSupply,
        ClaimableAmount,
        DAVTokenAmount,
        DavHoldingsPercentage,
        DavHoldings,
        DAVTokenfive_Amount,
      ];

      const loadData = async () => {
        for (const func of functions) {
          try {
            await func();
          } catch (error) {
            console.error(`Error in ${func.name}:`, error);
          }
        }
      };

      loadData();
    }
  }, [AllContracts, account]);

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
