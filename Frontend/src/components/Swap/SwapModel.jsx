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
import RouteDetailsPopup from "./RouteDetailsPopup";

import useSwapData from "./useSwapData";
import ActiveAuctionsModal from "./ActiveAuctionsModal";
import toast from "react-hot-toast";

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
  const [showRoutePopup, setShowRoutePopup] = useState(false);
  const [needsApproval, setNeedsApproval] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [showTxModal, setShowTxModal] = useState(false);
  const [txStatus, setTxStatus] = useState("");
  const [confirmedAmountIn, setConfirmedAmountIn] = useState("");
  const [confirmedAmountOut, setConfirmedAmountOut] = useState("");
  const [showActiveAuctionsModal, setShowActiveAuctionsModal] = useState(false);

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
    const token = TOKENS_BY_SYMBOL[symbol];
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
      token?.image &&
      (token.image.startsWith("http") ||
        token.image.startsWith("/"))
    ) {
      return (
        <img
          src={token.image}
          alt={symbol}
          width="32"
          className="rounded-circle"
        />
      );
    }
    if (token?.emoji) {
      return <span style={{ fontSize: "1.1em" }}>{token.emoji}</span>;
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

  return (
    <>
      {/* Inline transaction progress bar */}
      <div className="d-flex justify-content-center swap-container">
        <div
          className="d-flex flex-row flex-wrap justify-content-center w-100"
          style={{
            minHeight: "100vh",
            gap: 32,
            maxWidth: "100%",
            alignItems: "flex-start",
          }}
        >
          {/* Main swap card */}
          <div className="card-container">
            <div className="shadow-sm rounded-3 swap-card ">
              <label className="text-light small mb-1 font-weight-normal ">From</label>

              <div className="d-flex align-items-center gap-2">
                <input
                  type="number"
                  className="form-control"
                  value={amountIn}
                  onChange={(e) => setAmountIn(e.target.value)}
                  placeholder="0.0"
                  style={{
                    boxShadow: "none",
                    "--placeholder-color": "#6c757d",
                    backgroundColor: (isApproving || isSwapping) ? "#343a40" : undefined
                  }}
                  disabled={isApproving || isSwapping}
                />
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

              <div className="text-center ">
                <button
                  className="btn btn-outline-primary btn-sm rounded-circle"
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
                      {getPriceDifference().value.toFixed(4)} (
                      {getPriceDifference().isPositive ? "+" : ""}
                      {getPriceDifference().percentage.toFixed(2)}%)
                    </span>
                  )}
                </div>
              )}
              {/* Inline transaction progress bar below Network Fee */}
              {(isSwapping || isApproving || showTxModal) && (
                <div className="tx-progress-container mb-3">
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

              <RouteDetailsPopup
                routeDetails={routeDetails}
                showRoutePopup={showRoutePopup}
                setShowRoutePopup={setShowRoutePopup}
                getTokenLogo={getTokenLogo}
                TOKENS={TOKENS}
                state={state}
              />

              <div className="d-flex justify-content-between align-items-center gap-2 mt-3">
                <button
                  className="btn btn-sm rounded-circle btn-outline-secondary"
                  onClick={() => setShowActiveAuctionsModal(true)}
                  style={{ width: "32px", height: "32px", fontSize: "0.6rem", lineHeight: "1" }}
                  title="View Active Auctions"
                >
                  <i className="fas fa-gavel"></i>
                </button>
                <button
                  className="btn btn-sm rounded-circle btn-outline-secondary"
                  onClick={() => setShowRoutePopup(true)}
                  disabled={!routeDetails}
                  style={{ width: "32px", height: "32px", fontSize: "0.6rem", lineHeight: "1" }}
                  title="View Route Details"
                >
                  <i className="fas fa-route"></i>
                </button>
                <div className="d-flex gap-1">
                  {[0.1, 0.5, 1.0, 2].map((val) => (
                    <button
                      key={val}
                      className={`btn btn-sm rounded-circle p-1 ${slippage === val && !isCustomSlippage ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => handleSlippageSelection(val)}
                      style={{ width: "32px", height: "32px", fontSize: "0.6rem", lineHeight: "1" }}
                    >
                      {val}%
                    </button>
                  ))}
                </div>
                {needsApproval ? (
                  <button
                    className="btn btn-success rounded-pill py-2"
                    onClick={handleApprove}
                    disabled={isApproving || isSwapping}
                    style={{ flex: 1.5, padding: "10px 20px" }}
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
                    disabled={!quoteData || isSwapping}
                    style={{ flex: 1, padding: "10px 20px", fontWeight: 400, height: "40px" }}
                  >
                    {isSwapping ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                        ></span>
                        Swapping...
                      </>
                    ) : (
                      "SWAP"
                    )}
                  </button>
                )}
              </div>
              <div
                className="d-flex justify-content-center align-items-center py-3 pb-0"
                style={{ fontSize: "0.7rem" }}
              >
                <small className="text-secondary">
                  Network Fee: ${estimatedGas}
                </small>
              </div>
              {isModalOpen && (
                <TokenSearchModal
                  tokens={TOKENS}
                  excludeToken={modalType === "in" ? tokenOut : tokenIn}
                  onSelect={selectToken}
                  onClose={closeModal}
                />
              )}

              {/* Active Auctions Modal */}
              <ActiveAuctionsModal
                isOpen={showActiveAuctionsModal}
                onClose={() => setShowActiveAuctionsModal(false)}
                getTokenLogo={getTokenLogo}
                TOKENS={TOKENS}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SwapComponent;
