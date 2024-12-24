import "bootstrap/dist/css/bootstrap.min.css";
import "../Styles/DataTable.css";
import XerionLogo from "../assets/XerionLogo.png";
import FluxinLogo from "../assets/FluxinLogo.png";
import MetaMaskIcon from "../assets/metamask-icon.png";
import { useLocation } from "react-router-dom";
import { useDAVToken } from "../Context/DavTokenContext";
import { useState } from "react";
const DataTable = () => {
  const {
    // StartMarketPlaceListing,
    BurnTokenRatio,
    RatioTargetAmount,
    handleAddToken,
    HandleBurn,
    CheckMintBalance,
    OneListedTokenBurned,
    ListedTokenBurned,
    SwapTokens,
    ButtonText,
    claiming,
    Distributed,
    ClaimTokens,
  } = useDAVToken();
  const location = useLocation();
  const isBurn = location.pathname === "/burn";
  const isAuction = location.pathname === "/auction";

  const [errorPopup, setErrorPopup] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const Checking = async () => {
    setIsChecking(true); // Set checking to true when button is clicked
    try {
      await CheckMintBalance();
    } catch (e) {
      if (
        e.reason === "No additional DAV tokens added" ||
        (e.revert &&
          e.revert.args &&
          e.revert.args[0] === "No additional DAV tokens added")
      ) {
        console.error("No additional DAV tokens added:", e);
        setErrorPopup(true); // Show error popup if specific error occurs
      } else {
        console.error("Error calling seeMintableAmount:", e);
      }
    }
    setIsChecking(false); // Reset checking state after function execution
  };
  async function Swapping() {
    await SwapTokens("100");
  }
  return (
    <>
      {isAuction ? (
        <>
          <div className="container mt-4 datatablemarginbottom">
            <div className="table-responsive">
              <table className="table table-dark">
                <thead>
                  <tr className="align-item-center">
                    <th>#</th>
                    <th className="">Name</th>
                    <th>Mint</th>
                    <th></th>
                    <th>Price</th>
                    <th>Liquidity</th>
                    <th>Current Ratio</th>
                    <th>Ratio Target</th>
                    <th>Ratio Swap</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {/* Example Rows */}
                  <tr>
                    <td>1</td>
                    <td>
                      {/* <div className="d-flex justify-content-between align-items-center"> */}
                      <div className="tableName d-flex gap-4 align-items-center">
                        <div className="nameImage">
                          <img
                            src={FluxinLogo}
                            width={40}
                            height={40}
                            alt="Logo"
                          />
                        </div>
                        <div className="nameDetails">
                          <h5 className="nameBig">Fluxin</h5>
                          <p className="nameSmall mb-1 uppercase">Fluxin</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center justify-content-center">
                        <div
                          onClick={
                            Distributed !== "0.0" && !claiming
                              ? ClaimTokens
                              : null
                          }
                          className={`tableClaim hoverEffect ${
                            claiming || Distributed === "0.0" ? "disabled" : ""
                          }`}
                          style={{
                            pointerEvents:
                              claiming || Distributed === "0.0"
                                ? "none"
                                : "auto",
                          }}
                        >
                          {claiming
                            ? "minting.."
                            : `${Distributed ?? "0.0"} Mint`}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div
                        className={`d-flex align-items-center gap-2 ${
                          isChecking || Distributed > 0 ? "disabled" : ""
                        }`}
                      >
                        <button
                          onClick={Checking}
                          disabled={isChecking || Distributed > 0} // Disable if isChecking or Distributed > 0
                          className="btn btn-primary btn-sm swap-btn"
                        >
                          {isChecking ? "Checking..." : "Mint Balance"}
                        </button>
                      </div>

                      {errorPopup && (
                        <div className="popup-overlay">
                          <div className="popup-content">
                            <h4>Mint Additional DAV Tokens</h4>
                            <p>
                              You need to mint additional DAV tokens to claim
                              your reward.
                            </p>
                            <button
                              onClick={() => setErrorPopup(false)}
                              className="btn btn-secondary"
                            >
                              Close
                            </button>
                          </div>
                        </div>
                      )}
                    </td>
                    <td>$0.00000089</td>
                    <td className="text-success">1.25 M</td>
                    <td>1 : 250 M</td>
                    <td>{RatioTargetAmount} T</td>
                    <td className="tagTd">
                      <div className="d-flex justify-content-center gap-3 w-100">
                        <div className="tableClaim">100 RT</div>
                        <div className="tableClaim">200 State</div>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <button
                          onClick={Swapping}
                          disabled={ButtonText.includes("...")}
                          className="btn btn-primary btn-sm swap-btn"
                        >
                          {ButtonText.includes("...") ? ButtonText : "Swap"}
                        </button>

                        <img
                          src={MetaMaskIcon}
                          width={20}
                          height={20}
                          alt="Logo"
                          style={{ cursor: "pointer" }}
                          onClick={handleAddToken}
                        />
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>2</td>
                    <td>
                      <div className="tableName d-flex gap-4 align-items-center">
                        <div className="nameImage">
                          <img src={XerionLogo} alt="Logo" />
                        </div>
                        <div className="nameDetails">
                          <h5 className="nameBig">Xerion</h5>
                          <p className="nameSmall mb-1 uppercase">Xerion</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center justify-content-center">
                        <div className="tableClaim ">789 Mint</div>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <button className="btn btn-primary btn-sm swap-btn">
                          Mint Balance
                        </button>
                      </div>
                    </td>
                    <td>$0.0000067</td>
                    <td className="text-success">2.67 M</td>
                    <td>1 : 250 K</td>
                    <td>1 : 1 T</td>
                    <td>
                      <div className="d-flex justify-content-center gap-3 w-100">
                        <div className="tableClaim">50 000 Flixin</div>
                        <div className="tableClaim">25 000 000 State</div>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <button className="btn btn-primary btn-sm swap-btn">
                          Swap
                        </button>
                        <img
                          src={MetaMaskIcon}
                          width={20}
                          height={20}
                          alt="Logo"
                        />
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : isBurn ? (
        <>
          <div className="container mt-4 datatablemarginbottom">
            <div className="table-responsive">
              <table className="table table-dark">
                <thead>
                  <tr className="align-item-center">
                    <th>#</th>
                    <th></th>
                    <th className="">Name</th>
                    <th>Burn Ratio</th>
                    <th>Bounty</th>
                    <th>Burn Amount</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {/* Example Rows */}
                  <tr>
                    <td>1</td>
                    <td>
                      <div className="nameImage">
                        <img src={FluxinLogo} alt="Logo" />
                      </div>
                    </td>
                    <td>
                      <div className="nameDetails">
                        <h5 className="nameBig">Fluxin</h5>
                        <p className="nameSmall mb-1 uppercase">Fluxin</p>
                      </div>
                    </td>
                    <td>{BurnTokenRatio}</td>
                    <td>{OneListedTokenBurned} Fluxin</td>
                    <td>
                      <div className="d-flex align-items-center justify-content-center">
                        <div className="tableClaim">
                          {ListedTokenBurned} Fluxin
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center justify-content-center">
                        <button
                          disabled={ButtonText.includes("...")}
                          onClick={HandleBurn}
                          className="btn btn-primary btn-sm swap-btn"
                        >
                          {ButtonText.includes("...") ? ButtonText : "Burn"}
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <></>
      )}
    </>
  );
};

export default DataTable;
