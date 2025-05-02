import "bootstrap/dist/css/bootstrap.min.css";
import "../Styles/DataTable.css";
// import MetaMaskIcon from "../assets/metamask-icon.png";
import { useLocation } from "react-router-dom";
import { useSwapContract } from "../Functions/SwapContractFunctions";
import { useEffect, useState } from "react";
import { formatWithCommas } from "./DetailsInfo";
import { useAuctionTokens } from "../data/auctionTokenData";
import { useDAvContract } from "../Functions/DavTokenFunctions";
import { useAccount } from "wagmi";
import { useAddTokens, useUsersOwnerTokens } from "../data/AddTokens";
import { Auction_TESTNET } from "../ContractAddresses";

const DataTable = () => {
  const { davHolds, deployWithMetaMask } = useDAvContract();
  const { address } = useAccount();

  const {
    DavRequiredAmount,
    DavBalanceRequire,
    swappingStates,
    buttonTextStates,
    AirDropAmount,
    AddTokenIntoSwapContract,
    renounceTokenContract,
    CheckMintBalance,
    tokenMap,
    giveRewardForAirdrop,
  } = useSwapContract();

  const location = useLocation();
  const isAuction = location.pathname === "/auction";
  const isAddToken = location.pathname === "/AddToken";
  const [errorPopup, setErrorPopup] = useState({});
  const [checkingStates, setCheckingStates] = useState({});
  const [inputValues, setInputValues] = useState({});
  // Handle input change for tokenAddress or pairAddress for a specific user
  const handleInputChange = (tokenName, value) => {
    setInputValues((prev) => ({
      ...prev,
      [tokenName]: value, // store pairAddress directly
    }));
  };

  // Handle Add button click (calls AddTokenIntoSwapContract)
  const handleAdd = (tokenAddress, tokenName, user) => {
    const pairAddress = inputValues[tokenName] || "";
    console.log(
      `Add clicked for token ${tokenName} with tokenAddress: ${tokenAddress}, pairAddress: ${pairAddress}, user: ${user}`
    );
    AddTokenIntoSwapContract(tokenAddress, pairAddress, user);
  };
  function formatTimeVerbose(seconds) {
    if (typeof seconds !== "number" || isNaN(seconds) || seconds <= 0)
      return "0";

    const days = Math.floor(seconds / 86400);
    const hrs = Math.floor((seconds % 86400) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60); // in case it's float

    return `${days}d ${hrs}h ${mins}m ${secs}s`;
  }

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
        e.reason === `No new DAV holdings` ||
        (e.revert &&
          e.revert.args &&
          e.revert.args[0] === `No new DAV holdings`)
      ) {
        console.error(`No new DAV holdings:`, e);
        setErrorPopup((prev) => ({ ...prev, [id]: true }));
      } else {
        console.error("Error calling CheckMintBalance:", e);
      }
    }
    setCheckingStates((prev) => ({ ...prev, [id]: false }));
  };

  console.log("db required for Auction", DavBalanceRequire);

  const tokens = useAuctionTokens();
  const Addtokens = useAddTokens();
  const OwnersTokens = useUsersOwnerTokens();
  console.log("obj tokens", tokens);
  const [authorized, setAuthorized] = useState(false);

  const AuthAddress = import.meta.env.VITE_AUTH_ADDRESS;
  const handleSetAddress = () => {
    if (!address) {
      setAuthorized(false);
      console.warn("Wallet address not available");
      return;
    }

    setAuthorized(AuthAddress?.toLowerCase() === address.toLowerCase());

    console.log("comparing auth address", address);
  };
  useEffect(() => {
    handleSetAddress();
  }, [address, AuthAddress]);

  return isAuction ? (
    <div className="container  datatablemarginbottom">
      <div className="table-responsive">
        <table className="table table-dark">
          <thead>
            <tr>
              <th></th>
              <th>Name</th>
              <th>Claim</th>
              <th>Auction Timer</th>
              {/* <th>Liquidity</th> */}
              <th></th>
              <th>Current Ratio</th>
              <th>Ratio Swap</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {tokens
              .filter(
                ({
                  userHasSwapped,
                  name,
                  userHasReverse,
                  isReversing,
                  AuctionStatus,
                }) => {
                  console.log(`Filter Conditions:${name}`, {
                    userHasSwapped,
                    userHasReverse,
                    isReversing,
                    AuctionStatus,
                    // dbCheck: db >= DavRequiredAmount,
                  });

                  if (AuctionStatus == "false" && isReversing == "true") {
                    if (userHasReverse == "false") {
                      return true;
                    } else if (userHasSwapped && isReversing == "false") {
                      return false;
                    }
                  } else if (AuctionStatus == "true") {
                    if (userHasSwapped == "false") {
                      return true;
                    }
                  }
                }
              )
              .map(
                (
                  {
                    id,
                    name,
                    Pname,
                    image,
                    currentRatio,
                    SwapT,
                    ContractName,
                    isReversing,
                    AirdropClaimedForToken,
                    // AuctionStatus,
                    ReverseName,
                    TimeLeft,
                    inputTokenAmount,
                    onlyInputAmount,
                    // handleAddToken,
                    outputToken,
                  },
                  index
                ) => (
                  <tr key={index}>
                    <td></td>
                    <td>
                      <div className="tableName d-flex gap-5 align-items-center">
                        <div className="nameImage">
                          <img src={image} width={40} height={40} alt="Logo" />
                        </div>
                        <div className="nameDetails">
                          <h5 className="nameBig">{name}</h5>
                          {isReversing == "true" ? (
                            <p className="nameSmall mb-1 uppercase px-2 mx-5">
                              {ReverseName}
                            </p>
                          ) : (
                            <p className="nameSmall mb-1 uppercase">{Pname}</p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td>
                      <button
                        onClick={() => Checking(id, ContractName)}
                        className="btn btn-primary btn-sm swap-btn"
                        disabled={checkingStates[id] || davHolds == 0}
                      >
                        {checkingStates[id]
                          ? ` AIRDROPPING...`
                          : AirdropClaimedForToken == "true"
                          ? " AIRDROP CLAIMED"
                          : `${formatWithCommas(AirDropAmount)} `}
                      </button>
                    </td>

                    <td>{TimeLeft}</td>
                    <td className="text-success"></td>
                    <td>{currentRatio}</td>

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
                      </div>
                    </td>
                    {errorPopup[id] && (
                      <div className="popup-overlay">
                        <div className="popup-content">
                          <h4 className="popup-header">
                            Mint Additional DAV Tokens
                          </h4>
                          <p className="popup-para">
                            You need to mint additional DAV tokens to claim
                            extra rewards.
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
                      <div className="d-flex align-items-center gap-2">
                        <>
                          {isReversing == "true" && (
                            <button
                              onClick={() => SwapT()}
                              disabled={
                                swappingStates[id] || outputToken <= "1"
                              }
                              className={`btn btn-sm swap-btn btn-primary btn-sm swap-btn `}
                            >
                              {swappingStates[id]
                                ? "Swapping..."
                                : "Reverse Swap"}
                            </button>
                          )}

                          {isReversing == "false" && (
                            <button
                              onClick={() => SwapT()}
                              //   disabled={swappingStates[id] || onlyInputAmount <= 0}
                              className={`btn btn-sm swap-btn btn-primary btn-sm swap-btn `}
                            >
                              {swappingStates[id]
                                ? "Swapping..."
                                : buttonTextStates[id] || "Swap"}
                            </button>
                          )}
                        </>

                        {/* <img
                          src={MetaMaskIcon}
                          width={20}
                          height={20}
                          onClick={handleAddToken}
                          alt="Logo"
                          style={{ cursor: "pointer" }}
                        /> */}
                      </div>
                    </td>
                  </tr>
                )
              )}
          </tbody>
        </table>
      </div>
    </div>
  ) : isAddToken ? (
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
                  <th>Token Address/Pair</th>

                  <th>Renounced</th>
                  <th>Time To claim</th>
                  <th>Amount</th>
                  <th>Airdrop</th>
                  <th>Deploy</th>
                </tr>
              ) : (
                <tr>
                  <th></th>
                  <th>Logo</th>
                  <th>Token Name</th>
                  <th>Token Address</th>
                  {/* <th>Liquidity</th> */}
                  <th></th>
                  <th>Supply</th>
                  <th>Pair</th>
                  <th>Amount</th>
                  <th>Time To claim</th>
                  <th>Airdrop</th>
                  <th></th>
                </tr>
              )}
            </thead>
            <tbody>
              {authorized
                ? Addtokens.map(
                    ({ image, user, name, TimeLeft, TokenAddress }, index) => (
                      <tr key={index}>
                        <td>
                          <div className="nameImage">
                            <img
                              src={image}
                              width={40}
                              height={40}
                              alt="Logo"
                            />
                          </div>
                        </td>
                        <td>{name}</td>
                        <td>
                          <div className="d-flex align-items-center justify-content-center gap-2">
                            <td
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
                            >
                              {TokenAddress
                                ? `${TokenAddress.slice(
                                    0,
                                    6
                                  )}...${TokenAddress.slice(-4)}`
                                : "N/A"}
                            </td>
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              placeholder="Enter Pair Address"
                              value={inputValues[name] || ""}
                              onChange={(e) =>
                                handleInputChange(name, e.target.value)
                              }
                              style={{ width: "120px" }}
                            />
                            <button
                              className="btn btn-sm swap-btn btn-primary"
                              onClick={() =>
                                handleAdd(TokenAddress, name, user)
                              }
                            >
                              Add
                            </button>
                          </div>
                        </td>
                        <td>
                          <button
                            className="btn btn-sm swap-btn btn-primary"
                            onClick={() =>
                              renounceTokenContract(TokenAddress, name)
                            }
                            disabled
                          >
                            Renounce
                          </button>
                        </td>
                        <td>{formatTimeVerbose(TimeLeft)}</td>

                        <td>500,000</td>
                        <td>
                          <button
                            className="btn btn-sm swap-btn btn-primary"
                            onClick={() => giveRewardForAirdrop(TokenAddress)}
                          >
                            Claim
                          </button>
                        </td>
                        <td>
                          <button
                            className="btn btn-sm swap-btn btn-primary"
                            onClick={() =>
                              deployWithMetaMask(
                                name,
                                name,
                                address,
                                Auction_TESTNET
                              )
                            }
                          >
                            Deploy
                          </button>
                        </td>
                      </tr>
                    )
                  )
                : OwnersTokens.map(
                    (
                      { image, name, address, pairAddress, nextClaimTime },
                      index
                    ) => (
                      <tr key={index}>
                        <td></td>
                        <td>
                          <div className="nameImage">
                            <img
                              src={image}
                              width={40}
                              height={40}
                              alt="Logo"
                            />
                          </div>
                        </td>
                        <td>{name}</td>
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
                        <td></td>
                        <td>500 Billion</td>
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
                          >
                            Claim
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
  ) : (
    <></>
  );
};

export default DataTable;
