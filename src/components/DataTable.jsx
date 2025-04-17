import "bootstrap/dist/css/bootstrap.min.css";
import "../Styles/DataTable.css";
import MetaMaskIcon from "../assets/metamask-icon.png";
import { useLocation } from "react-router-dom";
import { useSwapContract } from "../Functions/SwapContractFunctions";
import { useState } from "react";
import { formatWithCommas } from "./DetailsInfo";
import BurnDataTable from "./BurnDataTable";
import { useAuctionTokens } from "../data/auctionTokenData";
import { useDAvContract } from "../Functions/DavTokenFunctions";
import { useGeneralTokens } from "../Functions/GeneralTokensFunctions";
import { Addresses } from "../data/AddressMapping";

const DataTable = () => {
  const { DavBalance } = useDAvContract();
  const { CheckMintBalance } = useGeneralTokens();

  const {
    DavRequiredAmount,
    DavBalanceRequire,
    swappingStates,
    buttonTextStates,
  } = useSwapContract();

  const location = useLocation();
  const isAuction = location.pathname === "/auction";
  const [errorPopup, setErrorPopup] = useState({});
  const [checkingStates, setCheckingStates] = useState({});

  console.log("required dav amount", DavRequiredAmount);

  const Checking = async (id, ContractName) => {
    setCheckingStates((prev) => ({ ...prev, [id]: true }));
    try {
      const AddressMapping = Addresses[ContractName];
      console.log("address get from mapping", AddressMapping);
      await CheckMintBalance(AddressMapping);
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

  console.log("db required for Auction", DavBalanceRequire);

  const tokens = useAuctionTokens();
  console.log("obj tokens", tokens);

  return isAuction ? (
    <div className="container mt-4 datatablemarginbottom">
      <div className="table-responsive">
        <table className="table table-dark">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Check</th>
              {/* <th>Liquidity</th> */}
              <th></th>
              <th>Current Ratio</th>
              <th>Ratio Swap</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {tokens
              .filter(
                ({
                  userHasSwapped,
                  name,
                  userHasReverse,
                  isReversing,
                  AuctionStatus,
                  distributedAmount,
                }) => {
                  console.log(`Filter Conditions:${name}`, {
                    userHasSwapped,
                    userHasReverse,
                    isReversing,
                    AuctionStatus,
                    // dbCheck: db >= DavRequiredAmount,
                  });

                  if (AuctionStatus == "false" && isReversing == "true") {
                    if (!userHasReverse) {
                      return true;
                    } else if (distributedAmount > 1) {
                      return true;
                    } else if (userHasSwapped && isReversing == "false") {
                      return false;
                    }
                  } else if (AuctionStatus == "true") {
                    if (userHasSwapped == "false") {
                      return true;
                    }
                  }
                }
              )
              .map(
                (
                  {
                    id,
                    name,
                    Pname,
                    image,
                    currentRatio,
                    SwapT,
                    ContractName,
                    Liquidity,
                    isReversing,
                    AuctionStatus,
                    ReverseName,

                    inputTokenAmount,
                    onlyInputAmount,
                    handleAddToken,
                    outputToken,
                  },
                  index
                ) => (
                  <tr key={index}>
                    <td></td>
                    <td>
                      <div className="tableName d-flex gap-5 align-items-center">
                        <div className="nameImage">
                          <img src={image} width={40} height={40} alt="Logo" />
                        </div>
                        <div className="nameDetails">
                          <h5 className="nameBig">{name}</h5>
                          {isReversing == "true" ? (
                            <p className="nameSmall mb-1 uppercase px-2 mx-5">
                              {ReverseName}
                            </p>
                          ) : (
                            <p className="nameSmall mb-1 uppercase">{Pname}</p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td>
                      <button
                        onClick={() => Checking(id, ContractName)}
                        className="btn btn-primary btn-sm swap-btn"
                        disabled={checkingStates[id] || DavBalance == 0}
                      >
                        {checkingStates[id] ? "AIRDROPPING..." : "AIRDROP"}
                      </button>
                    </td>

                    <td className="text-success">{Liquidity}</td>
                    <td>{currentRatio}</td>

                    <td>
                      <div className="d-flex justify-content-center gap-3 w-100">
                        {id !== "state" && (
                          <>
                            {isReversing == "true" ? (
                              <>
                                <div className="tableClaim hover-container">
                                  {outputToken <= "1" && (
                                    <div className="hover-box">
                                      {`not enough State Token available in your account`}
                                    </div>
                                  )}
                                  {formatWithCommas(outputToken)}
                                </div>
                                <div className="tableClaim">
                                  {formatWithCommas(inputTokenAmount)}
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="tableClaim hover-container">
                                  {onlyInputAmount <= 0 && (
                                    <div className="hover-box">
                                      {`not enough ${name} available in your account`}
                                    </div>
                                  )}
                                  {formatWithCommas(inputTokenAmount)}
                                </div>

                                <div className="tableClaim">
                                  {formatWithCommas(outputToken)}
                                </div>
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
                            You need to mint additional DAV tokens to claim
                            extra rewards.
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
                        <>
                          {isReversing == "true" && (
                            <button
                              onClick={() => SwapT()}
                              disabled={
                                swappingStates[id] || outputToken <= "1"
                              }
                              className={`btn btn-sm swap-btn btn-primary btn-sm swap-btn `}
                            >
                              {swappingStates[id]
                                ? "Swapping..."
                                : "Reverse Swap"}
                            </button>
                          )}

                          {isReversing == "false" && (
                            <button
                              onClick={() => SwapT()}
                              disabled={
                                swappingStates[id] || AuctionStatus == "false"
                              }
                              className={`btn btn-sm swap-btn btn-primary btn-sm swap-btn `}
                            >
                              {swappingStates[id]
                                ? "Swapping..."
                                : buttonTextStates[id] || "Swap"}
                            </button>
                          )}
                        </>

                        <img
                          src={MetaMaskIcon}
                          width={20}
                          height={20}
                          onClick={handleAddToken}
                          alt="Logo"
                          style={{ cursor: "pointer" }}
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
  ) : (
    <>
      <BurnDataTable />
    </>
  );
};

export default DataTable;
