import "bootstrap/dist/css/bootstrap.min.css";
import "../Styles/DetailsInfo.css";
import { Fluxin, useDAVToken, Xerion } from "../Context/DavTokenContext";
import PropTypes from "prop-types";
import { useContext, useEffect, useState } from "react";
import {
  DAV_TOKEN_ADDRESS,
  STATE_TOKEN_ADDRESS,
  Ratio_TOKEN_ADDRESS,
} from "../Context/DavTokenContext";
import { PriceContext } from "../api/StatePrice";

export const formatWithCommas = (value) => {
  if (value === null || value === undefined) return "";
  const valueString = value.toString();
  const [integerPart, decimalPart] = valueString.split(".");
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return decimalPart ? `${formattedInteger}.${decimalPart}` : formattedInteger;
};
const DetailsInfo = ({ searchQuery, selectedToken }) => {
  const { stateUsdPrice, FluxinRatioPrice, XerionRatioPrice } =
    useContext(PriceContext);

  const {
    StartMarketPlaceListing,
    withdraw_95,
    AuctionRunning,
    withdraw_5,
    // ClaimLPTokens,
    // AddTokens,
    FluxinSupply,
    XerionSupply,
    // AddTokensToContract,
    setRatioTarget,
    WithdrawState,
    WithdrawFluxin,
    WithdrawXerion,
    account,
    mintStateTokens,
    mintFluxinTokens,
    LPStateTransferred,
    PercentageOfState,
    PercentageFluxin,
    PercentageXerion,
    DAVTokensWithdraw,
    StateSupply,
    RenounceState,
    ReanounceContract,
    davTransactionHash,
    stateTransactionHash,
    DepositToken,
    XerionTransactionHash,
    Supply,
    isRenounced,
    DAVTokensFiveWithdraw,
    LastLiquidity,
    Batch,
    ReanounceFluxinContract,
    ReanounceXerionContract,
    StateBalance,
    FluxinBalance,
    XerionBalance,
    AuctionTime,
    mintAdditionalTOkens,
    BatchAmount,
    // saveTokenName,
    LastDevShare,

    AddTokensToContract,
    Approve,
  } = useDAVToken();

  const [numerator, setNumerator] = useState("");
  const [Denominator, setDenominator] = useState("");
  const [StateToken, setState] = useState({
    raw: "",
    formatted: "",
  });
  const [authorized, setAuthorized] = useState(false);
  const auctionStatus = AuctionRunning ? "True" : "False";

  const AuthAddress =
    "0x3Bdbb84B90aBAf52814aAB54B9622408F2dCA483".toLowerCase();

  // Fetch and update token data when the selectedToken changes
  const handleSetAddress = () => {
    setAuthorized(AuthAddress === account);
    console.log(account);
  };

  // Update authorization whenever 'account' or 'AuthAddress' changes
  useEffect(() => {
    handleSetAddress();
  }, [account, AuthAddress]);

  const shortenAddress = (address) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
  };
  const shortened = shortenAddress(Ratio_TOKEN_ADDRESS);
  const davShortened = shortenAddress(DAV_TOKEN_ADDRESS);
  const stateShortened = shortenAddress(STATE_TOKEN_ADDRESS);
  const FluxinShortened = shortenAddress(Fluxin);
  const XerionShortened = shortenAddress(Xerion);

  const tokens = [
    {
      tokenName: "DAV",
      key: davShortened,
      name: "pDAV",
      supply: "5,000,000.00",
      BatchRelease: "1M",
      transactionHash:
        "0xa7edbeaf4dabb78ef6385220bc75f7266c144a4c9da19393245ab62999195d90",
      claimDAVToken: DAVTokensWithdraw,
      claimFiveDAVToken: DAVTokensFiveWithdraw,
      address: DAV_TOKEN_ADDRESS,
      renounceSmartContract: isRenounced?.dav ?? "Unknown",
      BatchAmount: BatchAmount,
      Batch: Batch,
      Supply: Supply,
      LastDevShare: LastDevShare,
      LastLiquidity: LastLiquidity,
      actions: {
        claimLiquidityDAVToken: withdraw_95,
        claimFiveDAVToken: withdraw_5,
        ReanounceContract: ReanounceContract,
        // MoveTokens: () => MoveTokens(Amount),
      },
    },
    {
      tokenName: "Fluxin",
      key: FluxinShortened,
      name: "Fluxin",
      supply: "1,000,000,000,000.00",
      Treasury: "1,000,000,000,000.00",
      Supply: FluxinSupply,
      percentage: PercentageFluxin,
      address: Fluxin,
      Balance: FluxinBalance,
      pair: "Fluxin/pSTATE",
      claimLPToken: LPStateTransferred,
      mintAddTOkens: "250,000,000,000",
      ApproveAmount: "10,000,000,000",
      transactionHash:
        "0xcc7e04c885a56607fbc2417a9f894bda0fbdd68418ce189168adcb1c10406208",
      renounceSmartContract: isRenounced?.Fluxin ?? "Unknown",
      actions: {
        ReanounceContract: ReanounceFluxinContract,
        WithdrawState: WithdrawFluxin,
        mintAdditionalTOkens: mintAdditionalTOkens,
        AddTokenToContract: () =>
          AddTokensToContract(Fluxin, STATE_TOKEN_ADDRESS, FluxinRatioPrice),
        setRatio: (value) => setRatioTarget(Fluxin, value), // Fluxin token is pre-set here
        Approval: (value) => Approve("Fluxin", value),
        DepositTokens: (value) => DepositToken(Fluxin, value),
      },
    },
    {
      tokenName: "Xerion",
      key: XerionShortened,
      name: "Xerion",
      supply: "500,000,000,000.00",
      Supply: XerionSupply,
      percentage: PercentageXerion,
      address: Xerion,
      Balance: XerionBalance,
      pair: "Xerion/pSTATE",
      mintAddTOkens: "125,000,000,000",
      ApproveAmount: "10,000,000,000",
      transactionHash: XerionTransactionHash,
      renounceSmartContract: isRenounced?.Xerion ?? "Unknown",
      actions: {
        ReanounceContract: ReanounceXerionContract,
        WithdrawState: WithdrawXerion,
        mintAdditionalTOkens: mintAdditionalTOkens,
        AddTokenToContract: () =>
          AddTokensToContract(Xerion, STATE_TOKEN_ADDRESS, XerionRatioPrice),
        setRatio: (value) => setRatioTarget(Xerion, value),
        Approval: (value) => Approve("Xerion", value),
        DepositTokens: (value) => DepositToken(Xerion, value),
      },
    },
    {
      tokenName: "AuctionRatioSwapping",

      actions: {},
    },

    //state token
    {
      tokenName: "STATE",
      key: stateShortened,
      name: "pSTATE",
      supply: "999,000,000,000,000.00",
      Treasury: "999,000,000,000,000.00",
      Supply: StateSupply,
      percentage: PercentageOfState,
      Balance: StateBalance,
      address: STATE_TOKEN_ADDRESS,
      claimLPToken: LPStateTransferred,
      mintAddTOkens: "1,000,000,000,000",
      ApproveAmount: "10,000,000,000",
      transactionHash:
        "0xf562341d1f0f5469809553f07cd9f19da479a9af3b074d0982594899a6595b10",

      renounceSmartContract: isRenounced?.state ?? "Unknown",
      actions: {
        ReanounceContract: RenounceState,
        WithdrawState: WithdrawState,
        mintAdditionalTOkens: mintAdditionalTOkens,
        Approval: (value) => Approve("state", value),
        DepositTokens: (value) => DepositToken(STATE_TOKEN_ADDRESS, value),
      },
    },
  ];
  console.log("renounced ", stateTransactionHash);
  const handleInputChange = (e) => {
    const value = e.target.value;
    setNumerator(value);
  };
  const handleInputChangeofToken = (e) => {
    const value = e.target.value;
    setDenominator(value);
  };
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
            <tr>
              <td className="d-flex align-items-center">Token Name</td>
              <td className="d-flex align-items-center justify-content-center">
                {dataToShow.name || ""}
              </td>
              <td></td>
            </tr>
            <tr>
              <td className="d-flex align-items-center">
                Contract/Token Address
              </td>
              <td className="d-flex align-items-center justify-content-center">
                <a
                  href={`https://otter.pulsechain.com/address/${dataToShow.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: "12px" }}
                >
                  {dataToShow.key || ""}
                </a>
              </td>
              <td></td>
            </tr>

            {dataToShow.tokenName !== "DAV" &&
              dataToShow.tokenName !== "STATE" &&
              dataToShow.tokenName !== "Fluxin" &&
              dataToShow.tokenName !== "Xerion" && (
                <>
                  <tr>
                    <td className="d-flex align-items-center">Ratio Target</td>
                    <td className="d-flex align-items-center justify-content-center">
                      {dataToShow.ratioTarget || ""}
                    </td>
                    <td></td>
                  </tr>

                  <tr>
                    <td className="d-flex align-items-center">
                      Auction Allocation
                    </td>
                    <td className="d-flex align-items-center justify-content-center">
                      {dataToShow.auctionAllocation || ""}
                    </td>
                    <td></td>
                  </tr>
                  <tr>
                    <td className="d-flex align-items-center">
                      DAV Treasury Supply
                    </td>
                    <td className="d-flex align-items-center justify-content-center">
                      {dataToShow.davTreasurySupply || ""}
                    </td>
                    <td></td>
                  </tr>

                  <tr>
                    <td className="d-flex align-items-center">Start Auction</td>
                    <td>
                      <div className="tableClaim w-100">
                        {dataToShow.startAuction || ""}
                      </div>
                    </td>
                    <td className="d-flex justify-content-end">
                      <button
                        onClick={dataToShow.actions.startAuction}
                        className="btn btn-primary btn-sm swap-btn info-icon"
                      >
                        SET
                      </button>
                    </td>
                  </tr>
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
                {authorized && (
                  <>
                    <tr>
                      <td className="d-flex align-items-center">
                        Withdraw 95%
                      </td>
                      <td>
                        <td className="d-flex align-items-center justify-content-center">
                          {dataToShow.claimDAVToken || ""}
                        </td>
                      </td>
                      <td className="d-flex justify-content-end">
                        <button
                          onClick={() =>
                            dataToShow.actions.claimLiquidityDAVToken()
                          }
                          className="btn btn-primary btn-sm swap-btn info-icon"
                        >
                          Withdraw
                        </button>
                      </td>
                    </tr>
                    <tr>
                      <td className="d-flex align-items-center">Withdraw 5%</td>
                      <td>
                        <td className="d-flex align-items-center justify-content-center">
                          {dataToShow.claimFiveDAVToken || ""}
                        </td>
                      </td>
                      <td className="d-flex justify-content-end">
                        <button
                          onClick={() => dataToShow.actions.claimFiveDAVToken()}
                          className="btn btn-primary btn-sm swap-btn info-icon"
                        >
                          Withdraw
                        </button>
                      </td>
                    </tr>
                  </>
                )}
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
                <tr>
                  <td className="d-flex align-items-center">
                    Current Distribution Rate
                  </td>
                  <td className="d-flex align-items-center justify-content-center">
                    {dataToShow.percentage} %
                  </td>
                  <td></td>
                </tr>
                {authorized ? (
                  <>
                    <tr>
                      <td className="d-flex align-items-center">
                        Auction Rate (in days)
                      </td>
                      <td>
                        <div className="w-100">
                          <input
                            type="text"
                            className="form-control text-center mh-30"
                            placeholder={AuctionTime}
                            value={numerator}
                            onChange={(e) => handleInputChange(e, "numerator")}
                          />
                        </div>
                      </td>
                      <td className="d-flex justify-content-end">
                        <button
                          //   onClick={()=>setRatioTarget(numerator, Denominator)}
                          className="btn btn-primary btn-sm swap-btn info-icon"
                        >
                          Set
                        </button>
                      </td>
                    </tr>
                    {dataToShow.tokenName != "STATE" && (
                      <>
                        <tr>
                          <td className="d-flex align-items-center">
                            Add Pair into Main Contract
                          </td>
                          <td className="d-flex align-items-center justify-content-center">
                            {dataToShow.pair}
                          </td>
                          <td className="d-flex justify-content-end">
                            <button
                              onClick={dataToShow.actions.AddTokenToContract}
                              className="btn btn-primary btn-sm swap-btn info-icon"
                            >
                              Set
                            </button>
                          </td>
                        </tr>
                      </>
                    )}
                    <tr>
                      <td className="d-flex align-items-center">
                        Approve Main Contract
                      </td>
                      <td className="d-flex align-items-center justify-content-center">
                        {dataToShow.ApproveAmount}
                      </td>
                      <td className="d-flex justify-content-end">
                        <button
                          onClick={() => dataToShow.actions.Approval()}
                          className="btn btn-primary btn-sm swap-btn info-icon"
                        >
                          Set
                        </button>
                      </td>
                    </tr>
                    <tr>
                      <td className="d-flex align-items-center">
                        Deposit into Main Contract
                      </td>
                      <td>
                        <div className="w-100">
                          <input
                            type="text"
                            className="form-control text-center mh-30"
                            placeholder="Enter amount"
                            value={Denominator}
                            onChange={(e) =>
                              handleInputChangeofToken(e, "Denominator")
                            }
                          />
                        </div>
                      </td>
                      <td className="d-flex justify-content-end">
                        <button
                          onClick={() =>
                            dataToShow.actions.DepositTokens(Denominator)
                          }
                          className="btn btn-primary btn-sm swap-btn info-icon"
                        >
                          Set
                        </button>
                      </td>
                    </tr>
                    <tr>
                      <td className="d-flex align-items-center">
                        Current Ratio
                      </td>
                      <td className="d-flex align-items-center justify-content-center">
                        {"0:0"}
                      </td>
                      <td></td>
                    </tr>
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
                    <tr>
                      <td className="d-flex align-items-center">
                        Ratio Target
                      </td>
                      <td>
                        <div className="w-100">
                          <input
                            type="text"
                            className="form-control text-center mh-30"
                            placeholder="Enter Target"
                            value={numerator}
                            onChange={(e) => handleInputChange(e, "numerator")}
                          />
                        </div>
                      </td>

                      <td className="d-flex justify-content-end">
                        <button
                          onClick={() => dataToShow.actions.setRatio(numerator)}
                          className="btn btn-primary btn-sm swap-btn info-icon"
                        >
                          Set
                        </button>
                      </td>
                    </tr>
                  </>
                ) : (
                  <></>
                )}
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
