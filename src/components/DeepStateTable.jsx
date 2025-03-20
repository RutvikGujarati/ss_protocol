import "bootstrap/dist/css/bootstrap.min.css";
import "../Styles/DataTable.css";
import { useContext, useEffect, useState } from "react";
import { ContractContext } from "../Functions/ContractInitialize";
import { ethers } from "ethers";
import { useTokens } from "../data/BurntokenData";

const DeepStateTable = () => {
  const { AllContracts, account } = useContext(ContractContext);
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

  useEffect(() => {
    userTotalBuyCounts();
  }, [account, AllContracts]); // Fetch user buy counts when account/contract changes

  const tokens = useTokens(totalBuyCounts);

  const SellTokens = async (amount) => {
    try {
      const amountInWei = ethers.parseUnits(amount.toString(), 18);
      const tx = await AllContracts.DeepStateContract.sell(amountInWei);
      await tx.wait();
    } catch (error) {
      console.log("Error in selling tokens:", error);
    }
  };

  return (
    <div className="container">
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
              <th>Action</th>
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
                  <td>
                    <button
                      className="btn btn-primary btn-sm "
                      onClick={() => SellTokens(LPTAmount)}
					  style={{ height: "40px" }}

                    >
                      Sell
                    </button>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DeepStateTable;
