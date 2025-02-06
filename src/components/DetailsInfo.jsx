import "bootstrap/dist/css/bootstrap.min.css";
import "../Styles/DetailsInfo.css";
import { useDAVToken } from "../Context/DavTokenContext";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { TokensDetails } from "../data/TokensDetails";
import {
  DoubleValues,
  ReanounceContractsComponent,
  SmallTokenDetails,
  TableRowDataShow,
  TableRowForTokens,
  TableRowWithClick,
} from "./SeperateComps/TableRow";
import { useGeneralAuctionFunctions } from "../Functions/GeneralAuctionFunctions";

export const formatWithCommas = (value) => {
  if (value === null || value === undefined) return "";
  const valueString = value.toString();
  const [integerPart, decimalPart] = valueString.split(".");
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return decimalPart ? `${formattedInteger}.${decimalPart}` : formattedInteger;
};
const DetailsInfo = ({ searchQuery, selectedToken }) => {
  const {
    account,
    stateTransactionHash,
    setDBRequired,
    // AuctionRunning,
    setDBForBurnRequired,
    mintAdditionalTOkens,
    StateBurnBalance,
  } = useDAVToken();
  const { AuctionRunning } = useGeneralAuctionFunctions();

  const [numerator, setNumerator] = useState("");
  const [isTyping, setIsTyping] = useState(false);

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
  const formatPrice = (price) => {
    if (!price || isNaN(price)) {
      return "0.0000";
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
    return `${parseFloat(price).toFixed(7)}`;
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
    setIsTyping(e.target.value.length > 0);
  };

  const handleInputChangeAuction = (e) => {
    const value = e.target.value;
    setNumeratorOfAuction(value);
    setIsTyping(e.target.value.length > 0);
  };
  const handleInputChangeInterval = (e) => {
    const value = e.target.value;
    setNumeratorOfInterval(value);
    setIsTyping(e.target.value.length > 0);
  };

  const handleInputChangeofToken = (e) => {
    const rawValue = e.target.value.replace(/,/g, "");
    if (!isNaN(rawValue) && rawValue !== "") {
      setDenominator(rawValue);
      setIsTyping(e.target.value.length > 0);
    } else if (rawValue === "") {
      setDenominator("");
    }
  };
  const handleInputChangeofStateToken = (e) => {
    const rawValue = e.target.value.replace(/,/g, "");
    if (!isNaN(rawValue) && rawValue !== "") {
      setStateDenominator(rawValue);
      setIsTyping(e.target.value.length > 0);
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
          <thead className="d-flex ">
            <th className="fw-bold d-flex align-items-center uppercase">
              Information
            </th>
            {dataToShow.tokenName !== "DAV" ? (
              <th className="fw-bold d-flex justify-content-end align-items-center text-end w-100 uppercase py-4">
                <button className=" swap-btn py-1 mx-3 btn btn-primary btn-sm ">
                  Price : $ {formatPrice(dataToShow.Price)}
                </button>
              </th>
            ) : (
              <th className="fw-bold d-flex  justify-content-end align-items-center text-end w-100 uppercase py-4"></th>
            )}
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
                  label={"Token Address"}
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
                    label2={"Token Address"}
                    TokenAddress={dataToShow.address}
                    value={dataToShow.key}
                    priceTag={formatWithCommas(dataToShow.Supply)}
                    PercentageOfToken={dataToShow.percentage}
                  />
                </>
              )}

            {dataToShow.tokenName == "DAV" && (
              <>
                <SmallTokenDetails label={"Supply"} data={"5,000,000.00"} />
                <SmallTokenDetails
                  label={"Total Dav Tokens Minted"}
                  data={dataToShow.Supply || ""}
                />

                <tr>
                  <td className="d-flex align-items-center">
                    Contract Renounced
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
                      value={formatWithCommas(
                        dataToShow.claimFiveDAVTokenValue
                      )}
                      action={dataToShow.actions.claimFiveDAVToken}
                      buttonText="Withdraw"
                    />
                    <TableRowWithClick
                      label="Withdraw 95%"
                      value={formatWithCommas(dataToShow.claimDAVToken)}
                      action={dataToShow.actions.claimLiquidityDAVToken}
                      buttonText="Withdraw"
                    />
                  </>
                )}
              </>
            )}
            {dataToShow.tokenName == "STATE" && (
              <>
                <SmallTokenDetails
                  label={"State tokens burn"}
                  data={formatWithCommas(StateBurnBalance)}
                />
                <SmallTokenDetails
                  label={"Minted Supply"}
                  data={formatWithCommas(dataToShow.Supply)}
                />

                <SmallTokenDetails
                  label={"Current Distribution Rate"}
                  data={`${dataToShow.percentage} %`}
                />
              </>
            )}
            {(dataToShow.tokenName == "STATE" ||
              dataToShow.tokenName == "Fluxin" ||
              dataToShow.tokenName == "Xerion") && (
              <>
                {dataToShow.tokenName !== "STATE" && (
                  <>
                    <DoubleValues
                      label1={`${dataToShow.tokenName} in DAV vaults`}
                      firstData={formatWithCommas(dataToShow.RatioBalance)}
                      label2={"STATE Tokens in DAV vaults"}
                      SecondData={formatWithCommas(dataToShow.stateBalance)}
                    />
                    <DoubleValues
                      label1={`Total ${dataToShow.tokenName} Burned`}
                      firstData={dataToShow.TotalTokensBurn}
                      label2={"Total Bounty"}
                      SecondData={dataToShow.TotalBounty}
                    />
                    <DoubleValues
                      label1={`Current Ratio`}
                      firstData={`1:${dataToShow.Ratio}`}
                      label2={"Target Ratio"}
                      SecondData={`1:${dataToShow.target}`}
                    />
                  </>
                )}

                <ReanounceContractsComponent
                  condition1={dataToShow.renounceSmartContract}
                  hash={dataToShow.transactionHash}
                  ClickAction={() => dataToShow.actions.ReanounceContract()}
                />

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
                        Mint Additional {dataToShow.tokenName} tokens
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
								  className={`form-control text-center mh-30 ${
                                    isTyping ? "text-blue" : ""
                                  }`}                                  placeholder="Enter amount"
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
                                {`Deposit ${dataToShow.name}`}
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
                                  className={`form-control text-center mh-30 ${
                                    isTyping ? "text-blue" : ""
                                  }`}
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
                                Deposit State
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
								  className={`form-control text-center mh-30 ${
                                    isTyping ? "text-blue" : ""
                                  }`}                                  placeholder={
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
                          {/* <tr>
                            <td className="d-flex align-items-center">
                              set BurnRate
                            </td>
                            <td>
                              <div className="w-100">
                                <input
                                  type="text"
                                  className="form-control text-center mh-30"
                                  placeholder="Enter Rate"
                                  value={burningRate}
                                  onChange={(e) => handleInputChangeBurnRate(e)}
                                />
                              </div>
                            </td>
                            <td className="d-flex justify-content-end">
                              <button
                                onClick={() =>
                                  dataToShow.actions.setBurn(burningRate)
                                }
                                className="btn btn-primary btn-sm swap-btn info-icon"
                              >
                                Set
                              </button>
                            </td>
                          </tr> */}
                          <tr>
                            <td className="d-flex align-items-center">
                              Auction Duration
                            </td>
                            <td>
                              <div className="w-100">
                                <input
                                  type="text"
								  className={`form-control text-center mh-30 ${
                                    isTyping ? "text-blue" : ""
                                  }`}                                  placeholder={
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
								  className={`form-control text-center mh-30 ${
                                    isTyping ? "text-blue" : ""
                                  }`}                                  placeholder="Enter Target"
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
                          {/* <tr>
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
                          </tr> */}

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
                                {`Start ${dataToShow.name}`}
                              </button>
                            </td>
                          </tr>
                          <SmallTokenDetails
                            label={"Time Left In auction"}
                            data={dataToShow.AuctionTimeRunning}
                          />
                          <SmallTokenDetails
                            label={"Time Left In burn Cycle"}
                            data={dataToShow.BurnTimeLeft}
                          />
                          <SmallTokenDetails
                            label={"Next Start Time of the Auction"}
                            data={dataToShow.AuctionNextTime.nextAuctionStart}
                          />
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
