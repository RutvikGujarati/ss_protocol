import "bootstrap/dist/css/bootstrap.min.css";
import "../Styles/InfoCards.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { useSwapContract } from "../Functions/SwapContractFunctions";
import { useContext, useEffect, useRef, useState } from "react";
import { ethers } from "ethers";
import { useLocation } from "react-router-dom";
import PLSLogo from "../assets/pls1.png";
import BNBLogo from "../assets/bnb.png";
import sonic from "../assets/S_token.svg";
import { formatWithCommas } from "./DetailsInfo";
import { useDAvContract } from "../Functions/DavTokenFunctions";
import DotAnimation from "../Animations/Animation";
import { useChainId } from "wagmi";
import { PriceContext } from "../api/StatePrice";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { faCopy } from "@fortawesome/free-regular-svg-icons";
const InfoCards = () => {
  const chainId = useChainId();
  const { stateUsdPrice } = useContext(PriceContext);
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
    return `${parseFloat(price).toFixed(7)}`;
  };
  const [copied, setCopied] = useState(false);
  const [copiedCode, setCopiedCode] = useState("");

  const {
    mintDAV,
    claimableAmount,
    CanClaimNow,
    isLoading,
    usableTreasury,
    BurnStateTokens,
    claimAmount,
    ReferralAMount,
    claimableAmountForBurn,
    BurnClicked,
    Claiming,
    ContractPls,
    claimBurnAmount,
    // AllUserPercentage,
    TimeUntilNextClaim,
    UserPercentage,
    davHolds,
    AddYourToken,
    // AddDavintoLP,
    stateHolding,
    ReferralCodeOfUser,
  } = useDAvContract();

  const handleBurnClick = async () => {
    const amountToBurn = rawAmount.trim() === "" ? stateHolding : rawAmount;

    try {
      await BurnStateTokens(amountToBurn); // Use input or default
      setAmountOfInput(""); // Reset input after success
    } catch (error) {
      console.error("Burn failed:", error);
    }
  };

  console.log("Connected Chain ID:", chainId);
  const setBackLogo = () => {
    if (chainId === 369) {
      return PLSLogo; // PulseChain
    } else if (chainId === 56) {
      return BNBLogo; // BNB Chain
    } else if (chainId === 146) {
      return sonic; // BNB Chain
    } else {
      return PLSLogo; // Optional fallback logo
    }
  };
  const getLogoSize = () => {
    return chainId === 56
      ? { width: "170px", height: "140px" } // Bigger size for BNB
      : { width: "110px", height: "140px" }; // Default size
  };

  const {
    CalculationOfCost,
    TotalCost,
    getAirdropAmount,
    getInputAmount,
    getOutPutAmount,
  } = useSwapContract();
  const [amount, setAmount] = useState("");
  const [Refferalamount, setReferralAmount] = useState("");
  const [load, setLoad] = useState(false);
  const [loadClaim, setLoadClaim] = useState(false);

  const handleMint = async () => {
    setLoad(true);
    try {
      await mintDAV(amount, Refferalamount);
      await getAirdropAmount();
      await getInputAmount();
      await getOutPutAmount();
      setAmount("");
      setReferralAmount("");
    } catch (error) {
      console.error("Error minting:", error);
      alert("Minting failed! Please try again.");
    } finally {
      setLoad(false);
    }
  };
  const handleClaim = async () => {
    setLoadClaim(true);
    try {
      await claimAmount();
    } catch (error) {
      console.error("Error minting:", error);
      alert("claiming failed! Please try again.");
    } finally {
      setLoadClaim(false);
    }
  };

  const handleInputChange = (e) => {
    if (/^\d*$/.test(e.target.value)) {
      setAmount(e.target.value);
    }
    CalculationOfCost(e.target.value);
  };
  const handleOptionalInputChange = (e) => {
    setReferralAmount(e.target.value);
  };

  function formatNumber(number) {
    if (!number) return "0";
    return new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 0,
    }).format(number);
  }

  useEffect(() => {
    CalculationOfCost(amount);
    // GetCurrentStateReward();
  }, [amount]);

  const location = useLocation();
  const isBurn = location.pathname === "/StateLp";
  const isAuction = location.pathname === "/auction";
  const isAddToken = location.pathname === "/AddToken";
  const [amountOfInput, setAmountOfInput] = useState("");
  const [TokenName, setTokenName] = useState("");
  const [rawAmount, setRawAmount] = useState("");
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);

  const handleInputChangeForBurn = (e) => {
    const input = e.target.value.replace(/,/g, ""); // remove commas
    if (!isNaN(input)) {
      setRawAmount(input); // raw unformatted number
      setAmountOfInput(Number(input).toLocaleString("en-US")); // formatted for display
    } else if (input === "") {
      setRawAmount("");
      setAmountOfInput("");
    }
  };
  const handleInputChangeForAddtoken = (e) => {
    setTokenName(e.target.value);
  };

  // Function to stop changing the amount
  const stopChanging = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      stopChanging();
    };
  }, []);
  const customWidth = "180px";

  return (
    <>
      {isAuction ? (
        <>
          <div className="container mt-4">
            <div className="row g-4 d-flex align-items-stretch pb-1 border-bottom-">
              <div className="col-md-4 p-0 m-2 cards">
                <div className="card bg-dark text-light border-light p-3 text-center w-100">
                  <div className="mb-3 d-flex justify-content-start align-items-center gap-2">
                    <label className="mb-0 detailText ">affiliate link </label>
                    <input
                      type="text"
                      placeholder="Optional"
                      list="referralSuggestions"
                      className="form-control text-center fw-bold w-auto mx-4"
                      value={Refferalamount}
                      onChange={handleOptionalInputChange}
                    />
                    <datalist id="referralSuggestions">
                      {copiedCode && <option value={copiedCode} />}
                    </datalist>
                  </div>

                  <div className="mb-2 d-flex justify-content-start align-items-center gap-2">
                    <label className="mb-0 detailText">Mint DAV Token</label>

                    <input
                      type="text"
                      placeholder="Enter Value"
                      className="form-control text-center fw-bold w-auto mx-2"
                      value={amount}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <h5 className="detailAmount">1 DAV TOKEN = 1,000,000 PLS</h5>
                  <h5 className="detailAmount mb-4">
                    {TotalCost
                      ? formatNumber(ethers.formatUnits(TotalCost, 18))
                      : "0"}{" "}
                    PLS{" "}
                  </h5>

                  <div className="d-flex justify-content-center">
                    <button
                      onClick={handleMint}
                      className="btn btn-primary btn-sm mb-0"
                      style={{ width: "200px" }}
                      disabled={load}
                    >
                      {load ? "Minting..." : "Mint"}
                    </button>
                  </div>
                  <h6
                    className="detailText mb-0 mt-2"
                    style={{
                      fontSize: "14px",
                      textTransform: "capitalize",
                    }}
                  >
                    Transferring DAV tokens is not allowed after minting
                  </h6>
                </div>
              </div>
              <div className="col-md-4 p-0 m-2 cards">
                <div className="card bg-dark text-light border-light p-3 d-flex w-100">
                  <img
                    src={setBackLogo()}
                    alt="PLS Logo"
                    style={{
                      position: "absolute",
                      ...getLogoSize(),
                      opacity: 0.1, // Subtle shadow effect
                      top: "25%",
                      left: "80%",
                      transform: "translate(-50%, -50%)",
                      zIndex: 0, // Ensure it's behind
                      pointerEvents: "none", // Prevent interference
                    }}
                  />
                  <div>
                    <div className="carddetaildiv uppercase d-flex justify-content-between align-items-center">
                      <div className="carddetails2">
                        <div className="d-flex">
                          <p className="mb-1 detailText">Dav holdings </p>
                        </div>
                        <div className="d-flex">
                          <h5 className="">
                            {isLoading ? <DotAnimation /> : davHolds}
                          </h5>
                        </div>
                      </div>
                    </div>
                    <div className="carddetails2 mt-1">
                      <h6
                        className="detailText d-flex "
                        style={{
                          fontSize: "14px",
                          textTransform: "capitalize",
                        }}
                      >
                        {chainId == 146
                          ? "SONIC - SWAP LEVY"
                          : "PLS - SWAP LEVY"}
                      </h6>
                      <h5 className="">{formatWithCommas(claimableAmount)}</h5>
                      <div className="d-flex justify-content-center ">
                        <button
                          onClick={handleClaim}
                          className="btn btn-primary d-flex btn-sm justify-content-center align-items-center mx-5 mt-4"
                          style={{ width: "190px" }}
                          disabled={loadClaim || Number(claimableAmount) === 0}
                        >
                          {loadClaim ? "Claiming..." : "Claim"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-4 p-0 m-2 cards">
                <div className="card bg-dark text-light border-light p-3 d-flex w-100">
                  <div>
                    <div className="carddetaildiv uppercase d-flex justify-content-between align-items-center">
                      <div className="carddetails2 ">
                        <h6 className="detailText">INFO</h6>
                        <p className="mb-1">
                          <span className="detailText">
                            State Token Holding -{" "}
                          </span>
                          <span>{formatWithCommas(stateHolding)}</span>
                        </p>
                        <p className="mb-1">
                          <span className="detailText">
                            State Token Price -{" "}
                          </span>
                          <span>{formatPrice(stateUsdPrice)}</span>
                        </p>
                        <p className="mb-1">
                          <span className="detailText">
                            Affiliate com received -{" "}
                          </span>
                          <span>{formatWithCommas(ReferralAMount)}</span>
                        </p>
                        <p className="mb-1 d-flex align-items-center gap-2 flex-wrap">
                          <span className="detailText">
                            Your Affiliate Link -{" "}
                          </span>
                          <span style={{ textTransform: "none" }}>
                            {ReferralCodeOfUser}
                          </span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(ReferralCodeOfUser);
                              setCopied(true);
                              setCopiedCode(ReferralCodeOfUser);
                              setTimeout(() => setCopied(false), 2000); // Reset after 2 sec
                            }}
                            className="btn btn-outline-light btn-sm py-0 px-2"
                            style={{ fontSize: "14px" }}
                            title={copied ? "Copied!" : "Copy"}
                          >
                            <FontAwesomeIcon icon={copied ? faCheck : faCopy} />
                          </button>
                        </p>
                      </div>
                    </div>
                    <h6
                      className="detailText mb-0 mt-5 px-3"
                      style={{
                        fontSize: "14px",
                        textTransform: "capitalize",
                        marginTop: "2.0rem", // or whatever spacing you want
                      }}
                    >
                      Referrers receive their commission directly in their
                      wallet
                    </h6>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : isBurn ? (
        <>
          <div className="container mt-4">
            <div className="row g-4 d-flex align-items-stretch pb-1 border-bottom-">
              <div className="col-md-4 p-0 m-2 cards">
                <div
                  className="card bg-dark text-light border-light p-3 d-flex w-100"
                  style={{ minHeight: "260px" }}
                >
                  <div>
                    <div className="carddetaildiv uppercase d-flex justify-content-between align-items-center">
                      <div className="carddetails2 mb-4">
                        <div className="d-flex justify-content-center ">
                          <p className="mb-1 detailText">Dav Token holdings </p>
                        </div>
                        <div className="d-flex  justify-content-center">
                          <h5 className="">
                            {isLoading ? <DotAnimation /> : davHolds}
                          </h5>
                        </div>
                      </div>
                    </div>

                    <div className="carddetails2 mt-1">
                      <h6
                        className="detailText mt-5  d-flex justify-content-center"
                        style={{
                          fontSize: "14px",
                          textTransform: "capitalize",
                        }}
                      >
                        MINIMUM REQUIREMENTS - 10 DAV TOKENS
                      </h6>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-4 p-0 m-2 cards">
                <div className="card bg-dark text-light border-light p-0 d-flex justify-content-start align-items-center text-center w-100 ">
                  <div className="p-2 pt-3 pb-2">
                    <p className="mb-2 detailText ">STATE TOKENS BURN</p>
                    <div className="d-flex align-items-center gap-2">
                      <input
                        type="text"
                        placeholder={formatWithCommas(stateHolding)}
                        className="form-control text-center fw-bold "
                        value={amountOfInput}
                        onChange={handleInputChangeForBurn}
                      />
                    </div>
                    <button
                      onClick={handleBurnClick}
                      style={{ width: customWidth }}
                      className="btn btn-primary mx-5 mt-4 btn-sm d-flex justify-content-center align-items-center"
                      disabled={load}
                    >
                      {BurnClicked ? "Burning..." : "Burn"}
                    </button>
                  </div>
                  <div className="carddetails2 ">
                    <h6
                      className="detailText mb-0"
                      style={{
                        fontSize: "14px",
                        textTransform: "capitalize",
                      }}
                    >
                      % STATE TOKENS BURNED BY YOU - {UserPercentage}%
                    </h6>
                  </div>
                </div>
              </div>
              <div className="col-md-4 p-0 m-2 cards">
                <div className="card bg-dark text-light border-light p-0 d-flex justify-content-start align-items-center text-center w-100 ">
                  <div className="p-2 pt-3 pb-2">
                    {" "}
                    <p className="mb-2 detailText ">YOUR CLAIM</p>
                    <div className="d-flex  justify-content-center">
                      <h5 className="mt-2">
                        {formatWithCommas(claimableAmountForBurn)}
                      </h5>
                    </div>
                    <button
                      onClick={() => claimBurnAmount()}
                      style={{ width: customWidth || "100%" }}
                      className="btn btn-primary mt-4 btn-sm d-flex justify-content-center align-items-center"
                      disabled={Claiming || CanClaimNow == "false"}
                    >
                      {Claiming ? "Claiming..." : "Claim"}
                    </button>
                  </div>
                  <div className="carddetails2 ">
                    <h6
                      className="detailText mb-1"
                      style={{
                        fontSize: "14px",
                        textTransform: "capitalize",
                      }}
                    >
                      {Math.floor(TimeUntilNextClaim / 3600)}
                      <span style={{ textTransform: "none" }}>h</span>{" "}
                      {Math.floor((TimeUntilNextClaim % 3600) / 60)}
                      <span style={{ textTransform: "none" }}>m</span>{" "}
                      {TimeUntilNextClaim % 60}s
                    </h6>
                    <h6
                      className="detailText mb-0"
                      style={{
                        fontSize: "14px",
                        textTransform: "capitalize",
                      }}
                    >
                      TREASURY - {formatWithCommas(ContractPls)} PLS
                    </h6>
                    <h6
                      className="detailText mb-0"
                      style={{
                        fontSize: "14px",
                        textTransform: "capitalize",
                      }}
                    >
                      CLAIMABLE TREASURY - {formatWithCommas(usableTreasury)}{" "}
                      PLS
                    </h6>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : isAddToken ? (
        <>
          <div className="container mt-4">
            <div className="row g-4 d-flex align-items-stretch pb-1 border-bottom-">
              <div className="col-md-4 p-0 m-2 cards">
                <div
                  className="card bg-dark text-light border-light p-3 d-flex w-100"
                  style={{ minHeight: "260px" }}
                >
                  <div>
                    <div className="carddetaildiv uppercase d-flex justify-content-between align-items-center">
                      <div className="carddetails2 ">
                        <h6 className="detailText">LISTING A TOKEN</h6>
                        <ul className="mb-1" style={{ paddingLeft: "20px" }}>
                          <li className="detailText">
                            List 1 Token @ 10 Million PLS market Making Services
                          </li>
                          <li className="detailText">
                            Free Liquidity Pool Tokens (1%) Paired with state
                            Token
                          </li>
                          <li className="detailText">
                            Market Making Service For 21 Auctions (3 Years)
                          </li>
                          <li className="detailText">
                            Token Creators Receive Periodical Airdrops
                          </li>
                          <li className="detailText">
                            Add a Standard State Dex Logo
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-4 p-0 m-2 cards">
                <div className="card bg-dark text-light border-light p-0 d-flex justify-content-start align-items-center text-center w-100 ">
                  <div className="p-2 pt-3 pb-2">
                    <p className="mb-2 detailText ">Token Name</p>
                    <div className="d-flex align-items-center gap-2">
                      <input
                        type="text"
                        placeholder="Enter Name"
                        className="form-control text-center fw-bold"
                        value={TokenName}
                        onChange={handleInputChangeForAddtoken}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-4 p-0 m-2 cards">
                <div className="card bg-dark text-light border-light p-0 d-flex justify-content-start align-items-center text-center w-100 ">
                  <div className="p-2 pt-3 pb-2">
                    <p className="mb-2 detailText ">Market Maker Fee</p>
                    <h6 className="text-center  mt-3">10 000 000 PLS</h6>

                    <button
                      onClick={() => AddYourToken(TokenName)}
                      style={{ width: customWidth }}
                      className="btn btn-primary mx-5 mt-4 btn-sm d-flex justify-content-center align-items-center"
                      disabled={load}
                    >
                      Process Listing
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <></>
      )}
    </>
  );
};

export default InfoCards;
