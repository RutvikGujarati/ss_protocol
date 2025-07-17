import { formatUnits, parseUnits } from "ethers";
import { useState, useEffect, useContext } from "react";
import TokenSearchModal from "./TokenSearchModal";
import { ethers } from "ethers";
import React from "react";
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

const SwapComponent = () => {
  const { signer } = useContext(ContractContext);
  const TOKENS = useAllTokens();
  const { address } = useAccount();

  const [tokenIn, setTokenIn] = useState("PLS");
  const [tokenOut, setTokenOut] = useState("STATE");
  const [isLoading, setIsLoading] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [amountIn, setAmountIn] = useState("");
  const [amountOut, setAmountOut] = useState("");
  const [slippage, setSlippage] = useState(0.5);
  const [isAutoSlippage, setIsAutoSlippage] = useState(true);
  const [error, setError] = useState("");
  const [quoteData, setQuoteData] = useState(null);
  const [estimatedGas, setEstimatedGas] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [routeDetails, setRouteDetails] = useState(null);
  const [showRoutePopup, setShowRoutePopup] = useState(false);
  const [needsApproval, setNeedsApproval] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [tokenBalance, setTokenBalance] = useState("");
  const [copiedTokenIn, setCopiedTokenIn] = useState(false);
  const [copiedTokenOut, setCopiedTokenOut] = useState(false);
  const [tokenPrices, setTokenPrices] = useState({});
  const [inputUsdValue, setInputUsdValue] = useState("");
  const [outputUsdValue, setOutputUsdValue] = useState("");
  const [currentStep, setCurrentStep] = useState(""); // "approving", "swapping", ""

  const handleSwitchTokens = () => {
    setTokenIn(tokenOut);
    setTokenOut(tokenIn);
    setAmountOut("");
  };

  const ERC20_ABI = [
    "function allowance(address owner, address spender) view returns (uint256)",
    "function approve(address spender, uint256 amount) returns (bool)"
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
      const allowance = await contract.allowance(address, "0x6BF228eb7F8ad948d37deD07E595EfddfaAF88A6");
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
    setCurrentStep("approving");
    try {
      const tokenAddress = TOKENS[tokenIn].address;
      const contract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
      const amount = parseUnits(amountIn, TOKENS[tokenIn].decimals);
      const tx = await contract.approve("0x6BF228eb7F8ad948d37deD07E595EfddfaAF88A6", amount);
      await tx.wait();
      setNeedsApproval(false);
      setError("");

      // Automatically trigger swap after approval
      setCurrentStep("swapping");
      await handleSwap();
    } catch (err) {
      setError("Approval failed. Try again.");
      console.error("Approval error", err);
      setCurrentStep("");
    } finally {
      setIsApproving(false);
    }
  };

  const getTokenLogo = (symbol) => {
    if (SPECIAL_TOKEN_LOGOS[symbol]) {
      return <img src={SPECIAL_TOKEN_LOGOS[symbol]} alt={symbol} width="32" />;
    }
    if (TOKENS[symbol]?.image && (TOKENS[symbol].image.startsWith('http') || TOKENS[symbol].image.startsWith('/'))) {
      return <img src={TOKENS[symbol].image} alt={symbol} width="32" />;
    }
    if (TOKENS[symbol]?.emoji) {
      return <span style={{ fontSize: "1.1em" }}>{TOKENS[symbol].emoji}</span>;
    }
    return <img src="/default.png" alt={symbol} width="32" />;
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

  function getApiTokenAddress(symbol) {
    if (symbol === "PLS") return "PLS";
    return TOKENS[symbol]?.address;
  }

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
      const tokenInAddress = getApiTokenAddress(tokenIn);
      const tokenOutAddress = getApiTokenAddress(tokenOut);
      const url = `https://sdk.piteas.io/quote?tokenInAddress=${tokenInAddress}&tokenOutAddress=${tokenOutAddress}&amount=${amount}&allowedSlippage=${slippage}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Quote fetch failed.");
      const data = await response.json();
      setAmountOut(formatUnits(data.destAmount, TOKENS[tokenOut].decimals));
      setEstimatedGas(data.gasUseEstimateUSD.toFixed(4));
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

  // Fetch token balance
  useEffect(() => {
    const fetchBalance = async () => {
      if (!signer || !address || !tokenIn || !TOKENS[tokenIn]) {
        setTokenBalance("");
        return;
      }
      try {
        if (tokenIn === "PLS") {
          // Native balance
          const bal = await signer.provider.getBalance(address);
          setTokenBalance(formatUnits(bal, 18));
        } else {
          // ERC20 balance
          const tokenAddress = TOKENS[tokenIn].address;
          const contract = new ethers.Contract(tokenAddress, ["function balanceOf(address) view returns (uint256)"], signer);
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

  const handleSwap = async () => {
    if (!signer || !quoteData) {
      setError("Wallet not connected or quote data missing.");
      return;
    }

    setIsSwapping(true);
    setCurrentStep("swapping");
    try {
      const tx = await signer.sendTransaction({
        to: "0x6BF228eb7F8ad948d37deD07E595EfddfaAF88A6",
        value: quoteData.value,
        data: quoteData.calldata,
      });
      console.log("Transaction sent:", tx.hash);

      // Wait for transaction confirmation
      await tx.wait();
      console.log("Transaction confirmed:", tx.hash);

      setError("");
      setShowConfirmation(true);
      setCurrentStep("");
    } catch (err) {
      console.error("Swap failed", err);
      setError("Swap failed. Try again.");
      setCurrentStep("");
    } finally {
      setIsSwapping(false);
    }
  };

  const handleSlippageToggle = (isAuto) => {
    setIsAutoSlippage(isAuto);
    if (isAuto) {
      setSlippage(0.5);
    }
  };

  // Copy to clipboard handler
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
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: token.address,
            symbol: symbol,
            decimals: token.decimals,
            image: token.image || window.location.origin + '/default.png',
          },
        },
      });
    } catch (err) {
      // Optionally handle error or show feedback
      console.log("Error adding to MetaMask", err);
    }
  };

  // Fetch token prices from CoinGecko
  const fetchTokenPrices = async () => {
    try {
      const prices = {};

      // Fetch price for tokenIn (if not PLS)
      if (tokenIn !== "PLS" && TOKENS[tokenIn]?.address) {
        try {
          const response = await fetch(
            `https://api.geckoterminal.com/api/v2/networks/pulsechain/tokens/${TOKENS[tokenIn].address}`
          );
          if (response.ok) {
            const data = await response.json();
            prices[TOKENS[tokenIn].address.toLowerCase()] = data.data?.attributes?.price_usd || 0;
            console.log(`Price for ${tokenIn}:`, data.data?.attributes?.price_usd);
          }
        } catch (err) {
          console.error(`Error fetching price for ${tokenIn}:`, err);
        }
      }

      // Fetch price for tokenOut (if not PLS and different from tokenIn)
      if (tokenOut !== "PLS" && TOKENS[tokenOut]?.address && tokenOut !== tokenIn) {
        try {
          const response = await fetch(
            `https://api.geckoterminal.com/api/v2/networks/pulsechain/tokens/${TOKENS[tokenOut].address}`
          );
          if (response.ok) {
            const data = await response.json();
            prices[TOKENS[tokenOut].address.toLowerCase()] = data.data?.attributes?.price_usd || 0;
            console.log(`Price for ${tokenOut}:`, data.data?.attributes?.price_usd);
          }
        } catch (err) {
          console.error(`Error fetching price for ${tokenOut}:`, err);
        }
      }

      // Add PLS price if either token is PLS
      if (tokenIn === "PLS" || tokenOut === "PLS") {
        try {
          const plsResponse = await fetch(
            'https://api.coingecko.com/api/v3/simple/price?ids=pulsechain&vs_currencies=usd'
          );
          const plsData = await plsResponse.json();
          if (plsData.pulsechain) {
            prices['pls'] = plsData.pulsechain.usd;
            console.log("PLS price:", plsData.pulsechain.usd);
          }
        } catch (err) {
          console.error("Error fetching PLS price:", err);
        }
      }

      // Add fallback prices for tokens not on API
      const fallbackPrices = {
        // Example: '0x4208A56180C81De2da1765eE5b866C9Dec3b346E': 0.001, // STATE token
      };

      // Merge fallback prices
      Object.keys(fallbackPrices).forEach(address => {
        if (!prices[address.toLowerCase()]) {
          prices[address.toLowerCase()] = fallbackPrices[address];
        }
      });

      console.log("Final prices object:", prices);
      setTokenPrices(prices);
    } catch (err) {
      console.error("Error fetching token prices:", err);
    }
  };

  // Calculate USD values
  const calculateUsdValues = () => {
    if (!amountIn || isNaN(amountIn)) {
      setInputUsdValue("");
      setOutputUsdValue("");
      return;
    }

    // Calculate input USD value
    let inputPrice = 0;
    if (tokenIn === "PLS") {
      inputPrice = tokenPrices['pls'] || 0;
    } else if (TOKENS[tokenIn]?.address) {
      inputPrice = tokenPrices[TOKENS[tokenIn].address.toLowerCase()] || 0;
    }

    const inputUsd = parseFloat(amountIn) * inputPrice;
    setInputUsdValue(inputUsd > 0 ? `$${inputUsd.toFixed(8)}` : "");

    // Calculate output USD value
    if (amountOut && !isNaN(amountOut)) {
      let outputPrice = 0;
      if (tokenOut === "PLS") {
        outputPrice = tokenPrices['pls'] || 0;
      } else if (TOKENS[tokenOut]?.address) {
        outputPrice = tokenPrices[TOKENS[tokenOut].address.toLowerCase()] || 0;
      }

      const outputUsd = parseFloat(amountOut) * outputPrice;
      setOutputUsdValue(outputUsd > 0 ? `$${outputUsd.toFixed(8)}` : "");
    } else {
      setOutputUsdValue("");
    }
  };

  // Calculate price difference
  const getPriceDifference = () => {
    if (!inputUsdValue || !outputUsdValue) return null;

    const inputUsd = parseFloat(inputUsdValue.replace('$', ''));
    const outputUsd = parseFloat(outputUsdValue.replace('$', ''));

    if (isNaN(inputUsd) || isNaN(outputUsd)) return null;

    const difference = outputUsd - inputUsd;
    const percentage = inputUsd > 0 ? (difference / inputUsd) * 100 : 0;

    return {
      value: difference,
      percentage: percentage,
      isPositive: difference > 0
    };
  };

  // Fetch prices on mount and when TOKENS change
  useEffect(() => {
    fetchTokenPrices();
  }, [tokenIn, tokenOut]);

  // Calculate USD values when amounts or prices change
  useEffect(() => {
    calculateUsdValues();
  }, [amountIn, amountOut, tokenPrices, tokenIn, tokenOut]);

  return (
    <div
      className="d-flex justify-content-center mb-4"
      style={{
        background: "linear-gradient(180deg, #0d1117 0%, #161b22 100%)",
        fontFamily: "Inter, sans-serif",
        minHeight: "100vh",
        padding: "20px 0",
        alignItems: "flex-start",
        paddingTop: "60px",
      }}
    >
      <div
        className="shadow"
        style={{
          width: "100%",
          maxWidth: "500px",
          borderRadius: "20px",
          background: "#1e1e1e",
          color: "#fff",
          boxShadow: "0 0 15px rgba(0,0,0,0.2)",
          padding: "24px",
          margin: "0 16px",
        }}
      >
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="fw-bold">Swap Tokens</h3>
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
        <div className="input-group mb-3 bg-dark rounded-pill shadow-sm p-2 align-items-center">
          <input
            type="number"
            className="form-control border-0 bg-transparent text-light fs-5"
            value={amountIn}
            onChange={(e) => setAmountIn(e.target.value)}
            placeholder="0.0"
            style={{ boxShadow: "none" }}
            disabled={isApproving || isSwapping}
          />
          <div className="d-flex align-items-center gap-1">
            <button
              className="btn btn-dark d-flex align-items-center gap-2 rounded-pill px-3"
              onClick={() => openModal("in")}
              disabled={isApproving || isSwapping}
            >
              {getTokenLogo(tokenIn)}
              {TOKENS[tokenIn]?.symbol || tokenIn}
            </button>
            {/* Copy icon for input token (not PLS) */}
            {tokenIn !== "PLS" && TOKENS[tokenIn]?.address && (
              <>
                <span
                  role="button"
                  title={copiedTokenIn ? "Copied!" : "Copy address"}
                  onClick={() => handleCopy(TOKENS[tokenIn].address, "in")}
                  style={{ cursor: "pointer", marginLeft: 4, color: copiedTokenIn ? "#4caf50" : "#ffffff", fontSize: 18 }}
                >
                  {copiedTokenIn ? "✔️" : <img src={copyIcon} alt="Copy" width="18" />}
                </span>
                <span
                  role="button"
                  title="Add to MetaMask"
                  onClick={() => handleAddToMetaMask(TOKENS[tokenIn], "in")}
                  style={{ cursor: "pointer", marginLeft: 6, color: "#f6851b", fontSize: 18 }}
                >
                  <img src={metamaskIcon} alt="MetaMask" width="18" style={{ verticalAlign: 'middle' }} />
                </span>
              </>
            )}
          </div>
        </div>
        {/* Token balance and USD value display */}
        <div className="d-flex justify-content-between align-items-center mb-2">
          <small className="text-secondary">
            {inputUsdValue && <span>{inputUsdValue}</span>}
          </small>
          <small className="text-secondary">
            Balance: {tokenBalance !== "" ? `${parseFloat(tokenBalance).toFixed(6)} ${TOKENS[tokenIn]?.symbol || tokenIn}` : "-"}
          </small>
        </div>

        <div className="text-center mb-3">
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
        <div className="input-group mb-3 bg-dark rounded-pill shadow-sm p-2 align-items-center">
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
          <div className="d-flex align-items-center gap-1">
            <button
              className="btn btn-dark d-flex align-items-center gap-2 rounded-pill px-3"
              onClick={() => openModal("out")}
              disabled={isApproving || isSwapping}
            >
              {getTokenLogo(tokenOut)}
              {TOKENS[tokenOut]?.symbol || tokenOut}
            </button>
            {/* Copy icon for output token (not PLS) */}
            {tokenOut !== "PLS" && TOKENS[tokenOut]?.address && (
              <>
                <span
                  role="button"
                  title={copiedTokenOut ? "Copied!" : "Copy address"}
                  onClick={() => handleCopy(TOKENS[tokenOut].address, "out")}
                  style={{ cursor: "pointer", marginLeft: 4, color: copiedTokenOut ? "#4caf50" : "#ffffff", fontSize: 18 }}
                >
                  {copiedTokenOut ? "✔️" : <img src={copyIcon} alt="Copy" width="18" />}
                </span>
                <span
                  role="button"
                  title="Add to MetaMask"
                  onClick={() => handleAddToMetaMask(TOKENS[tokenOut], "out")}
                  style={{ cursor: "pointer", marginLeft: 6, color: "#f6851b", fontSize: 18 }}
                >
                  <img src={metamaskIcon} alt="MetaMask" width="18" style={{ verticalAlign: 'middle' }} />
                </span>
              </>
            )}
          </div>
        </div>
        {/* Output USD value display */}
        {outputUsdValue && (
          <div className="d-flex justify-content-start align-items-center gap-2 mb-2">
            <small className="text-secondary">
              {outputUsdValue}
            </small>
            {getPriceDifference() && (
              <span
                className="badge"
                style={{
                  backgroundColor: getPriceDifference().isPositive ? '#28a745' : '#dc3545',
                  color: 'white',
                  fontSize: '0.7rem',
                  padding: '2px 6px'
                }}
              >
                {getPriceDifference().isPositive ? '+' : ''}{getPriceDifference().value.toFixed(8)} ({getPriceDifference().isPositive ? '+' : ''}{getPriceDifference().percentage.toFixed(2)}%)
              </span>
            )}
          </div>
        )}

        {error && <div className="alert alert-danger py-2">{error}</div>}



        <div className="d-flex justify-content-between align-items-center mb-2">
          <small className="text-secondary">
            Network Fee: {estimatedGas}
          </small>
        </div>
        {/* Progress indicator */}
        {currentStep && (
          <div className="d-flex justify-content-center align-items-center mb-3">
            <div className="d-flex align-items-center gap-3">
              {/* Step 1: Approving */}
              <div className="d-flex flex-column align-items-center">
                <div
                  className={`rounded-circle d-flex align-items-center justify-content-center ${currentStep === "approving" ? "bg-primary text-white" :
                    currentStep === "swapping" ? "bg-success text-white" : "bg-secondary text-white"
                    }`}
                  style={{ width: "32px", height: "32px", fontSize: "14px" }}
                >
                  {currentStep === "swapping" ? "✓" : "1"}
                </div>
                <small className={`mt-1 ${currentStep === "approving" ? "text-primary" : currentStep === "swapping" ? "text-success" : "text-secondary"}`}>
                  Approving
                </small>
              </div>

              {/* Connecting line */}
              <div
                className={`border-top ${currentStep === "swapping" ? "border-success" : "border-secondary"}`}
                style={{ width: "40px", height: "2px" }}
              ></div>

              {/* Step 2: Swapping */}
              <div className="d-flex flex-column align-items-center">
                <div
                  className={`rounded-circle d-flex align-items-center justify-content-center ${currentStep === "swapping" ? "bg-primary text-white" :
                    currentStep === "approving" ? "bg-secondary text-white" : "bg-success text-white"
                    }`}
                  style={{ width: "32px", height: "32px", fontSize: "14px" }}
                >
                  {currentStep === "swapping" ? "2" : currentStep === "approving" ? "2" : "✓"}
                </div>
                <small className={`mt-1 ${currentStep === "swapping" ? "text-primary" : currentStep === "approving" ? "text-secondary" : "text-success"}`}>
                  Swapping
                </small>
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

        <div className="d-grid">
          {needsApproval ? (
            <button
              className="btn btn-warning rounded-pill py-2"
              onClick={handleApprove}
              disabled={isApproving || isSwapping}
            >
              {isApproving ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
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
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
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
            style={{ backgroundColor: "rgba(0,0,0,0.7)", zIndex: 3000, width: "100px" }}
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