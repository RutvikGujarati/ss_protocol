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

  useEffect(() => {
    const nameCells = document.querySelectorAll(".name-cell");
    nameCells.forEach((cell) => {
      cell.style.cursor = "pointer";
    });
  }, []);

  const targetRatio = 0.03;

  const getVaultIndicator = (token) => {
    if (token.tokenName === "DAV" || token.tokenName === "$TATE1") return null;

    const value = (500000000000 - token.DavVault) / token.DavVault;
    const isBuy = value <= targetRatio;

    return (
      <span
        className="ms-2"
        style={{ color: isBuy ? "green" : "red", cursor: "pointer" }}
      >
        ●
      </span>
    );
  };

  useEffect(() => {
    const tooltipTriggerList = document.querySelectorAll(
      '[data-bs-toggle="tooltip"]'
    );
    tooltipTriggerList.forEach((el) => {
      new Tooltip(el);
    });
  }, []);

  const formatPrice = (price) => {
    if (!price || isNaN(price)) return "0.0000";

    const formattedPrice = parseFloat(price).toFixed(10);
    const [integerPart, decimalPart] = formattedPrice.split(".");

    const leadingZerosMatch = decimalPart.match(/^0+(.)/);
    if (leadingZerosMatch) {
      const leadingZeros = leadingZerosMatch[0].slice(0, -1);
      const firstSignificantDigit = leadingZerosMatch[1];
      const zeroCount = leadingZeros.length;
      if (zeroCount < 4) {
        return `${integerPart}.${"0".repeat(
          zeroCount
        )}${firstSignificantDigit}${decimalPart
          .slice(zeroCount + 1)
          .slice(0, 3)}`;
      } else {
        return (
          <>
            {integerPart}.<span>0</span>
            <sub>{zeroCount}</sub>
            {firstSignificantDigit}
            {decimalPart.slice(zeroCount + 1).slice(0, 3)}
          </>
        );
      }
    }

    return `${parseFloat(price).toFixed(7)}`;
  };

  const handleSearch = (e) => {
    const query = e.target.value;
    setLocalSearchQuery(query);
  };

  const filteredTokens = tokens.filter(
    (item) =>
      item.tokenName.toLowerCase().includes(localSearchQuery.toLowerCase()) ||
      item.emoji.includes(localSearchQuery)
  );

  const getVaultRatio = (token) => {
    if (token.tokenName === "DAV" || token.tokenName === "STATE") return null;
    return (500000000000 - token.DavVault) / token.DavVault;
  };
  const sortedTokens = tokens
    .filter((token) => token.isSupported)
    .sort((a, b) => {
      const order = { DAV: 0, $TATE1: 1 };

      // Prioritize DAV and STATE
      if (
        order[a.tokenName] !== undefined ||
        order[b.tokenName] !== undefined
      ) {
        return (order[a.tokenName] ?? 99) - (order[b.tokenName] ?? 99);
      }

      // Sort by ratio in descending order for other tokens
      const aRatio = a.ratio ?? -Infinity; // Handle null/undefined ratios
      const bRatio = b.ratio ?? -Infinity;
      return bRatio - aRatio; // Descending order
    });

  const dataToShow = selectedToken
    ? tokens.find((token) => token.tokenName === selectedToken.name)
    : filteredTokens[0] || tokens[0];

  // Filter static tokens (DAV and STATE) for display during loading
  const staticTokens = filteredTokens.filter(
    (token) => token.tokenName === "DAV" || token.tokenName === "STATE"
  );

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
      <div className="table-responsive">
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
                  {dataToShow.tokenName !== "DAV" ? (
                    <th className="fw-bold text-uppercase text-end col-auto">
                      <button className="swap-btn py-1 mx-3 btn btn-primary btn-sm">
                        Price: ${formatPrice(dataToShow.Price)}
                      </button>
                    </th>
                  ) : (
                    <th className="col-auto"></th>
                  )}
                </tr>
              </thead>
              <tbody>
                {(loading ? staticTokens : sortedTokens)
                  .filter((token) => token.isSupported)
                  .sort((a, b) => {
                    const order = { DAV: 0, STATE: 1 };

                    if (
                      order[a.tokenName] !== undefined ||
                      order[b.tokenName] !== undefined
                    ) {
                      return (
                        (order[a.tokenName] ?? 99) - (order[b.tokenName] ?? 99)
                      );
                    }

                    const aRatio = getVaultRatio(a);
                    const bRatio = getVaultRatio(b);

                    const aIsRed = aRatio !== null && aRatio > targetRatio;
                    const bIsRed = bRatio !== null && bRatio > targetRatio;

                    return aIsRed === bIsRed ? 0 : aIsRed ? -1 : 1;
                  })
                  .map((token) => (
                    <tr key={token.tokenName}>
                      <td className="text-center align-middle">
                        <div className="d-flex flex-column align-items-center">
                          <span style={{ fontSize: "1rem", lineHeight: "1" }}>
                            {token.emoji}
                          </span>
                          <span>{token.tokenName}</span>
                        </div>
                      </td>
                      <td className="text-center">
                        <div className="mx-2">
                          {token.tokenName === "DAV" ||
                          token.tokenName === "$TATE1"
                            ? "------"
                            : `1:${token.ratio}`}
                        </div>
                      </td>
                      <td className="text-center">
                        <div className="mx-4">
                          {token.tokenName === "DAV" ||
                          token.tokenName === "$TATE1"
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
                            : token.tokenName === "$TATE1"
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
                              href={`https://midgard.wtf/address/${token.TokenAddress}`}
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
                                    : token.tokenName === "$TATE1"
                                    ? "$TATE1"
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
                              "-------"
                            ) : token.tokenName === "$TATE1" ? (
                              DavAddress ===
                              "0x0000000000000000000000000000000000000000" ? (
                                <button
                                  className="btn btn-sm swap-btn btn-primary"
                                  onClick={() => setDavAndStateIntoSwap()}
                                >
                                  Add
                                </button>
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
                      <td>{getVaultIndicator(token)}</td>
                      <td></td>
                    </tr>
                  ))}
              </tbody>
            </table>
            {loading && staticTokens.length > 0 && (
              <div className="container text-center mt-5">
                <p className="funny-loading-text">
                  <IOSpinner /> Fetching..
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="alert alert-warning text-center" role="alert">
            Currently No detailed information is available for the selected
            token.
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
