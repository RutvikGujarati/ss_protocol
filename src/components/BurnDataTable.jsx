import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../Styles/DataTable.css";
import { useDAVToken } from "../Context/DavTokenContext";
import { useTokens } from "../data/BurntokenData";
import { useDAvContract } from "../Functions/DavTokenFunctions";
import { formatWithCommas } from "./DetailsInfo";
import { useGeneralAuctionFunctions } from "../Functions/GeneralAuctionFunctions";

const BurnDataTable = () => {
  const [isProcessing, setIsProcessing] = useState({});
  const [errorPopup, setErrorPopup] = useState({
    state: false,
    message: "",
  });
  const { DavBalance } = useDAvContract();
  const {
    balances,
    bountyBalances,
    ClickBurn,
    DavBalanceRequireForBurn,
    DavBalanceRequire,
  } = useDAVToken();
  const { BurnOccuredForToken, BurnCycleACtive } = useGeneralAuctionFunctions();
  // Log for debugging
  console.log("BurnOccuredForToken:", BurnCycleACtive);
  console.log("BurnOccuredForToken:", parseFloat(DavBalance));
  const db = parseFloat(DavBalance);
  console.log("db", db);
  console.log("db required for burn", DavBalanceRequireForBurn);
  console.log("db required for Auction", DavBalanceRequire);
  // Get token data
  const tokens = useTokens(
    balances,
    bountyBalances,
    BurnCycleACtive,
    BurnOccuredForToken,
    ClickBurn
  );

  const handleBurn = async (id, clickBurnFn) => {
    setIsProcessing((prev) => ({ ...prev, [id]: true }));
    try {
      await clickBurnFn();
    } catch (err) {
      console.error("Error processing burn:", err);

      if (
        err.reason === "Burn already occurred for this cycle" ||
        (err.revert &&
          err.revert.args &&
          err.revert.args[0] === "Burn already occurred for this cycle")
      ) {
        setErrorPopup({
          state: true,
          message: "Burn already occurred for this cycle",
        });
      } else {
        setErrorPopup({
          state: true,
          message: "An error occurred while processing the burn",
        });
      }
    } finally {
      setIsProcessing((prev) => ({ ...prev, [id]: false }));
    }
  };

  return (
    <>
      {errorPopup.state && (
        <div
          className="position-fixed top-50 start-50 translate-middle d-flex justify-content-center align-items-center"
          style={{ zIndex: 1050 }}
        >
          <div
            className="card bg-dark text-white shadow-lg border border-secondary"
            style={{ minWidth: "320px", maxWidth: "400px" }}
          >
            <div className="card-body text-center">
              <h5 className="card-title text-danger fw-bold">Note:</h5>
              <p className="card-text">{errorPopup.message}</p>

              <div className="text-end">
                <button
                  onClick={() =>
                    setErrorPopup((prev) => ({ ...prev, state: false }))
                  }
                  className="btn btn-outline-light btn-sm px-4"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="container mt-4 datatablemarginbottom">
        <div className="table-responsive">
          <div className="announcement text-center">
            <div className="">SEE WHITEPAPER FOR MORE INFORMATION.</div>
          </div>
          <table className="table table-dark mt-3">
            {/* <thead>
              <tr className="align-item-center">
                <th>#</th>
                <th></th>
                <th>Name</th>
                <th>Burn Ratio</th>
                <th>Bounty</th>
                <th>Burn Amount</th>
                <th>Action</th>
              </tr>
            </thead> */}
            {/* <tbody>
              {tokens
                .filter(
                  ({ BurnOccured, burnCycle }) =>
                    !BurnOccured && burnCycle && db >= 10
                )
                .map(
                  ({
                    id,
                    name,
                    logo,
                    burnRatio,
                    bounty,
                    burnAmount,
                    clickBurn,
                  }) => (
                    <tr key={id}>
                      <td>{id}</td>
                      <td>
                        <div className="nameImage">
                          <img
                            src={logo}
                            width={40}
                            height={40}
                            alt={`${name} Logo`}
                          />
                        </div>
                      </td>
                      <td>
                        <div className="nameDetails">
                          <h5 className="nameBig">{name}</h5>
                          <p className="nameSmall mb-1 uppercase">{name}</p>
                        </div>
                      </td>
                      <td>{burnRatio}</td>
                      <td>
                        {formatWithCommas(bounty)} {name}
                      </td>
                      <td>
                        {formatWithCommas(burnAmount)} {name}
                      </td>

                      <td>
                        <div className="d-flex align-items-center justify-content-center">
                          <button
                            className="btn btn-primary btn-sm swap-btn"
                            onClick={() => handleBurn(id, clickBurn)}
                            disabled={isProcessing[id]}
                          >
                            {isProcessing[id] ? "Processing..." : "Burn"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                )}
            </tbody> */}
          </table>
        </div>
      </div>
    </>
  );
};

export default BurnDataTable;
