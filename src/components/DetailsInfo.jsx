import "bootstrap/dist/css/bootstrap.min.css";
import "../Styles/DetailsInfo.css";
import { useDAVToken } from "../Context/DavTokenContext";
import PropTypes from "prop-types";
import { useState } from "react";
import {
  DAV_TOKEN_ADDRESS,
  STATE_TOKEN_ADDRESS,
  Ratio_TOKEN_ADDRESS,
} from "../Context/DavTokenContext";

const DetailsInfo = ({ searchQuery }) => {
  const {
    StartMarketPlaceListing,
    withdraw_95,
    AuctionRunning,
    withdraw_5,
    ClaimLPTokens,
    setRatioTarget,
    LPStateTransferred,
    DAVTokensWithdraw,
    DAVTokensFiveWithdraw,
  } = useDAVToken();

  const [numerator, setNumerator] = useState("");
  const [Denominator, setDenominator] = useState("");
  const auctionStatus = AuctionRunning ? "True" : "False";
  const FluxinAddress = "0xAE79930e57BB2EA8dde7381AC6d338A706386bAe";

  const shortenAddress = (address) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
  };
  const shortened = shortenAddress(Ratio_TOKEN_ADDRESS);
  const davShortened = shortenAddress(DAV_TOKEN_ADDRESS);
  const stateShortened = shortenAddress(STATE_TOKEN_ADDRESS);

  // List of tokens with their respective actions
  const tokens = [
    {
      tokenName: "DAV",
      key: davShortened,
      supply: "5M",
      BatchRelease: "1M",
      claimDAVToken: DAVTokensWithdraw,
      claimFiveDAVToken: DAVTokensFiveWithdraw,
      renounceSmartContract: "No",
      actions: {
        claimDAVToken: withdraw_95,
        claimFiveDAVToken: withdraw_5,
      },
    },
    {
      tokenName: "Fluxin",
      key: shortened,
      supply: "1M",
      ratioTarget: "1:1",
      auctionAllocation: "50%",
      davTreasurySupply: "500K",
      ratioTargetAmend: "1:1 Trillion",
      claimDAVToken: DAVTokensWithdraw,
      claimFiveDAVToken: DAVTokensFiveWithdraw,
      startAuction: `Auction Status - ${auctionStatus}`,
      renounceSmartContract: "Yes",
      actions: {
        claimLPToken: ClaimLPTokens,
        claimDAVToken: withdraw_95,
        claimFiveDAVToken: withdraw_5,
        startAuction: StartMarketPlaceListing,
        setRatioTarget: () => setRatioTarget(numerator, Denominator), // Using dynamic parameters
      },
    },
    //left of implementation
    {
      tokenName: "Xerion",
      key: "XRN",
      supply: "2M",
      ratioTarget: "1:2",
      auctionAllocation: "30%",
      davTreasurySupply: "1M",
      ratioTargetAmend: "1:2 Trillion",
      claimLPToken: "1M",
      claimDAVToken: "1M",
      renounceSmartContract: "No",
      actions: {
        claimLPToken: ClaimLPTokens,
        claimDAVToken: withdraw_95,
        claimFiveDAVToken: withdraw_5,
        startAuction: StartMarketPlaceListing,
        setRatioTarget: () => setRatioTarget(numerator, Denominator), // Using dynamic parameters
      },
    },
    //state token
    {
      tokenName: "State",
      key: stateShortened,
      supply: "999T",
      Treasury: "999T",
      claimLPToken: LPStateTransferred,
      renounceSmartContract: "No",
      actions: {
        claimDAVToken: withdraw_95,
        claimFiveDAVToken: withdraw_5,
      },
    },
    {
      tokenName: "Rutvik",
      key: "RT",
      supply: "5M",
      ratioTarget: "1:5",
      auctionAllocation: "70%",
      davTreasurySupply: "1M",
      ratioTargetAmend: "1:2 Trillion",
      claimLPToken: "1M",
      claimDAVToken: "1M",
      renounceSmartContract: "No",
      actions: {
        claimLPToken: ClaimLPTokens,
        claimDAVToken: withdraw_95,
        claimFiveDAVToken: withdraw_5,
        startAuction: StartMarketPlaceListing,
        setRatioTarget: () => setRatioTarget(numerator, Denominator), // Using dynamic parameters
      },
    },
    {
      tokenName: "Polaris",
      key: "PLR",
      supply: "3M",
      ratioTarget: "1:3",
      auctionAllocation: "40%",
      davTreasurySupply: "1.2M",
      ratioTargetAmend: "1:3 Quadrillion",
      claimLPToken: "1.2M",
      claimDAVToken: "1.2M",
      renounceSmartContract: "Yes",
      actions: {
        claimLPToken: ClaimLPTokens,
        claimDAVToken: withdraw_95,
        claimFiveDAVToken: withdraw_5,
        startAuction: StartMarketPlaceListing,
        setRatioTarget: () => setRatioTarget(numerator, Denominator), // Using dynamic parameters
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

  // Filter details based on the search query
  const filteredTokens = tokens.filter((item) =>
    item.tokenName.toLowerCase().includes((searchQuery ?? "").toLowerCase())
  );

  // Show the first value by default or the searched value
  const dataToShow = filteredTokens.length > 0 ? filteredTokens[0] : tokens[0];

  return (
    <div className="container mt-3">
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
              {dataToShow.tokenName || ""}
            </td>
            <td></td>
          </tr>
          <tr>
            <td className="d-flex align-items-center">
              Contract/Token Address
            </td>
            <td className="d-flex align-items-center justify-content-center">
              <a
                href={`https://scan.v4.testnet.pulsechain.com/#/address/${FluxinAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: "12px" }}
              >
                {dataToShow.key || ""}
              </a>
            </td>
            <td></td>
          </tr>
          <tr>
            <td className="d-flex align-items-center">Supply</td>
            <td className="d-flex align-items-center justify-content-center">
              {dataToShow.supply || ""}
            </td>
            <td></td>
          </tr>
          {dataToShow.tokenName !== "DAV" &&
            dataToShow.tokenName !== "State" && (
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
                      onClick={setRatioTarget(numerator, Denominator)}
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

                {/* Dynamically render token actions */}
              </>
            )}
          {dataToShow.tokenName == "DAV" && (
            <>
              <tr>
                <td className="d-flex align-items-center">
                  Claim 95% Liquidity share(PLS)
                </td>
                <td>
                  <div className="tableClaim w-100">
                    {dataToShow.claimDAVToken || ""}
                  </div>
                </td>
                <td className="d-flex justify-content-end">
                  <button
                    onClick={dataToShow.actions.claimDAVToken}
                    className="btn btn-primary btn-sm swap-btn info-icon"
                  >
                    Claim
                  </button>
                </td>
              </tr>
              <tr>
                <td className="d-flex align-items-center">
                  Claim 5% Development share(PLS)
                </td>
                <td>
                  <div
                    onClick={dataToShow.actions.claimFiveDAVToken}
                    className="tableClaim w-100"
                  >
                    {dataToShow.claimFiveDAVToken || ""}
                  </div>
                </td>
                <td className="d-flex justify-content-end">
                  <button className="btn btn-primary btn-sm swap-btn info-icon">
                    Claim
                  </button>
                </td>
              </tr>
              <tr>
                <td className="d-flex align-items-center">
                  Release Next batch DAV Token
                </td>
                <td>
                  <div
                    onClick={dataToShow.actions.claimFiveDAVToken}
                    className="tableClaim w-100"
                  >
                    {dataToShow.BatchRelease || ""}
                  </div>
                </td>
                <td className="d-flex justify-content-end">
                  <button className="btn btn-primary btn-sm swap-btn info-icon">
                    Release
                  </button>
                </td>
              </tr>
            </>
          )}

          {dataToShow.tokenName == "State" && (
            <>
              <tr>
                <td className="d-flex align-items-center">State Treasury</td>
                <td className="d-flex align-items-center justify-content-center">
                  {dataToShow.Treasury || ""}
                </td>
                <td></td>
              </tr>
              <tr>
                <td className="d-flex align-items-center">
                  3.5% LP Token Transferred
                </td>
                <td>
                  <div className="tableClaim w-100">
                    {dataToShow.claimLPToken || ""}
                  </div>
                </td>
                <td className="d-flex justify-content-end"></td>
              </tr>
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
              <button className="btn btn-primary btn-sm swap-btn info-icon">
                Set
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

DetailsInfo.propTypes = {
  searchQuery: PropTypes.string.isRequired,
};

export default DetailsInfo;
