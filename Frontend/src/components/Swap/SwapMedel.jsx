import { formatUnits, parseUnits } from "ethers";
import { useState, useEffect, useContext } from "react";
import TokenSearchModal from "./TokenSearchModal";
import { TOKENS } from "./Tokens";
import { ContractContext } from "../../Functions/ContractInitialize";

const SwapComponent = () => {
  const { signer } = useContext(ContractContext);
  const [tokenIn, setTokenIn] = useState("PLS");
  const [tokenOut, setTokenOut] = useState("pSTATE");
  const [isLoading, setIsLoading] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [amountIn, setAmountIn] = useState("");
  const [amountOut, setAmountOut] = useState("");
  const [slippage, setSlippage] = useState(0.5);
  const [error, setError] = useState("");
  const [quoteData, setQuoteData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleSwitchTokens = () => {
    setTokenIn(tokenOut);
    setTokenOut(tokenIn);
    setAmountOut("");
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
      setAmountOut(formatUnits(data.destAmount, TOKENS[tokenOut].decimals));
      setQuoteData(data.methodParameters);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Could not fetch quote. Try again.");
      setAmountOut("");
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
        <h3 className="text-center  fw-bold">Swap Tokens</h3>

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
            <img
              src={TOKENS[tokenIn].image}
              alt={TOKENS[tokenIn].symbol}
              width="24"
              height="24"
              className="rounded-circle"
            />
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
            <img
              src={TOKENS[tokenOut].image}
              alt={TOKENS[tokenOut].symbol}
              width="24"
              height="24"
              className="rounded-circle"
            />
            {TOKENS[tokenOut].symbol}
          </button>
        </div>

        {/* Slippage */}
        <div className="mb-3">
          <label className="form-label text-light small mb-1">
            Slippage Tolerance (%)
          </label>
          <input
            type="number"
            className="form-control bg-dark border-0 text-light rounded-pill shadow-sm"
            value={slippage}
            onChange={(e) => setSlippage(e.target.value)}
            step="0.1"
            min="0"
          />
        </div>

        {/* Error */}
        {error && <div className="alert alert-danger py-2">{error}</div>}

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
