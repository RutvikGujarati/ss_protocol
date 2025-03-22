import "bootstrap/dist/css/bootstrap.min.css";
import "../Styles/InfoCards.css";
import { useSwapContract } from "../Functions/SwapContractFunctions";
import React, { useContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import { useLocation } from "react-router-dom";
import PLSLogo from "../assets/pls1.png";
import BNBLogo from "../assets/bnb.png";
import MetaMaskIcon from "../assets/metamask-icon.png";
import { formatWithCommas } from "./DetailsInfo";
import { PriceContext } from "../api/StatePrice";
import { useDAvContract } from "../Functions/DavTokenFunctions";
import DotAnimation from "../Animations/Animation";
import { useGeneralTokens } from "../Functions/GeneralTokensFunctions";
import { useChainId } from "wagmi";
import { useDeepStateFunctions } from "../Functions/DeepStateContract";
import { ContractContext } from "../Functions/ContractInitialize";
const InfoCards = () => {
  const chainId = useChainId();
  const { AllContracts, account } = useContext(ContractContext);
  const { stateUsdPrice, priceLoading } = useContext(PriceContext);
  const {
    PLSPrice,
    BuyTokens,
    Reinvest,
    CalculateBalanceInUSD,
    balanceOfContract,
    UsersTokens,
    UsersTotalTokens,
    UsersDividends,
    TotalInvested,
    WithdrawDividends,
    CurrentSellprice,
    CurrentBuyprice,
    TotalUserProfit,
    totalBStuckEth,
  } = useDeepStateFunctions();
  const [CurrentBuyPrice, setCurrentBuyPrice] = useState("0");

  const [setBurnRatio] = useState("0.0");
  const {
    mintDAV,
    claimableAmount,
    davHolds,
    isLoading,
    DavBalance,
    davPercentage,
    claimAmount,
  } = useDAvContract();
  const { ClaimTokens, CheckMintBalance, Distributed } = useGeneralTokens();
  console.log("Connected Chain ID:", chainId);
  const setBackLogo = () => {
    if (chainId === 369) {
      return PLSLogo; // PulseChain
    } else if (chainId === 56) {
      return BNBLogo; // BNB Chain
    } else {
      return PLSLogo; // Optional fallback logo
    }
  };
  const [Denominator, setDenominator] = useState("");
  const [WithdrawAmount, setWithdrawAMount] = useState("");
  const [ReinvestAmount, setReinvestAmount] = useState("");

  const handleInputChangeofToken = (e) => {
    const rawValue = e.target.value.replace(/,/g, "");
    if (!isNaN(rawValue) && rawValue !== "") {
      setDenominator(rawValue);
    } else if (rawValue === "") {
      setDenominator("");
    }
  };
  const handleInputChangeofWithdraw = (e) => {
    const rawValue = e.target.value.replace(/,/g, "");
    if (!isNaN(rawValue) && rawValue !== "") {
      setWithdrawAMount(rawValue);
    } else if (rawValue === "") {
      setWithdrawAMount("");
    }
  };
  const handleInputChangeofReinvest = (e) => {
    const rawValue = e.target.value.replace(/,/g, "");
    if (!isNaN(rawValue) && rawValue !== "") {
      setReinvestAmount(rawValue);
    } else if (rawValue === "") {
      setReinvestAmount("");
    }
  };
  CalculateBalanceInUSD();
  const getLogoSize = () => {
    return chainId === 56
      ? { width: "170px", height: "140px" } // Bigger size for BNB
      : { width: "110px", height: "140px" }; // Default size
  };
  const getLiveText = () => {
    if (chainId === 369) {
      return { text: "🟢 LIVE ON PULSECHAIN.", color: "" };
    } else if (chainId === 56) {
      return { text: "🟢 LIVE ON BINANCE SMART CHAIN.", color: "" };
    } else {
      return { text: "🟢 LIVE ON PULSECHAIN.", color: "" }; // Fallback
    }
  };
  const [estimatedLPT, setEstimatedLPT] = useState("0.00");

  useEffect(() => {
    const fetchEstimate = async () => {
      if (!Denominator || isNaN(Denominator)) {
        setEstimatedLPT("0.00");
        return;
      }

      try {
        const amountInWei = ethers.parseUnits(Denominator.toString(), 18);
        const userAmount =
          await AllContracts.DeepStateContract.calculateTokensForEth(
            amountInWei
          );

        // Convert BigInt -> String -> Number -> Fixed 2 decimals
        setEstimatedLPT(Number(ethers.formatUnits(userAmount, 18)).toFixed(2));
      } catch (error) {
        console.error("Error calculating estimated LPT:", error);
        setEstimatedLPT("0.00");
      }
    };

    fetchEstimate();
  }, [Denominator]);

  const CurrentBuy = async () => {
    try {
      const userAmount = await AllContracts.DeepStateContract.buyPrice(); // Get amount in Wei
      const formattedAmount = ethers.formatEther(userAmount); // Convert to ETH
      setCurrentBuyPrice(formattedAmount); // Store in state
      console.log("User's total tokens in ETH:", formattedAmount);
    } catch (error) {
      console.log("Error fetching tokens amount:", error);
    }
  };
  const liveText = getLiveText();

  const {
    handleAddTokenState,
    handleAddTokenDAV,
    // LoadingState,
    CalculationOfCost,
    TotalCost,
    TotalStateHoldsInUS,
    contracts,
    StateBurnBalance,
    StateHolds,
    DavRequiredAmount,
  } = useSwapContract();
  const [amount, setAmount] = useState("");
  const [load, setLoad] = useState(false);
  const [loadClaim, setLoadClaim] = useState(false);
  const [errorPopup, setErrorPopup] = useState({});
  const [checkingStates, setCheckingStates] = useState({});
  const [claimingStates, setClaimingStates] = useState({});
  const handleMint = async () => {
    setLoad(true);
    try {
      await mintDAV(amount);
      setAmount("");
    } catch (error) {
      console.error("Error minting:", error);
      alert("Minting failed! Please try again.");
    } finally {
      setLoad(false);
    }
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

  const handleClaimTokens = async (id, ContractName) => {
    setClaimingStates((prev) => ({ ...prev, [id]: true }));
    const contract = contracts[ContractName];
    await ClaimTokens(contract);
    setClaimingStates((prev) => ({ ...prev, [id]: false })); // Reset claiming state
  };

  const formatPrice = (price) => {
    if (!price || isNaN(price)) {
      return "$0.0000"; // Default display for invalid or null prices
    }

    const formattedPrice = parseFloat(price).toFixed(10); // Format to 9 decimals for processing
    const [integerPart, decimalPart] = formattedPrice.split(".");

    // Check for leading zeros in the decimal part
    const leadingZerosMatch = decimalPart.match(/^0+(.)/); // Match leading zeros and capture the first non-zero digit
    if (leadingZerosMatch) {
      const leadingZeros = leadingZerosMatch[0].slice(0, -1); // Extract all leading zeros except the last digit
      const firstSignificantDigit = leadingZerosMatch[1]; // Capture the first significant digit
      const zeroCount = leadingZeros.length;
      if (zeroCount < 4) {
        return `${integerPart}.${"0".repeat(
          zeroCount
        )}${firstSignificantDigit}${decimalPart
          .slice(zeroCount + 1)
          .slice(0, 3)}`;
      } else {
        return (
          <>
            {integerPart}.<span>0</span>
            <sub>{zeroCount}</sub>
            {firstSignificantDigit}
            {decimalPart.slice(zeroCount + 1).slice(0, 3)}
          </>
        );
      }
    }

    // General case: No significant leading zeros
    return `$${parseFloat(price).toFixed(7)}`;
  };
  const Checking = async (id, ContractName) => {
    setCheckingStates((prev) => ({ ...prev, [id]: true })); // Set checking state for specific button
    try {
      const contract = contracts[ContractName]; // Get the dynamic contract based on the ContractName
      await CheckMintBalance(contract);
    } catch (e) {
      if (
        e.reason === "StateToken: No new DAV minted" ||
        (e.revert &&
          e.revert.args &&
          e.revert.args[0] === "StateToken: No new DAV minted")
      ) {
        console.error("StateToken: No new DAV minted:", e);
        setErrorPopup((prev) => ({ ...prev, [id]: true }));
      } else {
        console.error("Error calling CheckMintBalance:", e);
      }
    }
    setCheckingStates((prev) => ({ ...prev, [id]: false })); // Reset checking state
  };
  const calculateBurnRatio = async () => {
    try {
      const maxSupply = 999000000000000;
      const calculate = StateBurnBalance.toString() / maxSupply || 0;
      console.log("burn ratio calculation", calculate);
      setBurnRatio(calculate.toFixed(17));
    } catch (error) {
      console.error("Error calculating burn ratio:", error);
    }
  };
  const handleInputChange = (e) => {
    if (/^\d*$/.test(e.target.value)) {
      setAmount(e.target.value);
    }
    CalculationOfCost(e.target.value);
  };

  function formatNumber(number) {
    if (!number) return "0";
    return new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 0,
    }).format(number);
  }

  useEffect(() => {
    UsersTotalTokens();
    CurrentBuy();
    CalculationOfCost(amount);
    calculateBurnRatio();
  }, [amount]);

  const location = useLocation();
  const isBurn = location.pathname === "/StateLp";
  const isAuction = location.pathname === "/auction";

  return (
    <>
      {isAuction ? (
        <>
          <div className="container mt-4">
            <div className="row g-4 d-flex align-items-stretch pb-1 border-bottom-">
              <div className="col-md-4 p-0 m-2 cards">
                <div className="card bg-dark text-light border-light p-0 d-flex justify-content-center align-items-center text-center w-100">
                  <div className="p-2">
                    <p className="mb-2 detailText">MINT DAV TOKENS</p>
                    <input
                      type="text"
                      placeholder="Enter Value"
                      className="form-control text-center fw-bold mb-3"
                      value={amount}
                      onChange={handleInputChange}
                    />
                    <h5 className="detailAmount">1 DAV TOKEN = 500000 PLS</h5>
                    <h5 className="detailAmount mb-4">
                      {TotalCost
                        ? formatNumber(ethers.formatUnits(TotalCost, 18))
                        : "0"}{" "}
                      PLS
                    </h5>

                    <button
                      onClick={handleMint}
                      className="btn btn-primary btn-sm d-flex justify-content-center align-items-center mt-4 w-100 "
                      disabled={load}
                    >
                      {load ? "Minting..." : "Mint"}
                    </button>
                  </div>
                  <div className="carddetails2">
                    <h6
                      className="detailText "
                      style={{
                        fontSize: "14px",
                        textTransform: "capitalize",
                      }}
                    >
                      Transferring DAV tokens is not allowed after minting
                    </h6>
                  </div>
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
                      top: "40%",
                      left: "70%",
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
                          <p className="mb-1 detailText mx-2"> / Dav Rank</p>
                        </div>
                        <div className="d-flex">
                          <h5 className="">
                            {isLoading ? <DotAnimation /> : davHolds}
                          </h5>
                          <h5 className="mx-1 ">
                            {isLoading ? (
                              <DotAnimation />
                            ) : (
                              `/ ${davPercentage}`
                            )}
                          </h5>
                        </div>
                      </div>

                      <div className="mb-0 mx-1">
                        <img
                          src={MetaMaskIcon}
                          width={20}
                          height={20}
                          alt="Logo"
                          style={{ cursor: "pointer", marginLeft: "5px" }}
                          onClick={handleAddTokenDAV}
                        />
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
                        PLS - SWAP LEVY{" "}
                      </h6>
                      <h5 className="">{formatWithCommas(claimableAmount)}</h5>
                      <div className="d-flex justify-content-center ">
                        <button
                          onClick={handleClaim}
                          className="btn btn-primary d-flex btn-sm justify-content-center align-items-center mx-5 mt-4"
                          style={{ width: "190px" }}
                          disabled={loadClaim}
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
                      <div className="carddetails2">
                        <p className="mb-1 detailText">State token holdings</p>
                        <h5 className="">
                          {StateHolds} / $
                          {formatWithCommas(TotalStateHoldsInUS)}
                        </h5>
                        <h5 className="detailAmount">
                          1 TRILLION STATE TOKENS = {""}${" "}
                          {formatWithCommas(
                            (stateUsdPrice * 1000000000000).toFixed(0)
                          )}
                        </h5>
                      </div>
                      <div className="mb-0 mx-1">
                        <img
                          src={MetaMaskIcon}
                          width={20}
                          height={20}
                          alt="Logo"
                          style={{ cursor: "pointer" }}
                          onClick={handleAddTokenState}
                        />
                      </div>
                    </div>
                    {errorPopup["state"] && (
                      <div className="popup-overlay">
                        <div className="popup-content">
                          <h4 className="popup-header">
                            Mint Additional DAV Tokens
                          </h4>
                          <p className="popup-para">
                            You need to mint additional DAV tokens to claim
                            extra rewards
                          </p>
                          <button
                            onClick={() =>
                              setErrorPopup((prev) => ({
                                ...prev,
                                ["state"]: false,
                              }))
                            }
                            className="btn btn-secondary popup-button"
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    )}
                    <div className="carddetails2">
                      <p className="mb-1 detailText">State token price</p>
                      <h5 className="">
                        ${" "}
                        {priceLoading ? (
                          <DotAnimation />
                        ) : (
                          formatPrice(stateUsdPrice)
                        )}
                      </h5>
                    </div>
                    <div className="d-flex justify-content-between w-100">
                      <div className="carddetails2 text-center w-50">
                        <p className="mb-1 detailText">Check</p>
                        <button
                          onClick={() => Checking("state", "state")}
                          className="btn btn-primary btn-sm swap-btn"
                          disabled={
                            checkingStates["state"] ||
                            Distributed["state"] > 0 ||
                            DavBalance == 0
                          }
                        >
                          {checkingStates["state"]
                            ? "AIRDROPPING..."
                            : "AIRDROP"}
                        </button>
                      </div>
                      <div className="carddetails2 text-center w-50">
                        <p className="mb-1 detailText">Mint</p>
                        <div
                          onClick={
                            Distributed !== "0.0" && !claimingStates["state"]
                              ? () => handleClaimTokens("state", "state")
                              : null
                          }
                          className={` btn btn-primary btn-sm swap-btn ${
                            claimingStates["state"] ||
                            Distributed["state"] === "0.0"
                              ? "disabled"
                              : ""
                          }`}
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          {claimingStates["state"]
                            ? "minting..."
                            : `${
                                formatWithCommas(Distributed["state"]) ?? "0.0"
                              }`}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="announcement text-center overflow-hidden relative">
              <div className="animate-marquee whitespace-nowrap">
                <div className="marquee-inner">
                  {[...Array(2)].map((_, i) => (
                    <React.Fragment key={i}>
                      {[
                        { text: `${liveText.text}`, color: "" },
                        {
                          text: `${DavRequiredAmount} DAV TOKEN REQUIRED TO PARTICIPATE IN THE DAILY AUCTION AND RECEIVE ±100% ROI ON SWAPS.`,
                          color: "white",
                        },
                        {
                          text: "10$ TOKEN DEPLOYED.",
                          color: "white",
                          //   image: RievaLogo,
                        },
                      ].map((item, j) => (
                        <span
                          key={`${i}-${j}`}
                          className="marquee-content  rieva-token-container"
                          style={{
                            color: item.color,
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          {/* {item.image && (
                            <div className="">
                              <img
                                src={item.image}
                                alt="Rieva Token"
                                className="rieva-token-image"
                              />
                            </div>
                          )} */}
                          {item.text}
                        </span>
                      ))}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      ) : isBurn ? (
        <>
          <div className="container mt-4 ">
            <div className="table-responsive">
              <div className="announcement text-center">
                <div className="">
                  PROFIT HARVESTING FOR LIQUIDITY POOLS - PULSECHAIN
                </div>
              </div>
            </div>
            <div className="row g-4 d-flex align-items-stretch pb-1  mt-1">
              <div className="col-md-4 p-0 m-2 cards">
                <div className="card bg-dark text-light border-light p-3 d-flex w-100">
                  <div className="carddetaildiv uppercase">
                    <div className="carddetails2">
                      <p className="mb-1 detailText">Treasury</p>
                      <p className="mb-0 detailAmount">
                        {" "}
                        Total ETH Invested : {TotalInvested} ETH
                      </p>
                      <p className="mb-0 detailAmount">
                        {" "}
                        LPT Held : {(Number(UsersTokens) || 0).toFixed(0)}
                      </p>
                      <p className="mb-0 detailAmount">
                        {" "}
                        Contract ETH Balance :{" "}
                        {Number(balanceOfContract).toFixed(2)} ETH
                      </p>
                    </div>
                    <div className="carddetails2">
                      <p className="mb-1 detailText detailAmount">
                        Price Information
                      </p>
                      <p className="mb-0 detailAmount">
                        Current Buy Price: {CurrentBuyprice} ETH
                      </p>
                      <p className="mb-0 detailAmount">
                        Current Sell Price: {CurrentSellprice} ETH
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-4 p-0 m-2 cards">
                <div className="card bg-dark text-light border-light p-3 d-flex w-100">
                  <div className="carddetaildiv uppercase ">
                    <div className="carddetails2">
                      <p className="mb-1 detailText detailAmount">
                        Price Summary
                      </p>
                      <p className="mb-0 detailAmount">
                        Total ETH Profit : {TotalUserProfit} ETH
                      </p>
                      <p className="mb-0 detailAmount">
                        PLS Price : $ {""}
                        {(Number(PLSPrice) || 0).toFixed(6)} {""}
                      </p>
                      <p className="mb-0 detailAmount">
                        LPT Value : ${" "}
                        {(Number(PLSPrice) * Number(UsersTokens) || 0).toFixed(
                          2
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-4 p-0 m-2 cards">
                <div className="card bg-dark text-light border-light p-3 d-flex w-100">
                  <div className="carddetaildiv uppercase">
                    <div className="carddetails2">
                      {/* Buy Section */}
                      <div className="d-flex align-items-center justify-content-between">
                        <p className="mb-0 detailText">BUY </p>
                        <p className="mb-0 detailAmount">
                          Est. LPT: {estimatedLPT}
                        </p>
                        <p className="mb-0 mt-1 mx-1 detailAmount">
                          (@ {CurrentBuyPrice} ETH)
                        </p>
                      </div>
                      <div className="d-flex align-items-center justify-content-between mt-1">
                        <input
                          type="text"
                          className="form-control text-center mh-30"
                          placeholder="Enter ETH "
                          value={
                            Denominator
                              ? Number(Denominator).toLocaleString()
                              : ""
                          }
                          onChange={(e) => handleInputChangeofToken(e)}
                          style={{ width: "50%" }}
                        />
                        <button
                          onClick={() => BuyTokens(Denominator)}
                          className="swap-btn py-1 mx-1 btn btn-primary"
                          style={{ width: "30%" }}
                        >
                          Buy
                        </button>
                      </div>

                      {/* Withdraw Section */}
                      <div className="d-flex align-items-center justify-content-start">
                        <p className="mt-1 mb-1 detailText">WITHDRAW</p>
                        <p className="mb-0 detailAmount mx-5">
                          {UsersDividends} ETH
                        </p>
                      </div>
                      <div className="d-flex align-items-center justify-content-between mt-1">
                        <input
                          type="text"
                          className="form-control text-center mh-30"
                          placeholder="Enter ETH"
                          style={{ width: "50%" }}
                          value={WithdrawAmount}
                          onChange={(e) => handleInputChangeofWithdraw(e)}
                        />
                        <button
                          className="swap-btn py-1 btn btn-primary"
                          style={{ width: "32%" }}
                          onClick={() => {
                            WithdrawDividends(WithdrawAmount);
                          }}
                        >
                          Withdraw
                        </button>
                      </div>

                      {/* Re-Invest Section */}
                      <div className="d-flex align-items-center justify-content-start">
                        <p className="mt-1 mb-1 detailText">RE-INVEST</p>
                        <p className="mb-0 detailAmount mx-5">
                          {totalBStuckEth} ETH
                        </p>
                      </div>
                      <div className="d-flex align-items-center justify-content-between mt-1">
                        <input
                          type="text"
                          className="form-control text-center mh-30"
                          placeholder="Enter ETH"
                          style={{ width: "50%" }}
                          value={ReinvestAmount}
                          onChange={(e) => {
                            handleInputChangeofReinvest(e);
                          }}
                        />
                        <button
                          className="swap-btn py-1 btn btn-primary mx-1"
                          style={{ width: "30%" }}
                          onClick={() => {
                            Reinvest(ReinvestAmount);
                          }}
                        >
                          Re-Invest
                        </button>
                      </div>
                    </div>
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
