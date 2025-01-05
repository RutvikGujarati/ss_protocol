import "bootstrap/dist/css/bootstrap.min.css";
import "../Styles/DetailsInfo.css";
import { useDAVToken } from "../Context/DavTokenContext";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import {
  DAV_TOKEN_ADDRESS,
  STATE_TOKEN_ADDRESS,
  Ratio_TOKEN_ADDRESS,
} from "../Context/DavTokenContext";

export const formatWithCommas = (value) => {
  if (value === null || value === undefined) return "";
  const valueString = value.toString();
  const [integerPart, decimalPart] = valueString.split(".");
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return decimalPart ? `${formattedInteger}.${decimalPart}` : formattedInteger;
};
const DetailsInfo = ({ searchQuery, selectedToken }) => {
  const {
    StartMarketPlaceListing,
    withdraw_95,
    AuctionRunning,
    withdraw_5,
    ClaimLPTokens,
	AddTokens,
    setRatioTarget,
    WithdrawState,
    account,
    mintAdditionalTOkens,
    LPStateTransferred,
    PercentageOfState,
    DAVTokensWithdraw,
    StateSupply,
    RenounceState,
    ReanounceContract,
    Supply,
    DAVTokensFiveWithdraw,
    LastLiquidity,
    Batch,
    StateBalance,
    BatchAmount,
    saveTokenName,
    LastDevShare,
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
    "0xB511110f312a4C6C4a240b2fE94de55D600Df7a9".toLowerCase();

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

  const tokens = [
    {
      tokenName: "DAV",
      key: davShortened,
      name: "pDAV",
      supply: "5,000,000.00",
      BatchRelease: "1M",

      claimDAVToken: DAVTokensWithdraw,
      claimFiveDAVToken: DAVTokensFiveWithdraw,
      address: DAV_TOKEN_ADDRESS,
      renounceSmartContract: "No",
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
      tokenName: "Xerion",
      key: shortened,
      supply: "1M",
      ratioTarget: "1:1",
      auctionAllocation: "50%",
      davTreasurySupply: "500K",
      ratioTargetAmend: "1:1 Trillion",
      claimDAVToken: DAVTokensWithdraw,
      address: Ratio_TOKEN_ADDRESS,
      claimFiveDAVToken: DAVTokensFiveWithdraw,
      startAuction: `Auction Status - ${auctionStatus}`,
      renounceSmartContract: "no",
      actions: {
        claimLPToken: ClaimLPTokens,
        claimDAVToken: withdraw_95,
        claimFiveDAVToken: withdraw_5,
        startAuction: StartMarketPlaceListing,
        // setRatioTarget: setRatioTarget(numerator, Denominator), // Using dynamic parameters
      },
    },

    //state token
    {
      tokenName: "STATE",
      key: stateShortened,
      name: "pSTATE",
      supply: "999,000,000,000,000.00",
      Treasury: "999,000,000,000,000.00",
      StateSupply: StateSupply,
      percentage: PercentageOfState,
      address: STATE_TOKEN_ADDRESS,
      claimLPToken: LPStateTransferred,
      renounceSmartContract: "No",
      actions: {
        ReanounceContract: RenounceState,
        WithdrawState: WithdrawState,
        mintAdditionalTOkens: mintAdditionalTOkens,
      },
    },
  ];

  const handleInputChange = (e, field) => {
    const value = e.target.value;
    if (field === "numerator") {
      setNumerator(value);
    } else if (field === "denominator") {
      setDenominator(value);
    }
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
              dataToShow.tokenName !== "STATE" && (
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
                    <td className="d-flex align-items-center">
                      Ratio Target - Amend
                    </td>
                    <td>
                      <div className="w-100">
                        <input
                          type="text"
                          className="form-control text-center mh-30"
                          placeholder="Numerator"
                          value={numerator}
                          onChange={(e) => handleInputChange(e, "numerator")}
                        />
                      </div>
                    </td>
                    <td>
                      <div className="w-100">
                        <input
                          type="text"
                          className="form-control text-center mh-30"
                          placeholder="Denominator"
                          value={Denominator}
                          onChange={(e) => handleInputChange(e, "denominator")}
                        />
                      </div>
                    </td>
                    <td className="d-flex justify-content-end">
                      <button
                        // onClick={() => setRatioTarget(numerator, Denominator)}
                        className="btn btn-primary btn-sm swap-btn info-icon"
                      >
                        Set
                      </button>
                    </td>
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

            {dataToShow.tokenName == "STATE" && (
              <>
                <tr>
                  <td className="d-flex align-items-center">Minted Supply</td>
                  <td className="d-flex align-items-center justify-content-center">
                    {formatWithCommas(dataToShow.StateSupply)}
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
                            placeholder="Enter Days"
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
                    <tr>
                      <td className="d-flex align-items-center">
                       Add Tokens
                      </td>
                      <td>
                        <div className="w-100">
                          <input
                            type="text"
                            className="form-control text-center mh-30"
                            placeholder="Enter Token Address"
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
                        State Balance(inside Contract)
                      </td>
                      <td>
                        <div className="w-100">
                          <input
                            type="text"
                            className="form-control text-center mh-30"
                            placeholder={formatWithCommas(StateBalance)}
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
                        {"1,000,000,000,000"}
                      </td>
                      <td className="d-flex justify-content-end">
                        <button
                          onClick={() =>
                            dataToShow.actions.mintAdditionalTOkens(
                              1000000000000
                            )
                          }
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
                            placeholder="Numerator"
                            value={numerator}
                            onChange={(e) => handleInputChange(e, "numerator")}
                          />
                        </div>
                      </td>
                      <td>
                        <div className="w-100">
                          <input
                            type="text"
                            className="form-control text-center mh-30"
                            placeholder="Denominator"
                            value={Denominator}
                            onChange={(e) =>
                              handleInputChange(e, "denominator")
                            }
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
                    <tr>
                      <td className="d-flex align-items-center">Burn Ratio</td>
                      <td>
                        <div className="w-100">
                          <input
                            type="text"
                            className="form-control text-center mh-30"
                            placeholder="Numerator"
                            value={numerator}
                            onChange={(e) => handleInputChange(e, "numerator")}
                          />
                        </div>
                      </td>
                      <td>
                        <div className="w-100">
                          <input
                            type="text"
                            className="form-control text-center mh-30"
                            placeholder="Denominator"
                            value={Denominator}
                            onChange={(e) =>
                              handleInputChange(e, "denominator")
                            }
                          />
                        </div>
                      </td>
                      <td className="d-flex justify-content-end">
                        <button
                          onClick={() => setRatioTarget(numerator, Denominator)}
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
                {dataToShow.renounceSmartContract || ""}
              </td>
              <td className="d-flex justify-content-end">
                <button
                  onClick={() => dataToShow.actions.ReanounceContract()} // Add parentheses to invoke the function
                  className="btn btn-primary btn-sm swap-btn info-icon"
                >
                  Set
                </button>
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
