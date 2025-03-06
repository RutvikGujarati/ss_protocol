import "bootstrap/dist/css/bootstrap.min.css";
import "../Styles/DataTable.css";
import { useSwapContract } from "../Functions/SwapContractFunctions";
import { useDAvContract } from "../Functions/DavTokenFunctions";
import XerionLogo from "../assets/layti.png";

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
              {/* Contract Market Cap Box */}
              <div className="col-12 col-sm-6 col-md-4 d-flex justify-content-center">
                <div
                  className="announcement rounded bg-dark text-light flex-fill d-flex flex-column text-center"
                  style={{ minWidth: "180px", width: "100%", height: "120px" }}
                >
                  <div className="row w-100 h-100">
                    {/* Text Column */}
                    <div className="col-9 d-flex flex-column align-items-center justify-content-center">
                      <h1 className="fs-5 mb-1">50.21213 PLS</h1>
                      <p className="mb-1" style={{ fontSize: "10px" }}>
                        Contract Market Cap
                      </p>
                      <p className="mb-2 fs-6">Value: 45453 USD</p>
                    </div>

                    {/* Image Column */}
                    <div className="col-3 d-flex align-items-center justify-content-center">
                      <img src={XerionLogo} width={40} height={40} alt="Logo" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Your Tokens Box */}
              <div className="col-12 col-sm-6 col-md-4 d-flex justify-content-center">
                <div
                  className="announcement rounded bg-dark text-light flex-fill d-flex flex-column text-center"
                  style={{ minWidth: "180px", width: "100%", height: "120px" }}
                >
                  <div className="row w-100 h-100">
                    {/* Text Column */}
                    <div className="col-9 d-flex flex-column align-items-center justify-content-center">
                      <h1 className="fs-5 mb-1">50.21213 PLS</h1>
                      <p className="mb-1" style={{ fontSize: "12px" }}>
                        Your Tokens
                      </p>
                      <p className="mb-2 fs-6">Value: 45453 USD</p>
                    </div>

                    {/* Image Column */}
                    <div className="col-3 d-flex align-items-center justify-content-center">
                      <img src={XerionLogo} width={40} height={40} alt="Logo" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Your Dividends Earnings Box */}
              <div className="col-12 col-sm-6 col-md-4 d-flex justify-content-center">
                <div
                  className="announcement rounded bg-dark text-light flex-fill d-flex flex-column align-items-center justify-content-center text-center"
                  style={{ minWidth: "180px", width: "100%", height: "120px" }}
                >
                  <h1 className="fs-5 mb-1">50.21213 PLS</h1>
                  <p className="mb-1" style={{ fontSize: "12px" }}>
                    Your Dividends Earnings
                  </p>
                  <p className="mb-2 fs-6">Value: 45453 USD</p>
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
