import "bootstrap/dist/css/bootstrap.min.css";
import "../Styles/DataTable.css";
import MetaMaskIcon from "../assets/metamask-icon.png";
import { useLocation } from "react-router-dom";
import { useSwapContract } from "../Functions/SwapContractFunctions";
import { useEffect, useState } from "react";
import { formatWithCommas } from "./DetailsInfo";
import { useAuctionTokens } from "../data/auctionTokenData";
import { useDAvContract } from "../Functions/DavTokenFunctions";
import { useAccount } from "wagmi";
import { useAddTokens, useUsersOwnerTokens } from "../data/AddTokens";
import { Auction_TESTNET } from "../Constants/ContractAddresses";
import pulsex from "../assets/ninemm.png";

import IOSpinner from "../Constants/Spinner";
const DataTable = () => {
  const {
    davHolds,
    deployWithMetaMask,
    isProcessing,
    pendingToken,
    DepositStateBack,
    BurnPairStateTokens,
  } = useDAvContract();
  const { address, isConnected } = useAccount();
  const {
    DavRequiredAmount,
    DavBalanceRequire,
    swappingStates,
    buttonTextStates,
    AirDropAmount,
    setTxStatusForSwap,
    setTxStatusForAdding,
    txStatusForAdding,
    AddTokenIntoSwapContract,
    isTokenSupporteed,
    renounceTokenContract,
    txStatusForSwap,
    CheckMintBalance,
    isCliamProcessing,
    fetchUserTokenAddresses,
    IsEnoughState,
    handleAddToken,
    tokenMap,
    giveRewardForAirdrop,
  } = useSwapContract();

  const { tokens } = useAuctionTokens();
  const { tokens: Addtokens } = useAddTokens();
  const OwnersTokens = useUsersOwnerTokens();
  console.log("obj tokens", tokens);

  const location = useLocation();
  const isAuction = location.pathname === "/auction";
  const isAddToken = location.pathname === "/AddToken";
  const isBurnLP = location.pathname === "/burn-lp";

  const [errorPopup, setErrorPopup] = useState({});
  const [processingToken, setProcessingToken] = useState(null);
  const [checkingStates, setCheckingStates] = useState({});
  const [inputValues, setInputValues] = useState({});
  const [authorized, setAuthorized] = useState(false);

  const AuthAddress = import.meta.env.VITE_AUTH_ADDRESS;

  const handleSetAddress = () => {
    if (!address) {
      setAuthorized(false);
      console.warn("Wallet address not available");
      return;
    }

    setAuthorized(AuthAddress === address);

    console.log("comparing auth address", address);
  };
  useEffect(() => {
    handleSetAddress();
  }, [address, AuthAddress]);
  //utils
  function formatCountdown(seconds) {
    if (!seconds || seconds <= 0) return "0h 0m";

    const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((seconds % (60 * 60)) / 60);

    return `${hours}h ${minutes}m`;
  }
  function formatTimeVerbose(seconds) {
    if (typeof seconds !== "number" || isNaN(seconds) || seconds <= 0)
      return "0";

    const days = Math.floor(seconds / 86400);
    const hrs = Math.floor((seconds % 86400) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    // const secs = Math.floor(seconds % 60); // in case it's float

    return `${days}d ${hrs}h ${mins}m`;
  }
  // Handle input change for tokenAddress or pairAddress for a specific user
  const handleInputChange = (tokenName, value) => {
    setInputValues((prev) => ({
      ...prev,
      [tokenName]: value, // store pairAddress directly
    }));
  };

  // Handle Add button click (calls AddTokenIntoSwapContract)
  const handleAdd = async (tokenAddress, tokenName, user, name) => {
    const pairAddress = inputValues[tokenName] || "";
    setProcessingToken(tokenName); // Set current token being processed
    try {
      await AddTokenIntoSwapContract(tokenAddress, pairAddress, user, name);
      await isTokenSupporteed();
    } catch (error) {
      console.error("AddTokenIntoSwapContract failed:", error);
    } finally {
      setProcessingToken(null); // Reset after processing
    }
  };

  console.log("required dav amount", DavRequiredAmount);

  const Checking = async (id, ContractName) => {
    setCheckingStates((prev) => ({ ...prev, [id]: true }));
    try {
      // Dynamically get address from swap.tokenMap (or pass it as prop if needed)
      const AddressMapping = tokenMap?.[ContractName];
      if (!AddressMapping) {
        throw new Error(`Token address not found for ${ContractName}`);
      }

      console.log("Address fetched from tokenMap:", AddressMapping);
      await CheckMintBalance(AddressMapping);
    } catch (e) {
      if (
        e.reason === `No new DAV holdings for this token` ||
        (e.revert &&
          e.revert.args &&
          e.revert.args[0] === `No new DAV holdings for this token`)
      ) {
        console.error(`No new DAV holdings for this token:`, e);
        setErrorPopup((prev) => ({ ...prev, [id]: true }));
      } else {
        console.error("Error calling CheckMintBalance:", e);
      }
    }
    setCheckingStates((prev) => ({ ...prev, [id]: false }));
  };

  console.log("db required for Auction", DavBalanceRequire);

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isAddingPopupOpen, setIsAddingPopUpOpen] = useState(false);

  // Show/hide popup based on txStatus
  useEffect(() => {
    if (!txStatusForAdding) {
      setIsAddingPopUpOpen(false);
      return;
    }

    setIsAddingPopUpOpen(true);

    let timer;
    if (["confirmed", "error"].includes(txStatusForAdding)) {
      timer = setTimeout(() => {
        setIsAddingPopUpOpen(false);
        setTxStatusForAdding("");
      }, 2000); // 2-second delay for confirmed and error states
    }

    return () => clearTimeout(timer);
  }, [txStatusForAdding]);
  useEffect(() => {
    if (!txStatusForSwap) {
      setIsPopupOpen(false);
      return;
    }

    setIsPopupOpen(true);

    let timer;
    if (["confirmed", "error"].includes(txStatusForSwap)) {
      timer = setTimeout(() => {
        setIsPopupOpen(false);
        setTxStatusForSwap("");
      }, 2000); // 2-second delay for confirmed and error states
    }

    return () => clearTimeout(timer);
  }, [txStatusForSwap]);

  return !isConnected || !address ? (
    <div className="container text-center mt-5">
      <p className="text-light">Please connect your wallet.</p>
    </div>
  ) : isAuction ? (
    // loading ? (
    //   <div className="container text-center mt-5">
    //     <IOSpinner />
    //   </div>
    // ) :
    <div className="container  datatablemarginbottom">
      <div className="table-responsive">
        <div style={{ maxHeight: "190px", overflowY: "auto" }}>
          <table className="table table-dark">
            <thead>
              <tr>
                <th></th>
                <th>Emoticon</th>
                <th>Token Name</th>
                <th>Claim Airdrop</th>
                <th></th>
                <th>Auction Timer</th>
                <th className="text-center">
                  <span className="mx-3"> Ratio Swapping Auction</span>
                  <a
                    href={`https://midgard.wtf/address/${Auction_TESTNET}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: "15px", color: "white" }}
                  >
                    <i className="bi bi-box-arrow-up-right"></i>
                  </a>
                </th>
                <th>Market Maker Instructions</th>
                <th></th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {tokens
                  .filter(({ name, isReversing, AuctionStatus }) => {
                    console.log(`Filter Conditions: ${name}`, {
                      isReversing,
                      AuctionStatus,
                    });

                    const isAuctionActive = AuctionStatus === "true";
                    const isReverseAuction =
                      AuctionStatus === "false" && isReversing === "true";

                    return isAuctionActive || isReverseAuction;
                  })
                .map(
                  (
                    {
                      id,
                      name,
                      emoji,
                      token,
                      // currentRatio,
                      SwapT,
                      ContractName,
                      isReversing,
                      AirdropClaimedForToken,
                      userHasSwapped,
                      userHasReverse,
                      // AuctionStatus,
                      TimeLeft,
                      inputTokenAmount,
                      hasDeposited,
                      onlyInputAmount,
                      // handleAddToken,
                      outputToken,
                    },
                    index
                  ) => (
                    <tr className="small-font-row" key={index}>
                      <td></td>
                      <td>{emoji}</td>
                      <td className="justify-content-center">
                        {`${name}`}
                        {hasDeposited == "true" && (
                          <>
                            <span
                              style={{
                                marginLeft: "8px",
                              }}
                            >
                              🏳️
                            </span>
                          </>
                        )}
                      </td>
                      <td style={{ position: "relative" }}>
                        <button
                          onClick={() => Checking(id, ContractName)}
                          className="btn btn-primary btn-sm swap-btn"
                          disabled={checkingStates[id] || davHolds == 0}
                        >
                          {checkingStates[id]
                            ? ` AIRDROPPING...`
                            : AirdropClaimedForToken == "true"
                            ? " CLAIMED"
                            : `${formatWithCommas(AirDropAmount[name])} `}
                        </button>
                      </td>
                      <td>
                        {" "}
                        <img
                          src={MetaMaskIcon}
                          onClick={() =>
                            handleAddToken(
                              token,
                              name === "DAV"
                                ? "pDAV"
                                : name === "STATE"
                                ? "State"
                                : name
                            )
                          }
                          alt="MetaMask"
                          style={{
                            width: "20px",
                            height: "20px",
                            cursor: "pointer",
                            marginLeft: "6px",
                            verticalAlign: "middle",
                          }}
                        />
                      </td>
                      <td className="timer-cell">
                        {formatCountdown(TimeLeft)}
                      </td>
                      <td>
                        <div className="d-flex justify-content-center gap-3 w-100">
                          {id !== "state" && (
                            <>
                              {isReversing == "true" ? (
                                <>
                                  <div className="tableClaim hover-container">
                                    {outputToken <= "1" && (
                                      <div className="hover-box">
                                        {`not enough State Token available in your account`}
                                      </div>
                                    )}
                                    {formatWithCommas(outputToken)}
                                  </div>
                                  <div className="tableClaim">
                                    {formatWithCommas(inputTokenAmount)}
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className="tableClaim hover-container">
                                    {onlyInputAmount <= 0 && (
                                      <div className="hover-box">
                                        {`not enough ${name} available in your account`}
                                      </div>
                                    )}
                                    {formatWithCommas(inputTokenAmount)}
                                  </div>

                                  <div className="tableClaim">
                                    {formatWithCommas(outputToken)}
                                  </div>
                                </>
                              )}
                            </>
                          )}
                          <div className="d-flex align-items-center gap-2">
                            <>
                              {isReversing == "true" && (
                                <button
                                  onClick={() => SwapT()}
                                  disabled={
                                    userHasReverse == "true" ||
                                    swappingStates[id] ||
                                    outputToken <= "1"
                                  }
                                  className={`btn btn-sm swap-btn btn-primary btn-sm swap-btn `}
                                >
                                  {userHasReverse == "true"
                                    ? "Reverse Swapped ✅"
                                    : swappingStates[id]
                                    ? "Swapping..."
                                    : "Reverse Swap"}
                                </button>
                              )}

                              {isReversing == "false" && (
                                <button
                                  onClick={() => SwapT()}
                                  disabled={
                                    userHasSwapped == "true" ||
                                    swappingStates[id] ||
                                    onlyInputAmount <= 0
                                  }
                                  className="btn btn-sm swap-btn btn-primary"
                                >
                                  {userHasSwapped == "true"
                                    ? "Swapped ✅"
                                    : swappingStates[id]
                                    ? "Swapping..."
                                    : buttonTextStates[id] || "Swap"}
                                </button>
                              )}
                            </>
                          </div>
                        </div>
                      </td>
                      {errorPopup[id] && (
                        <div className="popup-overlay2">
                          <div className="popup-content2">
                            <h4 className="popup-header2">
                              Mint Additional DAV Tokens
                            </h4>
                            <p className="popup-para">
                              You need to mint additional DAV tokens to claim
                              extra.
                            </p>
                            <button
                              onClick={() =>
                                setErrorPopup((prev) => ({
                                  ...prev,
                                  [id]: false,
                                }))
                              }
                              className="btn btn-secondary popup-button"
                            >
                              Close
                            </button>
                          </div>
                        </div>
                      )}

                      <td>
                        Swap {formatWithCommas(outputToken)} tokens <br /> for{" "}
                        {name} tokens on external DEX
                      </td>
                      <td>
                        <a
                          href="https://dex.9mm.pro/swap?chain=pulsechain"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <img
                            src={pulsex}
                            alt="sDAV Logo"
                            className="mb-1 "
                            style={{
                              background: "transparent",
                              width: "20px",
                              height: "20px",
                              cursor: "pointer",
                              marginLeft: "8px",
                            }}
                          />
                        </a>
                      </td>
                      <td></td>
                      {isPopupOpen && (
                        <div
                          className="modal d-flex align-items-center justify-content-center"
                          style={{
                            zIndex: 30000,
                            background: "rgba(33, 37, 41, 0.1)",
                            pointerEvents: isPopupOpen ? "auto" : "none",
                          }}
                        >
                          <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content popup-content">
                              <div className="modal-header border-0 text-center w-100 d-block">
                                <h3 className="modal-title text-light">
                                  Transaction Status
                                </h3>
                              </div>

                              <div className="modal-body">
                                <div className="tx-progress-container">
                                  <div className="step-line">
                                    <div
                                      className={`step ${
                                        txStatusForSwap === "initializing" ||
                                        txStatusForSwap === "initiated" ||
                                        txStatusForSwap === "Approving" ||
                                        txStatusForSwap === "swap pending" ||
                                        txStatusForSwap === "confirmed" ||
                                        txStatusForSwap === "error"
                                          ? "active"
                                          : ""
                                      }`}
                                    >
                                      <span className="dot" />
                                      <span className="label">
                                        Initializing
                                      </span>
                                    </div>
                                    <div
                                      className={`step ${
                                        txStatusForSwap === "initiated" ||
                                        txStatusForSwap === "Approving" ||
                                        txStatusForSwap === "pending" ||
                                        txStatusForSwap === "confirmed" ||
                                        txStatusForSwap === "error"
                                          ? "active"
                                          : ""
                                      }`}
                                    >
                                      <span className="dot" />
                                      <span className="label">Initiated</span>
                                    </div>
                                    <div
                                      className={`step ${
                                        txStatusForSwap === "Approving" ||
                                        txStatusForSwap === "pending" ||
                                        txStatusForSwap === "confirmed" ||
                                        txStatusForSwap === "error"
                                          ? "active"
                                          : ""
                                      }`}
                                    >
                                      <span className="dot" />
                                      <span className="label">Approving</span>
                                    </div>
                                    <div
                                      className={`step ${
                                        txStatusForSwap === "pending" ||
                                        txStatusForSwap === "confirmed" ||
                                        txStatusForSwap === "error"
                                          ? "active"
                                          : ""
                                      }`}
                                    >
                                      <span className="dot" />
                                      <span className="label">Swapping</span>
                                    </div>
                                    <div
                                      className={`step ${
                                        txStatusForSwap === "confirmed" ||
                                        txStatusForSwap === "error"
                                          ? "active"
                                          : ""
                                      }`}
                                    >
                                      <span className="dot" />
                                      <span className="label">
                                        {txStatusForSwap === "error"
                                          ? "Error"
                                          : "Confirmed"}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </tr>
                  )
                )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  ) : isBurnLP ? (
    <>
      <div className="mt-4 container  datatablemarginbottom">
        <div className="table-responsive">
          <table className="table table-dark">
            <thead>
              <tr>
                <th>Emoticon</th>
                <th>Token Name</th>

                {/* <th>Liquidity</th> */}
                <th></th>
                <th>Token Address</th>
                <th>Pair Address</th>
                <th>Conditions</th>
                <th>Burn LP</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {OwnersTokens.filter(
                ({ name }) => IsEnoughState?.[name] != "true"
              ).map(
                (
                  { name, address, pairAddress, Emojis, isDeposited, isBurned },
                  index
                ) => (
                  <tr key={index}>
                    <td>{Emojis}</td>
                    <td className="justify-content-center">
                      {`${name}`}
                      {isDeposited == "true" && (
                        <>
                          <span
                            style={{
                              marginLeft: "8px",
                            }}
                          >
                            🏳️
                          </span>
                        </>
                      )}
                      {isBurned == "true" && (
                        <>
                          <span
                            style={{
                              marginLeft: "8px",
                            }}
                          >
                            🔥
                          </span>
                        </>
                      )}
                    </td>{" "}
                    <td></td>
                    <td
                      onClick={() => {
                        if (address) {
                          navigator.clipboard.writeText(address);
                          alert("Address copied to clipboard!");
                        }
                      }}
                      className={address ? "clickable-address" : ""}
                      title={address ? "Click to copy full address" : ""}
                    >
                      {address
                        ? `${address.slice(0, 6)}...${address.slice(-4)}`
                        : "N/A"}
                    </td>
                    <td
                      onClick={() => {
                        if (pairAddress) {
                          navigator.clipboard.writeText(pairAddress);
                          alert("Address copied to clipboard!");
                        }
                      }}
                      className={pairAddress ? "clickable-pairAddress" : ""}
                      title={
                        pairAddress ? "Click to copy full pairAddress" : ""
                      }
                    >
                      {pairAddress
                        ? `${pairAddress.slice(0, 6)}...${pairAddress.slice(
                            -4
                          )}`
                        : "N/A"}
                    </td>
                    <td>500 Million</td>
                    <td>
                      <button
                        className="btn btn-sm swap-btn btn-primary"
                        onClick={() => BurnPairStateTokens(pairAddress)}
                      >
                        Burn
                      </button>
                    </td>
                    <td></td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  ) : isAddToken ? (
    // addTokensLoading ? (
    //   <div className="container text-center mt-5">
    //     <IOSpinner />
    //     <p className="funny-loading-text">Fetching...</p>
    //   </div>
    // ) :
    <>
      <div className="container  datatablemarginbottom">
        <div className="table-responsive">
          <table className="table table-dark">
            <thead>
              {authorized ? (
                <tr>
                  {/* <th></th> */}
                  <th>Logo</th>
                  <th>Token Name</th>
                  <th>Deploy</th>
                  <th>Token Address/Pair</th>

                  <th>Renounced</th>
                  <th>Time To claim</th>
                  <th>Amount</th>
                  <th>Airdrop</th>
                </tr>
              ) : (
                <tr>
                  <th>Emoticon</th>
                  <th>Token Name</th>

                  {/* <th>Liquidity</th> */}
                  <th></th>
                  <th>Token Address</th>
                  <th>Pair Address</th>
                  <th>Amount</th>
                  <th>Time To claim</th>
                  <th>Airdrop</th>
                  <th>Deposit State</th>
                  <th></th>
                </tr>
              )}
            </thead>
            <tbody>
              {authorized &&
                Addtokens.slice() // Create a copy to avoid mutating the original array
                  .sort((a, b) => {
                    // Normalize values to handle booleans, strings, or undefined
                    const aDeployed = String(a.isDeployed) === "true";
                    const bDeployed = String(b.isDeployed) === "true";
                    const aAdded = String(a.isAdded) === "true";
                    const bAdded = String(b.isAdded) === "true";
                    const aRenounced = String(a.isRenounceToken) === "true";
                    const bRenounced = String(b.isRenounceToken) === "true";

                    // Priority 1: isDeployed == "false", isAdded == "false", isRenounceToken == "false"
                    const aPriority1 = !aDeployed && !aAdded && !aRenounced;
                    const bPriority1 = !bDeployed && !bAdded && !bRenounced;
                    if (aPriority1 && !bPriority1) return -1;
                    if (!aPriority1 && bPriority1) return 1;

                    // Priority 2: isAdded == "false", isRenounceToken == "false"
                    const aPriority2 = !aAdded && !aRenounced;
                    const bPriority2 = !bAdded && !bRenounced;
                    if (aPriority2 && !bPriority2) return -1;
                    if (!aPriority2 && bPriority2) return 1;

                    // Priority 3: isRenounceToken == "false"
                    const aPriority3 = !aRenounced;
                    const bPriority3 = !bRenounced;
                    if (aPriority3 && !bPriority3) return -1;
                    if (!aPriority3 && bPriority3) return 1;

                    // Priority 4: Remaining tokens (maintain original order)
                    return 0;
                  })
                  .map(
                    (
                      {
                        user,
                        name,
                        Emojis,
                        isAdded,
                        TimeLeft,
                        isDeployed,
                        isRenounceToken,
                        TokenAddress,
                      },
                      index
                    ) => (
                      <tr key={index}>
                        <td>
                          <h5>{Emojis}</h5>
                        </td>
                        <td>{name}</td>
                        <td>
                          {isDeployed ? (
                            <span
                              className="badge bg-gradient bg-success px-3 py-2 rounded-pill shadow-lg"
                              style={{ fontSize: "12px" }}
                            >
                              ✅ Token Deployed
                            </span>
                          ) : (
                            <button
                              className="btn btn-sm swap-btn btn-primary"
                              onClick={async () => {
                                try {
                                  await deployWithMetaMask(
                                    name,
                                    name,
                                    Emojis,
                                    address,
                                    Auction_TESTNET,
                                    address
                                  );
                                  await fetchUserTokenAddresses();
                                } catch (error) {
                                  console.error("Deployment failed:", error);
                                }
                              }}
                              disabled={isProcessing == name}
                            >
                              {isProcessing == name ? "Deploying..." : "Deploy"}
                            </button>
                          )}
                        </td>
                        <td>
                          {isAdded ? (
                            <span
                              className="badge bg-gradient bg-success px-3 py-2 rounded-pill shadow-lg"
                              style={{ fontSize: "12px" }}
                            >
                              ✅ Token Added
                            </span>
                          ) : (
                            <div className="d-flex align-items-center justify-content-center gap-2">
                              <div
                                onClick={() => {
                                  if (TokenAddress) {
                                    navigator.clipboard.writeText(TokenAddress);
                                    alert("Address copied to clipboard!");
                                  }
                                }}
                                className={
                                  TokenAddress ? "clickable-TokenAddress" : ""
                                }
                                title={
                                  TokenAddress
                                    ? "Click to copy full TokenAddress"
                                    : ""
                                }
                                style={{
                                  minWidth: "100px",
                                  textAlign: "center",
                                  cursor: "pointer",
                                }}
                              >
                                {TokenAddress
                                  ? `${TokenAddress.slice(
                                      0,
                                      6
                                    )}...${TokenAddress.slice(-4)}`
                                  : "N/A"}
                              </div>

                              <input
                                type="text"
                                className="form-control form-control-sm"
                                placeholder="Enter Pair Address"
                                value={inputValues[name] || ""}
                                onChange={(e) =>
                                  handleInputChange(name, e.target.value)
                                }
                                style={{
                                  width: "140px",
                                  "--placeholder-color": "#6c757d",
                                }}
                              />
                              <button
                                className="btn btn-sm swap-btn btn-primary"
                                onClick={() =>
                                  handleAdd(TokenAddress, name, user, name)
                                }
                                disabled={processingToken === name}
                              >
                                {processingToken === name ? (
                                  <>
                                    <IOSpinner className="me-2" />
                                    Processing...
                                  </>
                                ) : (
                                  "Add"
                                )}
                              </button>
                            </div>
                          )}
                        </td>
                        <td>
                          {isRenounceToken == "true" ? (
                            <span
                              className="badge bg-gradient bg-success px-3 py-2 rounded-pill shadow-lg"
                              style={{ fontSize: "12px" }}
                            >
                              ✅ Token Renounced
                            </span>
                          ) : (
                            <button
                              className="btn btn-sm swap-btn btn-primary"
                              onClick={() =>
                                renounceTokenContract(TokenAddress, name)
                              }
                            >
                              Renounce
                            </button>
                          )}
                        </td>
                        <td className="timer-cell">
                          {formatTimeVerbose(TimeLeft)}
                        </td>
                        <td>500,000</td>
                        <td>
                          <button
                            className="btn btn-sm swap-btn btn-primary"
                            onClick={() => giveRewardForAirdrop(TokenAddress)}
                            disabled={
                              isCliamProcessing == TokenAddress || TimeLeft > 0
                            }
                          >
                            {isCliamProcessing == TokenAddress
                              ? "Processing..."
                              : "Claim"}
                          </button>
                        </td>
                        {isAddingPopupOpen && (
                          <div
                            className="modal d-flex align-items-center justify-content-center"
                            style={{
                              zIndex: 30000,
                              background: "rgba(33, 37, 41, 0.1)",
                              pointerEvents: isAddingPopupOpen
                                ? "auto"
                                : "none",
                            }}
                          >
                            <div className="modal-dialog modal-dialog-centered">
                              <div className="modal-content popup-content">
                                <div className="modal-body">
                                  <div className="tx-progress-container">
                                    <div className="step-line">
                                      <div
                                        className={`step ${
                                          txStatusForAdding === "initiated" ||
                                          txStatusForAdding === "Adding" ||
                                          txStatusForAdding ===
                                            "Status Updating" ||
                                          txStatusForAdding === "confirmed" ||
                                          txStatusForAdding === "error"
                                            ? "active"
                                            : ""
                                        }`}
                                      >
                                        <span className="dot" />
                                        <span className="label">Initiated</span>
                                      </div>
                                      <div
                                        className={`step ${
                                          txStatusForAdding === "Adding" ||
                                          txStatusForAdding ===
                                            "Status Updating" ||
                                          txStatusForAdding === "confirmed" ||
                                          txStatusForAdding === "error"
                                            ? "active"
                                            : ""
                                        }`}
                                      >
                                        <span className="dot" />
                                        <span className="label">Adding</span>
                                      </div>
                                      <div
                                        className={`step ${
                                          txStatusForAdding ===
                                            "Status Updating" ||
                                          txStatusForAdding === "confirmed" ||
                                          txStatusForAdding === "error"
                                            ? "active"
                                            : ""
                                        }`}
                                      >
                                        <span className="dot" />
                                        <span className="label">
                                          Status update
                                        </span>
                                      </div>
                                      <div
                                        className={`step ${
                                          txStatusForAdding === "confirmed" ||
                                          txStatusForAdding === "error"
                                            ? "active"
                                            : ""
                                        }`}
                                      >
                                        <span className="dot" />
                                        <span className="label">
                                          {txStatusForAdding === "error"
                                            ? "Error"
                                            : "Confirmed"}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </tr>
                    )
                  )}

              {!authorized && (
                <>
                  {pendingToken && (
                    <tr>
                      <td
                        colSpan={14}
                        style={{
                          textAlign: "center",
                          fontWeight: "bold",
                        }}
                      >
                        {`${pendingToken} Token will be listed in 24-48 hr`}
                      </td>
                    </tr>
                  )}
                  {OwnersTokens.map(
                    (
                      {
                        name,
                        address,
                        pairAddress,
                        Emojis,
                        nextClaimTime,
                        isDeposited,
                      },
                      index
                    ) => (
                      <tr key={index}>
                        <td>{Emojis}</td>
                        <td className="justify-content-center">
                          {`${name}`}
                          {isDeposited == "true" && (
                            <>
                              <span
                                style={{
                                  marginLeft: "8px",
                                }}
                              >
                                🏳️
                              </span>
                            </>
                          )}
                        </td>{" "}
                        <td></td>
                        <td
                          onClick={() => {
                            if (address) {
                              navigator.clipboard.writeText(address);
                              alert("Address copied to clipboard!");
                            }
                          }}
                          className={address ? "clickable-address" : ""}
                          title={address ? "Click to copy full address" : ""}
                        >
                          {address
                            ? `${address.slice(0, 6)}...${address.slice(-4)}`
                            : "N/A"}
                        </td>
                        <td
                          onClick={() => {
                            if (pairAddress) {
                              navigator.clipboard.writeText(pairAddress);
                              alert("Address copied to clipboard!");
                            }
                          }}
                          className={pairAddress ? "clickable-pairAddress" : ""}
                          title={
                            pairAddress ? "Click to copy full pairAddress" : ""
                          }
                        >
                          {pairAddress
                            ? `${pairAddress.slice(0, 6)}...${pairAddress.slice(
                                -4
                              )}`
                            : "N/A"}
                        </td>
                        <td>2,500,000</td>
                        <td>{formatTimeVerbose(nextClaimTime)}</td>
                        <td>
                          <button
                            className="btn btn-sm swap-btn btn-primary"
                            onClick={() => giveRewardForAirdrop(address)}
                            disabled={
                              isCliamProcessing == address || nextClaimTime > 0
                            }
                          >
                            {isCliamProcessing == address
                              ? "Processing..."
                              : "Claim"}
                          </button>
                        </td>
                        <td>
                          <button
                            className="btn btn-sm swap-btn btn-primary"
                            onClick={() => DepositStateBack(address)}
                            disabled={isDeposited == "true"}
                          >
                            500 million
                          </button>
                        </td>
                        <td></td>
                      </tr>
                    )
                  )}
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  ) : (
    <></>
  );
};

export default DataTable;
