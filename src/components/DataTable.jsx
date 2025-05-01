import "bootstrap/dist/css/bootstrap.min.css";
import "../Styles/DataTable.css";
// import MetaMaskIcon from "../assets/metamask-icon.png";
import { useLocation } from "react-router-dom";
import { useSwapContract } from "../Functions/SwapContractFunctions";
import { useEffect, useState } from "react";
import { formatWithCommas } from "./DetailsInfo";
import { useAuctionTokens } from "../data/auctionTokenData";
import { useDAvContract } from "../Functions/DavTokenFunctions";
import { Addresses } from "../data/AddressMapping";
import { useAccount } from "wagmi";
import { useAddTokens, useUsersOwnerTokens } from "../data/AddTokens";

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
    CheckMintBalance,
  } = useSwapContract();

  const location = useLocation();
  const isAuction = location.pathname === "/auction";
  const isAddToken = location.pathname === "/AddToken";
  const [errorPopup, setErrorPopup] = useState({});
  const [checkingStates, setCheckingStates] = useState({});
  const [inputValues, setInputValues] = useState({});
  // Handle input change for tokenAddress or pairAddress for a specific user
  const handleInputChange = (user, field, value) => {
    setInputValues((prev) => ({
      ...prev,
      [user]: {
        ...prev[user],
        [field]: value,
      },
    }));
  };

  // Handle Add button click (calls AddTokenIntoSwapContract)
  const handleAdd = (name, user) => {
    const { tokenAddress = "", pairAddress = "" } = inputValues[name] || {};
    console.log(
      `Add clicked for token ${name} with tokenAddress: ${tokenAddress}, pairAddress: ${pairAddress}, user: ${user}`
    );
    AddTokenIntoSwapContract(tokenAddress, pairAddress, user);
  };
  console.log("required dav amount", DavRequiredAmount);

  const Checking = async (id, ContractName) => {
    setCheckingStates((prev) => ({ ...prev, [id]: true }));
    try {
      const AddressMapping = Addresses[ContractName];
      console.log("address get from mapping", AddressMapping);
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

  const AuthAddress = import.meta.env.VITE_AUTH_ADDRESS.toLowerCase();
  const handleSetAddress = () => {
    if (!address) {
      setAuthorized(false);
      console.warn("Wallet address not available");
      return;
    }

    setAuthorized(AuthAddress === address.toLowerCase());
    console.log(address);
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
                ? Addtokens.map(({ image, user, name, TimeLeft }, index) => (
                    <tr key={index}>
                      <td>
                        <div className="nameImage">
                          <img src={image} width={40} height={40} alt="Logo" />
                        </div>
                      </td>
                      <td>{name}</td>
                      <td>
                        <div className="d-flex align-items-center justify-content-center gap-2">
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="Enter Token Address"
                            value={inputValues[name]?.tokenAddress || ""}
                            onChange={(e) =>
                              handleInputChange(
                                name,
                                "tokenAddress",
                                e.target.value
                              )
                            }
                            style={{ width: "120px" }}
                          />
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="Enter Pair Address"
                            value={inputValues[name]?.pairAddress || ""}
                            onChange={(e) =>
                              handleInputChange(
                                name,
                                "pairAddress",
                                e.target.value
                              )
                            }
                            style={{ width: "120px" }}
                          />
                          <button
                            className="btn btn-sm swap-btn btn-primary"
                            onClick={() => handleAdd(name, user)}
                          >
                            Add
                          </button>
                        </div>
                      </td>
                      <td>
                        <button className="btn btn-sm swap-btn btn-primary">
                          Renounce
                        </button>
                      </td>
                      <td>{TimeLeft}</td>
                      <td>{TimeLeft}</td>
                      <td>
                        <button
                          className="btn btn-sm swap-btn btn-primary"
                          onClick={() =>
                            deployWithMetaMask(name, name, address, address)
                          }
                        >
                          Deploy
                        </button>
                      </td>
                    </tr>
                  ))
                : OwnersTokens.map(({ name, address }, index) => (
                    <tr key={index}>
                      <td></td>
                      <td>
                       
                      </td>
                      <td>{name}</td>
                      <td>{address}</td>
                      <td></td>
                      <td>--</td>
                      <td>--</td>
                      <td>--</td>
                      <td>--</td>
                      <td>--</td>
                      <td></td>
                    </tr>
                  ))}
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
