import "bootstrap/dist/css/bootstrap.min.css";
import "../Styles/DetailsInfo.css";
import "../Styles/SearchInfo.css";
import MetaMaskIcon from "../assets/metamask-icon.png";
import { useSwapContract } from "../Functions/SwapContractFunctions";
import PropTypes from "prop-types";
import { useContext, useEffect, useState } from "react";
import { TokensDetails } from "../data/TokensDetails";
import { useDAvContract } from "../Functions/DavTokenFunctions";
import { Tooltip } from "bootstrap";
import IOSpinner from "../Constants/Spinner";
import toast from "react-hot-toast";
import dav from "../assets/davlogo.png";
import state from "../assets/statelogo.png";
import useTokenBalances from "./Swap/UserTokenBalances";
import { ContractContext } from "../Functions/ContractInitialize";
import { useAllTokens } from "./Swap/Tokens";

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
  const { signer } = useContext(ContractContext);
  const TOKENS = useAllTokens();
  const tokenBalances = useTokenBalances(TOKENS, signer);
  const [pstateToPlsRatio, setPstateToPlsRatio] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Debug logging
  useEffect(() => {
    console.log("TOKENS object:", TOKENS);
    console.log("Token balances:", tokenBalances);
    console.log("Tokens from TokensDetails:", tokens);
    console.log("pSTATE to PLS ratio:", pstateToPlsRatio);
  }, [TOKENS, tokenBalances, tokens, pstateToPlsRatio]);

  // Fetch pSTATE to PLS ratio
  const fetchPstateToPlsRatio = async () => {
    try {
      setIsRefreshing(true);
      const response = await fetch("https://api.geckoterminal.com/api/v2/networks/pulsechain/pools/0x3403400cf93c82e4d74e51a63b107626a63d53fb");
      if (response.ok) {
        const data = await response.json();
        // The ratio is base_token_price_quote_token which gives us pSTATE price in terms of quote token (WPLS)
        const ratio = parseFloat(data.data.attributes.base_token_price_quote_token);
        setPstateToPlsRatio(ratio);
        console.log("pSTATE to PLS ratio:", ratio);
      }
    } catch (err) {
      console.error("Error fetching pSTATE to PLS ratio:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Initial fetch on component mount
  useEffect(() => {
    fetchPstateToPlsRatio();
  }, []); // Empty dependency array - only runs once when component mounts

  // Helper function to calculate PLS value for a token
  const calculatePlsValue = (token) => {
    if (token.tokenName === "DAV" || token.tokenName === "STATE") {
      return "-----";
    }

    const userBalance = tokenBalances[token.tokenName];
    const tokenRatio = token.ratio;

    if (userBalance === undefined || !tokenRatio || pstateToPlsRatio <= 0) {
      return "Loading...";
    }

    // Calculate: (userBalance / tokenRatio) * pstateToPlsRatio
    const pstateValue = parseFloat(userBalance) * parseFloat(tokenRatio);
    const plsValue = pstateValue * pstateToPlsRatio;

    // Round to nearest thousand
    const roundedPlsValue = Math.round(plsValue / 1000) * 1000;

    console.log(`${token.tokenName} calculation:`, {
      userBalance,
      tokenRatio,
      pstateToPlsRatio,
      pstateValue,
      plsValue,
      roundedPlsValue
    });

    return `${formatWithCommas(roundedPlsValue.toFixed(0))} PLS`;
  };
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
  // Select top 5 tokens (excluding DAV and STATE) with best ratios for green dot
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
      return bRatio - aRatio; // Sort by ratio descending
    })
    .slice(0, 5)
    .map((token) => token.tokenName);


  return (
    <div className="container mt-3 p-0 pb-4 mb-5">
      <div className="mb-3 d-flex justify-content-center align-items-center gap-3">
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
                  <th className="text-center">Est. PLS Value</th>
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
                                style={{ width: "30px", height: "30px", borderRadius: "50%" }}
                                alt="DAV logo"
                              />
                            ) : token.tokenName === "STATE" ? (
                              <img
                                src={state} // Replace with actual path
                                style={{ width: "30px", height: "30px", borderRadius: "50%" }}
                                alt="STATE logo"
                              />
                            ) : isImageUrl(token.emoji) ? (
                              <img
                                src={token.emoji}
                                style={{ width: "30px", height: "30px", borderRadius: "50%" }}
                                alt={`${token.tokenName} emoji`}
                              />
                            ) : (
                              <span style={{ fontSize: "20px" }}>
                                {token.emoji}
                              </span>
                            )}
                          </span>
                          <span>
                            {token.tokenName === "DAV" ? "pDAV" : token.tokenName === "STATE" ? "pSTATE" : token.tokenName}
                          </span>
                        </div>
                      </td>
                      <td className="text-center">
                        <div className="mx-2">
                          {token.tokenName === "DAV" ||
                            token.tokenName === "STATE"
                            ? "------"
                            : (
                              <span style={{ color: showDot ? "#28a745" : "inherit" }}>
                                {`1:${formatWithCommas(token.ratio)}`}
                              </span>
                            )}
                        </div>
                      </td>
                      <td className="text-center">
                        <div className="mx-4">
                          {token.tokenName === "DAV" ||
                            token.tokenName === "STATE"
                            ? "-----"
                            : `${token.Cycle}/20`}
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
                              href={`https://kekxplorer.avecdra.pro/address/${token.TokenAddress}`}
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
                                      ? "pSTATE"
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

                      <td className="text-center">
                        <div className="mx-2">
                          {calculatePlsValue(token)}
                        </div>
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
