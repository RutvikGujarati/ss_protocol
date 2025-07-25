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
import { useAccount, useChainId } from "wagmi";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { faCopy } from "@fortawesome/free-regular-svg-icons";
import toast from "react-hot-toast";
import IOSpinner from "../Constants/Spinner";
import GraphemeSplitter from 'grapheme-splitter';


import axios from "axios";
const InfoCards = () => {
  const chainId = useChainId();
  const splitter = new GraphemeSplitter();

  const [copied, setCopied] = useState(false);
  const [copiedCode, setCopiedCode] = useState("");
  const [fileUploaded, setFileUploaded] = useState(null);
  const [isFileUploaded, setIsFileUploaded] = useState(false);
  const { address } = useAccount();
  const {
    mintDAV,
    claimableAmount,
    CanClaimNow,
    isLoading,
    usableTreasury,
    BurnStateTokens,
    claimAmount,
    ReferralAMount,
    userBurnedAmountInCycle,
    claimableAmountForBurn,
    BurnClicked,
    Claiming,
    ContractPls,
    TokenProcessing,
    TokenWithImageProcessing,
    DavMintFee,
    userBurnedAmount,
    claimBurnAmount,
    txStatus,
    // AllUserPercentage,
    TimeUntilNextClaim,
    hasClaimingStarted,
    UserPercentage,
    davHolds,
    davExpireHolds,
    buttonTextStates,
    AddYourToken,
    // AddDavintoLP,
    stateHolding,
    ReferralCodeOfUser,
    davGovernanceHolds,
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
  const [isUploadingToPinata, setIsUploadingToPinata] = useState(false);
  const uploadingToastIdRef = useRef(null);
  useEffect(() => {
    if (isUploadingToPinata) {
      // Show toast if not already shown
      if (!uploadingToastIdRef.current) {
        uploadingToastIdRef.current = toast.loading(
          "Uploading image to Pinata...",
          {
            position: "top-center",
            autoClose: false,
          }
        );
      }
    } else {
      // Dismiss toast if upload finished
      if (uploadingToastIdRef.current) {
        toast.dismiss(uploadingToastIdRef.current);
        uploadingToastIdRef.current = null;
      }
    }
  }, [isUploadingToPinata]);
  const [selectedFile, setSelectedFile] = useState(null);
  const uploadToPinata = async (file) => {
    const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
    const gateway = import.meta.env.VITE_PINATA_GATEWAY;

    // Debugging: Log environment variable

    if (!gateway) {
      console.error("VITE_PINATA_GATEWAY is not defined in .env");
      throw new Error("Pinata gateway URL is not configured");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("pinataMetadata", JSON.stringify({ name: file.name }));
    formData.append("pinataOptions", JSON.stringify({ cidVersion: 1 }));

    try {
      const res = await axios.post(url, formData, {
        maxBodyLength: Infinity,
        headers: {
          pinata_api_key: import.meta.env.VITE_PINATA_API_KEY,
          pinata_secret_api_key: import.meta.env.VITE_PINATA_SECRET_API_KEY,
        },
      });

      const ipfsHash = res.data.IpfsHash;
      // Ensure no double slashes by normalizing the URL
      const pinataURL = `${gateway.endsWith("/") ? gateway.slice(0, -1) : gateway
        }/${ipfsHash}`;
      return pinataURL;
    } catch (err) {
      console.error("Pinata upload failed:", err.response?.data || err.message);
      throw new Error("Failed to upload image to Pinata");
    }
  };
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setSelectedFile(null);
      setFileUploaded(null);
      return;
    }
    setIsFileUploaded(true);
    const validTypes = ["image/png", "image/jpeg"];
    const maxSize = 2 * 1024 * 1024;

    if (!validTypes.includes(file.type)) {
      alert("Only PNG or JPG images are allowed.");
      e.target.value = "";
      return;
    }

    if (file.size < 1 || file.size > maxSize) {
      alert("File size must be between 1 byte and 2 MB.");
      e.target.value = "";
      return;
    }

    const img = new Image();
    img.src = URL.createObjectURL(file);

    img.onload = () => {
      const { width, height } = img;
      if (width < 30 || height < 30) {
        alert("Image dimensions must be at least 30x30 pixels.");
        e.target.value = "";
        return;
      }
      if (width !== height) {
        alert("Image must be square.");
        e.target.value = "";
        return;
      }

      setSelectedFile(file); // Store the raw file only
      setFileUploaded(null); // Reset any previous uploaded URL
    };

    img.onerror = () => {
      alert("Failed to load image.");
      setIsFileUploaded(false);
      e.target.value = "";
    };
  };
  const handleWithDelay = (fn, delay = 100) => {
    setTimeout(async () => {
      try {
        await fn();
      } catch (err) {
        console.error("Async function failed:", err);
      }
    }, delay);
  };

  const handleTokenProcess = async () => {
    try {
      if (!TokenName || (!Emoji && !selectedFile)) {
        alert("Please enter an emoji or select an image.");
        return;
      }

      let tokenMedia = Emoji;
      let isImage = false;

      if (selectedFile) {
        if (!fileUploaded) {
          setIsUploadingToPinata(true);
          try {
            const pinataURL = await uploadToPinata(selectedFile);
            setFileUploaded(pinataURL);
            tokenMedia = pinataURL;
            isImage = true;
          } catch (uploadErr) {
            console.error("Pinata upload failed:", uploadErr);
            alert("Image upload failed.");
            setIsUploadingToPinata(false);
            return;
          }
          setIsUploadingToPinata(false);
        } else {
          tokenMedia = fileUploaded;
          isImage = true;
        }
      }

      await AddYourToken(TokenName, tokenMedia, isImage);

      // Reset form
      setTokenName("");
      setEmoji("");
      setFileUploaded(null);
      setSelectedFile(null);
    } catch (err) {
      console.error("Error processing token:", err);
    }
  };

  const adjustedTokenProcessing = isFileUploaded
    ? Math.floor(TokenWithImageProcessing)
    : Math.floor(TokenProcessing);

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
  const isBurn = location.pathname === "/Deflation";
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
    if (graphemes.length > 10) return; // Optionally restrict to 1 emoji/logogram
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
  const AuthAddress = import.meta.env.VITE_AUTH_ADDRESS;

  return (
    <>
      {isAuction ? (
        <>
          <div className="container mt-4">
            <div className="row g-4 d-flex align-items-stretch pb-1">
              <div className="col-md-4 p-0 m-2 cards">
                <div
                  className="card bg-dark text-light border-light p-3 text-center w-100"
                  style={{ minHeight: "260px" }}
                >
                  <div className=" mb-2 d-flex justify-content-center align-items-center gap-2">
                    <div
                      className="floating-input-container"
                      style={{ maxWidth: "300px" }}
                    >
                      <input
                        type="text"
                        id="affiliateLink"
                        list="referralSuggestions"
                        className={`form-control text-center fw-bold ${Refferalamount ? "filled" : ""
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
                        className={`form-control text-center fw-bold ${amount ? "filled" : ""
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

                  <h5 className="detailAmount">
                    1 DAV TOKEN = {formatWithCommas(Math.floor(1500000))} PLS
                  </h5>
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
                          className={`step ${txStatus === "initializing" ||
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
                          className={`step ${txStatus === "initiated" ||
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
                          className={`step ${txStatus === "pending" || txStatus === "confirmed"
                              ? "active"
                              : ""
                            }`}
                        >
                          <span className="dot" />
                          <span className="label">Pending</span>
                        </div>
                        <div
                          className={`step ${txStatus === "confirmed" ? "active" : ""
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
                          <p className="mb-1 detailText">
                            ACTIVE DAV / EXPIRED DAV
                          </p>
                        </div>
                        <div className="d-flex">
                          <h5 className="">
                            {address == AuthAddress ? (
                              <>
                                {isLoading ? (
                                  <DotAnimation />
                                ) : (
                                  davGovernanceHolds
                                )}
                              </>
                            ) : (
                              <>{isLoading ? <DotAnimation /> : davHolds}</>
                            )}{" "}
                            / {isLoading ? <DotAnimation /> : davExpireHolds}
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
                        {chainId == 146 ? "SONIC - SWAP LEVY" : "GAS SWAP LEVY"}
                      </h6>
                      <h5 className="">
                        <> {formatWithCommas(claimableAmount)} PLS</>
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
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : isBurn ? (
        <>
          <div className="container mt-4">
            <div className="row g-4 d-flex align-items-stretch pb-1 ">
              <div className="col-md-4 p-0 m-2 cards">
                <div
                  className="card bg-dark text-light border-light p-3 d-flex w-100"
                  style={{ minHeight: "260px" }}
                >
                  <div>
                    <div className="carddetaildiv uppercase d-flex justify-content-between align-items-center">
                      <div className="carddetails2 mb-4">
                        <div className="d-flex justify-content-center ">
                          <p className="mb-1 detailText">TREASURY</p>
                        </div>
                        <div className="d-flex  justify-content-center">
                          <h5 className="">
                            {formatWithCommas(ContractPls)} PLS
                          </h5>
                        </div>
                      </div>
                    </div>

                    <div className="carddetails2 ">
                      <div className="d-flex justify-content-center ">
                        <p className="mb-1 detailText"> ACTIVE DAV </p>
                      </div>
                      <div className="d-flex  justify-content-center">
                        <h5 className="">
                          {address == AuthAddress ? (
                            <>
                              {isLoading ? (
                                <DotAnimation />
                              ) : (
                                davGovernanceHolds
                              )}
                            </>
                          ) : (
                            <>{isLoading ? <DotAnimation /> : davHolds}</>
                          )}
                        </h5>
                      </div>
                    </div>

                    <div className="carddetails2 ">
                      <h6
                        className="detailText mt-3 text-center"
                        style={{
                          fontSize: "14px",
                          textTransform: "capitalize",
                        }}
                      >
                        A MINIMUM OF 10 DAV TOKENS ARE REQUIRED TO CLAIM REWARDS
                      </h6>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-4 p-0 m-2 cards">
                <div className="card bg-dark text-light border-light p-0 d-flex justify-content-start align-items-center text-center w-100">
                  <div className="p-2 pt-3 pb-2">
                    <p className="mb-2 detailText">STATE TOKENS BURN</p>

                    <div className="d-flex align-items-center gap-2">
                      <input
                        type="text"
                        placeholder={formatWithCommas(stateHolding)}
                        className="form-control text-center fw-bold"
                        style={{ "--placeholder-color": "#6c757d" }}
                        value={amountOfInput}
                        onChange={handleInputChangeForBurn}
                      />
                    </div>

                    {BurnClicked ? (
                      <div className="tx-progress-container mt-5 ">
                        <div
                          className="step-line"
                          style={{
                            justifyContent: "space-between",
                            gap: "20px",
                          }}
                        >
                          <div
                            className={`step ${[
                                "initializing",
                                "initiated",
                                "Approving",
                                "Pending",
                                "confirmed",
                              ].includes(buttonTextStates)
                                ? "active"
                                : ""
                              }`}
                          >
                            <span className="dot" />
                            <span className="label">Initializing</span>
                          </div>
                          <div
                            className={`step ${[
                                "initiated",
                                "Approving",
                                "Pending",
                                "confirmed",
                              ].includes(buttonTextStates)
                                ? "active"
                                : ""
                              }`}
                          >
                            <span className="dot" />
                            <span className="label">Initiated</span>
                          </div>
                          <div
                            className={`step ${["Approving", "Pending", "confirmed"].includes(
                              buttonTextStates
                            )
                                ? "active"
                                : ""
                              }`}
                          >
                            <span className="dot" />
                            <span className="label">Approving</span>
                          </div>
                          <div
                            className={`step ${["Pending", "confirmed"].includes(
                              buttonTextStates
                            )
                                ? "active"
                                : ""
                              }`}
                          >
                            <span className="dot" />
                            <span className="label">Burning</span>
                          </div>
                          <div
                            className={`step ${buttonTextStates === "confirmed" ? "active" : ""
                              }`}
                          >
                            <span className="dot" />
                            <span className="label">Confirmed</span>
                          </div>
                        </div>
                      </div>
                    ) : (
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
                        Burn
                      </button>
                    )}
                  </div>

                  <div className="carddetails2">
                    <h6
                      className="detailText mb-0"
                      style={{
                        fontSize: "14px",
                        textTransform: "capitalize",
                      }}
                    >
                      % BURNED BY YOU - {UserPercentage}%
                    </h6>
                    <h6
                      className="detailText mb-0"
                      style={{
                        fontSize: "14px",
                        textTransform: "capitalize",
                      }}
                    >
                      BURNED BY YOU - {formatWithCommas(userBurnedAmount)}
                    </h6>
                    <h6
                      className="detailText mb-0"
                      style={{
                        fontSize: "14px",
                        textTransform: "capitalize",
                      }}
                    >
                      CURRENT CYCLE BURN -{" "}
                      {formatWithCommas(userBurnedAmountInCycle)}
                    </h6>
                  </div>
                </div>
              </div>

              <div className="col-md-4 p-0 m-2 cards">
                <div className="card bg-dark text-light border-light p-0 d-flex justify-content-start align-items-center text-center w-100 ">
                  <div className="p-2 pt-3 pb-2">
                    {" "}
                    <p className="mb-2 detailText ">EXPECTED CLAIM </p>
                    <div className="d-flex  justify-content-center">
                      <h5 className="mt-2">
                        {formatWithCommas(claimableAmountForBurn)} PLS
                      </h5>
                    </div>
                    <div
                      className="d-flex justify-content-center"
                      style={{ minHeight: "24px" }}
                    >
                      <h6
                        className="detailText2"
                        style={{
                          visibility:
                            Number(claimableAmountForBurn) == 0
                              ? "visible"
                              : "hidden",
                        }}
                      >
                        {/* @ Current Burn % - {formatWithCommas(expectedClaim)} PLS */}
                      </h6>
                    </div>
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
                      {hasClaimingStarted == "false" ? (
                        "Not started"
                      ) : (
                        <>
                          {Math.floor(TimeUntilNextClaim / 86400)}
                          <span style={{ textTransform: "none" }}>d</span>{" "}
                          {Math.floor((TimeUntilNextClaim % 86400) / 3600)}
                          <span style={{ textTransform: "none" }}>h</span>{" "}
                          {Math.floor((TimeUntilNextClaim % 3600) / 60)}
                          <span style={{ textTransform: "none" }}>m</span>{" "}
                          {TimeUntilNextClaim % 60}
                          <span style={{ textTransform: "none" }}>s</span>
                        </>
                      )}
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
            <div className="row g-4 d-flex align-items-stretch pb-1 ">
              <div className="col-md-4 p-0 m-2 cards">
                <div
                  className="card bg-dark text-light border-light p-0 d-flex justify-content-start align-items-center text-center w-100 "
                  style={{ minHeight: "260px" }}
                >
                  <div className="p-2 pt-3 pb-2">
                    <p className="mb-2 detailText ">ADD TOKEN NAME</p>
                    {/* <p className="mb-2 detailText ">Token Name</p> */}
                    <div className="mb-2  d-flex align-items-center gap-2">
                      <div
                        className="floating-input-container"
                        style={{ maxWidth: "300px" }}
                      >
                        <input
                          type="text"
                          className={`form-control text-center fw-bold ${TokenName ? "filled" : ""
                            }`}
                          style={{ "--placeholder-color": "#6c757d" }}
                          value={TokenName}
                          maxLength={11}
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
                          Enter Token Name
                        </label>
                      </div>
                    </div>
                    {/* <p className="mb-2 detailText mt-3">Emoji</p> */}
                    <div className="d-flex align-items-center gap-2">
                      <div
                        className="floating-input-container"
                        style={{ maxWidth: "300px" }}
                      >
                        <input
                          type="text"
                          className={`form-control text-center fw-bold ${Emoji ? "filled" : ""
                            }`}
                          style={{ "--placeholder-color": "#6c757d" }}
                          value={Emoji}
                          disabled={isProcessingToken || !!selectedFile}
                          onChange={(e) => {
                            const graphemes = splitter.splitGraphemes(e.target.value);
                            const value = graphemes[0] || ''; 
                            setFileUploaded(null);
                            setIsFileUploaded(false);
                            handleInputChangeForEmoji(value);
                          }}
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
                    <h6 className="mt-4">
                      <ul
                        style={{
                          listStyleType: "disc",
                          textAlign: "left",
                          paddingLeft: "20px",
                          fontSize: "14px",
                        }}
                      >
                        <li>Choose an image or an emoji. </li>
                        <li>You can only select one </li>
                        <li>Emoji is free</li>
                      </ul>
                    </h6>
                  </div>
                </div>
              </div>
              <div className="col-md-4 p-0 m-2 cards">
                <div className="card bg-dark text-light border-light p-0 d-flex justify-content-start align-items-center text-center w-100">
                  <div className="p-2 pt-3 pb-2 ">
                    {/* Heading */}
                    <p className="mb-2 detailText ">Upload Image</p>

                    {/* File Input */}
                    <div className="d-flex align-items-center gap-2">
                      <div
                        className="floating-input-container"
                        style={{ maxWidth: "300px" }}
                      >
                        <input
                          type="file"
                          className="form-control text-center fw-bold"
                          style={{ "--placeholder-color": "#6c757d" }}
                          disabled={isProcessingToken || !!Emoji}
                          onChange={handleFileUpload}
                          accept="image/*"
                        />
                      </div>
                    </div>
                    <h6 className="mt-5 mx-5">
                      <ul
                        style={{
                          listStyleType: "disc",
                          textAlign: "left",
                          paddingLeft: "20px",
                          fontSize: "14px",
                        }}
                      >
                        <li>Minimum 30px dimension</li>
                        <li>Square with 1:1 aspect ratio</li>
                        <li>Minimum 1 byte file size</li>
                        <li>Maximum 2 MB file size</li>
                      </ul>
                    </h6>
                  </div>
                </div>
              </div>

              <div className="col-md-4 p-0 m-2 cards">
                <div className="card bg-dark text-light border-light p-0 d-flex justify-content-start align-items-center text-center w-100 ">
                  <div className="p-2 pt-3 pb-2">
                    <p className="mb-2 detailText ">TOKEN Fee</p>
                    <h6 className="text-center  mt-3">
                      {formatWithCommas(adjustedTokenProcessing)} PLS
                    </h6>

                    <button
                      onClick={() => handleWithDelay(handleTokenProcess)}
                      style={{ width: customWidth }}
                      className="btn btn-primary mx-5 mt-4 btn-sm d-flex justify-content-center align-items-center"
                      disabled={isProcessingToken || isUploadingToPinata}
                    >
                      {isProcessingToken || isUploadingToPinata ? (
                        <>
                          <IOSpinner className="me-2" />
                          {isUploadingToPinata
                            ? "Uploading..."
                            : "Processing..."}
                        </>
                      ) : (
                        "Process Listing"
                      )}
                    </button>
                  </div>
                  <h6 className="mt-4">
                    <ul
                      style={{
                        listStyleType: "disc",
                        textAlign: "left",
                        paddingLeft: "20px",
                        fontSize: "14px",
                      }}
                    >
                      <li>Token Fee + Emoji Fee - 15 Million PLS </li>
                      <li>Token Fee + Image Fee - 20 Million PLS </li>
                    </ul>
                  </h6>
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
