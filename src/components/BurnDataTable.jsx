import "bootstrap/dist/css/bootstrap.min.css";
import "../Styles/DataTable.css";
import { useSwapContract } from "../Functions/SwapContractFunctions";
import { useDAvContract } from "../Functions/DavTokenFunctions";

const BurnDataTable = () => {
  const { DavBalance } = useDAvContract();
  const { DavBalanceRequireForBurn, DavBalanceRequire } = useSwapContract();
  // Log for debugging
  console.log("BurnOccuredForToken:", parseFloat(DavBalance));
  const db = parseFloat(DavBalance);
  console.log("db", db);
  console.log("db required for burn", DavBalanceRequireForBurn);
  console.log("db required for Auction", DavBalanceRequire);
  // Get token data

  return (
    <>
      <div className="container mt-4 datatablemarginbottom">
        <div className="table-responsive">
          <div className="container mt-4">
            <div className="row g-4 d-flex align-items-stretch pb-1 justify-content-center">
              <div className="col-md-4 p-0 m-2 cards d-flex flex-row gap-3">
                <div
                  className="announcement text-center p-2 rounded bg-dark text-light flex-fill d-flex justify-content-center align-items-center"
                  style={{ width: "150px", height: "40px" }}
                >
                  Buy
                </div>
                <div
                  className="announcement text-center p-2 rounded bg-dark text-light flex-fill d-flex justify-content-center align-items-center"
                  style={{ width: "150px", height: "40px" }}
                >
                  Sell
                </div>
                <div
                  className="announcement text-center p-2 rounded bg-dark text-light flex-fill d-flex justify-content-center align-items-center"
                  style={{ width: "150px", height: "40px" }}
                >
                  Withdraw
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="container mt-4">
          <div className="row g-4 d-flex align-items-stretch pb-1 border-bottom-">
            <div className="col-md-4 p-0 m-2 cards">
              <div className="card bg-dark text-light border-light p-0 d-flex justify-content-center align-items-center text-center w-100">
                <div className="p-2">
                  <p className="mb-2 detailText">Buy TOKENS</p>
                  <input
                    type="text"
                    placeholder="Enter Value"
                    className="form-control text-center fw-bold mb-3"
                    //   value={amount}
                    //   onChange={handleInputChange}
                  />
                  <button
                    //   onClick={handleMint}
                    className="btn btn-primary btn-sm d-flex justify-content-center align-items-center mt-4 w-100 "
                  >
                    Buy
                  </button>
                </div>
              </div>
            </div>
            <div className="col-md-4 p-0 m-2 cards">
              <div className="card bg-dark text-light border-light p-0 d-flex justify-content-center align-items-center text-center w-100">
                <div className="p-2">
                  <p className="mb-2 detailText">Sell TOKENS</p>
                  <input
                    type="text"
                    placeholder="Enter Value"
                    className="form-control text-center fw-bold mb-3"
                    //   value={amount}
                    //   onChange={handleInputChange}
                  />
                  <button
                    //   onClick={handleMint}
                    className="btn btn-primary btn-sm d-flex justify-content-center align-items-center mt-4 w-100 "
                  >
                    Sell
                  </button>
                </div>
              </div>
            </div>
            <div className="col-md-4 p-0 m-2 cards">
              <div className="card bg-dark text-light border-light p-0 d-flex justify-content-center align-items-center text-center w-100">
                <div className="p-2">
                  <p className="mb-2 detailText">Withdraw TOKENS</p>
                  <input
                    type="text"
                    placeholder="Enter Value"
                    className="form-control text-center fw-bold mb-3"
                    //   value={amount}
                    //   onChange={handleInputChange}
                  />
                  <button
                    //   onClick={handleMint}
                    className="btn btn-primary btn-sm d-flex justify-content-center align-items-center mt-4 w-100 "
                  >
                    Withdraw
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BurnDataTable;
