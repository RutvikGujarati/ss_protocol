import "bootstrap/dist/css/bootstrap.min.css";
import "../Styles/DataTable.css";
import MetaMaskIcon from "../assets/metamask-icon.png";
import { useLocation } from "react-router-dom";
import { useDAVToken } from "../Context/DavTokenContext";
import { useContext, useState } from "react";
import { formatWithCommas } from "./DetailsInfo";
import { PriceContext } from "../api/StatePrice";
import BurnDataTable from "./BurnDataTable";
import { getAuctionTokens } from "../data/auctionTokenData";

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
    isReversed,
    RatioTargetsofTokens,
    outAmounts,
    Distributed,
    AuctionRunning,
    auctionDetails,
    userHashSwapped,
    DavBalance,
    ClaimTokens,
    XerionOnepBalance,
    handleAddFluxin,
    handleAddXerion,
    FluxinOnepBalance,
    swappingStates,
    buttonTextStates,
  } = useDAVToken();
  const location = useLocation();
  const isAuction = location.pathname === "/auction";
  const [errorPopup, setErrorPopup] = useState({});
  const [checkingStates, setCheckingStates] = useState({});
  const [claimingStates, setClaimingStates] = useState({});
  console.log("is auction running", auctionDetails["Fluxin"]);
  console.log("use has swappeddddd", AuctionRunning.Xerion);

  const Checking = async (id, ContractName) => {
    setCheckingStates((prev) => ({ ...prev, [id]: true }));
    try {
      const contract = contracts[ContractName];
      await CheckMintBalance(contract);
    } catch (e) {
      if (
        e.reason === `${id}: No new DAV minted` ||
        (e.revert &&
          e.revert.args &&
          e.revert.args[0] === `${id}: No new DAV minted`)
      ) {
        console.error(`${id}: No new DAV minted:`, e);
        setErrorPopup((prev) => ({ ...prev, [id]: true }));
      } else {
        console.error("Error calling CheckMintBalance:", e);
      }
    }
    setCheckingStates((prev) => ({ ...prev, [id]: false }));
  };

  const formatPrice = (price) => {
    if (!price || isNaN(price)) {
      return "$0.0000";
    }

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

    // General case: No significant leading zeros
    return `$${parseFloat(price).toFixed(7)}`;
  };

  const handleClaimTokens = async (id, ContractName) => {
    setClaimingStates((prev) => ({ ...prev, [id]: true }));
    const contract = contracts[ContractName];
    await ClaimTokens(contract);
    setClaimingStates((prev) => ({ ...prev, [id]: false })); // Reset claiming state
  };

  const tokens = getAuctionTokens(
    stateUsdPrice,
    XerionUsdPrice,
    XerionRatioPrice,
    FluxinRatioPrice,
    FluxinUsdPrice,
    isReversed,
    AuctionRunning,
    userHashSwapped,
    RatioTargetsofTokens,
    outAmounts,
    Distributed,
    FluxinOnepBalance,
    XerionOnepBalance,
    SwapTokens,
    handleAddFluxin,
    handleAddXerion,
    handleAddTokenState
  );

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
            {tokens
                .filter(
                  ({ userHasSwapped, AuctionStatus }) =>
                    !userHasSwapped && AuctionStatus
                )

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
                    SwapT,
                    isReversing,
                    ContractName,
                    Liquidity,
                    Price,
                    currentTokenRatio,
                    RatioTargetToken,
                    onChart,
                    distributedAmount,
                    inputTokenAmount,
                    handleAddXerion,
                    outputToken,
                  },
                  index
                ) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
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
                      {isReversing === "true" &&
                      currentTokenRatio > RatioTargetToken
                        ? reverseRatio
                        : currentRatio}
                    </td>

                    <td>{ratio}</td>
                    <td>
                      <div className="d-flex justify-content-center gap-3 w-100">
                        {id !== "state" && (
                          <>
                            {isReversing == "true" &&
                            currentTokenRatio > RatioTargetToken ? (
                              <>
                                <div className="tableClaim">
                                  {formatWithCommas(outputToken)}
                                </div>{" "}
                                <div className="tableClaim">
                                  {formatWithCommas(inputTokenAmount)}
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="tableClaim">
                                  {formatWithCommas(inputTokenAmount)}
                                </div>
                                <div className="tableClaim">
                                  {formatWithCommas(outputToken)}
                                </div>{" "}
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
                            onClick={() => SwapT()}
                            disabled={swappingStates[id]}
                            className="btn btn-primary btn-sm swap-btn"
                          >
                            {swappingStates[id]
                              ? "Swapping..."
                              : isReversing == "true"
                              ? "Reverse Swap"
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
  ) : (
    <>
      <BurnDataTable />
    </>
  );
};

export default DataTable;
