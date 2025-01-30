import "bootstrap/dist/css/bootstrap.min.css";
import "../Styles/DetailsInfo.css";
import { useDAVToken } from "../Context/DavTokenContext";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { TokensDetails } from "../data/TokensDetails";
import {
  TableRowDataShow,
  TableRowForTokens,
  TableRowWithClick,
} from "./SeperateComps/TableRow";

export const formatWithCommas = (value) => {
  if (value === null || value === undefined) return "";
  const valueString = value.toString();
  const [integerPart, decimalPart] = valueString.split(".");
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return decimalPart ? `${formattedInteger}.${decimalPart}` : formattedInteger;
};
const DetailsInfo = ({ searchQuery, selectedToken }) => {
  const {
    AuctionRunning,
    account,
    stateTransactionHash,
    setDBRequired,
    setDBForBurnRequired,
    mintAdditionalTOkens,
    StateBurnBalance,
  } = useDAVToken();

  const [numerator, setNumerator] = useState("");

  const [numeratorOfAUction, setNumeratorOfAuction] = useState("");
  const [numeratorOfInterval, setNumeratorOfInterval] = useState("");
  const [Denominator, setDenominator] = useState("");

  const [StateDenominator, setStateDenominator] = useState("");
  const [StateToken, setState] = useState({
    raw: "",
    formatted: "",
  });
  const [authorized, setAuthorized] = useState(false);

  const AuthAddress =
    "0xB1bD9F3B5F64dE482485A41c84ea4a90DAc5F98e".toLowerCase();

  const handleSetAddress = () => {
    setAuthorized(AuthAddress === account);
    console.log(account);
  };

  useEffect(() => {
    handleSetAddress();
  }, [account, AuthAddress]);

  const tokens = TokensDetails();
  console.log("auction running from detailInfo", AuctionRunning.Fluxin);
  console.log("renounced ", stateTransactionHash);
  const handleInputChange = (e) => {
    const value = e.target.value;
    setNumerator(value);
  };

  const handleInputChangeAuction = (e) => {
    const value = e.target.value;
    setNumeratorOfAuction(value);
  };
  const handleInputChangeInterval = (e) => {
    const value = e.target.value;
    setNumeratorOfInterval(value);
  };
  const handleInputChangeofToken = (e) => {
    const rawValue = e.target.value.replace(/,/g, "");
    if (!isNaN(rawValue) && rawValue !== "") {
      setDenominator(rawValue);
    } else if (rawValue === "") {
      setDenominator("");
    }
  };
  const handleInputChangeofStateToken = (e) => {
    const rawValue = e.target.value.replace(/,/g, "");
    if (!isNaN(rawValue) && rawValue !== "") {
      setStateDenominator(rawValue);
    } else if (rawValue === "") {
      setStateDenominator("");
    }
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

  const handleInputChanged = (e) => {
    const rawValue = e.target.value.replace(/,/g, "");
    if (!/^\d*\.?\d*$/.test(rawValue)) {
      return;
    }

    const formattedValue = formatWithCommas(rawValue);

    setState({
      raw: rawValue,
      formatted: formattedValue,
    });
  };

  const filteredTokens = tokens.filter((item) =>
    item.tokenName.toLowerCase().includes((searchQuery ?? "").toLowerCase())
  );

  const dataToShow = selectedToken
    ? tokens.find((token) => token.tokenName === selectedToken.name)
    : filteredTokens[0] || tokens[0];
  return (
    <div className="container mt-3 p-0">
      {dataToShow ? (
        <table className="table table-dark infoTable">
          <thead>
            <th className="fw-bold d-flex align-items-center uppercase">
              Information
            </th>
          </thead>
          <tbody>
            {(dataToShow.tokenName === "DAV" ||
              dataToShow.tokenName === "STATE") && (
              <>
                <tr>
                  <td className="d-flex align-items-center">Token Name</td>
                  <td className="d-flex align-items-center justify-content-center">
                    {dataToShow.name || ""}
                  </td>
                  <td></td>
                </tr>
                <TableRowDataShow
                  label={"Contract/Token Address"}
                  address={dataToShow.address}
                  value={dataToShow.key}
                />
              </>
            )}

            {dataToShow.tokenName !== "DAV" &&
              dataToShow.tokenName !== "STATE" && (
                <>
                  <TableRowForTokens
                    label={"Token Name"}
                    tokenName={dataToShow.name}
                    label2={"Contract/Token Address"}
                    TokenAddress={dataToShow.address}
                    value={dataToShow.key}
                    priceTag={dataToShow.Price}
                    PercentageOfToken={dataToShow.percentage}
                  />
                </>
              )}

            {dataToShow.tokenName == "DAV" && (
              <>
                <tr>
                  <td className="d-flex align-items-center">Supply</td>
                  <td className="d-flex align-items-center justify-content-center">
                    {"5,000,000.00"}
                  </td>
                  <td></td>
                </tr>
                <tr>
                  <td className="d-flex align-items-center">
                    Total Dav Tokens Minted
                  </td>
                  <td className="d-flex align-items-center justify-content-center">
                    {dataToShow.Supply || ""}
                  </td>
                  <td></td>
                </tr>
                <tr>
                  <td className="d-flex align-items-center">
                    Renounce Smart Contract
                  </td>

                  <td className="d-flex align-items-center justify-content-center">
                    {dataToShow.renounceSmartContract == null
                      ? "Loading..."
                      : dataToShow.renounceSmartContract
                      ? "Yes"
                      : "No"}{" "}
                  </td>
                  <td className="d-flex justify-content-end">
                    {dataToShow.renounceSmartContract ? (
                      <button
                        onClick={() =>
                          window.open(
                            `https://otter.pulsechain.com/tx/${dataToShow.transactionHash}`,
                            "_blank",
                            "noopener,noreferrer"
                          )
                        }
                        className="btn btn-primary btn-sm swap-btn info-icon"
                      >
                        View
                      </button>
                    ) : (
                      <button
                        onClick={() => dataToShow.actions.ReanounceContract()}
                        className="btn btn-primary btn-sm swap-btn info-icon"
                      >
                        Set
                      </button>
                    )}
                  </td>
                </tr>
                {authorized && (
                  <>
                    <TableRowWithClick
                      label="Withdraw 5%"
                      value={dataToShow.claimFiveDAVToken}
                      action={dataToShow.actions.claimFiveDAVToken}
                      buttonText="Withdraw"
                    />
                    <TableRowWithClick
                      label="Withdraw 95%"
                      value={dataToShow.claimDAVToken}
                      action={dataToShow.actions.claimLiquidityDAVToken}
                      buttonText="Withdraw"
                    />
                  </>
                )}
              </>
            )}
            {dataToShow.tokenName == "STATE" && (
              <>
                <tr>
                  <td className="d-flex align-items-center">
                    State tokens burn
                  </td>
                  <td className="d-flex align-items-center justify-content-center">
                    {formatWithCommas(StateBurnBalance)}
                  </td>
                  <td></td>
                </tr>
                <tr>
                  <td className="d-flex align-items-center">
                    Current Distribution Rate
                  </td>
                  <td className="d-flex align-items-center justify-content-center">
                    {dataToShow.percentage} %
                  </td>
                  <td></td>
                </tr>
              </>
            )}
            {(dataToShow.tokenName == "STATE" ||
              dataToShow.tokenName == "Fluxin" ||
              dataToShow.tokenName == "Xerion") && (
              <>
                <tr>
                  <td className="d-flex align-items-center">Minted Supply</td>
                  <td className="d-flex align-items-center justify-content-center">
                    {formatWithCommas(dataToShow.Supply)}
                  </td>
                  <td></td>
                </tr>

                {dataToShow.tokenName !== "STATE" && (
                  <>
                    <tr>
                      <td className="d-flex align-items-center">
                        {dataToShow.tokenName} in DAV vaults
                      </td>
                      <td className="d-flex align-items-center justify-content-center position-relative px-3 small py-0">
                        {formatWithCommas(dataToShow.RatioBalance)}
                        <span
                          className="border-end h-75 position-absolute"
                          style={{ right: 0, opacity: 0.3 }}
                        ></span>
                      </td>
                      <td className="d-flex align-items-center">
                        State Token in DAV vaults
                      </td>
                      <td className="d-flex align-items-center justify-content-center px-3">
                        {formatWithCommas(dataToShow.stateBalance)}
                      </td>
                    </tr>

                    <tr>
                      <td className="d-flex align-items-center">
                        Total {dataToShow.tokenName} Burned
                      </td>
                      <td className="d-flex align-items-center justify-content-center position-relative px-3 small py-0">
                        <span
                          className="border-end h-75 position-absolute"
                          style={{ right: 0, opacity: 0.3 }}
                        ></span>
                        {dataToShow.TotalTokensBurn}
                      </td>
                      <td className="d-flex align-items-center">
                        Total Bounty
                      </td>
                      <td className="d-flex align-items-center justify-content-center px-3">
                        {dataToShow.TotalBounty}
                      </td>
                    </tr>

                    <tr>
                      <td className="d-flex align-items-center">
                        Current Ratio
                      </td>
                      <td className="d-flex align-items-center justify-content-center position-relative px-3 small py-0">
                        <span
                          className="border-end h-75 position-absolute border-opacity-25"
                          style={{ right: 0, opacity: 0.3 }}
                        ></span>
                        {`1:${dataToShow.Ratio}`}
                      </td>

                      <td className="d-flex align-items-center">
                        Target Ratio
                      </td>
                      <td className="d-flex align-items-center justify-content-center px-3">
                        {`1:${dataToShow.target}`}
                      </td>
                    </tr>
                  </>
                )}

                <tr>
                  <td className="d-flex align-items-center">
                    Renounce Smart Contract
                  </td>

                  <td className="d-flex align-items-center justify-content-center">
                    {dataToShow.renounceSmartContract == null
                      ? "Loading..."
                      : dataToShow.renounceSmartContract
                      ? "Yes"
                      : "No"}{" "}
                  </td>
                  <td className="d-flex justify-content-end">
                    {dataToShow.renounceSmartContract ? (
                      <button
                        onClick={() =>
                          window.open(
                            `https://otter.pulsechain.com/tx/${dataToShow.transactionHash}`,
                            "_blank",
                            "noopener,noreferrer"
                          )
                        }
                        className="btn btn-primary btn-sm swap-btn info-icon"
                      >
                        View
                      </button>
                    ) : (
                      <button
                        onClick={() => dataToShow.actions.ReanounceContract()}
                        className="btn btn-primary btn-sm swap-btn info-icon"
                      >
                        Set
                      </button>
                    )}
                  </td>
                </tr>
                {authorized && (
                  <>
                    <tr>
                      <td className="d-flex align-items-center">
                        {dataToShow.tokenName.toLowerCase() === "state"
                          ? "State Balance (inside Contract)"
                          : dataToShow.tokenName.toLowerCase() === "xerion"
                          ? "Xerion Balance (inside Contract)"
                          : "Fluxin Balance (inside Contract)"}
                      </td>

                      <td>
                        <div className="w-100">
                          <input
                            type="text"
                            className="form-control text-center mh-30"
                            placeholder={formatWithCommas(dataToShow.Balance)}
                            value={StateToken.formatted}
                            onChange={(e) => handleInputChanged(e)}
                          />
                        </div>
                      </td>
                      <td className="d-flex justify-content-end">
                        <button
                          onClick={() =>
                            dataToShow.actions.WithdrawState(StateToken.raw)
                          }
                          className="btn btn-primary btn-sm swap-btn info-icon"
                        >
                          Withdraw
                        </button>
                      </td>
                    </tr>
                    <tr>
                      <td className="d-flex align-items-center">
                        Mint Additional state tokens
                      </td>
                      <td className="d-flex align-items-center justify-content-center">
                        {dataToShow.mintAddTOkens}
                      </td>
                      <td className="d-flex justify-content-end">
                        <button
                          onClick={() => {
                            if (dataToShow.tokenName === "Fluxin") {
                              mintAdditionalTOkens("fluxin", 250000000000); // Amount for Fluxin
                            } else if (dataToShow.tokenName === "STATE") {
                              mintAdditionalTOkens("state", 1000000000000); // Amount for State
                            } else if (dataToShow.tokenName === "Xerion") {
                              mintAdditionalTOkens("Xerion", 125000000000); // Amount for State
                            }
                          }}
                          className="btn btn-primary btn-sm swap-btn info-icon"
                        >
                          Mint
                        </button>
                      </td>
                    </tr>
                    {dataToShow.tokenName != "STATE" &&
                      dataToShow.tokenName != "DAV" && (
                        <>
                          <div className="">
                            <h6
                              className="fw-bold fontSetting text-uppercase mb-0 infoTable text-light rounded-2xl shadow-sm my-1 py-3 px-2"
                              style={{ lineHeight: "1.6" }}
                            >
                              Auction Settings
                            </h6>
                          </div>

                          <tr>
                            <td className="d-flex align-items-center">
                              {`Deposit ${dataToShow.name}`}
                            </td>
                            <td>
                              <div className="w-100">
                                <input
                                  type="text"
                                  className="form-control text-center mh-30"
                                  placeholder="Enter amount"
                                  value={
                                    Denominator
                                      ? Number(Denominator).toLocaleString()
                                      : ""
                                  }
                                  onChange={(e) => handleInputChangeofToken(e)}
                                />
                              </div>
                            </td>
                            <td className="d-flex justify-content-end">
                              <button
                                onClick={() => {
                                  dataToShow.actions.DepositTokens(Denominator);
                                }}
                                className="btn btn-primary btn-sm swap-btn info-icon"
                              >
                                Deposit
                              </button>
                            </td>
                          </tr>
                          <tr>
                            <td className="d-flex align-items-center">
                              Deposit STATE Tokens
                            </td>
                            <td>
                              <div className="w-100">
                                <input
                                  type="text"
                                  className="form-control text-center mh-30"
                                  placeholder="Enter amount"
                                  value={
                                    StateDenominator
                                      ? Number(
                                          StateDenominator
                                        ).toLocaleString()
                                      : ""
                                  }
                                  onChange={(e) =>
                                    handleInputChangeofStateToken(e)
                                  }
                                />
                              </div>
                            </td>
                            <td className="d-flex justify-content-end">
                              <button
                                onClick={() => {
                                  dataToShow.actions.DepositStateTokens(
                                    StateDenominator
                                  );
                                }}
                                className="btn btn-primary btn-sm swap-btn info-icon"
                              >
                                Deposit
                              </button>
                            </td>
                          </tr>

                          <tr>
                            <td className="d-flex align-items-center">
                              Auction Interval
                            </td>
                            <td>
                              <div className="w-100">
                                <input
                                  type="text"
                                  className="form-control text-center mh-30"
                                  placeholder={
                                    dataToShow.interval.auctionInterval
                                  }
                                  value={numeratorOfInterval}
                                  onChange={(e) => handleInputChangeInterval(e)}
                                />
                              </div>
                            </td>
                            <td className="d-flex justify-content-end">
                              <button
                                onClick={() =>
                                  dataToShow.actions.SetInterval(
                                    numeratorOfInterval
                                  )
                                }
                                className="btn btn-primary btn-sm swap-btn info-icon"
                              >
                                Set
                              </button>
                            </td>
                          </tr>
                          <tr>
                            <td className="d-flex align-items-center">
                              Auction Duration
                            </td>
                            <td>
                              <div className="w-100">
                                <input
                                  type="text"
                                  className="form-control text-center mh-30"
                                  placeholder={
                                    dataToShow.Duration.auctionDuration
                                  }
                                  value={numeratorOfAUction}
                                  onChange={(e) => handleInputChangeAuction(e)}
                                />
                              </div>
                            </td>
                            <td className="d-flex justify-content-end">
                              <button
                                onClick={() =>
                                  dataToShow.actions.SetDuration(
                                    numeratorOfAUction
                                  )
                                }
                                className="btn btn-primary btn-sm swap-btn info-icon"
                              >
                                Set
                              </button>
                            </td>
                          </tr>

                          <tr>
                            <td className="d-flex align-items-center">
                              Set Ratio Target
                            </td>
                            <td>
                              <div className="w-100">
                                <input
                                  type="number"
                                  className="form-control text-center mh-30"
                                  placeholder="Enter Target"
                                  value={numerator}
                                  onChange={(e) => handleInputChange(e)}
                                />
                              </div>
                            </td>

                            <td className="d-flex justify-content-end">
                              <button
                                onClick={() =>
                                  dataToShow.actions.setRatio(numerator)
                                }
                                className="btn btn-primary btn-sm swap-btn info-icon"
                              >
                                Set
                              </button>
                            </td>
                          </tr>
                          <tr>
                            <td className="d-flex align-items-center">
                              Set reverse Swap
                            </td>
                            <td>
                              {" "}
                              <div className="w-100">
                                {dataToShow.isReversing}
                              </div>
                            </td>

                            <td className="d-flex justify-content-end">
                              <button
                                onClick={() => {
                                  if (dataToShow.isReversing == "true") {
                                    dataToShow.actions.setReverseEnabled(false);
                                  } else {
                                    dataToShow.actions.setReverseEnabled(true);
                                  }
                                }}
                                className="btn btn-primary btn-sm swap-btn info-icon"
                              >
                                Set
                              </button>
                            </td>
                          </tr>

                          <tr>
                            <td className="d-flex align-items-center">
                              Start Auction
                            </td>
                            <td className="d-flex align-items-center justify-content-center">
                              {dataToShow.AuctionRunning}
                            </td>
                            <td className="d-flex justify-content-end">
                              <button
                                onClick={() =>
                                  dataToShow.actions.StartingAuction()
                                }
                                className="btn btn-primary btn-sm swap-btn info-icon"
                              >
                                Start
                              </button>
                            </td>
                          </tr>

                          <tr>
                            <td className="d-flex align-items-center">
                              Time Left In auction{" "}
                            </td>
                            <td className="d-flex align-items-center justify-content-center">
                              {dataToShow.AuctionTimeRunning}
                            </td>
                            <td></td>
                          </tr>
                          <tr>
                            <td className="d-flex align-items-center">
                              Time Left In burn Cycle{" "}
                            </td>
                            <td className="d-flex align-items-center justify-content-center">
                              {dataToShow.BurnTimeLeft}
                            </td>
                            <td></td>
                          </tr>
                          <tr>
                            <td className="d-flex align-items-center">
                              Next Start Time of the Auction
                            </td>
                            <td className="d-flex align-items-center justify-content-center">
                              {dataToShow.AuctionNextTime.nextAuctionStart}
                            </td>
                            <td></td>
                          </tr>
                        </>
                      )}
                  </>
                )}

                <></>
              </>
            )}
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
  searchQuery: PropTypes.string.isRequired,
  selectedToken: PropTypes.object,
};

export default DetailsInfo;
