import "bootstrap/dist/css/bootstrap.min.css";
import "../Styles/DataTable.css";
import { useContext, useEffect, useState } from "react";
import { ContractContext } from "../Functions/ContractInitialize";
import { ethers } from "ethers";
import { useTokens } from "../data/BurntokenData";

const DeepStateTable = () => {
  const { AllContracts } = useContext(ContractContext);

  const [balanceOfContract, setbalanceOfContract] = useState("0");
  const [PLSPrice, setPLSPrice] = useState("0");
  const [DividendsUSD, setDividendsUSD] = useState("0");
  const [UsersTokens, setUsersTokens] = useState("0");
  const [UsersDividends, setUsersDividends] = useState("0");
  const [Sellloading, setSellLoading] = useState(false);

  console.log("DeepStateContract", AllContracts.DeepStateContract);

  const contractBalance = async () => {
    try {
      if (!AllContracts || !AllContracts.DeepStateContract) {
        console.log("DeepStateContract is not initialized.");
        return;
      }

      const userAmount =
        await AllContracts.DeepStateContract.totalEthereumBalance();
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

  const SellTokens = async (amount) => {
    try {
      setSellLoading(true);
      const amountInWei = ethers.parseUnits(amount.toString(), 18);
      const tx = await AllContracts.DeepStateContract.sell(amountInWei);
      await tx.wait();
      await contractBalance(), setSellLoading(false);
    } catch (error) {
      console.log("Error in buying tokens:", error);
      setSellLoading(false);
    } finally {
      setSellLoading(false);
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
      setUsersDividends(parseFloat(ethers.formatEther(userAmount)).toFixed(18));
    } catch (error) {
      console.error("Error fetching dividends:", error);
      setUsersDividends("0");
    }
  };

  const tokens = useTokens();

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
    contractBalance();
    fetchPLSPrice();
    UsersTotalTokens();
    UsersTotalDividends();
    CalculateDividendsInUSD();
  });
  return (
    <>
      <div className="container  ">
        <div className="table-responsive">
          <table className="table table-dark">
            <thead>
              <tr className="align-item-center">
                <th>Buys</th>
                <th></th>
                <th>LPT Amount</th>
                <th>ETH Cost</th>
                <th>Buy Price</th>
                <th>Current Value</th>
                <th>Profit/Loss</th>
                <th></th>
                <th></th>
                <th></th>
                <th>Action</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {tokens.map(
                ({
                  id,
                  LPTAmount,
                  EthCost,
                  BuyCost,
                  CurrentValue,
                  Action,
                  ProfitLoss,
                }) => (
                  <tr key={id}>
                    <td>{id}</td>
                    <td></td>
                    <td>{LPTAmount}</td>
                    <td>{EthCost}</td>
                    <td>{BuyCost}</td>
                    <td>{CurrentValue}</td>

                    <td>{ProfitLoss}</td>
                    <td>{Action}</td>
                    <td>{/* {formatWithCommas(burnAmount)} {name} */}</td>

                    <td>
                      <div className="d-flex align-items-center justify-content-center">
                        <button className="btn btn-primary btn-sm swap-btn">
                          {/* {isProcessing[id] ? "Processing..." : "Burn"} */}
                          Hold
                        </button>
                      </div>
                    </td>
                    <td>{/* {formatWithCommas(burnAmount)} {name} */}</td>

                    <td>
                      <div className="d-flex align-items-center justify-content-center">
                        <button
                          className="btn btn-primary btn-sm swap-btn"
                          onClick={() => SellTokens(LPTAmount)}
                        >
                          {/* {isProcessing[id] ? "Processing..." : "Burn"} */}
                          Sell
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default DeepStateTable;
