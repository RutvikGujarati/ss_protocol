import { parseUnits, formatUnits } from "ethers";
import { useState, useEffect, useContext } from "react";
import TokenSearchModal from "./TokenSearchModal";
import { ethers } from "ethers";
import setting from "/setting.png";
import { ContractContext } from "../../Functions/ContractInitialize";
import { useAllTokens } from "./Tokens";
import state from "../../assets/statelogo.png";
import pulsechainLogo from "../../assets/pls1.png";
import { useAccount } from "wagmi";
import SettingsPopup from "./SettingsPopup";
import RouteDetailsPopup from "./RouteDetailsPopup";
import copyIcon from "/copy.png";
import metamaskIcon from "../../assets/metamask-icon.png";
import useSwapData from "./useSwapData";
import { useRef } from "react";
import AuctionInfo from "./AuctionInfo";
import TxProgressModal from "../TxProgressModal";

const SwapComponent = () => {
  const { signer } = useContext(ContractContext);
  const TOKENS = useAllTokens();
  const { address } = useAccount();


  const [tokenIn, setTokenIn] = useState("PLS");
  const [tokenOut, setTokenOut] = useState("STATE");
  const [amountIn, setAmountIn] = useState("");
  const [isSwapping, setIsSwapping] = useState(false);
  const [slippage, setSlippage] = useState(0.5);
  const [isAutoSlippage, setIsAutoSlippage] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showRoutePopup, setShowRoutePopup] = useState(false);
  const [needsApproval, setNeedsApproval] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [tokenBalance, setTokenBalance] = useState("");
  const [copiedTokenIn, setCopiedTokenIn] = useState(false);
  const [copiedTokenOut, setCopiedTokenOut] = useState(false);
  const swapCardRef = useRef(null);
  const [swapCardHeight, setSwapCardHeight] = useState(null);
  const [showTxModal, setShowTxModal] = useState(false);
  const [txStatus, setTxStatus] = useState("");

  const {
    amountOut,
    estimatedGas,
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
  };

  const checkAllowance = async () => {
    if (tokenIn === "PLS") {
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
      const amount = parseUnits(amountIn, TOKENS[tokenIn].decimals);
      const tx = await contract.approve(
        "0x6BF228eb7F8ad948d37deD07E595EfddfaAF88A6",
        amount
      );
      await tx.wait();
      setNeedsApproval(false);
      setError("");
      setTxStatus("pending");
      await handleSwap();
    } catch (err) {
      setError("Approval failed. Try again.");
      console.error("Approval error", err);
      setTxStatus("error");
      setTimeout(() => setShowTxModal(false), 1200);
    } finally {
      setIsApproving(false);
    }
  };

  const getTokenLogo = (symbol) => {
    if (SPECIAL_TOKEN_LOGOS[symbol]) {
      return <img src={SPECIAL_TOKEN_LOGOS[symbol]} alt={symbol} width="32" className="rounded-circle" />;
    }
    if (
      TOKENS[symbol]?.image &&
      (TOKENS[symbol].image.startsWith("http") ||
        TOKENS[symbol].image.startsWith("/"))
    ) {
      return <img src={TOKENS[symbol].image} alt={symbol} width="32" className="rounded-circle" />;
    }
    if (TOKENS[symbol]?.emoji) {
      return <span style={{ fontSize: "1.1em" }}>{TOKENS[symbol].emoji}</span>;
    }
    return <img src="/default.png" alt={symbol} width="32" className="rounded-circle" />;
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
      setError("Wallet not connected or quote data missing.");
      return;
    }

    setIsSwapping(true);
    setShowTxModal(true);
    setTxStatus("pending");
    try {
      const tx = await signer.sendTransaction({
        to: "0x6BF228eb7F8ad948d37deD07E595EfddfaAF88A6",
        value: quoteData.value,
        data: quoteData.calldata,
      });
      console.log("Transaction sent:", tx.hash);
      await tx.wait();
      console.log("Transaction confirmed:", tx.hash);
      setError("");
      setShowConfirmation(true);
      setAmountIn("");
      setTxStatus("confirmed");
      setTimeout(() => setShowTxModal(false), 1200);
    } catch (err) {
      console.error("Swap failed", err);
      setError("Swap failed. Try again.");
      setTxStatus("error");
      setTimeout(() => setShowTxModal(false), 1200);
    } finally {
      setIsSwapping(false);
      setAmountIn("");
    }
  };

  const handleSlippageToggle = (isAuto) => {
    setIsAutoSlippage(isAuto);
    if (isAuto) {
      setSlippage(0.5);
    }
  };

  const handleCopy = (address, type) => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    if (type === "in") {
      setCopiedTokenIn(true);
      setTimeout(() => setCopiedTokenIn(false), 1200);
    } else {
      setCopiedTokenOut(true);
      setTimeout(() => setCopiedTokenOut(false), 1200);
    }
  };

  const handleAddToMetaMask = async (token) => {
    if (!window.ethereum || !token?.address) return;
    try {
      let symbol = token.symbol;
      if (symbol === "STATE" && token.address) {
        symbol = "pSTATE";
      }
      await window.ethereum.request({
        method: "wallet_watchAsset",
        params: {
          type: "ERC20",
          options: {
            address: token.address,
            symbol: symbol,
            decimals: token.decimals,
            image: token.image || window.location.origin + "/default.png",
          },
        },
      });
    } catch (err) {
      console.log("Error adding to MetaMask", err);
    }
  };

  useEffect(() => {
    const fetchBalance = async () => {
      if (!signer || !address || !tokenIn || !TOKENS[tokenIn]) {
        setTokenBalance("");
        return;
      }
      try {
        if (tokenIn === "PLS") {
          const bal = await signer.provider.getBalance(address);
          setTokenBalance(formatUnits(bal, 18));
        } else {
          const tokenAddress = TOKENS[tokenIn].address;
          const contract = new ethers.Contract(
            tokenAddress,
            ["function balanceOf(address) view returns (uint256)"],
            signer
          );
          const bal = await contract.balanceOf(address);
          setTokenBalance(formatUnits(bal, TOKENS[tokenIn].decimals));
        }
      } catch (err) {
        console.error("Error fetching balance", err);
        setTokenBalance("");
      }
    };
    fetchBalance();
  }, [signer, address, tokenIn, TOKENS]);

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
    if (swapCardRef.current) {
      setSwapCardHeight(swapCardRef.current.offsetHeight);
    }
  }, [amountIn, amountOut, isLoading, showSettings, showConfirmation, needsApproval, isApproving, isSwapping, tokenIn, tokenOut, TOKENS]);

  return (
    <>
      <TxProgressModal isOpen={showTxModal} txStatus={txStatus} onClose={() => setShowTxModal(false)} />
      <div
        className="d-flex justify-content-center"
        style={{
          background: "linear-gradient(180deg, #0d1117 0%, #161b22 100%)",
          fontFamily: "Inter, sans-serif",
          minHeight: "100vh",
          padding: 0,
          margin: 0,
          boxSizing: "border-box",
          overflowY: "auto",
          transition: "all 0.3s"
        }}
      >
        <div className="d-flex flex-row flex-wrap justify-content-center w-100" style={{ minHeight: "80vh", gap: 32, maxWidth: "100%", alignItems: "flex-start" }}>
          {/* Left info section for auction swap line */}
          <AuctionInfo swapCardHeight={swapCardHeight} />
          {/* Main swap card */}
          <div className="card-container" ref={swapCardRef}>
            <div
              className="shadow-sm rounded-3 swap-card"
              style={{
                background: "#212529",
                color: "#fff",
                borderRadius: "20px",
                padding: "24px",
                margin: 0,
                transition: "margin 0.3s",
                border: "1px solid #ffffff26"
              }}
            >
              <div className="d-flex justify-content-between detailText ">
                <p
                  className="mb-1 detailText fs-5"
                  style={{ fontFamily: "Satoshi, sans-serif", textTransform: "uppercase" }}
                >
                  SWAP TOKENS
                </p>
                <button
                  className="btn btn-link text-light"
                  onClick={() => setShowSettings(!showSettings)}
                >
                  <img src={setting} width="24" height="24" alt="Settings" />
                </button>
              </div>

              <SettingsPopup
                show={showSettings}
                slippage={slippage}
                isAutoSlippage={isAutoSlippage}
                handleSlippageToggle={handleSlippageToggle}
                setSlippage={setSlippage}
                onClose={() => setShowSettings(false)}
              />

              <label className="text-light small mb-1">From</label>

              <div className="d-flex align-items-center gap-2">
                <input
                  type="number"
                  className="form-control text-light fw-bold swap-amount-input"
                  value={amountIn}
                  onChange={(e) => setAmountIn(e.target.value)}
                  placeholder="0.0"
                  style={{ boxShadow: "none", color: '#343a40' }}
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
                      <span style={{ fontWeight: 700 }}>{TOKENS[tokenIn]?.symbol || tokenIn}</span>
                    </span>
                    <span className="ms-2 d-flex align-items-center">
                      <i className="bi bi-chevron-down" style={{ fontSize: '1.1em' }}></i>
                    </span>
                  </button>
                  {tokenIn !== "PLS" && TOKENS[tokenIn]?.address && (
                    <>
                      <span
                        role="button"
                        title={copiedTokenIn ? "Copied!" : "Copy address"}
                        onClick={() => handleCopy(TOKENS[tokenIn].address, "in")}
                        style={{
                          cursor: "pointer",
                          marginLeft: 4,
                          color: copiedTokenIn ? "#4caf50" : "#ffffff",
                          fontSize: 18,
                        }}
                      >
                        {copiedTokenIn ? (
                          "✔️"
                        ) : (
                          <img src={copyIcon} alt="Copy" width="18" />
                        )}
                      </span>
                      <span
                        role="button"
                        title="Add to MetaMask"
                        onClick={() => handleAddToMetaMask(TOKENS[tokenIn])}
                        style={{
                          cursor: "pointer",
                          marginLeft: 6,
                          color: "#f6851b",
                          fontSize: 18,
                        }}
                      >
                        <img
                          src={metamaskIcon}
                          alt="MetaMask"
                          width="18"
                          style={{ verticalAlign: "middle" }}
                        />
                      </span>
                    </>
                  )}
                </div>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-2" style={{ fontSize: "0.9rem" }}>
                <small className="text-secondary">
                  {inputUsdValue && <span>{inputUsdValue}</span>}
                </small>
                <span className="text-secondary small fw-normal ms-1">
                  Bal: {tokenBalance ? `${parseFloat(tokenBalance).toFixed(2)}` : "-"}
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

              <label className="text-light small mb-1">To</label>

              <div className="d-flex align-items-center gap-2">
                <input
                  type="text"
                  className="form-control text-light fw-bold fs-6"
                  value={
                    isLoading
                      ? "Fetching..."
                      : amountOut
                        ? amountOut
                        : "Waiting for input..."
                  }
                  readOnly
                  style={{ fontSize: "1.15rem", background: '#343a40' }}
                />
                <div className="d-flex align-items-center gap-1">
                  <button
                    className="d-flex align-items-center justify-content-between gap-2 px-2 token-select-btn"
                    onClick={() => openModal("out")}
                    disabled={isApproving || isSwapping}
                  >
                    <span className="d-flex align-items-center gap-2">
                      {getTokenLogo(tokenOut)}
                      <span style={{ fontWeight: 700 }}>{TOKENS[tokenOut]?.symbol || tokenOut}</span>
                    </span>
                    <span className="ms-2 d-flex align-items-center">
                      <i className="bi bi-chevron-down" style={{ fontSize: '1.1em' }}></i>
                    </span>
                  </button>
                  {tokenOut !== "PLS" && TOKENS[tokenOut]?.address && (
                    <>
                      <span
                        role="button"
                        title={copiedTokenOut ? "Copied!" : "Copy address"}
                        onClick={() => handleCopy(TOKENS[tokenOut].address, "out")}
                        style={{
                          cursor: "pointer",
                          marginLeft: 4,
                          color: copiedTokenOut ? "#4caf50" : "#ffffff",
                          fontSize: 18,
                        }}
                      >
                        {copiedTokenOut ? (
                          "✔️"
                        ) : (
                          <img src={copyIcon} alt="Copy" width="18" />
                        )}
                      </span>
                      <span
                        role="button"
                        title="Add to MetaMask"
                        onClick={() => handleAddToMetaMask(TOKENS[tokenOut])}
                        style={{
                          cursor: "pointer",
                          marginLeft: 6,
                          color: "#f6851b",
                          fontSize: 18,
                        }}
                      >
                        <img
                          src={metamaskIcon}
                          alt="MetaMask"
                          width="18"
                          style={{ verticalAlign: "middle" }}
                        />
                      </span>
                    </>
                  )}
                </div>
              </div>
              {outputUsdValue && (
                <div className="d-flex justify-content-start align-items-center gap-2 mb-2" style={{ fontSize: "0.9rem" }}>
                  <small className="text-secondary">{outputUsdValue}</small>
                  {getPriceDifference() && (
                    <span
                      className="badge"
                      style={{
                        backgroundColor: getPriceDifference().isPositive
                          ? "#28a745"
                          : "#dc3545",
                        color: "white",
                        fontSize: "0.7rem",
                        padding: "2px 6px",
                      }}
                    >
                      {getPriceDifference().isPositive ? "+" : ""}
                      {getPriceDifference().value.toFixed(8)} (
                      {getPriceDifference().isPositive ? "+" : ""}
                      {getPriceDifference().percentage.toFixed(2)}%)
                    </span>
                  )}
                </div>
              )}

              {error && <div className="alert alert-danger py-2">{error}</div>}

              <div className="d-flex justify-content-between align-items-center mb-2 " style={{ fontSize: "0.9rem" }}>
                <small className="text-secondary">Network Fee: {estimatedGas}</small>
              </div>

              <RouteDetailsPopup
                routeDetails={routeDetails}
                showRoutePopup={showRoutePopup}
                setShowRoutePopup={setShowRoutePopup}
                getTokenLogo={getTokenLogo}
                TOKENS={TOKENS}
                state={state}
              />

              <div className="d-grid">
                {needsApproval ? (
                  <button
                    className="btn btn-warning rounded-pill py-2"
                    onClick={handleApprove}
                    disabled={isApproving || isSwapping}
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
                      "Swap Now"
                    )}
                  </button>
                )}
              </div>

              {isModalOpen && (
                <TokenSearchModal
                  tokens={TOKENS}
                  excludeToken={modalType === "in" ? tokenOut : tokenIn}
                  onSelect={selectToken}
                  onClose={closeModal}
                />
              )}

              {showConfirmation && (
                <div
                  className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
                  style={{ backgroundColor: "rgba(0,0,0,0.7)", zIndex: 3000 }}
                >
                  <div
                    className="bg-dark text-light rounded-4 p-4 shadow-lg text-center"
                    style={{ maxWidth: "350px", width: "90%" }}
                  >
                    <h5 className="mb-3 text-success">Swap Complete</h5>
                    <p className="mb-1">
                      <strong>{amountIn}</strong> {TOKENS[tokenIn].symbol} →{" "}
                      <strong>{amountOut}</strong> {TOKENS[tokenOut].symbol}
                    </p>
                    <button
                      className="btn btn-outline-light mt-3"
                      onClick={() => setShowConfirmation(false)}
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SwapComponent;
