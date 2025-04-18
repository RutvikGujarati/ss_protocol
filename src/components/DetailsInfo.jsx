import "bootstrap/dist/css/bootstrap.min.css";
import "../Styles/DetailsInfo.css";
import { useSwapContract } from "../Functions/SwapContractFunctions";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { TokensDetails } from "../data/TokensDetails";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

import {
  DoubleValues,
  ReanounceContractsComponent,
  SmallTokenDetails,
  TableRowDataShow,
  TableRowForSwapTokens,
  //   TableRowForTokens,
  TableRowWithClick,
} from "./SeperateComps/TableRow";
import { useGeneralAuctionFunctions } from "../Functions/GeneralAuctionFunctions";
import { useAccount } from "wagmi";

export const formatWithCommas = (value) => {
  if (value === null || value === undefined) return "";
  const valueString = value.toString();
  const [integerPart, decimalPart] = valueString.split(".");
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return decimalPart ? `${formattedInteger}.${decimalPart}` : formattedInteger;
};
const DetailsInfo = ({ searchQuery, selectedToken }) => {
  const {
    stateTransactionHash,
    setDBRequired,
    // AuctionRunning,
    setDBForBurnRequired,
    StateBurnBalance,
  } = useSwapContract();
  const { address } = useAccount();
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

  const AuthAddress = import.meta.env.VITE_AUTH_ADDRESS.toLowerCase();
  const handleSetAddress = () => {
    if (!address) {
      setAuthorized(false);
      console.warn("Wallet address not available");
      return;
    }

    setAuthorized(AuthAddress === address.toLowerCase());
    console.log(address);
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
  }, [address, AuthAddress]);

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
                  <TableRowForSwapTokens
                    label={"Token Name"}
                    tokenName={dataToShow.name}
                    label2={"Token Address"}
                    TokenAddress={dataToShow.address}
                    value={dataToShow.key}
                  />

                  <TableRowForSwapTokens
                    label={"Contract Name"}
                    tokenName={`${dataToShow.tokenName} Swap`}
                    label2={"Contract Address"}
                    TokenAddress={dataToShow.SwapContract}
                    value={dataToShow.SwapShortContract}
                  />
                  <DoubleValues
                    label1={"Minted Supply"}
                    firstData={formatWithCommas(dataToShow.Supply)}
                    label2={"Current Distribution Rate"}
                    SecondData={`${dataToShow.percentage} %`}
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
                      <button className="btn btn-primary btn-sm swap-btn info-icon">
                        Renounced
                      </button>
                    ) : (
                      <button
                        onClick={() => dataToShow.actions.ReanounceContract()}
                        className="btn btn-primary btn-sm swap-btn info-icon "
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
                  label={"STATE Tokens Burned"}
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
                <ReanounceContractsComponent
                  label={"Contract Renounced"}
                  condition1={dataToShow.renounceSmartContract}
                  hash={dataToShow.transactionHash}
                  ClickAction={() => dataToShow.actions.ReanounceContract()}
                />
              </>
            )}
            {(dataToShow.tokenName == "STATE" ||
              dataToShow.tokenName == "Orxa" ||
              dataToShow.tokenName == "1$" ||
              dataToShow.tokenName == "Rieva" ||
              dataToShow.tokenName == "10$" ||
              dataToShow.tokenName == "Domus" ||
              dataToShow.tokenName == "Currus" ||
              dataToShow.tokenName == "Sanitas" ||
              dataToShow.tokenName == "Teeah" ||
              dataToShow.tokenName == "Valir" ||
              dataToShow.tokenName == "Layti") && (
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
                      label1={`Current Ratio`}
                      firstData={`1:${dataToShow.Ratio}`}
                      label2={"Target Ratio"}
                      SecondData={`1:${dataToShow.target}`}
                    />
                    <SmallTokenDetails
                      label={`Total ${dataToShow.tokenName} Burned`}
                      data={formatWithCommas(dataToShow.TotalTokensBurn)}
                    />
                    {/* <DoubleValues
                      label1={`Total ${dataToShow.tokenName} Burned`}
                      firstData={formatWithCommas(dataToShow.TotalTokensBurn)}
                      label2={"Total Bounty"}
                      SecondData={formatWithCommas(dataToShow.TotalBounty)}
                    /> */}

                    <ReanounceContractsComponent
                      label={"Contract Renounced"}
                      condition1={dataToShow.renounceSmartContract}
                      hash={dataToShow.transactionHash}
                      ClickAction={() => dataToShow.actions.ReanounceContract()}
                    />
                    <ReanounceContractsComponent
                      label={"Swap Contract Renounced"}
                      condition1={dataToShow.renounceSwapSmartContract}
                      //   hash={dataToShow.transactionHash}
                      ClickAction={() =>
                        dataToShow.actions.ReanounceSwapContract()
                      }
                    />
                  </>
                )}

                {authorized && (
                  <>
                    <tr>
                      <td className="d-flex align-items-center">
                        {dataToShow.tokenName.toLowerCase() === "state"
                          ? "STATE Balance (inside Contract)"
                          : dataToShow.tokenName === "Layti"
                          ? "Layti Balance (inside Contract)"
                          : dataToShow.tokenName === "1$"
                          ? "1$ Balance (inside Contract)"
                          : dataToShow.tokenName === "Rieva"
                          ? "Rieva Balance (inside Contract)"
                          : dataToShow.tokenName === "10$"
                          ? "10$ Balance (inside Contract)"
                          : dataToShow.tokenName === "Domus"
                          ? "Domus Balance (inside Contract)"
                          : dataToShow.tokenName === "Currus"
                          ? "Currus Balance (inside Contract)"
                          : dataToShow.tokenName === "Valir"
                          ? "Valir Balance (inside Contract)"
                          : dataToShow.tokenName === "Sanitas"
                          ? "Sanitas Balance (inside Contract)"
                          : dataToShow.tokenName === "Teeah"
                          ? "Teeah Balance (inside Contract)"
                          : "Orxa Balance (inside Contract)"}
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
                          className="btn btn-primary btn-sm swap-btn info-icon mx-4"
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
                            dataToShow.actions.mintAdditionalTOkens(); // Amount for Orxa
                          }}
                          className="btn btn-primary btn-sm swap-btn info-icon mx-5"
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
                                  }`}
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
                                className="btn btn-primary btn-sm swap-btn info-icon mx-3"
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
                                className="btn btn-primary btn-sm swap-btn info-icon mx-3"
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
                                  }`}
                                  placeholder={
                                    dataToShow.interval?.auctionInterval ||
                                    "4320000"
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
                                  }`}
                                  placeholder={
                                    dataToShow.Duration?.auctionDuration ||
                                    "86400"
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
                                  }`}
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
                                className="btn btn-primary btn-sm swap-btn info-icon mx-4"
                              >
                                {`Start ${dataToShow.name}`}
                              </button>
                            </td>
                          </tr>

                          <SmallTokenDetails
                            label={"Time Left In auction"}
                            data={dataToShow.AuctionTimeRunning}
                          />
                          {/* <SmallTokenDetails
                            label={"Time Left In burn Cycle"}
                            data={dataToShow.BurnTimeLeft}
                          /> */}
                          <SmallTokenDetails
                            label={"Next Start Time of the Auction"}
                            data={dataToShow.AuctionNextTime?.nextAuctionStart}
                          />
                          <tr>
                            <td className="d-flex align-items-center">
                              Start Reverse Swap
                            </td>
                            <td className="d-flex">
                              <div className="w-100 mt-3">
                                <OverlayTrigger
                                  placement="top"
                                  overlay={
                                    <Tooltip id="reverse-tooltip">
                                      {dataToShow.WillStart === "true" &&
                                      dataToShow.isReversing === "false" ? (
                                        dataToShow.WillStartForNext ===
                                        "true" ? (
                                          <>
                                            For this cycle - it is setted.{" "}
                                            <br />
                                            For Next cycle - it is setted.
                                          </>
                                        ) : (
                                          "For this cycle - it is setted."
                                        )
                                      ) : dataToShow.WillStartForNext ===
                                        "true" ? (
                                        "setted for next cycle."
                                      ) : (
                                        "Not setted"
                                      )}
                                    </Tooltip>
                                  }
                                >
                                  <span className="text-primary">
                                    {dataToShow.isReversing}
                                  </span>
                                </OverlayTrigger>
                              </div>
                            </td>

                            <td className="d-flex justify-content-end">
                              <button
                                onClick={() => {
                                  dataToShow.actions.setReverseEnabled();
                                }}
                                className="btn btn-primary btn-sm swap-btn info-icon mx-3"
                              >
                                Start Reverse
                              </button>
                            </td>
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
