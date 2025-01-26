import "bootstrap/dist/css/bootstrap.min.css";
import "../Styles/DataTable.css";
import XerionLogo from "../assets/XerionLogo.png";
import FluxinLogo from "../assets/FluxinLogo.png";
import stateLogo from "../assets/state_logo.png";
import MetaMaskIcon from "../assets/metamask-icon.png";
import { useLocation } from "react-router-dom";
import {
  //   STATE_TOKEN_ADDRESS,
  useDAVToken,
  Xerion,
} from "../Context/DavTokenContext";
import { useContext, useState } from "react";
import { formatWithCommas } from "./DetailsInfo";
import { Fluxin } from "../Context/DavTokenContext";
import { PriceContext } from "../api/StatePrice";

const DataTable = () => {
  const {
    stateUsdPrice,
    XerionUsdPrice,
    XerionRatioPrice,
    FluxinRatioPrice,
    FluxinUsdPrice,
  } = useContext(PriceContext);

  const {
    SwapTokens,
    handleAddTokenState,
    CheckMintBalance,
    // claiming,
    contracts,
    // ButtonText,
    userSwapped,
    isReversed,
    RatioValues,
    Distributed,
    AuctionRunning,
    userHashSwapped,
    DavBalance,
    ClaimTokens,
    handleAddFluxin,
    handleAddXerion,
    FormattedInbalance,
    OutBalance,
    swappingStates,
    buttonTextStates,
  } = useDAVToken();
  const location = useLocation();
  const isAuction = location.pathname === "/auction";
  const [errorPopup, setErrorPopup] = useState({});
  const [checkingStates, setCheckingStates] = useState({}); // State for checking buttons
  const [claimingStates, setClaimingStates] = useState({}); // Separate claiming state for each

  const Checking = async (id, ContractName) => {
    setCheckingStates((prev) => ({ ...prev, [id]: true })); // Set checking state for specific button
    try {
      const contract = contracts[ContractName]; // Get the dynamic contract based on the ContractName
      await CheckMintBalance(contract);
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
        console.error("Error calling CheckMintBalance:", e);
      }
    }
    setCheckingStates((prev) => ({ ...prev, [id]: false })); // Reset checking state
  };

  const formatPrice = (price) => {
    if (!price || isNaN(price)) {
      return "$0.0000"; // Default display for invalid or null prices
    }

    const formattedPrice = parseFloat(price).toFixed(10); // Format to 9 decimals for processing
    const [integerPart, decimalPart] = formattedPrice.split(".");

    // Check for leading zeros in the decimal part
    const leadingZerosMatch = decimalPart.match(/^0+(.)/); // Match leading zeros and capture the first non-zero digit
    if (leadingZerosMatch) {
      const leadingZeros = leadingZerosMatch[0].slice(0, -1); // Extract all leading zeros except the last digit
      const firstSignificantDigit = leadingZerosMatch[1]; // Capture the first significant digit
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

    // General case: No significant leading zeros
    return `$${parseFloat(price).toFixed(7)}`;
  };

  const handleClaimTokens = async (id, ContractName) => {
    setClaimingStates((prev) => ({ ...prev, [id]: true }));
    const contract = contracts[ContractName];
    await ClaimTokens(contract);
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
              {/* <th>Liquidity</th> */}
              <th></th>
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
                ContractName: "state",
                image: stateLogo,
                Price: stateUsdPrice,
                userHasSwapped: false,
                AuctionStatus: AuctionRunning.state,
                onChart:
                  "https://www.geckoterminal.com/pulsechain/pools/0x894fd7d05fe360a1d713c10b0e356af223fde88c",
                handleAddXerion: handleAddTokenState,
                distributedAmount: Distributed["state"],
              },
              {
                id: "Fluxin",
                name: "Fluxin",
                Pname: "Fluxin",
                ContractName: "Fluxin",
                image: FluxinLogo,
                ratio: `1:${RatioValues}`,
                currentRatio: `1:${FluxinRatioPrice}`,
                reverseRatio: `2:${FluxinRatioPrice}`,
                Price: FluxinUsdPrice,
                AuctionStatus: AuctionRunning.Fluxin,
                userHasSwapped: userHashSwapped,
                onChart:
                  "https://www.geckoterminal.com/pulsechain/pools/0x361afa3f5ef839bed6071c9f0c225b078eb8089a",
                distributedAmount: Distributed["Fluxin"],
                token: Fluxin,
                handleAddXerion: handleAddFluxin,
                inputTokenAmount: `${FormattedInbalance} Fluxin`,
                ratioPrice: FluxinRatioPrice,
                outputToken: `${OutBalance.formattedFluxin} State`,
              },
              {
                id: "Xerion",
                name: "Xerion",
                Pname: "Xerion",
                ContractName: "Xerion",
                image: XerionLogo,
                ratio: `1:${RatioValues.Xerion}`,
                userHasSwapped: false,
                currentRatio: `1:${XerionRatioPrice}`,
                Price: XerionUsdPrice,
                AuctionStatus: AuctionRunning.Xerion,
                onChart:
                  "https://www.geckoterminal.com/pulsechain/pools/0xc6359cd2c70f643888d556d377a4e8e25caadf77",
                // Liquidity: "0.0",
                distributedAmount: Distributed["Xerion"],
                token: Xerion,
                ratioPrice: XerionRatioPrice,
                handleAddXerion: handleAddXerion,
                inputTokenAmount: `${0} Xerion`,
                outputToken: `${0} State`,
              },
            ]
              .filter(({ userHasSwapped }) => !userHasSwapped)
              .filter(({ AuctionStatus }) => AuctionStatus)
              .map(
                (
                  {
                    id,
                    name,
                    Pname,
                    image,
                    ratio,
                    currentRatio,
                    reverseRatio,
                    ContractName,
                    Liquidity,
                    Price,
                    onChart,
                    distributedAmount,
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
                        onClick={() => Checking(id, ContractName)}
                        className="btn btn-primary btn-sm swap-btn"
                        disabled={
                          checkingStates[id] ||
                          Distributed > 0 ||
                          DavBalance == 0
                        }
                      >
                        {checkingStates[id] ? "Checking..." : "Mint Balance"}
                      </button>
                    </td>
                    <td>
                      <div
                        onClick={
                          Distributed !== "0.0" && !claimingStates[id]
                            ? () => handleClaimTokens(id, ContractName)
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

                    <td>
                      <a
                        href={onChart}
                        target="_blank"
                        style={{ fontSize: "13px" }}
                        className="font-color"
                      >
                        $ {formatPrice(Price)}
                      </a>
                    </td>
                    <td className="text-success">{Liquidity}</td>
                    <td>
                      {isReversed === "true" && FluxinRatioPrice > RatioValues
                        ? reverseRatio
                        : currentRatio}
                    </td>

                    <td>{ratio}</td>
                    <td>
                      <div className="d-flex justify-content-center gap-3 w-100">
                        {id !== "state" && (
                          <>
                            {isReversed == "true" &&
                            FluxinRatioPrice > RatioValues ? (
                              <>
                                <div className="tableClaim">{outputToken}</div>{" "}
                                <div className="tableClaim">
                                  {inputTokenAmount}
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="tableClaim">
                                  {inputTokenAmount}
                                </div>
                                <div className="tableClaim">{outputToken}</div>{" "}
                              </>
                            )}
                          </>
                        )}
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
                              setErrorPopup((prev) => ({
                                ...prev,
                                [id]: false,
                              }))
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
                        {id !== "state" && (
                          <button
                            onClick={() => SwapTokens(id)}
                            disabled={swappingStates[id]}
                            className="btn btn-primary btn-sm swap-btn"
                          >
                            {swappingStates[id]
                              ? "Swapping..."
                              : buttonTextStates[id] || "Swap"}
                          </button>
                        )}

                        {id !== "state" && (
                          <img
                            src={MetaMaskIcon}
                            width={20}
                            height={20}
                            onClick={handleAddXerion}
                            alt="Logo"
                            style={{ cursor: "pointer" }}
                          />
                        )}
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
