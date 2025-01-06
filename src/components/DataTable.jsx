import "bootstrap/dist/css/bootstrap.min.css";
import "../Styles/DataTable.css";
import XerionLogo from "../assets/XerionLogo.png";
import stateLogo from "../assets/state_logo.png";
import MetaMaskIcon from "../assets/metamask-icon.png";
import { useLocation } from "react-router-dom";
import { useDAVToken } from "../Context/DavTokenContext";
import { useState } from "react";
import { formatWithCommas } from "./DetailsInfo";
import { Xerion, Xerion2, Xerion3 } from "../Context/DavTokenContext";

const DataTable = () => {
  const {
    SwapTokens,
    handleAddTokenState,
    CheckMintBalance,
    // claiming,
    Distributed,
    // DavBalance,
    ClaimTokens,
    handleAddXerion1,
    handleAddXerion2,
    handleAddXerion3,
  } = useDAVToken();
  const location = useLocation();
  const isAuction = location.pathname === "/auction";
  const [errorPopup, setErrorPopup] = useState({});
  const [checkingStates, setCheckingStates] = useState({}); // State for checking buttons
  const [swappingStates, setSwappingStates] = useState({}); // State for swapping buttons
  const [claimingStates, setClaimingStates] = useState({}); // Separate claiming state for each token

  const Checking = async (id) => {
    setCheckingStates((prev) => ({ ...prev, [id]: true })); // Set checking state for specific button
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
        setErrorPopup((prev) => ({ ...prev, [id]: true })); // Show error popup for the specific token
      } else {
        console.error("Error calling seeMintableAmount:", e);
      }
    }
    setCheckingStates((prev) => ({ ...prev, [id]: false })); // Reset checking state
  };

  const Swapping = async (id, token) => {
    setSwappingStates((prev) => ({ ...prev, [id]: true })); // Set swapping state for specific button
    await SwapTokens("1", token);
    setSwappingStates((prev) => ({ ...prev, [id]: false })); // Reset swapping state
  };

  const handleClaimTokens = async (id) => {
    setClaimingStates((prev) => ({ ...prev, [id]: true }));
    await ClaimTokens();
    setClaimingStates((prev) => ({ ...prev, [id]: false })); // Reset claiming state
  };

  return isAuction ? (
    <div className="container mt-4 datatablemarginbottom">
      <div className="table-responsive">
        <table className="table table-dark">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
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
            {[
              {
                id: "state",
                name: "STATE",
                Pname: "pSTATE",
                image: stateLogo,
                handleAddXerion: handleAddTokenState,
                ratio: "1:1",
                token: null,
                inputTokenAmount: 1,
                distributedAmount: Distributed,
                outputToken: 1,
              },
              {
                id: "xerion",
                name: "Xerion",
                Pname: "Xerion",
                image: XerionLogo,
                ratio: "1:2",
                distributedAmount: "0.0",
                token: Xerion,
                handleAddXerion: handleAddXerion1,
                inputTokenAmount: 1,
                outputToken: 2,
              },
              {
                id: "xerion2",
                name: "Xerion2",
                Pname: "Xerion2",
                distributedAmount: "0.0",
                handleAddXerion: handleAddXerion2,
                image: XerionLogo,
                ratio: "1:1",
                token: Xerion2,
                inputTokenAmount: 1,
                outputToken: 1,
              },
              {
                id: "xerion3",
                name: "Xerion3",
                Pname: "Xerion3",
                distributedAmount: "0.0",
                handleAddXerion: handleAddXerion3,
                image: XerionLogo,
                ratio: "1:1",
                token: Xerion3,
                inputTokenAmount: 1,
                outputToken: 1,
              },
            ].map(
              (
                {
                  id,
                  name,
                  Pname,
                  image,
                  ratio,
                  distributedAmount,
                  token,
                  inputTokenAmount,
                  handleAddXerion,
                  outputToken,
                },
                index
              ) => (
                <tr key={index}>
                  <td>{index === 0 ? "±" : index}</td>
                  <td>
                    <div className="tableName d-flex gap-4 align-items-center">
                      <div className="nameImage">
                        <img src={image} width={40} height={40} alt="Logo" />
                      </div>
                      <div className="nameDetails">
                        <h5 className="nameBig">{name}</h5>
                        <p className="nameSmall mb-1 uppercase">{Pname}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <button
                      onClick={() => Checking(id)}
                      disabled={id !== "state" || checkingStates[id]} // Disable for tokens other than STATE
                      className="btn btn-primary btn-sm swap-btn"
                    >
                      {checkingStates[id] ? "Checking..." : "Mint Balance"}
                    </button>
                  </td>
                  <td>
                    <div
                      onClick={
                        Distributed !== "0.0" && !claimingStates[id]
                          ? () => handleClaimTokens(id)
                          : null
                      }
                      className={` btn btn-primary btn-sm swap-btn ${
                        claimingStates[id] || distributedAmount === "0.0"
                          ? "disabled"
                          : ""
                      }`}
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      {claimingStates[id]
                        ? "minting..."
                        : `${formatWithCommas(distributedAmount) ?? "0.0"}`}
                    </div>
                  </td>

                  <td>$0.0</td>
                  <td className="text-success">0.0</td>
                  <td>0:0</td>
                  <td>{ratio}</td>
                  <td>
                    <div className="d-flex justify-content-center gap-3 w-100">
                      <div className="tableClaim">
                        {inputTokenAmount} Xerion
                      </div>
                      <div className="tableClaim">{outputToken} State</div>
                    </div>
                  </td>
                  {errorPopup[id] && (
                    <div className="popup-overlay">
                      <div className="popup-content">
                        <h4 className="popup-header">
                          Mint Additional DAV Tokens
                        </h4>
                        <p className="popup-para">
                          You need to mint additional DAV tokens to claim your
                          reward.
                        </p>
                        <button
                          onClick={() =>
                            setErrorPopup((prev) => ({ ...prev, [id]: false }))
                          }
                          className="btn btn-secondary popup-button"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  )}
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <button
                        onClick={() => Swapping(id, token)}
                        disabled={id === "state" || swappingStates[id]} // Disable for STATE
                        className="btn btn-primary btn-sm swap-btn"
                      >
                        {swappingStates[id] ? "Swapping..." : "Swap"}
                      </button>

                      <img
                        src={MetaMaskIcon}
                        width={20}
                        height={20}
                        alt="Logo"
                        style={{ cursor: "pointer" }}
                        onClick={handleAddXerion}
                      />
                    </div>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  ) : null;
};

export default DataTable;
