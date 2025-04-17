import "bootstrap/dist/css/bootstrap.min.css";
import "../Styles/DetailsInfo.css";
import "../Styles/SearchInfo.css";
import MetaMaskIcon from "../assets/metamask-icon.png";
import { useSwapContract } from "../Functions/SwapContractFunctions";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { TokensDetails } from "../data/TokensDetails";
import pulsex from "../assets/pulsex.png";
import { useAccount, useChainId } from "wagmi";
import XerionLogo from "../assets/layti.png";
import FluxinLogo from "../assets/FluxinLogo.png";
import Rieva from "../assets/rieva.png";
import DAVLogo from "../assets/d_logo.png";
import sDAV from "../assets/sDAV.png";
import TenDollar from "../assets/TenDollar.png";
import Currus from "../assets/Currus.png";
import ValirLogo from "../assets/Valir.png";
import SanitasLogo from "../assets/Sanitas.png";
import oned from "../assets/oned.png";
import Domus from "../assets/domus.png";
import Teeah from "../assets/teech.png";
import stateLogo from "../assets/state_logo.png";
import sState from "../assets/sonicstate.png";

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
    handleAddOneD,
    handleAddFluxin,
    handleAddXerion,
    handleAddRieva,
    handleAddDomus,
    handleAddTenDollar,
    handleAddCurrus,
    handleAddValir,
    handleAddTeeah,
    handleAddSanitas,
  } = useSwapContract();

  const { address } = useAccount();
  const chainId = useChainId();

  const [authorized, setAuthorized] = useState(false);
  const [filteredData, setFilteredData] = useState([]);
  const [localSearchQuery, setLocalSearchQuery] = useState("");

  const AuthAddress = import.meta.env.VITE_AUTH_ADDRESS.toLowerCase();

  const tokens = TokensDetails();

  const originalData = [
    { id: "∈", name: "DAV", logo: DAVLogo, AddToken: handleAddTokenDAV },
    { id: "±", name: "STATE", logo: stateLogo, AddToken: handleAddTokenState },
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
    handleSetAddress();
  }, [address]);

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

  const handleSetAddress = () => {
    if (!address) {
      setAuthorized(false);
      console.warn("Wallet address not available");
      return;
    }

    setAuthorized(AuthAddress === address.toLowerCase());
  };

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
          className="form-control text-center w-50"
          placeholder="SEARCH"
          value={localSearchQuery}
          onChange={handleSearch}
          style={{ maxWidth: "300px" }}
        />
      </div>

      {dataToShow ? (
        <table className="table table-dark infoTable text-center align-middle">
          <thead>
            <tr>
              <th className="fw-bold text-uppercase text-center col-1 py-3">
                Logo
              </th>
              <th className="fw-bold text-uppercase text-center col-3 py-3">
                Token Name
              </th>
              <th className="fw-bold text-uppercase text-center col-2 py-3">
                Current Ratio
              </th>
              <th className="fw-bold text-uppercase text-center col-3 py-3">
                Auctions
              </th>
              <th className="fw-bold text-uppercase text-center col py-3">
                Info
              </th>
              <th></th>
              <th></th>
              <th></th>
              <th>
                <a
                  href={`https://otter.pulsechain.com/address/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: "15px" }}
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
                <td>
                  <img
                    src={
                      filteredData.find((d) => d.name === token.tokenName)?.logo
                    }
                    alt={`${token.tokenName} logo`}
                    style={{ width: "40px", height: "40px" }}
                  />
                </td>
                <td>{token.tokenName}</td>
                <td>
                  {token.tokenName === "DAV" || token.tokenName === "STATE"
                    ? "-"
                    : "1:1000"}
                </td>

                <td>
                  {token.tokenName === "DAV" || token.tokenName === "STATE"
                    ? "-"
                    : `${token.Cycle}/56`}
                </td>

                <td>
                  <div className="d-flex justify-content-center align-items-center gap-2">
                    <a
                      href={`https://scan.v4.testnet.pulsechain.com/#/address/${token.address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: "15px" }}
                    >
                      <i className="bi bi-box-arrow-up-right"></i>
                    </a>

                    <img
                      src={MetaMaskIcon}
					  onClick={token.handleAddTokens}
                      alt="State Logo"
                      style={{ width: "20px", height: "20px",cursor:"pointer" }}
                    />
                    <a
                      href="https://pulsex.mypinata.cloud/ipfs/bafybeibzu7nje2o2tufb3ifitjrto3n3xcwon7fghq2igtcupulfubnrim/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img
                        src={pulsex}
                        alt="sDAV Logo"
                        style={{
                          borderRadius: "50%",
                          background: "transparent",
                          width: "30px",
                          height: "30px",
                          cursor: "pointer",
                        }}
                      />
                    </a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="alert alert-warning text-center" role="alert">
          Currently No detailed information is available for the selected token.
        </div>
      )}
    </div>
  );
};

DetailsInfo.propTypes = {
  selectedToken: PropTypes.object,
};

export default DetailsInfo;
