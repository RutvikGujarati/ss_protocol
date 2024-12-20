import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../Styles/DetailsInfo.css";
import { useDAVToken } from "../Context/DavTokenContext";
// import React, { useState } from "react";

const DetailsInfo = ({ searchQuery }) => {
  const { StartMarketPlaceListing, AuctionRunning, ClaimLPTokens,LpTokens,DAVTokensWithdraw } =
    useDAVToken();
  const auctionStatus = AuctionRunning ? "True" : "False";
  const details = [
    {
      tokenName: "Fluxin",
      key: "FLX",
      supply: "1M",
      ratioTarget: "1:1",
      auctionAllocation: "50%",
      davTreasurySupply: "500K",
      ratioTargetAmend: "1:1 Trillion",
      claimLPToken: LpTokens,
      claimDAVToken: DAVTokensWithdraw,
      startAuction: `Auction Status - ${auctionStatus}`,
      renounceSmartContract: "Yes",
    },
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
    },
    {
      tokenName: "Nova",
      key: "NVA",
      supply: "500K",
      ratioTarget: "1:0.5",
      auctionAllocation: "20%",
      davTreasurySupply: "300K",
      ratioTargetAmend: "1:0.5 Billion",
      claimLPToken: "200K",
      claimDAVToken: "100K",
      renounceSmartContract: "No",
    },
    {
      tokenName: "Eterna",
      key: "ETN",
      supply: "10M",
      ratioTarget: "1:10",
      auctionAllocation: "60%",
      davTreasurySupply: "6M",
      ratioTargetAmend: "1:10 Million",
      claimLPToken: "4M",
      claimDAVToken: "2M",
      renounceSmartContract: "Yes",
    },
    {
      tokenName: "Celest",
      key: "CST",
      supply: "4M",
      ratioTarget: "1:4",
      auctionAllocation: "45%",
      davTreasurySupply: "1.8M",
      ratioTargetAmend: "1:4 Trillion",
      claimLPToken: "2.2M",
      claimDAVToken: "1.8M",
      renounceSmartContract: "Yes",
    },
    {
      tokenName: "Aether",
      key: "AER",
      supply: "8M",
      ratioTarget: "1:8",
      auctionAllocation: "70%",
      davTreasurySupply: "5M",
      ratioTargetAmend: "1:8 Billion",
      claimLPToken: "3M",
      claimDAVToken: "2M",
      renounceSmartContract: "No",
    },
    {
      tokenName: "Solara",
      key: "SLR",
      supply: "6M",
      ratioTarget: "1:6",
      auctionAllocation: "25%",
      davTreasurySupply: "2M",
      ratioTargetAmend: "1:6 Billion",
      claimLPToken: "3M",
      claimDAVToken: "3M",
      renounceSmartContract: "Yes",
    },
    {
      tokenName: "Lunaris",
      key: "LNR",
      supply: "750K",
      ratioTarget: "1:0.75",
      auctionAllocation: "35%",
      davTreasurySupply: "400K",
      ratioTargetAmend: "1:0.75 Quadrillion",
      claimLPToken: "350K",
      claimDAVToken: "400K",
      renounceSmartContract: "No",
    },
    {
      tokenName: "Stellix",
      key: "STX",
      supply: "2.5M",
      ratioTarget: "1:2.5",
      auctionAllocation: "50%",
      davTreasurySupply: "1.5M",
      ratioTargetAmend: "1:2.5 Million",
      claimLPToken: "1M",
      claimDAVToken: "1.5M",
      renounceSmartContract: "Yes",
    },
  ];

  // Filter details based on the search query
  const filteredDetails = details.filter((item) =>
    item.tokenName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Show the first value by default or the searched value
  const dataToShow =
    filteredDetails.length > 0 ? filteredDetails[0] : details[0];

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
            <td className="d-flex align-items-center">#</td>
            <td className="d-flex align-items-center justify-content-center">
              {dataToShow.key || ""}
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
          <tr>
            <td className="d-flex align-items-center">Ratio Target</td>
            <td className="d-flex align-items-center justify-content-center">
              {dataToShow.ratioTarget || ""}
            </td>
            <td></td>
          </tr>
          <tr>
            <td className="d-flex align-items-center">Auction Allocation</td>
            <td className="d-flex align-items-center justify-content-center">
              {dataToShow.auctionAllocation || ""}
            </td>
            <td></td>
          </tr>
          <tr>
            <td className="d-flex align-items-center">DAV Treasury Supply</td>
            <td className="d-flex align-items-center justify-content-center">
              {dataToShow.davTreasurySupply || ""}
            </td>
            <td></td>
          </tr>
          <tr>
            <td className="d-flex align-items-center">Ratio Target - Amend</td>
            <td>
              <div className="tableClaim w-100">
                {dataToShow.ratioTargetAmend || ""}
              </div>
            </td>
            <td className="d-flex justify-content-end">
              <button className="btn btn-primary btn-sm swap-btn info-icon">
                Set
              </button>
            </td>
          </tr>
          <tr>
            <td className="d-flex align-items-center">Claim LP Token</td>
            <td>
              <div onClick={ClaimLPTokens} className="tableClaim w-100">
                {dataToShow.claimLPToken || ""}
              </div>
            </td>
            <td className="d-flex justify-content-end">
              <button className="btn btn-primary btn-sm swap-btn info-icon">
                Claim
              </button>
            </td>
          </tr>
          <tr>
            <td className="d-flex align-items-center">Claim DAV Token</td>
            <td>
              <div className="tableClaim w-100">
                {dataToShow.claimDAVToken || ""}
              </div>
            </td>
            <td className="d-flex justify-content-end">
              <button className="btn btn-primary btn-sm swap-btn info-icon">
                Claim
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
                onClick={StartMarketPlaceListing}
                className="btn btn-primary btn-sm swap-btn info-icon"
              >
                SET
              </button>
            </td>
          </tr>
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

export default DetailsInfo;
