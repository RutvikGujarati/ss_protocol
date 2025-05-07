import "bootstrap/dist/css/bootstrap.min.css";
import "../Styles/InfoCards.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { useSwapContract } from "../Functions/SwapContractFunctions";
import { useEffect, useRef, useState } from "react";
import { ethers } from "ethers";
import { useLocation } from "react-router-dom";
import PLSLogo from "../assets/pls1.png";
import BNBLogo from "../assets/bnb.png";
import sonic from "../assets/S_token.svg";
import { formatWithCommas } from "./DetailsInfo";
import { useDAvContract } from "../Functions/DavTokenFunctions";
import DotAnimation from "../Animations/Animation";
import { useChainId } from "wagmi";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { faCopy } from "@fortawesome/free-regular-svg-icons";
import toast from "react-hot-toast";
import IOSpinner from "../Constants/Spinner";
const InfoCards = () => {
  const chainId = useChainId();

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
    userBurnedAmount,
    claimBurnAmount,
    txStatus,
    expectedClaim,
    // AllUserPercentage,
    TimeUntilNextClaim,
    UserPercentage,
    davHolds,
    AddYourToken,
    // AddDavintoLP,
    stateHolding,
    ReferralCodeOfUser,
    isProcessingToken,
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

  const handleMint = () => {
    if (!amount) {
      toast.error("Please enter the mint amount!", {
        position: "top-center",
        autoClose: 12000,
      });
      return;
    }

    setLoad(true);

    // Allow React to re-render and apply disabled state
    setTimeout(async () => {
      try {
        await mintDAV(amount, Refferalamount);
        await getAirdropAmount();
        await getInputAmount();
        await getOutPutAmount();
        setAmount("");
        setReferralAmount("");
      } catch (error) {
        console.error("Error minting:", error);
        toast.error("Minting failed! Please try again.", {
          position: "top-center",
          autoClose: 12000,
        });
      } finally {
        setLoad(false);
      }
    }, 0);
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
  const [Emoji, setEmoji] = useState("");
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
  const handleInputChangeForAddtoken = (value) => {
    setTokenName(value);
  };
  const handleInputChangeForEmoji = (input) => {
    const graphemes = [...input]; // Spread into array of Unicode grapheme clusters
    if (graphemes.length > 3) return; // Optionally restrict to 1 emoji/logogram
    setEmoji(input);
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
                  <div className=" mb-2 d-flex justify-content-center align-items-center gap-2">
                    <div
                      className="floating-input-container"
                      style={{ maxWidth: "300px" }}
                    >
                      <input
                        type="text"
                        id="affiliateLink"
                        list="referralSuggestions"
                        className={`form-control text-center fw-bold ${
                          Refferalamount ? "filled" : ""
                        }`}
                        value={Refferalamount}
                        onChange={handleOptionalInputChange}
                        style={{ height: "38px", color: "#ffffff" }}
                      />
                      <label htmlFor="affiliateLink" className="floating-label">
                        Affiliate Link - Optional
                      </label>
                      <datalist id="referralSuggestions">
                        {copiedCode && <option value={copiedCode} />}
                      </datalist>
                    </div>
                  </div>
                  <div className="mt-2 mb-2 d-flex justify-content-center align-items-center ">
                    <div
                      className="floating-input-container"
                      style={{ maxWidth: "300px" }}
                    >
                      <input
                        type="text"
                        id="mintAmount"
                        className={`form-control text-center fw-bold ${
                          amount ? "filled" : ""
                        }`}
                        value={amount}
                        onChange={handleInputChange}
                        required
                        style={{ height: "38px", color: "#ffffff" }}
                      />
                      <label htmlFor="mintAmount" className="floating-label">
                        Mint DAV Token - Enter Amount
                      </label>
                    </div>
                  </div>

                  <h5 className="detailAmount">1 DAV TOKEN = 1,000,000 PLS</h5>
                  <h5 className="detailAmount mb-4">
                    {TotalCost
                      ? formatNumber(ethers.formatUnits(TotalCost, 18))
                      : "0"}{" "}
                    PLS{" "}
                  </h5>

                  {load ? (
                    <div className="tx-progress-container">
                      <div className="step-line">
                        <div
                          className={`step ${
                            txStatus === "initializing" ||
                            txStatus === "initiated" ||
                            txStatus === "pending" ||
                            txStatus === "confirmed"
                              ? "active"
                              : ""
                          }`}
                        >
                          <span className="dot" />
                          <span className="label">Initializing</span>
                        </div>
                        <div
                          className={`step ${
                            txStatus === "initiated" ||
                            txStatus === "pending" ||
                            txStatus === "confirmed"
                              ? "active"
                              : ""
                          }`}
                        >
                          <span className="dot" />
                          <span className="label">Initiated</span>
                        </div>
                        <div
                          className={`step ${
                            txStatus === "pending" || txStatus === "confirmed"
                              ? "active"
                              : ""
                          }`}
                        >
                          <span className="dot" />
                          <span className="label">Pending</span>
                        </div>
                        <div
                          className={`step ${
                            txStatus === "confirmed" ? "active" : ""
                          }`}
                        >
                          <span className="dot" />
                          <span className="label">Confirmed</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="d-flex justify-content-center">
                      <button
                        onClick={handleMint}
                        className="btn btn-primary btn-sm mb-0"
                        style={{ width: "200px" }}
                        disabled={load}
                      >
                        Mint
                      </button>
                    </div>
                  )}

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
                        {chainId == 146 ? "SONIC - SWAP LEVY" : "SWAP LEVY"}
                      </h6>
                      <h5 className="">
                        {formatWithCommas(claimableAmount)} PLS
                      </h5>
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
                            Affiliate com received -{" "}
                          </span>
                          <span>{formatWithCommas(ReferralAMount)} PLS</span>
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
                      className="detailText mb-0 m px-3"
                      style={{
                        fontSize: "14px",
                        textTransform: "capitalize",
                        marginTop: "3rem", // or whatever spacing you want
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

                    <div className="carddetails2 mt-4">
                      <h6
                        className="detailText mt-5 text-center"
                        style={{
                          fontSize: "14px",
                          textTransform: "capitalize",
                        }}
                      >
                        A MINIMUM OF 10 DAV TOKENS ARE REQUIRED TO CLAIM MARKET
                        MAKER REWARDS
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
                        style={{ "--placeholder-color": "#6c757d" }}
                        value={amountOfInput}
                        onChange={handleInputChangeForBurn}
                      />
                    </div>
                    <button
                      onClick={async () => {
                        setTimeout(async () => {
                          try {
                            await handleBurnClick(); // your async burn function
                          } catch (err) {
                            console.error("Burn failed:", err);
                          }
                        }, 100); // Allow re-render before blocking
                      }}
                      style={{ width: customWidth }}
                      className="btn btn-primary mx-5 mt-5 btn-sm d-flex justify-content-center align-items-center"
                      disabled={load || BurnClicked}
                    >
                      {BurnClicked ? (
                        <>
                          <IOSpinner className="me-2" />
                          Burning...
                        </>
                      ) : (
                        "Burn"
                      )}
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
                    <h6
                      className="detailText mb-0"
                      style={{
                        fontSize: "14px",
                        textTransform: "capitalize",
                      }}
                    >
                      STATE TOKENS BURNED- {formatWithCommas(userBurnedAmount)}
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
                        {formatWithCommas(claimableAmountForBurn)} PLS
                      </h5>
                    </div>
                    {Number(claimableAmountForBurn) == 0 && (
                      <div className="d-flex justify-content-center">
                        <h6 className="detailText">
                          expected Claim (@ Current Burn %) -{" "}
                          {formatWithCommas(expectedClaim)} PLS
                        </h6>
                      </div>
                    )}
                    <div className="d-flex justify-content-center mt-4">
                      <button
                        onClick={() => {
                          setTimeout(async () => {
                            try {
                              await claimBurnAmount();
                            } catch (err) {
                              console.error("Claim failed:", err);
                            }
                          }, 100);
                        }}
                        style={{ width: customWidth || "100%" }}
                        className="btn btn-primary btn-sm d-flex justify-content-center align-items-center"
                        disabled={
                          Claiming ||
                          claimableAmountForBurn == 0 ||
                          CanClaimNow === "false"
                        }
                      >
                        {Claiming ? (
                          <>
                            <IOSpinner className="me-2" />
                            Claiming...
                          </>
                        ) : (
                          "Claim"
                        )}
                      </button>
                    </div>
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
                      CLAIMABLE TREASURY (Past Cycle) -{" "}
                      {formatWithCommas(usableTreasury)} PLS
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
                          <li className="detailText2">
                            Market-making service for 21 auctions / 3 years
                          </li>
                          <li className="detailText2">
                            Free liquidity pool tokens paired with the STATE
                            token
                          </li>
                          <li className="detailText2">
                            Token creators receive periodic airdrops / 2.5
                            million tokens
                          </li>
                          <li className="detailText2">
                            Airdrops every 50 days
                          </li>
                          <li className="detailText2">
                            ADD YOUR TRIBE (EMOJI). ONLY 3 CHARACTERS ALLOWED
                          </li>
                          <li className="detailText2">Cost - 10 Million PLS</li>
                          <li className="detailText2">
                            Token listed within 24-48 hrs
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
                      <div
                        className="floating-input-container"
                        style={{ maxWidth: "300px" }}
                      >
                        <input
                          type="text"
                          className={`form-control text-center fw-bold ${
                            TokenName ? "filled" : ""
                          }`}
                          style={{ "--placeholder-color": "#6c757d" }}
                          maxLength={10}
                          value={TokenName}
                          disabled={isProcessingToken}
                          onChange={(e) =>
                            handleInputChangeForAddtoken(
                              e.target.value.toUpperCase()
                            )
                          }
                        />
                        <label
                          htmlFor="affiliateLink"
                          className="floating-label"
                        >
                          Enter Name
                        </label>
                      </div>
                    </div>
                    <p className="mb-2 detailText mt-3">Emoji</p>
                    <div className="d-flex align-items-center gap-2">
                      <div
                        className="floating-input-container"
                        style={{ maxWidth: "300px" }}
                      >
                        <input
                          type="text"
                          className={`form-control text-center fw-bold ${
                            Emoji ? "filled" : ""
                          }`}
                          style={{ "--placeholder-color": "#6c757d" }}
                          value={Emoji}
                          disabled={isProcessingToken}
                          onChange={(e) =>
                            handleInputChangeForEmoji(e.target.value)
                          }
                          inputMode="text"
                        />
                        <label
                          htmlFor="affiliateLink"
                          className="floating-label"
                        >
                          Enter Emoji
                        </label>
                      </div>
                    </div>
                  </div>
                  <h6
                    className="detailText mt-2"
                    style={{
                      fontSize: "14px",
                      textTransform: "capitalize",
                    }}
                  >
                    Windows key + . (period)
                  </h6>
                </div>
              </div>
              <div className="col-md-4 p-0 m-2 cards">
                <div className="card bg-dark text-light border-light p-0 d-flex justify-content-start align-items-center text-center w-100 ">
                  <div className="p-2 pt-3 pb-2">
                    <p className="mb-2 detailText ">Market Maker Fee</p>
                    <h6 className="text-center  mt-3">10,000,000 PLS</h6>

                    <button
                      onClick={async () => {
                        setTimeout(async () => {
                          try {
                            await AddYourToken(TokenName, Emoji);
                            setTokenName("");
                            setEmoji("");
                          } catch (err) {
                            console.error("Error processing token:", err);
                          }
                        }, 100); // Allow UI to re-render before tx.wait blocks
                      }}
                      style={{ width: customWidth }}
                      className="btn btn-primary mx-5 mt-4 btn-sm d-flex justify-content-center align-items-center"
                      disabled={isProcessingToken}
                    >
                      {isProcessingToken ? (
                        <>
                          <IOSpinner className="me-2" />
                          Processing...
                        </>
                      ) : (
                        "Process Listing"
                      )}
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
