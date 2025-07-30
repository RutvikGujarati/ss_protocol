import { parseUnits } from "ethers";
import { useState, useEffect, useContext } from "react";
import TokenSearchModal from "./TokenSearchModal";
import { ethers } from "ethers";
import { ContractContext } from "../../Functions/ContractInitialize";
import { useAllTokens } from "./Tokens";
import state from "../../assets/statelogo.png";
import pulsechainLogo from "../../assets/pls1.png";
import plslogo from "/pls.png";
import { useAccount } from "wagmi";

import useSwapData from "./useSwapData";
import toast from "react-hot-toast";
import React from "react";

const SwapComponent = () => {
  const { signer } = useContext(ContractContext);
  const TOKENS = useAllTokens();
  const { address } = useAccount();

  const [tokenIn, setTokenIn] = useState("STATE");
  const [tokenOut, setTokenOut] = useState("PulseChain from pump.tires");
  const [amountIn, setAmountIn] = useState("");
  const [isSwapping, setIsSwapping] = useState(false);
  const [slippage, setSlippage] = useState(1);
  const [isCustomSlippage, setIsCustomSlippage] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [needsApproval, setNeedsApproval] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [showTxModal, setShowTxModal] = useState(false);
  const [txStatus, setTxStatus] = useState("");
  const [confirmedAmountIn, setConfirmedAmountIn] = useState("");
  const [confirmedAmountOut, setConfirmedAmountOut] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [showRouteDetails, setShowRouteDetails] = useState(false);
  const [showAuctions, setShowAuctions] = useState(false);
  const [isInputHovered, setIsInputHovered] = useState(false);
  const [insufficientBalance, setInsufficientBalance] = useState(false);

  const {
    amountOut,
    estimatedGas,
    tokenInBalance,
    quoteData,
    routeDetails,
    inputUsdValue,
    outputUsdValue,
    isLoading,
  } = useSwapData({
    amountIn,
    tokenIn,
    tokenOut,
    slippage,
    TOKENS,
  });

  // Check if input amount exceeds balance
  useEffect(() => {
    if (amountIn && tokenInBalance) {
      const inputAmount = parseFloat(amountIn.replace(/,/g, ''));
      const balance = parseFloat(tokenInBalance);
      setInsufficientBalance(inputAmount > balance);
    } else {
      setInsufficientBalance(false);
    }
  }, [amountIn, tokenInBalance]);

  const handleSwitchTokens = () => {
    setTokenIn(tokenOut);
    setTokenOut(tokenIn);
  };


  const ERC20_ABI = [
    "function allowance(address owner, address spender) view returns (uint256)",
    "function approve(address spender, uint256 amount) returns (bool)",
  ];

  const SPECIAL_TOKEN_LOGOS = {
    STATE: state,
    pSTATE: state,
    PulseChain: pulsechainLogo,
    "PulseChain from pump.tires": plslogo,
  };

  const checkAllowance = async () => {
    if (tokenIn === "PulseChain from pump.tires") {
      setNeedsApproval(false);
      return;
    }
    try {
      const tokenAddress = TOKENS[tokenIn].address;
      const contract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
      const allowance = await contract.allowance(
        address,
        "0x6BF228eb7F8ad948d37deD07E595EfddfaAF88A6"
      );
      const amount = parseUnits(amountIn || "0", TOKENS[tokenIn].decimals);
      setNeedsApproval(BigInt(allowance) < BigInt(amount));
    } catch (err) {
      setNeedsApproval(false);
      console.error("Error checking allowance", err);
    }
  };

  useEffect(() => {
    if (signer && amountIn && !isNaN(amountIn)) {
      checkAllowance();
    } else {
      setNeedsApproval(false);
    }
  }, [tokenIn, amountIn, signer]);

  const handleApprove = async () => {
    setIsApproving(true);
    setShowTxModal(true);
    setTxStatus("Approving");
    try {
      const tokenAddress = TOKENS[tokenIn].address;
      const contract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
      // Approve unlimited amount (max uint256
      const maxUint256 = BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");
      const tx = await contract.approve(
        "0x6BF228eb7F8ad948d37deD07E595EfddfaAF88A6",
        maxUint256
      );
      await tx.wait();
      setNeedsApproval(false);
      setTxStatus("pending");
      await handleSwap();
    } catch (err) {
      toast.error("Approval failed. Try again.", {
        position: "top-center",
        autoClose: 5000, // 5 seconds
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      console.error("Approval error", err);
      setTxStatus("error");
      setTimeout(() => setShowTxModal(false), 1200);
    } finally {
      setIsApproving(false);
    }
  };
  const TOKENS_BY_SYMBOL = Object.values(TOKENS).reduce((acc, token) => {
    acc[token.symbol] = token;
    return acc;
  }, {});
  const getTokenLogo = (symbol) => {
    if (SPECIAL_TOKEN_LOGOS[symbol]) {
      return (
        <img
          src={SPECIAL_TOKEN_LOGOS[symbol]}
          alt={symbol}
          width="32"
          className="rounded-circle"
        />
      );
    }
    if (
      TOKENS[symbol]?.image &&
      (TOKENS[symbol].image.startsWith("http") ||
        TOKENS[symbol].image.startsWith("/"))
    ) {
      return (
        <img
          src={TOKENS[symbol].image}
          alt={symbol}
          width="32"
          className="rounded-circle"
        />
      );
    }
    if (TOKENS[symbol]?.emoji) {
      return <span style={{ fontSize: "1.1em" }}>{TOKENS[symbol].emoji}</span>;
    }
    return (
      <img
        src="/default.png"
        alt={symbol}
        width="32"
        className="rounded-circle"
      />
    );
  };
  const openModal = (type) => {
    setModalType(type);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalType(null);
  };

  const selectToken = (key) => {
    if (modalType === "in") setTokenIn(key);
    else setTokenOut(key);
    closeModal();
  };

  const handleSwap = async () => {
    if (!signer || !quoteData) {
      toast.error("Wallet not connected or quote data missing.", {
        position: "top-center",
        autoClose: 5000, // 5 seconds
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      return;
    }

    setIsSwapping(true);
    setShowTxModal(true);
    setTxStatus("pending");
    setConfirmedAmountIn(amountIn);
    setConfirmedAmountOut(amountOut);
    try {
      const tx = await signer.sendTransaction({
        to: "0x6BF228eb7F8ad948d37deD07E595EfddfaAF88A6",
        value: quoteData.value,
        data: quoteData.calldata,
      });
      console.log("Transaction sent:", tx.hash);
      await tx.wait();
      console.log("Transaction confirmed:", tx.hash);
      setShowConfirmation(true);
      setAmountIn("");
      setTxStatus("confirmed");
      setTimeout(() => setShowTxModal(false), 1200);
    } catch (err) {
      console.error("Swap failed", err);
      toast.error("Swap failed. Try again.", {
        position: "top-center",
        autoClose: 5000, // 5 seconds
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      setTxStatus("error");
      setTimeout(() => setShowTxModal(false), 1200);
    } finally {
      setIsSwapping(false);
      setAmountIn("");
    }
  };

  const handleSlippageSelection = (selectedSlippage) => {
    setSlippage(selectedSlippage);
    setIsCustomSlippage(false);
  };

  const getPriceDifference = () => {
    if (!inputUsdValue || !outputUsdValue) return null;
    const inputUsd = parseFloat(inputUsdValue.replace("$", ""));
    const outputUsd = parseFloat(outputUsdValue.replace("$", ""));
    if (isNaN(inputUsd) || isNaN(outputUsd)) return null;
    const difference = outputUsd - inputUsd;
    const percentage = inputUsd > 0 ? (difference / inputUsd) * 100 : 0;
    return {
      value: difference,
      percentage: percentage,
      isPositive: difference > 0,
    };
  };

  useEffect(() => {
    if (showConfirmation) {
      toast.success(
        `${confirmedAmountIn} ${getDisplaySymbol(TOKENS[tokenIn].symbol)} → ${confirmedAmountOut} ${getDisplaySymbol(TOKENS[tokenOut].symbol)} Swap Complete!`,
        {
          position: "top-center",
          autoClose: 6000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: false,
          theme: "dark",
        }
      );
      setShowConfirmation(false);
    }
  }, [showConfirmation]);

  // Helper to truncate token symbol and ensure single line
  const getDisplaySymbol = (symbol) => {
    if (!symbol) return '';
    // Remove all whitespace to ensure single line
    const singleLine = symbol.replace(/\s+/g, '');
    return singleLine.length > 6 ? singleLine.slice(0, 6) + '..' : singleLine;
  };
  // Helper to truncate decimal without rounding
  const truncateDecimals = (number, digits) => {
    const [intPart, decPart = ""] = number.toString().split(".");
    const truncated = decPart.length > digits
      ? `${intPart}.${decPart.slice(0, digits)}`
      : number.toString();
    return truncated;
  };

  // Helper to format number with commas and decimals
  const formatNumberWithCommas = (value) => {
    if (!value || isNaN(value.replace(/,/g, ''))) return value;
    const raw = value.replace(/,/g, '');
    const truncated = truncateDecimals(raw, 4);
    const [intPart, decPart] = truncated.split('.');
    return decPart
      ? Number(intPart).toLocaleString('en-US') + '.' + decPart
      : Number(intPart).toLocaleString('en-US');
  };

  // Helper to validate input amount
  const validateInputAmount = (rawValue) => {
    return /^\d*\.?\d{0,18}$/.test(rawValue);
  };

  // Helper to check if amount exceeds balance
  const checkInsufficientBalance = (inputValue, balance) => {
    if (!inputValue || !balance) return false;
    const inputAmount = parseFloat(inputValue.replace(/,/g, ''));
    const userBalance = parseFloat(balance);
    return inputAmount > userBalance;
  };

  // Helper to handle input change
  const handleInputChange = (value) => {
    const rawValue = value.replace(/,/g, '');
    if (validateInputAmount(rawValue)) {
      const isInsufficient = checkInsufficientBalance(rawValue, tokenInBalance);
      setInsufficientBalance(isInsufficient);
      setAmountIn(rawValue);
    }
  };

  // Helper to get percentage amount (without rounding)
  const getPercentageAmount = (percentage) => {
    if (!tokenInBalance) return "0";
    const balance = parseFloat(tokenInBalance);
    const result = (balance * percentage) / 100;
    // Return with full precision, don't round
    return result.toString();
  };

  // Helper to get max amount (exact balance without rounding)
  const getMaxAmount = () => {
    return tokenInBalance ? tokenInBalance.toString() : "";
  };

  return (
    <>
      {/* Inline transaction progress bar */}
      <div className="d-flex justify-content-center swap-container">
        <div
          className="d-flex flex-row flex-wrap justify-content-center w-100"
          style={{
            gap: 32,
            maxWidth: "100%",
            alignItems: "flex-start",
          }}
        >
          {/* Main swap card */}
          <div className="card-container">
            <div className="shadow-sm rounded-3 swap-card ">
              <label className="text-light small mb-1 font-weight-normal ">From</label>

              <div>

                <div className="d-flex align-items-center gap-2" style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="form-control"
                    value={formatNumberWithCommas(amountIn)}
                    onChange={(e) => handleInputChange(e.target.value)}
                    placeholder="0.0"
                    style={{
                      boxShadow: "none",
                      "--placeholder-color": "#6c757d",
                      backgroundColor: (isApproving || isSwapping) ? "#343a40" : undefined,
                      borderColor: insufficientBalance ? "#dc3545" : undefined,
                    }}
                    disabled={isApproving || isSwapping}
                  />

                  <div
                    className="d-flex gap-1 position-absolute"
                    style={{
                      right: "140px",
                      top: "140%",
                      transform: "translateY(-50%)",
                      zIndex: 2,
                    }}
                  >
                    {[25, 50, 75].map((percent) => (
                      <button
                        key={percent}
                        className="btn btn-outline-secondary btn-sm px-1 py-0"
                        style={{ fontSize: "0.6em", borderRadius: "10px", height: "20px", minWidth: "32px" }}
                        onClick={() => setAmountIn(getPercentageAmount(percent))}
                        type="button"
                        disabled={isApproving || isSwapping}
                      >
                        {percent}%
                      </button>
                    ))}
                    <button
                      className="btn btn-outline-secondary btn-sm px-1 py-0"
                      style={{ fontSize: "0.6em", borderRadius: "10px", height: "20px", minWidth: "32px" }}
                      onClick={() => setAmountIn(getMaxAmount())}
                      type="button"
                      disabled={isApproving || isSwapping}
                    >
                      Max
                    </button>
                  </div>
                  <div className="d-flex align-items-center gap-1">
                    <button
                      className="d-flex align-items-center justify-content-between gap-2 px-2 token-select-btn"
                      onClick={() => openModal("in")}
                      disabled={isApproving || isSwapping}
                    >
                      <span className="d-flex align-items-center gap-2">
                        {getTokenLogo(tokenIn)}
                        <span style={{ fontWeight: 500, fontSize: "1rem" }}>
                          {getDisplaySymbol(TOKENS[tokenIn]?.symbol || tokenIn)}
                        </span>
                      </span>
                      <span className="ms-2 d-flex align-items-center">
                        <i
                          className="bi bi-chevron-down"
                          style={{ fontSize: "1rem" }}
                        ></i>
                      </span>
                    </button>
                  </div>
                </div>
              </div>
              <div
                className="d-flex justify-content-between align-items-center mb-2 mt-1"
                style={{ fontSize: "0.7rem" }}
              >
                <small className="text-secondary">
                  {inputUsdValue && <span>{inputUsdValue}</span>}
                </small>
                <span className="text-secondary small fw-normal ms-1">
                  Bal:{" "}
                  {tokenInBalance
                    ? `${parseFloat(tokenInBalance).toFixed(2)}`
                    : "-"}
                </span>
              </div>
              {insufficientBalance && (
                <div className="text-danger small mb-2">
                  Insufficient balance. You only have {parseFloat(tokenInBalance).toFixed(2)} {TOKENS[tokenIn]?.symbol || tokenIn}.
                </div>
              )}

              <div className="text-center ">
                <button
                  className="btn btn-outline-primary btn-sm rounded-circle mt-3"
                  onClick={handleSwitchTokens}
                  disabled={isApproving || isSwapping}
                  style={{ width: "40px", height: "40px" }}
                >
                  ⇅
                </button>
              </div>

              <label className="text-light small mb-1 font-weight-normal">To</label>

              <div className="d-flex align-items-center gap-2">
                <input
                  type="text"
                  className="form-control font-weight-bold"
                  placeholder="0.0"
                  value={
                    isLoading
                      ? "Fetching..."
                      : amountOut
                  }
                  readOnly
                  style={{ fontSize: "1rem", background: "#343a40", "--placeholder-color": "#6c757d" }}
                />
                <div className="d-flex align-items-center gap-1">
                  <button
                    className="d-flex align-items-center justify-content-between gap-2 px-2 token-select-btn"
                    onClick={() => openModal("out")}
                    disabled={isApproving || isSwapping}
                  >
                    <span className="d-flex align-items-center gap-2">
                      {getTokenLogo(tokenOut)}
                      <span style={{ fontWeight: 500, fontSize: "1rem" }}>
                        {getDisplaySymbol(TOKENS[tokenOut]?.symbol || tokenOut)}
                      </span>
                    </span>
                    <span className="ms-2 d-flex align-items-center">
                      <i
                        className="bi bi-chevron-down"
                        style={{ fontSize: "1rem" }}
                      ></i>
                    </span>
                  </button>
                </div>
              </div>
              {outputUsdValue && (
                <div
                  className="d-flex justify-content-start align-items-center gap-2 mb-2"
                  style={{ fontSize: "0.7rem" }}
                >
                  <small className="text-secondary">{outputUsdValue}</small>
                  {getPriceDifference() && (
                    <span
                      className="badge"
                      style={{
                        color: getPriceDifference().isPositive
                          ? "#28a745"
                          : "#dc3545",
                        fontSize: "0.7rem",
                        padding: "2px 6px",
                      }}
                    >
                      {getPriceDifference().isPositive ? "+" : ""}
                      ({getPriceDifference().percentage.toFixed(2)}%)
                    </span>
                  )}
                </div>
              )}
              {/* Inline transaction progress bar below Network Fee */}
              {(isSwapping || isApproving || showTxModal) && (
                <div className="tx-progress-container mb-3 mt-3">
                  <div className="step-line">
                    <div className={`step ${txStatus === "initializing" || txStatus === "initiated" || txStatus === "Approving" || txStatus === "pending" || txStatus === "confirmed" ? "active" : ""}`}>
                      <span className="dot" />
                      <span className="label" style={{ fontSize: "0.65em" }}>Initializing</span>
                    </div>
                    <div className={`step ${txStatus === "initiated" || txStatus === "Approving" || txStatus === "pending" || txStatus === "confirmed" ? "active" : ""}`}>
                      <span className="dot" />
                      <span className="label" style={{ fontSize: "0.65em" }}>Initiated</span>
                    </div>
                    <div className={`step ${txStatus === "Approving" || txStatus === "pending" || txStatus === "confirmed" ? "active" : ""}`}>
                      <span className="dot" />
                      <span className="label" style={{ fontSize: "0.65em" }}>Approving</span>
                    </div>
                    <div className={`step ${txStatus === "pending" || txStatus === "confirmed" ? "active" : ""}`}>
                      <span className="dot" />
                      <span className="label" style={{ fontSize: "0.65em" }}>Swapping</span>
                    </div>
                    <div className={`step ${txStatus === "confirmed" || txStatus === "error" ? "active" : ""}`}>
                      <span className="dot" />
                      <span className="label" style={{ fontSize: "0.65em" }}>{txStatus === "error" ? "Error" : "Confirmed"}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="d-flex justify-content-center align-items-center mt-3">
                <div className="position-relative">
                  {needsApproval ? (
                    <button
                      className="btn btn-success rounded-pill py-2"
                      onClick={handleApprove}
                      disabled={isApproving || isSwapping}
                      style={{ width: "300px", padding: "10px 20px", fontWeight: 400, height: "40px", textAlign: "right", paddingRight: "40px" }}
                    >
                      {isApproving ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                          ></span>
                          Approving...
                        </>
                      ) : (
                        `Approve ${TOKENS[tokenIn]?.symbol || tokenIn}`
                      )}
                    </button>
                  ) : (
                    <button
                      className="btn btn-primary rounded-pill py-2"
                      onClick={handleSwap}
                      disabled={!quoteData || isSwapping || insufficientBalance}
                      style={{ width: "300px", padding: "10px 20px", fontWeight: 400, height: "40px", textAlign: "right", paddingRight: "40px" }}
                    >
                      {isSwapping ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                          ></span>
                          Swapping...
                        </>
                      ) : insufficientBalance ? (
                        `Insufficient ${TOKENS[tokenIn]?.symbol || tokenIn}`
                      ) : (
                        "SWAP"
                      )}
                    </button>
                  )}
                  <div className="d-flex gap-1 position-absolute" style={{ left: "3%", top: "50%", transform: "translateY(-50%)" }}>
                    {[0.1, 0.5, 1.0, 2].map((val) => (
                      <button
                        key={val}
                        disabled={isApproving || isSwapping}
                        className={`btn btn-sm rounded-circle p-1 ${slippage === val && !isCustomSlippage ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => handleSlippageSelection(val)}
                        style={{ width: "30px", height: "30px", fontSize: "0.6rem", lineHeight: "1" }}
                      >
                        {val}%
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Details Toggle */}
              <div className="d-flex justify-content-between align-items-center mt-3" >
                <button
                  className="btn btn-link text-light small  font-weight-normal p-0"
                  style={{ textDecoration: "none", fontWeight: 200, fontSize: "14px" }}
                  onClick={() => setShowDetails((prev) => !prev)}
                >
                  Details {showDetails ? <i className="bi bi-chevron-up"></i> : <i className="bi bi-chevron-down"></i>}
                </button>
              </div>

              {/* Details Section */}
              {showDetails && (
                <div className="border border-secondary rounded-3 px-2 py-1 mt-1 bg-dark bg-opacity-50" style={{ fontSize: "0.85rem" }}>
                  <div className="d-flex justify-content-between align-items-center h-100 mb-1">
                    <small className="text-secondary" style={{ fontSize: "9.8px" }}>Network Fee: ${estimatedGas}</small>
                  </div>
                  {/* Collapsible Active Auctions */}
                  <div className="border-top border-secondary pt-1 mb-0">
                    <div className="d-flex justify-content-between align-items-center h-100 mb-0">
                      <small className="text-secondary" style={{ fontSize: "9.8px" }}>Route: Piteas API</small>
                    </div>
                  </div>

                </div>
              )}

              {isModalOpen && (
                <TokenSearchModal
                  tokens={TOKENS}
                  excludeToken={modalType === "in" ? tokenOut : tokenIn}
                  onSelect={selectToken}
                  onClose={closeModal}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SwapComponent;
