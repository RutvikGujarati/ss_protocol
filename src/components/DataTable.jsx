import "bootstrap/dist/css/bootstrap.min.css";
import "../Styles/DataTable.css";
import XerionLogo from "../assets/XerionLogo.png";
// import FluxinLogo from "../assets/FluxinLogo.png";
import stateLogo from "../assets/state_logo.png";

import MetaMaskIcon from "../assets/metamask-icon.png";
import { useLocation } from "react-router-dom";
import { STATE_TOKEN_ADDRESS, useDAVToken } from "../Context/DavTokenContext";
import { useState } from "react";
import { formatWithCommas } from "./DetailsInfo";

import { Xerion, Xerion2 } from "../Context/DavTokenContext";
const DataTable = () => {
  const {
    // StartMarketPlaceListing,
    // BurnTokenRatio,
    // RatioTargetAmount,
    // HandleBurn,
    // OneListedTokenBurned,
    // ListedTokenBurned,
    SwapTokens,
    handleAddTokenState,
    CheckMintBalance,
    ButtonText,
    claiming,
    DavBalance,
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
        e.reason === "StateToken: No new DAV minted" ||
        (e.revert &&
          e.revert.args &&
          e.revert.args[0] === "StateToken: No new DAV minted")
      ) {
        console.error("StateToken: No new DAV minted:", e);
        setErrorPopup(true); // Show error popup if specific error occurs
      } else {
        console.error("Error calling seeMintableAmount:", e);
      }
    }
    setIsChecking(false); // Reset checking state after function execution
  };

  async function Swapping() {
    await SwapTokens("1",Xerion);
  }
  async function SwappingXerion2() {
    await SwapTokens("1",Xerion2);
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
                    <th>Check</th>
                    <th>Mint</th>
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
                    <td>±</td>
                    <td>
                      {/* <div className="d-flex justify-content-between align-items-center"> */}
                      <div className="tableName d-flex gap-4 align-items-center">
                        <div className="nameImage">
                          <img
                            src={stateLogo}
                            width={40}
                            height={40}
                            alt="Logo"
                          />
                        </div>
                        <div className="nameDetails">
                          <h5 className="nameBig">STATE</h5>
                          <p className="nameSmall mb-1 uppercase">pState</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div
                        className={`d-flex align-items-center justify-content-center ${
                          isChecking || Distributed > 0 ? "disabled" : ""
                        }`}
                      >
                        <button
                          onClick={Checking}
                          disabled={
                            isChecking || Distributed > 0 || DavBalance == 0
                          }
                          className="btn btn-primary btn-sm swap-btn"
                        >
                          {isChecking ? "Checking..." : "Mint Balance"}
                        </button>
                      </div>

                      {errorPopup && (
                        <div className="popup-overlay">
                          <div className="popup-content">
                            <h4 className="popup-header">
                              Mint Additional DAV Tokens
                            </h4>
                            <p className="popup-para">
                              You need to mint additional DAV tokens to claim
                              your reward.
                            </p>
                            <button
                              onClick={() => setErrorPopup(false)}
                              className="btn btn-secondary popup-button"
                            >
                              Close
                            </button>
                          </div>
                        </div>
                      )}
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
                            : `${formatWithCommas(Distributed) ?? "0.0"}`}
                        </div>
                      </div>
                    </td>

                    <td>$0.0</td>
                    <td className="text-success">0.0 </td>
                    <td>0:0 </td>
                    {/* <td>{RatioTargetAmount} </td> */}
                    <td>1:1 </td>
                    <td className="tagTd">
                      <div className="d-flex justify-content-center gap-3 w-100">
                        <div className="tableClaim">0 Xerion</div>
                        <div className="tableClaim">0 State </div>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <button
                          onClick={Swapping}
                          //   disabled={ButtonText.includes("...")}
                          disabled={true}
                          className="btn btn-primary btn-sm swap-btn"
                        >
                          {/* {ButtonText.includes("...") ? ButtonText : "Swap"} */}
                          Swap
                        </button>

                        <img
                          src={MetaMaskIcon}
                          width={20}
                          height={20}
                          alt="Logo"
                          style={{ cursor: "pointer" }}
                          onClick={handleAddTokenState}
                        />
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>1</td>
                    <td>
                      {/* <div className="d-flex justify-content-between align-items-center"> */}
                      <div className="tableName d-flex gap-4 align-items-center">
                        <div className="nameImage">
                          <img
                            src={XerionLogo}
                            width={40}
                            height={40}
                            alt="Logo"
                          />
                        </div>
                        <div className="nameDetails">
                          <h5 className="nameBig">Xerion</h5>
                          <p className="nameSmall mb-1 uppercase">Xerion</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div
                        className={`d-flex align-items-center justify-content-center ${
                          isChecking || Distributed > 0 ? "disabled" : ""
                        }`}
                      >
                        <button
                          onClick={Checking}
                          //   disabled={
                          //     isChecking || Distributed > 0 || DavBalance == 0
                          //   }
                          disabled={true}
                          className="btn btn-primary btn-sm swap-btn"
                        >
                          {isChecking ? "Checking..." : "Mint Balance"}
                        </button>
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
                          disabled={true}
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
                            : `${formatWithCommas(Distributed) ?? "0.0"}`}
                        </div>
                      </div>
                    </td>

                    <td>$0.0</td>
                    <td className="text-success">0.0 </td>
                    <td>0:0 </td>
                    {/* <td>{RatioTargetAmount} </td> */}
                    <td>1:2 </td>
                    <td className="tagTd">
                      <div className="d-flex justify-content-center gap-3 w-100">
                        <div className="tableClaim">1 Xerion</div>
                        <div className="tableClaim">2 State </div>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <button
                          onClick={Swapping}
                          disabled={ButtonText.includes("...")}
                          //   disabled={true}
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
                          onClick={handleAddTokenState}
                        />
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>2</td>
                    <td>
                      {/* <div className="d-flex justify-content-between align-items-center"> */}
                      <div className="tableName d-flex gap-4 align-items-center">
                        <div className="nameImage">
                          <img
                            src={XerionLogo}
                            width={40}
                            height={40}
                            alt="Logo"
                          />
                        </div>
                        <div className="nameDetails">
                          <h5 className="nameBig">Xerion2</h5>
                          <p className="nameSmall mb-1 uppercase">Xerion2</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div
                        className={`d-flex align-items-center justify-content-center ${
                          isChecking || Distributed > 0 ? "disabled" : ""
                        }`}
                      >
                        <button
                          onClick={Checking}
                          //   disabled={
                          //     isChecking || Distributed > 0 || DavBalance == 0
                          //   }
                          disabled={true}
                          className="btn btn-primary btn-sm swap-btn"
                        >
                          {isChecking ? "Checking..." : "Mint Balance"}
                        </button>
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
                          disabled={true}
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
                            : `${formatWithCommas(Distributed) ?? "0.0"}`}
                        </div>
                      </div>
                    </td>

                    <td>$0.0</td>
                    <td className="text-success">0.0 </td>
                    <td>0:0 </td>
                    {/* <td>{RatioTargetAmount} </td> */}
                    <td>1:1 </td>
                    <td className="tagTd">
                      <div className="d-flex justify-content-center gap-3 w-100">
                        <div className="tableClaim">1 Xerion</div>
                        <div className="tableClaim">1 State </div>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <button
                          onClick={SwappingXerion2}
                          disabled={ButtonText.includes("...")}
                          //   disabled={true}
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
                          onClick={handleAddTokenState}
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
          {/* <div className="container mt-4 datatablemarginbottom">
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
          </div> */}
        </>
      ) : (
        <></>
      )}
    </>
  );
};

export default DataTable;
