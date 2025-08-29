import { parseUnits } from "ethers";
import { useState, useEffect, useContext } from "react";
import TokenSearchModal from "./TokenSearchModal";
import { ethers } from "ethers";
import { ContractContext } from "../../Functions/ContractInitialize";
import { useAllTokens } from "./Tokens";
import state from "../../assets/statelogo.png";
import pulsechainLogo from "../../assets/pls1.png";
import { useAccount, useChainId } from "wagmi";
import { PULSEX_ROUTER_ADDRESS, PULSEX_ROUTER_ABI } from '../../Constants/Constants';
import useSwapData from "./useSwapData";
import toast from "react-hot-toast";
import useTokenBalances from "./UserTokenBalances";
import { TokensDetails } from "../../data/TokensDetails";
import { useSwapContract } from "../../Functions/SwapContractFunctions";
import { calculatePlsValueNumeric, formatWithCommas } from "../DetailsInfo";

const SwapComponent = () => {
  const { signer } = useContext(ContractContext);
  const chainId = useChainId();
  const TOKENS = useAllTokens();
  const { address } = useAccount();
  const nativeNames = {
    1: "Wrapped Ether",
    137: "Wrapped Matic",
    42161: "Arbitrum",
    10: "Optimism",
    369: "PulseChain from pump.tires", // pump.tires case
    56: "BNB Chain",
  };

  const [tokenIn, setTokenIn] = useState("STATE");
  const [tokenOut, setTokenOut] = useState(null);
  const [amountIn, setAmountIn] = useState("");
  const [isSwapping, setIsSwapping] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [needsApproval, setNeedsApproval] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [txStatus, setTxStatus] = useState("");
  const [confirmedAmountIn, setConfirmedAmountIn] = useState("");
  const [confirmedAmountOut, setConfirmedAmountOut] = useState("");
  const [insufficientBalance, setInsufficientBalance] = useState(false);

  const {
    amountOut,
    estimatedGas,
    tokenInBalance,
    quoteData,
    inputUsdValue,
    outputUsdValue,
    isLoading,
  } = useSwapData({
    amountIn,
    tokenIn,
    tokenOut,
    TOKENS,
  });
  const { pstateToPlsRatio, DaipriceChange } = useSwapContract();
  const { tokens } = TokensDetails();
  const tokenBalances = useTokenBalances(TOKENS, signer);

  const calculateTotalSum = () => {
    return tokens.reduce((sum, token) => {
      return sum + calculatePlsValueNumeric(token, tokenBalances, pstateToPlsRatio);
    }, 0);
  };

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

  useEffect(() => {
    if (chainId && nativeNames[chainId]) {
      setTokenOut(nativeNames[chainId]); // Set to native token for the chain
    } else {
      setTokenOut("STATE"); // Fallback to "STATE" if chainId is not supported
    }
  }, [chainId]);
  const ERC20_ABI = [
    "function allowance(address owner, address spender) view returns (uint256)",
    "function approve(address spender, uint256 amount) returns (bool)",
  ];

  const SPECIAL_TOKEN_LOGOS = {
    STATE: state,
    pSTATE: state,
    "PulseChain from pump.tires": pulsechainLogo,
  };

  const checkAllowance = async () => {
    if (tokenIn === "PulseChain from pump.tires") {
      setNeedsApproval(false);
      return;
    }
    setTxStatus("initiated")
    try {
      const tokenAddress = TOKENS[tokenIn].address;
      const contract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
      let swapRouterAddress;
      if (chainId == 369) {
        swapRouterAddress = PULSEX_ROUTER_ADDRESS;
      } else {
        swapRouterAddress = quoteData.to;
      }
      const allowance = await contract.allowance(
        address,
        swapRouterAddress
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
    try {
      setTxStatus("Approving");
      const tokenAddress = TOKENS[tokenIn].address;
      const contract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
      // Approve unlimited amount (max uint256
      const maxUint256 = BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");
      let swapRouterAddress;
      if (chainId == 369) {
        swapRouterAddress = PULSEX_ROUTER_ADDRESS
      } else {
        swapRouterAddress = quoteData.to;
      }
      const tx = await contract.approve(
        swapRouterAddress,
        maxUint256
      );
      await tx.wait();
      setNeedsApproval(false);
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
    } finally {
      setIsApproving(false);
    }
  };
  const getTokenLogo = (symbol) => {
    if (!symbol || !TOKENS[symbol]) {
      return <span>Loading...</span>;
    }
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
    if (!signer) {
      toast.error("Wallet not connected.", { position: "top-center", autoClose: 5000 });
      return;
    }
    setIsSwapping(true);
    setTxStatus("initiated");

    try {
      // Approval step if needed
      if (needsApproval && tokenIn !== "PulseChain from pump.tires") {
        console.log("Approval needed, calling handleApprove");
        await handleApprove();
      }

      setTxStatus("pending");
      setConfirmedAmountIn(amountIn);
      setConfirmedAmountOut(amountOut);

      // Validate quoteData before proceeding
      if (!quoteData) {
        throw new Error("Invalid quoteData: missing required fields");
      }

      let tx;
      const deadline = Math.floor(Date.now() / 1000) + 60 * 20;

      if (chainId === 369) {
        // ✅ PulseChain logic (PulseX Router)
        const routerContract = new ethers.Contract(
          PULSEX_ROUTER_ADDRESS,
          PULSEX_ROUTER_ABI,
          signer
        );

        if (!quoteData.amountIn || !quoteData.amountOutRaw || !quoteData.path) {
          throw new Error("Invalid quoteData for PulseX swap");
        }

        if (quoteData.isNativeIn) {
          tx = await routerContract.swapExactETHForTokens(
            quoteData.amountOutRaw,
            quoteData.path,
            address,
            deadline,
            { value: quoteData.amountIn }
          );
        } else if (quoteData.isNativeOut) {
          tx = await routerContract.swapExactTokensForETH(
            quoteData.amountIn,
            quoteData.amountOutRaw,
            quoteData.path,
            address,
            deadline
          );
        } else {
          tx = await routerContract.swapExactTokensForTokens(
            quoteData.amountIn,
            quoteData.amountOutRaw,
            quoteData.path,
            address,
            deadline
          );
        }
      } else {
        // ✅ Other chains (Sushi API style)
        console.log("Using Sushi API for swap", quoteData.to);

        const txData = {
          to: quoteData.to,
          data: quoteData.data,
        };

        tx = await signer.sendTransaction(txData);
      }

      if (!tx) {
        throw new Error("Failed to create transaction");
      }

      console.log("Transaction sent:", tx.hash);
      await tx.wait();

      setTxStatus("confirmed");
      setAmountIn("");
      setShowConfirmation(true);

    } catch (err) {
      console.error("Swap failed:", err);
      toast.error(`Swap failed: ${err.reason || err.message || "Unknown error"}`, {
        position: "top-center",
        autoClose: 5000,
      });
      setTxStatus("error");
    } finally {
      setIsSwapping(false);
    }
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

  // Helper to get max amount (exact balance without rounding)
  const getMaxAmount = () => {
    return tokenInBalance ? tokenInBalance.toString() : "";
  };

  return (
    <>
      {/* Inline transaction progress bar */}
      <div className="container mt-4">
        <div className="row g-4 d-flex align-items-stretch pb-1">
          <div className="col-md-4 p-0 m-2 cards">
            <div className="card bg-dark text-light border-light p-3 d-flex w-100" style={{ minHeight: "260px" }}>
              <label className="detailText text-center small mb-1 font-weight-normal w-100">YOU PAY</label>
              <div className="d-flex flex-column align-items-center gap-2" style={{ position: "relative" }}>
                {/* Input + Swap button in one row */}
                <div className="position-relative" style={{ maxWidth: "80%", width: "100%" }}>
                  <input
                    type="text"
                    className="form-control pe-5" // padding-end so text doesn't overlap with icon
                    value={amountIn}
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

                  {/* Swap Button inside input */}
                  <button
                    className="btn btn-outline-light rounded-circle position-absolute"
                    style={{
                      width: "25px",
                      height: "25px",
                      top: "50%",
                      right: "10px",
                      transform: "translateY(-50%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 0,
                    }}
                    onClick={() => {
                      const prevIn = tokenIn;
                      const prevOut = tokenOut;
                      setTokenIn(prevOut);
                      setTokenOut(prevIn);
                      setAmountIn("");
                      setInsufficientBalance(false);
                    }}
                    disabled={isApproving || isSwapping}
                  >
                    <i className="bi bi-arrow-left-right" style={{ fontSize: "1rem" }}></i>
                  </button>
                </div>


                {inputUsdValue && (
                  <small
                    className="text-secondary"
                    style={{
                      alignSelf: "flex-start",
                      marginLeft: "10%", // aligns with input box
                      fontSize: "0.7rem"
                    }}
                  >
                    {inputUsdValue}
                  </small>
                )}
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
                className="d-flex justify-content-center align-items-center mb-2 mt-1"
                style={{ fontSize: "0.7rem" }}
              >
                <span
                  className="text-secondary small fw-normal ms-1"
                  style={{
                    cursor: (isApproving || isSwapping) ? "default" : "pointer",
                    opacity: (isApproving || isSwapping) ? "0.6" : "1"
                  }}
                  onClick={(isApproving || isSwapping) ? undefined : () => setAmountIn(getMaxAmount())}
                >
                  Bal: {tokenInBalance ? `${parseFloat(tokenInBalance).toFixed(2)}` : "-"}
                </span>
              </div>

            </div>
          </div>

          {/* Second Card: To Token Selection */}
          <div className="col-md-4 p-0 m-2 cards">
            <div className="card bg-dark text-light border-light p-3 d-flex w-100">

              <label className="detailText text-center small mb-1 font-weight-normal w-100">YOU RECIEVE</label>
              <div className="d-flex flex-column align-items-center gap-2" style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="form-control font-weight-bold"
                  placeholder="0.0"
                  value={isLoading ? "Fetching..." : amountOut}
                  readOnly
                  style={{ fontSize: "1rem", width: "80%", background: "#343a40", "--placeholder-color": "#6c757d" }}
                />
                {outputUsdValue && (
                  <div
                    className="d-flex align-items-start gap-2 mb-2"
                    style={{
                      fontSize: "0.7rem",
                      alignSelf: "flex-start",
                      marginLeft: "10%", // aligns with centered input edges
                    }}
                  >
                    <small className="text-secondary">{outputUsdValue}</small>
                    {getPriceDifference() && (
                      <span
                        className="badge"
                        style={{
                          color: getPriceDifference().isPositive ? "#28a745" : "#dc3545",
                          fontSize: "0.7rem",
                          fontWeight: 100,
                          padding: "2px 6px",
                        }}
                      >
                        {getPriceDifference().isPositive ? "+" : ""}(
                        {getPriceDifference().percentage.toFixed(2)}%)
                      </span>
                    )}
                  </div>
                )}

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
              {/* <TxProgressModal isOpen={isSwapping} txStatus={txStatus}
                steps={SwappingSteps} /> */}

              <div className="d-flex justify-content-center align-items-center mt-3">
                <div className="position-relative">

                  <button
                    className="btn btn-primary rounded-pill py-2"
                    onClick={handleSwap}
                    disabled={!quoteData || isSwapping || insufficientBalance}
                    style={{
                      minWidth: "170px",
                      width: "auto",
                      fontSize: "16px",
                      padding: "10px 20px",
                      fontWeight: 400,
                      height: "40px",
                      textAlign: "center",
                      whiteSpace: "nowrap"
                    }}
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

                </div>
              </div>

            </div>
          </div>

          {/* Third Card: Swap Button and Details Section */}
          <div className="col-md-4 p-0 m-2 cards">
            <div className="card bg-dark text-light border-light p-3 d-flex w-100">
              <div className="carddetaildiv uppercase d-flex justify-content-between align-items-center">
                <div className="carddetails2">
                  <h6 className="detailText">Details</h6>
                  <p className="mb-1">
                    <span className="detailText">Network Fee - </span>
                    <span className="second-span-fontsize">{estimatedGas}</span>
                  </p>
                  <p className="mb-1">
                    <span className="detailText">Route - </span>
                    <span className="second-span-fontsize">Piteas API</span>
                  </p>
                  <p className="mb-1">
                    <span className="detailText">Slippage 0.5% -  </span>
                    <span className="second-span-fontsize">Gas swap levy </span>
                  </p>

                  <p className="mb-1">
                    <span className="detailText">WITHDRAW PLS INDEX FUND - </span>
                    <button
                      className="btn btn-sm text-light  p-0"
                      style={{ textDecoration: "none", fontSize: "13px", fontWeight: "700" }}
                      onClick={() => {
                        const calculated = Math.max(calculateTotalSum() * DaipriceChange, 0) / 100;

                        if (DaipriceChange < 0 || calculated === 0) {
                          if (DaipriceChange < 0) {
                            toast.error(
                              `Invalid amount: index value is negative (${DaipriceChange}%) for now`,
                              { position: "top-center" }
                            );
                          } else {
                            toast.error("Invalid amount: get more state tokens", {
                              position: "top-center",
                            });
                          }
                          return;
                        }
                        setTokenIn(nativeNames[chainId]);
                        setTokenOut("STATE");
                        setAmountIn(calculated.toString());
                      }}
                      disabled={isApproving || isSwapping}
                      title="Reset to default tokens"
                    >
                      CHECK
                    </button>
                  </p>
                  <div className="d-flex justify-content-start align-items-center ">
                    <button
                      className="btn detailText btn-link text-light  p-0"
                      style={{ textDecoration: "none", fontSize: "13px", fontWeight: "700" }}
                      onClick={() => {
                        setTokenIn("STATE");
                        setTokenOut(nativeNames[chainId]);
                        setAmountIn("");
                      }}
                      disabled={isApproving || isSwapping}
                      title="Reset to default tokens"
                    >
                      Refresh <i className="bi bi-arrow-clockwise"></i>

                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>

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
    </>
  );
};

export default SwapComponent;
