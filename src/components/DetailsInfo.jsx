import "bootstrap/dist/css/bootstrap.min.css";
import "../Styles/DetailsInfo.css";
import "../Styles/SearchInfo.css";
import MetaMaskIcon from "../assets/metamask-icon.png";
import { useSwapContract } from "../Functions/SwapContractFunctions";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { TokensDetails } from "../data/TokensDetails";
import pulsex from "../assets/ninemm.png";
import { useChainId } from "wagmi";

import DAVLogo from "../assets/1.png";
import sDAV from "../assets/sDAV.png";
import stateLogo from "../assets/3.png";
import yees from "../assets/2.png";
import sState from "../assets/sonicstate.png";
import { Auction_TESTNET } from "../ContractAddresses";

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
    handleAddTokenDAV,
    handleAddTokensDAV,
    handleAddTokenState,
    handleAddTokensState,
    setDavAndStateIntoSwap,
    AddTokenIntoSwapContract,
  } = useSwapContract();

  const chainId = useChainId();

  const [filteredData, setFilteredData] = useState([]);
  const [localSearchQuery, setLocalSearchQuery] = useState("");

  const tokens = TokensDetails();

  const originalData = [
    { id: "∈", name: "DAV", logo: DAVLogo, AddToken: handleAddTokenDAV },
    { id: "±", name: "STATE", logo: stateLogo, AddToken: handleAddTokenState },
    { id: "±", name: "Yees", logo: yees, AddToken: handleAddTokenState },
  ];

  const SonicData = [
    { id: "∈", name: "DAV", logo: sDAV, AddToken: handleAddTokensDAV },
    { id: "±", name: "STATE", logo: sState, AddToken: handleAddTokensState },
  ];

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
  }, [filteredData]);

  useEffect(() => {
    const data = chainId === 146 ? SonicData : originalData;
    setFilteredData(data);
  }, [chainId]);

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
    const query = e.target.value.toLowerCase();
    setLocalSearchQuery(query);
  };

  const filteredTokens = tokens.filter((item) =>
    item.tokenName.toLowerCase().includes(localSearchQuery.toLowerCase())
  );

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
          style={{ maxWidth: "300%" }}
        />
      </div>
      <div className="table-responsive">
        {dataToShow ? (
          <table className="table table-dark">
            <thead>
              <tr>
                <th className="text-center">Logo</th>
                <th className="text-center">Token Name</th>
                <th className="text-center">Current Ratio</th>
                <th className="text-center">Auctions</th>
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
              {filteredTokens.map((token) => (
                <tr key={token.tokenName}>
                  <td className="text-center">
                    <img
                      src={
                        filteredData.find((d) => d.name === token.tokenName)
                          ?.logo
                      }
                      className="mx-4"
                      alt={`${token.tokenName} logo`}
                      style={{ width: "40px", height: "40px" }}
                    />
                  </td>
                  <td className="text-center">{token.tokenName}</td>
                  <td className="text-center">
                    <div className="mx-2">
                      {token.tokenName === "DAV" || token.tokenName === "STATE"
                        ? "------"
                        : "1:1000"}
                    </div>
                  </td>
                  <td className="text-center">
                    <div className="mx-4">
                      {token.tokenName === "DAV" || token.tokenName === "STATE"
                        ? "-----"
                        : `${token.Cycle + 1}/21`}
                    </div>
                  </td>
                  <td className="text-center">
                    <div className="d-flex justify-content-center align-items-center gap-4">
                      <a
                        href={`https://scan.v4.testnet.pulsechain.com/#/address/${token.address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: "15px", color: "white" }}
                      >
                        <i className="bi bi-box-arrow-up-right"></i>
                      </a>
                      <img
                        src={MetaMaskIcon}
                        onClick={token.handleAddTokens}
                        alt="State Logo"
                        style={{
                          width: "20px",
                          height: "20px",
                          cursor: "pointer",
                        }}
                      />
                      {token.tokenName === "DAV" ? (
                        "----"
                      ) : (
                        <a
                          href="https://dex.9mm.pro/swap?chain=pulsechain"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <img
                            src={pulsex}
                            alt="sDAV Logo"
                            className="mb-1"
                            style={{
                              background: "transparent",
                              width: "20px",
                              height: "20px",
                              cursor: "pointer",
                            }}
                          />
                        </a>
                      )}
                      {token.tokenName === "DAV" ? (
                        "---------------"
                      ) : (
                        <button
                          className="btn btn-sm swap-btn btn-primary"
                          onClick={
                            token.tokenName === "STATE"
                              ? () => setDavAndStateIntoSwap()
                              : () => AddTokenIntoSwapContract()
                          }
                        >
                          Add
                        </button>
                      )}
                    </div>
                  </td>
                  <td></td>
                  <td></td>
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
