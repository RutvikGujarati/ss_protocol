import "bootstrap/dist/css/bootstrap.min.css";
import "../Styles/DetailsInfo.css";
import "../Styles/SearchInfo.css";
import MetaMaskIcon from "../assets/metamask-icon.png";
import { useSwapContract } from "../Functions/SwapContractFunctions";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { TokensDetails } from "../data/TokensDetails";
import { Auction_TESTNET } from "../ContractAddresses";
import { useDAvContract } from "../Functions/DavTokenFunctions";
import { Tooltip } from "bootstrap";

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

  const tokens = TokensDetails();

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
    if (token.tokenName === "DAV" || token.tokenName === "STATE") return null;

    const value = (500000000000 - token.DavVault) / token.DavVault;
    const isBuy = value <= targetRatio;
    const tooltipText = isBuy ? "Buy" : "Sell";

    return (
      <span
        className="ms-2"
        style={{ color: isBuy ? "green" : "red", cursor: "pointer" }}
        data-bs-toggle="tooltip"
        data-bs-placement="top"
        title={tooltipText}
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

  const dataToShow = selectedToken
    ? tokens.find((token) => token.tokenName === selectedToken.name)
    : filteredTokens[0] || tokens[0];

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
                <th className="text-center">
                  <a
                    href={`https://scan.v4.testnet.pulsechain.com/#/address/${Auction_TESTNET}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: "15px", color: "white" }}
                  >
                    <i className="bi bi-box-arrow-up-right"></i>
                  </a>
                </th>
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
              {filteredTokens
                .filter((token) => token.isSupported)
                .sort((a, b) => {
                  const order = { DAV: 0, STATE: 1 };

                  // Handle DAV and STATE first
                  if (
                    order[a.tokenName] !== undefined ||
                    order[b.tokenName] !== undefined
                  ) {
                    return (
                      (order[a.tokenName] ?? 99) - (order[b.tokenName] ?? 99)
                    );
                  }

                  // Now sort by vault ratio
                  const aRatio = getVaultRatio(a);
                  const bRatio = getVaultRatio(b);

                  const aIsRed = aRatio !== null && aRatio > targetRatio;
                  const bIsRed = bRatio !== null && bRatio > targetRatio;

                  return aIsRed === bIsRed ? 0 : aIsRed ? -1 : 1;
                })

                .map((token) => (
                  <tr key={token.tokenName}>
                    <td className="text-center">{`${token.emoji} ${token.tokenName}`}</td>
                    <td className="text-center">
                      <div className="mx-2">
                        {token.tokenName === "DAV" ||
                        token.tokenName === "STATE"
                          ? "------"
                          : "1:1000"}
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
                      <div className="d-flex justify-content-center align-items-center gap-4">
                        <a
                          href={`https://scan.v4.testnet.pulsechain.com/#/address/${token.TokenAddress}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ fontSize: "15px", color: "white" }}
                        >
                          <i className="bi bi-box-arrow-up-right"></i>
                        </a>
                        <img
                          src={MetaMaskIcon}
                          onClick={() =>
                            handleAddToken(
                              token.TokenAddress,
                              token.tokenName === "DAV"
                                ? "pDAV"
                                : token.tokenName === "STATE"
                                ? "State"
                                : token.tokenName
                            )
                          }
                          alt="State Logo"
                          style={{
                            width: "20px",
                            height: "20px",
                            cursor: "pointer",
                          }}
                        />

                        {token.tokenName === "DAV" ? (
                          "-------"
                        ) : token.tokenName === "STATE" ? (
                          DavAddress ===
                          "0x0000000000000000000000000000000000000000" ? (
                            <button
                              className="btn btn-sm swap-btn btn-primary"
                              onClick={() => setDavAndStateIntoSwap()}
                            >
                              Add
                            </button>
                          ) : (
                            <span className="text-green-500">ADDED</span>
                          )
                        ) : token.isRenounced == "true" ? (
                          <span className="text-green-500">Renounced</span>
                        ) : (
                          <span className="text-green-500">-------</span>
                        )}
                      </div>
                    </td>
                    <td></td>
                    <td>{getVaultIndicator(token)}</td>

                    <td></td>
                  </tr>
                ))}
            </tbody>
          </table>
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
