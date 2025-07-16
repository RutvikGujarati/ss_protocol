import { formatUnits, parseUnits } from "ethers";
import { useState, useContext, useMemo } from "react";
import { useAccount } from "wagmi";
import { ContractContext } from "../Functions/ContractInitialize";

const SwapComponent = () => {
  const { address } = useAccount();
  const TOKENS = {
    PLS: { symbol: "PLS", address: "PLS", decimals: 18 },
    WPLS: {
      symbol: "WPLS",
      address: "0xA1077a294dDE1B09bB078844df40758a5D0f9a27",
      decimals: 18,
    },
    DAI: {
      symbol: "DAI",
      address: "0xefD766cCb38EaF1dfd701853BFCe31359239F305",
      decimals: 18,
    },
    // Add more tokens here in the future
  };
  const { signer } = useContext(ContractContext);
  const [tokenIn, setTokenIn] = useState("PLS");
  const [tokenOut, setTokenOut] = useState("WPLS");
  const [isLoading, setIsLoading] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [amountIn, setAmountIn] = useState("");
  const [amountOut, setAmountOut] = useState("");
  const [slippage, setSlippage] = useState(0.5);
  const [error, setError] = useState("");
  const [quoteData, setQuoteData] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null); // 'in' or 'out'

  const filteredTokens = useMemo(() => {
    const excludeToken = modalType === "in" ? tokenOut : tokenIn;
    return Object.keys(TOKENS).filter(
      (key) =>
        key !== excludeToken &&
        TOKENS[key].symbol.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, tokenIn, tokenOut, modalType]);

  const handleSwitchTokens = () => {
    setTokenIn(tokenOut);
    setTokenOut(tokenIn);
  };

  const openModal = (type) => {
    setModalType(type);
    setSearchTerm("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSearchTerm("");
    setModalType(null);
  };

  const selectToken = (key) => {
    if (modalType === "in") {
      setTokenIn(key);
    } else {
      setTokenOut(key);
    }
    closeModal();
  };

  const fetchQuote = async () => {
    try {
      if (!amountIn || isNaN(amountIn)) {
        setError("Invalid input amount.");
        return;
      }
      setIsLoading(true);

      const amount = parseUnits(
        amountIn.toString(),
        TOKENS[tokenIn].decimals
      ).toString();
      const tokenInAddress = TOKENS[tokenIn].address;
      const tokenOutAddress = TOKENS[tokenOut].address;

      const url = `https://sdk.piteas.io/quote?tokenInAddress=${tokenInAddress}&tokenOutAddress=${tokenOutAddress}&amount=${amount}&allowedSlippage=${slippage}`;
      const response = await fetch(url);

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      const amountOutFormatted = formatUnits(
        data.destAmount,
        TOKENS[tokenOut].decimals
      );
      setAmountOut(amountOutFormatted);
      setQuoteData(data.methodParameters);
      setError("");
    } catch (err) {
      console.error(err);
      setError(
        "Failed to fetch quote. Please check parameters or try again later."
      );
      setAmountOut("");
    } finally {
      setIsLoading(false);
    }
  };

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

      console.log("Swap transaction sent:", tx);
      setError("");
    } catch (err) {
      console.error("Swap failed", err);
      setError("Swap failed. Please try again.");
    } finally {
      setIsSwapping(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100">
      <div
        className="card p-4 shadow-lg border-0"
        style={{ width: "100%", maxWidth: "450px", borderRadius: "15px" }}
      >
        <h3 className="text-center mb-4 text-primary fw-bold">Swap Tokens</h3>

        {/* From Section */}
        <div className="d-flex justify-content-between mb-3">
          <small className="text-light">From</small>
        </div>
        <div className="input-group mb-3 bg-dark rounded-pill shadow-sm">
          <input
            type="number"
            className="form-control border-0 bg-transparent text-light fs-4"
            value={amountIn}
            onChange={(e) => setAmountIn(e.target.value)}
            placeholder="0.0"
            style={{ boxShadow: "none" }}
          />
          <button
            className="btn btn-dark text-light fw-bold rounded-pill"
            onClick={() => openModal("in")}
            style={{ minWidth: "120px" }}
          >
            {TOKENS[tokenIn].symbol}
          </button>
        </div>

        {/* Switch Button */}
        <div className="text-center mb-3">
          <button
            className="btn btn-outline-primary btn-sm rounded-circle"
            onClick={handleSwitchTokens}
            style={{ width: "40px", height: "40px", padding: "0" }}
            title="Switch tokens"
          >
            ⇅
          </button>
        </div>

        {/* To Section */}
        <div className="d-flex justify-content-between mb-3">
          <small className="text-light">To (Estimated)</small>
        </div>
        <div className="input-group mb-3 bg-dark rounded-pill shadow-sm">
          <input
            type="number"
            className="form-control border-0 text-light bg-transparent fs-4"
            value={amountOut}
            readOnly
            placeholder="0.0"
            style={{ boxShadow: "none" }}
          />
          <button
            className="btn btn-dark text-light fw-bold rounded-pill"
            onClick={() => openModal("out")}
            style={{ minWidth: "120px" }}
          >
            {TOKENS[tokenOut].symbol}
          </button>
        </div>

        {/* Slippage Input */}
        <div className="mb-4">
          <label className="form-label text-light small">
            Slippage Tolerance (%)
          </label>
          <input
            type="number"
            className="form-control bg-dark rounded-pill border-0 shadow-sm"
            value={slippage}
            onChange={(e) => setSlippage(e.target.value)}
            step="0.1"
            min="0"
          />
        </div>

        {/* Price Impact */}
        {quoteData && (
          <div className="mb-3 text-light small text-center">
            Price Impact: {(slippage * 100).toFixed(2)}%
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="alert alert-danger mb-3" role="alert">
            {error}
          </div>
        )}

        {/* Buttons */}
        <div className="d-grid gap-2">
          <button
            className="btn btn-outline-primary rounded-pill py-2"
            onClick={fetchQuote}
            disabled={isLoading || !amountIn}
          >
            {isLoading ? (
              <span
                className="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden="true"
              ></span>
            ) : null}
            {isLoading ? "Fetching..." : "Get Quote"}
          </button>
          <button
            className="btn btn-primary rounded-pill py-2"
            onClick={handleSwap}
            disabled={!quoteData || isLoading || isSwapping}
          >
            {isSwapping ? (
              <span
                className="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden="true"
              ></span>
            ) : null}
            {isSwapping ? "Swapping..." : "Swap Now"}
          </button>
        </div>

        {/* Wallet Address */}
        {address && (
          <small className="text-light text-center d-block mt-3">
            Connected: {address.slice(0, 6)}...{address.slice(-4)}
          </small>
        )}

        {/* Token Selection Modal */}
        {isModalOpen && (
  <div
    className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
    style={{ backgroundColor: "rgba(0, 0, 0, 0.5)", zIndex: 2000 }}
  >
    <div
      className="bg-dark text-light rounded-4 shadow-lg p-4 border border-secondary"
      style={{ width: "100%", maxWidth: "360px" }}
    >
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="m-0">Select Token</h5>
        <button
          className="btn btn-close btn-close-white"
          onClick={closeModal}
        ></button>
      </div>

      {/* Search */}
      <input
        type="text"
        className="form-control mb-3 bg-dark text-light border border-secondary rounded-pill px-3"
        placeholder="Search tokens..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* Token List */}
      <div
        style={{
          maxHeight: "250px",
          overflowY: "auto",
        }}
      >
        {filteredTokens.length > 0 ? (
          filteredTokens.map((key) => (
            <div
              key={key}
              className="p-2 px-3 rounded-3 mb-1 d-flex align-items-center justify-content-between text-light token-item"
              style={{
                backgroundColor: "#212529",
                cursor: "pointer",
                transition: "background-color 0.2s",
              }}
              onClick={() => selectToken(key)}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#2c2f33")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "#212529")
              }
            >
              <span>{TOKENS[key].symbol}</span>
              <small className="text-muted">{TOKENS[key].address.slice(0, 6)}...{TOKENS[key].address.slice(-4)}</small>
            </div>
          ))
        ) : (
          <div className="p-2 text-muted text-center">No tokens found</div>
        )}
      </div>
    </div>
  </div>
)}

      </div>
    </div>
  );
};

export default SwapComponent;