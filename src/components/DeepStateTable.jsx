import "bootstrap/dist/css/bootstrap.min.css";
import "../Styles/DataTable.css";
import { useContext, useEffect } from "react";
import { ContractContext } from "../Functions/ContractInitialize";
import { ethers } from "ethers";
import { useTokens } from "../data/BurntokenData";
import { useDeepStateFunctions } from "../Functions/DeepStateContract";

const DeepStateTable = () => {
  const { AllContracts, account } = useContext(ContractContext);
  const { totalBuyCounts, userTotalBuyCounts,SellTokens } = useDeepStateFunctions();

  useEffect(() => {
    userTotalBuyCounts();
  }, [account, AllContracts]);

  const tokens = useTokens(totalBuyCounts);



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
                isSold,
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
                    {ProfitLoss <0 ? (
                      <button className=" custom-red-button" disabled>
                        Hold
                      </button>
                    ) : (
                      <button
                        className={`custom-green-button ${
                          isSold ? "disabled-button" : ""
                        }`}
                        onClick={() => SellTokens(id)}
                        disabled={isSold}
                      >
                        {isSold ? "Sold" : "Sell"}
                      </button>
                    )}
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
