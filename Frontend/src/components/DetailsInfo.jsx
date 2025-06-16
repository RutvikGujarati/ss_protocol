import "bootstrap/dist/css/bootstrap.min.css";
import "../Styles/DetailsInfo.css";
import "../Styles/SearchInfo.css";
import MetaMaskIcon from "../assets/metamask-icon.png";
import { useSwapContract } from "../Functions/SwapContractFunctions";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { TokensDetails } from "../data/TokensDetails";
import { useDAvContract } from "../Functions/DavTokenFunctions";
import { Tooltip } from "bootstrap";
import IOSpinner from "../Constants/Spinner";
import toast from "react-hot-toast";
import dav from "../assets/davlogo.png";
import state from "../assets/statelogo.png";

export const formatWithCommas = (value) => {
  if (value === null || value === undefined) return "";
  const valueString = value.toString();
  const [integerPart, decimalPart] = valueString.split(".");
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return decimalPart ? `${formattedInteger}.${decimalPart}` : formattedInteger;
};

const DetailsInfo = ({ selectedToken }) => {
  const {
    setDBRequired,
    setDBForBurnRequired,
    setDavAndStateIntoSwap,
    handleAddToken,
    DavAddress,
  } = useSwapContract();
  const { totalStateBurned } = useDAvContract();
  const [localSearchQuery, setLocalSearchQuery] = useState("");
  const { tokens, loading } = TokensDetails(); // Destructure tokens and loading

  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === "DavBalanceRequire") {
        setDBRequired(event.newValue);
      }
      if (event.key === "DavBalanceRequireForBurn") {
        setDBForBurnRequired(event.newValue);
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const isInfoPage = location.pathname === "/info";

  useEffect(() => {
    const nameCells = document.querySelectorAll(".name-cell");
    nameCells.forEach((cell) => {
      cell.style.cursor = "pointer";
    });
  }, []);

  const targetRatio = 0.03;

  useEffect(() => {
    const tooltipTriggerList = document.querySelectorAll(
      '[data-bs-toggle="tooltip"]'
    );
    tooltipTriggerList.forEach((el) => {
      new Tooltip(el);
    });
  }, []);

  const handleSearch = (e) => {
    const query = e.target.value.trim(); // Trim to remove leading/trailing spaces
    setLocalSearchQuery(query);
  };

  // Filter tokens by tokenName based on search query
  const filteredTokens = tokens.filter((item) =>
    item.tokenName.toLowerCase().includes(localSearchQuery.toLowerCase())
  );

  const isImageUrl = (url) => {
    return (
      typeof url === "string" &&
      url.startsWith("https://") &&
      url.includes("ipfs")
    );
  };

  // Define order for priority tokens (DAV and STATE)
  const order = { DAV: 0, STATE: 1 };

  // Get supported tokens
  const supportedTokens = tokens.filter((token) => token.isSupported);

  // Helper function to sort tokens for display
  const getSortedTokens = (tokensToSort) => {
    // Step 1: Extract and sort DAV and STATE to ensure they appear at the top
    const priorityTokens = tokensToSort
      .filter((t) => order[t.tokenName] !== undefined)
      .sort((a, b) => (order[a.tokenName] ?? 99) - (order[b.tokenName] ?? 99));

    // Step 2: Get top 5 tokens (excluding DAV and STATE) with highest ratios
    const topFiveTokens = tokensToSort
      .filter(
        (t) =>
          order[t.tokenName] === undefined && t.ratio != null && t.isSupported
      )
      .sort((a, b) => {
        const aRatio = a.ratio ?? -Infinity;
        const bRatio = b.ratio ?? -Infinity;
        return bRatio - aRatio; // Sort by token.ratio descending
      })
      .slice(0, 5);

    // Step 3: Get remaining tokens (excluding DAV, STATE, and top 5)
    const remainingTokens = tokensToSort
      .filter(
        (t) =>
          order[t.tokenName] === undefined &&
          !topFiveTokens.some((top) => top.tokenName === t.tokenName) &&
          t.isSupported
      )
      .sort((a, b) => {
        const aRatio = a.ratio ?? -Infinity;
        const bRatio = b.ratio ?? -Infinity;
        return bRatio - aRatio; // Sort by token.ratio descending
      });

    // Combine: DAV/STATE first, then top 5 tokens, then remaining tokens
    return [...priorityTokens, ...topFiveTokens, ...remainingTokens];
  };

  // Apply sorting to filtered tokens (search results) or all supported tokens
  const sortedTokens = getSortedTokens(
    localSearchQuery ? filteredTokens : supportedTokens
  );

  // Determine data to show: prioritize selectedToken, fallback to first sorted token, or null
  const dataToShow = selectedToken
    ? tokens.find((token) => token.tokenName === selectedToken.name)
    : sortedTokens[0] || null;

  // Select top 5 tokens (excluding DAV and STATE) with best ratios for green/red dot
  const greenDotEligibleTokens = (loading ? filteredTokens : supportedTokens)
    .filter(
      (token) =>
        token.isSupported &&
        token.tokenName !== "DAV" &&
        token.tokenName !== "STATE" &&
        token.ratio != null
    )
    .sort((a, b) => {
      const aRatio = a.ratio ?? -Infinity;
      const bRatio = b.ratio ?? -Infinity;
      const aIsRed = aRatio > targetRatio;
      const bIsRed = bRatio > targetRatio;
      // Prefer green (not red), then lower ratio
      if (aIsRed !== bIsRed) return aIsRed ? 1 : -1;
      return aRatio - bRatio;
    })
    .slice(0, 5)
    .map((token) => token.tokenName);

  return (
    <div className="container mt-3 p-0">
      <div className="mb-3 d-flex justify-content-center">
        <input
          type="text"
          className="form-control text-center"
          placeholder="SEARCH"
          value={localSearchQuery}
          onChange={handleSearch}
          style={{ maxWidth: "300%", "--placeholder-color": "#6c757d" }}
        />
      </div>
      <div className={`table-responsive ${isInfoPage ? "info-page" : ""}`}>
        {dataToShow ? (
          <>
            <table className="table table-dark">
              <thead>
                <tr>
                  <th className="text-center">Token Name</th>
                  <th className="text-center">Current Ratio</th>
                  <th className="text-center">Auctions</th>
                  <th className="text-center">DAV Vault</th>
                  <th className="text-center">Burned</th>
                  <th className="text-center">Info</th>
                  <th></th>
                  <th className="text-center">Market Maker</th>
                  <th className="col-auto"></th>
                </tr>
              </thead>
              <tbody>
                {sortedTokens.map((token) => {
                  const showDot = greenDotEligibleTokens.includes(
                    token.tokenName
                  );
                  const ratio = Number(token.ratio);
                  const isRed = ratio != null && ratio > targetRatio;
                  return (
                    <tr key={token.tokenName}>
                      <td className="text-center align-middle">
                        <div className="d-flex flex-column align-items-center">
                          <span style={{ fontSize: "1rem", lineHeight: "1" }}>
                            {token.tokenName === "DAV" ? (
                              <img
                                src={dav} // Replace with actual path
                                style={{ width: "30px", height: "30px" }}
                                alt="DAV logo"
                              />
                            ) : token.tokenName === "STATE" ? (
                              <img
                                src={state} // Replace with actual path
                                style={{ width: "30px", height: "30px" }}
                                alt="STATE logo"
                              />
                            ) : isImageUrl(token.emoji) ? (
                              <img
                                src={token.emoji}
                                style={{ width: "30px", height: "30px" }}
                                alt={`${token.tokenName} emoji`}
                              />
                            ) : (
                              <span style={{ fontSize: "20px" }}>
                                {token.emoji}
                              </span>
                            )}
                          </span>
                          <span>
                            {token.tokenName}
                            {token.isFlammed === "true" && <>🔥</>}
                          </span>
                        </div>
                      </td>
                      <td className="text-center">
                        <div className="mx-2">
                          {token.tokenName === "DAV" ||
                          token.tokenName === "STATE"
                            ? "------"
                            : `1:${formatWithCommas(token.ratio)}`}
                            {/* // : `1:1000`} */}
                        </div>
                      </td>
                      <td className="text-center">
                        <div className="mx-4">
                          {token.tokenName === "DAV" ||
                          token.tokenName === "STATE"
                            ? "-----"
                            : `${token.Cycle}/21`}
                        </div>
                      </td>
                      <td className="text-center">
                        <div className="mx-4">
                          {token.tokenName === "DAV"
                            ? "-----"
                            : `${formatWithCommas(token.DavVault)}`}
                        </div>
                      </td>
                      <td className="text-center">
                        <div className="mx-4">
                          {token.tokenName === "DAV"
                            ? "-----"
                            : token.tokenName === "STATE"
                            ? formatWithCommas(
                                Number(token.burned || 0) +
                                  Number(totalStateBurned)
                              )
                            : formatWithCommas(token.burned || 0)}
                        </div>
                      </td>
                      <td className="text-center">
                        <div className="d-flex justify-content-center align-items-center gap-3">
                          <div className="d-flex flex-column align-items-center">
                            <a
                              href={`https://scan.v4.testnet.pulsechain.com/#/address/${token.TokenAddress}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ fontSize: "15px", color: "white" }}
                            >
                              <i className="bi bi-box-arrow-up-right"></i>
                            </a>
                          </div>
                          <div
                            className="d-flex flex-column align-items-center"
                            style={{ cursor: "pointer" }}
                          >
                            <i
                              className="fa-solid fa-copy"
                              onClick={() => {
                                navigator.clipboard.writeText(
                                  token.TokenAddress
                                );
                                toast.success(
                                  `${token.tokenName} Address copied to clipboard!`,
                                  {
                                    position: "top-center",
                                    autoClose: 2000,
                                    hideProgressBar: true,
                                    closeOnClick: true,
                                    pauseOnHover: false,
                                    draggable: false,
                                    theme: "dark",
                                  }
                                );
                              }}
                              title="Copy Address"
                              style={{
                                fontSize: "15px",
                                color: "white",
                                cursor: "pointer",
                              }}
                            ></i>
                          </div>
                          <div
                            className="d-flex align-items-center"
                            style={{ marginRight: "-10px" }}
                          >
                            <img
                              src={MetaMaskIcon}
                              onClick={() =>
                                handleAddToken(
                                  token.TokenAddress,
                                  token.tokenName === "DAV"
                                    ? "pDAV"
                                    : token.tokenName === "STATE"
                                    ? "STATTE"
                                    : token.tokenName
                                )
                              }
                              alt="MetaMask"
                              style={{
                                width: "20px",
                                height: "20px",
                                cursor: "pointer",
                              }}
                            />
                          </div>
                          <div
                            className="d-flex flex-column align-items-center"
                            style={{ minWidth: "80px" }}
                          >
                            {token.tokenName === "DAV" ? (
                              token.isRenounced === true && (
                                <span>Renounced</span>
                              )
                            ) : token.tokenName === "STATE" ? (
                              DavAddress ===
                              "0x0000000000000000000000000000000000000000" ? (
                                <button
                                  className="btn btn-sm swap-btn btn-primary"
                                  onClick={() => setDavAndStateIntoSwap()}
                                >
                                  Add
                                </button>
                              ) : token.isRenounced === true ? (
                                <span>Renounced</span>
                              ) : (
                                <span>ADDED</span>
                              )
                            ) : token.isRenounced === "true" ? (
                              <span>Renounced</span>
                            ) : (
                              <span>-------</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td></td>
                      <td>
                        {showDot && (
                          <span
                            style={{
                              marginLeft: "6px",
                              width: "10px",
                              height: "10px",
                              borderRadius: "50%",
                              display: "inline-block",
                              backgroundColor: isRed ? "green" : "green",
                            }}
                          ></span>
                        )}
                      </td>
                      <td></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {loading && filteredTokens.length > 0 && (
              <div className="container text-center mt-5">
                <p className="funny-loading-text">
                  <IOSpinner /> Fetching..
                </p>
              </div>
            )}
            {!loading && filteredTokens.length === 0 && (
              <div className="alert alert-warning text-center" role="alert">
                No tokens found matching the search query.
              </div>
            )}
          </>
        ) : (
          <div className="alert alert-warning text-center" role="alert">
            No tokens available to display.
          </div>
        )}
      </div>
    </div>
  );
};

DetailsInfo.propTypes = {
  selectedToken: PropTypes.object,
};

export default DetailsInfo;
