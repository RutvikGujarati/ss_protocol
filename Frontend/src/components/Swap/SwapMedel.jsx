import { formatUnits, parseUnits } from "ethers";
import { useState, useEffect, useContext } from "react";
import TokenSearchModal from "./TokenSearchModal";
import React from "react";
import setting from "/setting.png";
import { ContractContext } from "../../Functions/ContractInitialize";
import { useAllTokens } from "./Tokens";

const SwapComponent = () => {
  const { signer } = useContext(ContractContext);
  const TOKENS = useAllTokens();
  const [tokenIn, setTokenIn] = useState("PLS");
  const [tokenOut, setTokenOut] = useState("pSTATE");
  const [isLoading, setIsLoading] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [amountIn, setAmountIn] = useState("");
  const [amountOut, setAmountOut] = useState("");
  const [slippage, setSlippage] = useState(0.5); // Default to 0.5% for Auto
  const [isAutoSlippage, setIsAutoSlippage] = useState(true); // New state for Auto/Custom toggle
  const [error, setError] = useState("");
  const [quoteData, setQuoteData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [routeDetails, setRouteDetails] = useState(null);
  const [showRoutePopup, setShowRoutePopup] = useState(false);

  const handleSwitchTokens = () => {
    setTokenIn(tokenOut);
    setTokenOut(tokenIn);
    setAmountOut("");
  };
  const isImageUrl = (str) => {
    return typeof str === "string" && str.includes("mypinata.cloud/ipfs/");
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

  const fetchQuote = async () => {
    if (!amountIn || isNaN(amountIn)) {
      setAmountOut("");
      setQuoteData(null);
      setRouteDetails([]);
      return;
    }

    try {
      setIsLoading(true);
      const amount = parseUnits(amountIn, TOKENS[tokenIn].decimals).toString();
      const tokenInAddress = TOKENS[tokenIn].address;
      const tokenOutAddress = TOKENS[tokenOut].address;

      const url = `https://sdk.piteas.io/quote?tokenInAddress=${tokenInAddress}&tokenOutAddress=${tokenOutAddress}&amount=${amount}&allowedSlippage=${slippage}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Quote fetch failed.");

      const data = await response.json();
      console.log("response", data);
      setAmountOut(formatUnits(data.destAmount, TOKENS[tokenOut].decimals));
      setQuoteData(data.methodParameters);
      setRouteDetails(data.route || { swaps: [] });
      setError("");
    } catch (err) {
      console.error(err);
      setError("Could not fetch quote. Try again.");
      setAmountOut("");
      setRouteDetails([]);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchQuote();
  }, [amountIn, tokenIn, tokenOut]);

  const handleSwap = async () => {
    if (!signer || !quoteData) {
      setError("Wallet not connected or quote data missing.");
      return;
    }

    setIsSwapping(true);
    try {
      const tx = await signer.sendTransaction({
        to: "0x6BF228eb7F8ad948d37deD07E595EfddfaAF88A6",
        data: quoteData.calldata,
        value: BigInt(quoteData.value),
      });

      console.log("Transaction sent:", tx.hash);
      setError("");
      setShowConfirmation(true);
    } catch (err) {
      console.error("Swap failed", err);
      setError("Swap failed. Try again.");
    } finally {
      setIsSwapping(false);
    }
  };

  const handleSlippageToggle = (isAuto) => {
    setIsAutoSlippage(isAuto);
    if (isAuto) {
      setSlippage(0.5); // Set to 0.5% when switching to Auto
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center mb-5"
      style={{
        background: "linear-gradient(180deg, #0d1117 0%, #161b22 100%)",
        fontFamily: "Inter, sans-serif",
        minHeight: "100vh",
      }}
    >
      <div
        className="p-4 mb-5 shadow"
        style={{
          width: "100%",
          maxWidth: "420px",
          borderRadius: "20px",
          background: "#1e1e1e",
          color: "#fff",
          boxShadow: "0 0 15px rgba(0,0,0,0.2)",
        }}
      >
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="fw-bold">Swap Tokens</h3>
          <button
            className="btn btn-link text-light"
            onClick={() => setShowSettings(!showSettings)}
          >
            <img src={setting} width="24" height="24" alt="Settings" />{" "}
          </button>
        </div>

        {showSettings && (
          <div
            className="position-absolute"
            style={{
              top: "250px",
              left: "500px",
              background: "#1e1e1e",
              borderRadius: "10px",
              padding: "10px",
              boxShadow: "0 0 10px rgba(0,0,0,0.5)",
              zIndex: 1000,
            }}
          >
            <label className="text-light small mb-1">Max slippage</label>
            <div className="input-group mb-2">
              <input
                type="text"
                className="form-control border-0 bg-transparent text-light fs-5"
                value={isAutoSlippage ? `${slippage}% (Auto)` : `${slippage}%`}
                readOnly
              />
            </div>
            <div className="d-flex justify-content-between align-items-center">
              <button
                className={`btn btn-sm ${isAutoSlippage ? "btn-primary" : "btn-outline-primary"
                  } rounded-pill px-3`}
                onClick={() => handleSlippageToggle(true)}
              >
                Auto
              </button>
              <button
                className={`btn btn-sm ${!isAutoSlippage ? "btn-primary" : "btn-outline-primary"
                  } rounded-pill px-3`}
                onClick={() => handleSlippageToggle(false)}
              >
                Custom
              </button>
              {!isAutoSlippage && (
                <input
                  type="number"
                  className="form-control bg-dark border-0 text-light rounded-pill shadow-sm w-25"
                  value={slippage}
                  onChange={(e) => setSlippage(e.target.value)}
                  step="0.1"
                  min="0"
                />
              )}
            </div>
          </div>
        )}
        {/* From */}
        <label className="text-light small mb-1">From</label>
        <div className="input-group mb-3 bg-dark rounded-pill shadow-sm p-2">
          <input
            type="number"
            className="form-control border-0 bg-transparent text-light fs-5"
            value={amountIn}
            onChange={(e) => setAmountIn(e.target.value)}
            placeholder="0.0"
            style={{ boxShadow: "none" }}
          />
          <button
            className="btn btn-dark d-flex align-items-center gap-2 rounded-pill px-3"
            onClick={() => openModal("in")}
          >
            {isImageUrl(TOKENS[tokenIn].image) ? (
              <img
                src={TOKENS[tokenIn].image}
                alt="token visual"
                style={{ width: "30px", height: "30px" }}
              />
            ) : (
              <span style={{ fontSize: "20px" }}>{TOKENS[tokenIn].image}</span>
            )}
            {TOKENS[tokenIn].symbol}
          </button>
        </div>

        {/* Switch */}
        <div className="text-center mb-3">
          <button
            className="btn btn-outline-primary btn-sm rounded-circle"
            onClick={handleSwitchTokens}
            style={{ width: "40px", height: "40px" }}
          >
            ⇅
          </button>
        </div>

        {/* To */}
        <label className="text-light small mb-1">To</label>
        <div className="input-group mb-3 bg-dark rounded-pill shadow-sm p-2">
          <input
            type="text"
            className="form-control border-0 bg-transparent text-light fs-5"
            value={
              isLoading
                ? "Fetching..."
                : amountOut
                  ? amountOut
                  : "Waiting for input..."
            }
            readOnly
          />
          <button
            className="btn btn-dark d-flex align-items-center gap-2 rounded-pill px-3"
            onClick={() => openModal("out")}
          >
            {isImageUrl(TOKENS[tokenOut].image) ? (
              <img
                src={TOKENS[tokenOut].image}
                alt="token visual"
                style={{ width: "30px", height: "30px" }}
              />
            ) : (
              <span style={{ fontSize: "20px" }}>{TOKENS[tokenOut].image}</span>
            )}

            {TOKENS[tokenOut].symbol}
          </button>
        </div>

        {/* Error */}
        {error && <div className="alert alert-danger py-2">{error}</div>}
        {routeDetails && (
          <div
            className="text-center mt-3"
            style={{ position: "relative" }} // <-- Add this line
            onMouseEnter={() => setShowRoutePopup(true)}
            onMouseLeave={() => setShowRoutePopup(false)}
          >
            <button className="btn btn-link text-danger fw-bold">
              Show Route 📍
            </button>

            {showRoutePopup && (
              <div
                className="bg-dark text-light rounded-4 shadow-lg p-4"
                style={{
                  position: "absolute",
                  left: "50%",
                  bottom: "110%",
                  transform: "translateX(-50%)",
                  zIndex: 3000,
                  minWidth: "320px",
                  maxWidth: "95vw",
                  width: "800px",
                  boxSizing: "border-box",
                }}
              >
                <h6 className="text-light mb-3">Route Details</h6>
                <div
                  style={{ borderTop: "1px solid #333", marginBottom: 16 }}
                ></div>
                <div className="d-flex flex-column gap-3">
                  {routeDetails?.paths?.length > 0 &&
                    routeDetails?.swaps?.length > 0 ? (
                    routeDetails.paths.map((path, i) => (
                      <div
                        key={i}
                        className="d-flex align-items-center gap-3 flex-wrap"
                      >
                        {/* Route percent and input token */}
                        <div
                          className="d-flex flex-column align-items-center"
                          style={{ minWidth: 70 }}
                        >
                          <img
                            src={
                              TOKENS[path[0]?.symbol]?.image ||
                              TOKENS[tokenIn].image
                            }
                            alt={path[0]?.symbol}
                            width="32"
                          />
                          <span className="badge bg-secondary mt-1">
                            {(routeDetails.swaps[i]?.percent / 1000).toFixed(2)}
                            %
                          </span>
                        </div>
                        {/* Multi-hop path */}
                        <div
                          className="d-flex flex-row gap-3 flex-wrap align-items-center"
                          style={{ flex: 1, minWidth: 0 }}
                        >
                          {/* Multi-hop path */}
                          <div
                            className="d-flex flex-row gap-3 flex-wrap align-items-center justify-content-center"
                            style={{ flex: 1, minWidth: 0 }}
                          >
                            {path.map((token, idx) => {
                              if (idx === path.length - 1) return null;
                              const nextToken = path[idx + 1];
                              const swap = routeDetails.swaps[i];
                              const sub = swap?.subswaps?.[idx];
                              const p = sub?.paths?.[0];
                              const platform = p?.exchange || p?.poolName || "";
                              const percent = p?.percent ? (p.percent / 1000).toFixed(2) : "100.00";
                              return (
                                <React.Fragment key={idx}>
                                  <div
                                    className="bg-secondary bg-opacity-10 border border-secondary rounded-3 px-1 py-1 d-flex flex-column align-items-center"
                                    style={{
                                      width: 120,
                                      minWidth: 90,
                                      maxWidth: 120,
                                      flex: "1 1 68px",
                                      boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                                      marginBottom: 4,
                                    }}
                                  >
                                    <div className="d-flex align-items-center mb-1" style={{ gap: 2, fontSize: "0.78rem" }}>
                                      <img
                                        src={TOKENS[token.symbol]?.image}
                                        alt={token.symbol}
                                        width="12"
                                        height="12"
                                        style={{ borderRadius: "50%" }}
                                      />
                                      <span className="fw-bold" style={{ fontSize: "0.78em" }}>{token.symbol}</span>
                                      <span style={{ fontSize: "0.95rem", color: "#aaa" }}>→</span>
                                      <img
                                        src={TOKENS[nextToken.symbol]?.image}
                                        alt={nextToken.symbol}
                                        width="12"
                                        height="12"
                                        style={{ borderRadius: "50%" }}
                                      />
                                      <span className="fw-bold" style={{ fontSize: "0.78em" }}>{nextToken.symbol}</span>
                                    </div>
                                    <div className="small text-secondary" style={{ fontSize: "0.68em", lineHeight: 1 }}>{platform}</div>
                                    <div className="small" style={{ fontSize: "0.68em", lineHeight: 1 }}>{percent}%</div>
                                  </div>
                                  {/* Dotted line/arrow between boxes, except after last box */}
                                  {idx < path.length - 2 && (
                                    <div
                                      style={{
                                        width: 10,
                                        height: 2,
                                        borderBottom: "2px dotted #555",
                                        margin: "0 2px",
                                      }}
                                    ></div>
                                  )}
                                </React.Fragment>
                              );
                            })}
                          </div>
                        </div>
                        {/* Output token */}
                        <div
                          className="d-flex flex-column align-items-center"
                          style={{ minWidth: 70 }}
                        >
                          <img
                            src={
                              TOKENS[path[path.length - 1]?.symbol]?.image ||
                              TOKENS[tokenOut].image
                            }
                            alt={path[path.length - 1]?.symbol}
                            width="32"
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-secondary">
                      No route details available.
                    </div>
                  )}
                </div>
                <div
                  style={{ borderTop: "1px solid #333", margin: "16px 0" }}
                ></div>
                <p className="text-light small mb-0">
                  This route optimizes your total output by considering split
                  routes, multi-hops, and the gas cost of each step.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Swap Button */}
        <div className="d-grid">
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
        </div>

        {/* Token Selector */}
        {isModalOpen && (
          <TokenSearchModal
            tokens={TOKENS}
            excludeToken={modalType === "in" ? tokenOut : tokenIn}
            onSelect={selectToken}
            onClose={closeModal}
          />
        )}

        {/* Confirmation Popup */}
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
  );
};

export default SwapComponent;
