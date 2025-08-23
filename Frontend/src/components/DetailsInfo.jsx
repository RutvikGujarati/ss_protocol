import "bootstrap/dist/css/bootstrap.min.css";
import "../Styles/DetailsInfo.css";
import "../Styles/SearchInfo.css";
import MetaMaskIcon from "../assets/metamask-icon.png";
import gecko from "../assets/gecko.svg";
import { useSwapContract } from "../Functions/SwapContractFunctions";
import PropTypes from "prop-types";
import { useContext, useEffect, useState, useMemo, useCallback, memo } from "react";
import { TokensDetails } from "../data/TokensDetails";
import { useDAvContract } from "../Functions/DavTokenFunctions";
import { Tooltip } from "bootstrap";
import IOSpinner from "../Constants/Spinner";
import toast from "react-hot-toast";
import dav from "../assets/davlogo.png";
import state from "../assets/statelogo.png";
import useTokenBalances from "./Swap/UserTokenBalances";
import { ContractContext } from "../Functions/ContractInitialize";
import { useAllTokens } from "./Swap/Tokens";
import { useChainId } from "wagmi";
import { explorerUrls } from "../Constants/ContractAddresses";
import { chainCurrencyMap } from "../../WalletConfig";

export const formatWithCommas = (value) => {
  if (value === null || value === undefined) return "";
  const valueString = value.toString();
  const [integerPart, decimalPart] = valueString.split(".");
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return decimalPart ? `${formattedInteger}.${decimalPart}` : formattedInteger;
};

// Helper functions (exported for use in other files)
export function calculatePlsValue(token, tokenBalances, pstateToPlsRatio, chainId) {
  if (token.tokenName === "DAV" || token.tokenName === "STATE") {
    return "-----";
  }

  const userBalance = tokenBalances[token.tokenName];
  const tokenRatio = token.ratio;
  const ratio = parseFloat(pstateToPlsRatio || 0);

  if (userBalance === undefined || !tokenRatio || ratio <= 0) {
    return "Loading...";
  }

  const pstateValue = parseFloat(userBalance) * parseFloat(tokenRatio);
  const plsValue = pstateValue * ratio;
  const roundedPlsValue = Math.round(plsValue / 1000) * 1000;

  return `${formatWithCommas(roundedPlsValue.toFixed(0))} ${chainCurrencyMap[chainId] || 'PLS'}`;
}

export function calculatePlsValueNumeric(token, tokenBalances, pstateToPlsRatio) {
  if (token.tokenName === "DAV" || token.tokenName === "STATE") {
    return 0;
  }

  const userBalance = tokenBalances[token.tokenName];
  const tokenRatio = token.ratio;
  const ratio = parseFloat(pstateToPlsRatio || 0);

  if (!tokenRatio || tokenRatio === "not started" || tokenRatio === "not listed") {
    return 0;
  }
  if (userBalance === undefined || !tokenRatio || ratio <= 0) {
    return 0;
  }

  const pstateValue = parseFloat(userBalance) * parseFloat(tokenRatio);
  const plsValue = pstateValue * ratio;
  const roundedPlsValue = Math.round(plsValue / 1000) * 1000;

  return roundedPlsValue;
}

// Memoized token row component
const TokenRow = memo(({
  token,
  tokenBalances,
  pstateToPlsRatio,
  chainId,
  totalStateBurned,
  showDot,
  handleAddToken,
  DavAddress,
  setDavAndStateIntoSwap,
  nativeSymbol,
  explorerUrl
}) => {
  const handleCopyAddress = useCallback(() => {
    navigator.clipboard.writeText(token.TokenAddress);
    toast.success(
      `${token.tokenName} Address copied to clipboard!`,
      {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: false,
        theme: "dark",
      }
    );
  }, [token.TokenAddress, token.tokenName]);

  const handleAddTokenClick = useCallback(() => {
    handleAddToken(
      token.TokenAddress,
      token.tokenName === "DAV"
        ? (chainId === 137 ? "mDAV" : "pDAV")
        : token.tokenName === "STATE"
          ? (chainId === 137 ? "mSTATE" : "pSTATE")
          : token.tokenName
    );
  }, [handleAddToken, token.TokenAddress, token.tokenName, chainId]);

  const isImageUrl = (url) => {
    return (
      typeof url === "string" &&
      url.startsWith("https://") &&
      url.includes("ipfs")
    );
  };

  return (
    <tr>
      <td className="text-center align-middle">
        <div className="d-flex flex-column align-items-center">
          <span style={{ fontSize: "1rem", lineHeight: "1" }}>
            {token.tokenName === "DAV" ? (
              <img
                src={dav}
                style={{ width: "30px", height: "30px", borderRadius: "50%" }}
                alt="DAV logo"
              />
            ) : token.tokenName === "STATE" ? (
              <img
                src={state}
                style={{ width: "30px", height: "30px", borderRadius: "50%" }}
                alt="STATE logo"
              />
            ) : isImageUrl(token.emoji) ? (
              <img
                src={token.emoji}
                style={{ width: "30px", height: "30px", borderRadius: "50%" }}
                alt={`${token.tokenName} emoji`}
              />
            ) : (
              <span style={{ fontSize: "20px" }}>
                {token.emoji}
              </span>
            )}
          </span>
          <span>
            {token.tokenName === "DAV"
              ? (chainId === 137 ? "mDAV" : "pDAV")
              : token.tokenName === "STATE"
                ? (chainId === 137 ? "mSTATE" : "pSTATE")
                : token.tokenName}
          </span>
        </div>
      </td>
      <td className="text-center">
        <div className="mx-2">
          {token.tokenName === "DAV" || token.tokenName === "STATE"
            ? "------"
            : (
              <span style={{ color: showDot ? "#28a745" : "inherit" }}>
                {`1:${formatWithCommas(token.ratio)}`}
              </span>
            )}
        </div>
      </td>
      <td className="text-center">
        <div className="mx-4">
          {token.tokenName === "DAV" || token.tokenName === "STATE"
            ? "-----"
            : `${token.Cycle}/20`}
        </div>
      </td>
      <td className="text-center">
        <div className="mx-4">
          {token.tokenName === "DAV"
            ? "-----"
            : `${formatWithCommas(token.DavVault)}`}
        </div>
      </td>
      <td className="text-center">
        <div className="mx-4">
          {token.tokenName === "DAV" ? (
            "-----"
          ) : token.tokenName === "STATE" ? (
            Number(token.burned || 0) + Number(totalStateBurned) === 0 ? (
              <span className="blink-new">NEW</span>
            ) : (
              formatWithCommas(
                Number(token.burned || 0) + Number(totalStateBurned)
              )
            )
          ) : (
            Number(token.burned || 0) === 0 ? (
              <span className="blink-new">NEW</span>
            ) : (
              formatWithCommas(token.burned || 0)
            )
          )}
        </div>
      </td>
      <td className="text-center">
        <div className="mx-4">
          {token.tokenName === "DAV"
            ? "-----"
            : `${formatWithCommas(token.BurnedLp)}`}
        </div>
      </td>
      <td className="text-center">
        <div className="d-flex justify-content-center align-items-center gap-3">
          <div className="d-flex flex-column align-items-center">
            {token.tokenName === "DAV" || token.tokenName === "STATE" ? (
              <span>-----</span>
            ) : (
              <a
                href={`https://www.geckoterminal.com/pulsechain/pools/${token.PairAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: "15px", color: "white" }}
              >
                <img
                  src={gecko}
                  alt="Gecko"
                  style={{ width: "20px", height: "20px" }}
                />
              </a>
            )}
          </div>
          <div className="d-flex flex-column align-items-center">
            <a
              href={`${explorerUrl}${token.TokenAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: "15px", color: "white" }}
            >
              <i className="bi bi-box-arrow-up-right"></i>
            </a>
          </div>
          <div
            className="d-flex flex-column align-items-center"
            style={{ cursor: "pointer" }}
          >
            <i
              className="fa-solid fa-copy"
              onClick={handleCopyAddress}
              title="Copy Address"
              style={{
                fontSize: "15px",
                color: "white",
                cursor: "pointer",
              }}
            ></i>
          </div>
          <div
            className="d-flex align-items-center"
            style={{ marginRight: "-10px" }}
          >
            <img
              src={MetaMaskIcon}
              onClick={handleAddTokenClick}
              alt="MetaMask"
              style={{
                width: "20px",
                height: "20px",
                cursor: "pointer",
              }}
            />
          </div>
          <div
            className="d-flex flex-column align-items-center"
            style={{ minWidth: "80px" }}
          >
            {token.tokenName === "DAV" ? (
              token.isRenounced === true && (
                <span>Renounced</span>
              )
            ) : token.tokenName === "STATE" ? (
              DavAddress === "0x0000000000000000000000000000000000000000" ? (
                <button
                  className="btn btn-sm swap-btn btn-primary"
                  onClick={() => setDavAndStateIntoSwap()}
                >
                  Add
                </button>
              ) : token.isRenounced === true ? (
                <span>Renounced</span>
              ) : (
                <span>ADDED</span>
              )
            ) : token.isRenounced === "true" ? (
              <span>Renounced</span>
            ) : (
              <span>-------</span>
            )}
          </div>
        </div>
      </td>
      <td className="text-center">
        <div className="mx-2">
          {calculatePlsValue(token, tokenBalances, pstateToPlsRatio, chainId)}
        </div>
      </td>
      <td></td>
    </tr>
  );
});

TokenRow.displayName = 'TokenRow';

const DetailsInfo = ({ selectedToken }) => {
  const {
    setDBRequired,
    setDBForBurnRequired,
    setDavAndStateIntoSwap,
    handleAddToken,
    DavAddress,
    pstateToPlsRatio,
  } = useSwapContract();

  const chainId = useChainId();
  const { totalStateBurned } = useDAvContract();
  const [localSearchQuery, setLocalSearchQuery] = useState("");
  const { tokens, loading } = TokensDetails();
  const { signer } = useContext(ContractContext);
  const TOKENS = useAllTokens();
  const tokenBalances = useTokenBalances(TOKENS, signer);

  // Memoized values
  const nativeSymbol = useMemo(() => chainCurrencyMap[chainId] || 'PLS', [chainId]);
  const explorerUrl = useMemo(() => explorerUrls[chainId] || "https://defaultexplorer.io/address/", [chainId]);
  const isInfoPage = useMemo(() => location.pathname === "/info", []);

  // Memoized filtered tokens
  const filteredTokens = useMemo(() => {
    if (!localSearchQuery.trim()) return tokens;

    return tokens.filter((item) => {
      const searchQuery = localSearchQuery.toLowerCase();
      const tokenName = item.tokenName.toLowerCase();

      if (["p", "pd", "pda", "pdav"].includes(searchQuery) && item.tokenName === "DAV") {
        return true;
      }
      if (["p", "ps", "psta", "pstat", "pstate"].includes(searchQuery) && item.tokenName === "STATE") {
        return true;
      }
      return tokenName.includes(searchQuery);
    });
  }, [tokens, localSearchQuery]);

  // Memoized sorting function
  const getSortedTokens = useCallback((tokensToSort) => {
    const order = { DAV: 0, STATE: 1 };

    const priorityTokens = tokensToSort
      .filter((t) => order[t.tokenName] !== undefined)
      .sort((a, b) => (order[a.tokenName] ?? 99) - (order[b.tokenName] ?? 99));

    const topFiveTokens = tokensToSort
      .filter(
        (t) =>
          order[t.tokenName] === undefined && t.ratio != null && t.isSupported
      )
      .sort((a, b) => {
        const aRatio = a.ratio ?? -Infinity;
        const bRatio = b.ratio ?? -Infinity;
        return bRatio - aRatio;
      })
      .slice(0, 5);

    const remainingTokens = tokensToSort
      .filter(
        (t) =>
          order[t.tokenName] === undefined &&
          !topFiveTokens.some((top) => top.tokenName === t.tokenName) &&
          t.isSupported
      )
      .sort((a, b) => {
        const aRatio = a.ratio ?? -Infinity;
        const bRatio = b.ratio ?? -Infinity;
        return bRatio - aRatio;
      });

    return [...priorityTokens, ...topFiveTokens, ...remainingTokens];
  }, []);

  // Memoized sorted tokens
  const sortedTokens = useMemo(() => {
    const supportedTokens = tokens.filter((token) => token.isSupported);
    return getSortedTokens(localSearchQuery ? filteredTokens : supportedTokens);
  }, [tokens, filteredTokens, localSearchQuery, getSortedTokens]);

  // Memoized data to show
  const dataToShow = useMemo(() => {
    return selectedToken
      ? tokens.find((token) => token.tokenName === selectedToken.name)
      : sortedTokens[0] || null;
  }, [selectedToken, tokens, sortedTokens]);

  // Memoized green dot eligible tokens
  const greenDotEligibleTokens = useMemo(() => {
    const tokensToCheck = loading ? filteredTokens : tokens.filter(t => t.isSupported);

    return tokensToCheck
      .filter(
        (token) =>
          token.isSupported &&
          token.tokenName !== "DAV" &&
          token.tokenName !== "STATE" &&
          token.ratio != null
      )
      .sort((a, b) => {
        const aRatio = a.ratio ?? -Infinity;
        const bRatio = b.ratio ?? -Infinity;
        return bRatio - aRatio;
      })
      .slice(0, 5)
      .map((token) => token.tokenName);
  }, [loading, filteredTokens, tokens]);

  // Memoized total sum calculation
  const totalSum = useMemo(() => {
    const sum = sortedTokens.reduce((sum, token) => {
      return sum + calculatePlsValueNumeric(token, tokenBalances, pstateToPlsRatio);
    }, 0);
    return formatWithCommas(sum.toFixed(0));
  }, [sortedTokens, tokenBalances, pstateToPlsRatio]);

  // Optimized search handler
  const handleSearch = useCallback((e) => {
    setLocalSearchQuery(e.target.value.trim());
  }, []);

  // Effects
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === "DavBalanceRequire") {
        setDBRequired(event.newValue);
      }
      if (event.key === "DavBalanceRequireForBurn") {
        setDBForBurnRequired(event.newValue);
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [setDBRequired, setDBForBurnRequired]);

  useEffect(() => {
    const nameCells = document.querySelectorAll(".name-cell");
    nameCells.forEach((cell) => {
      cell.style.cursor = "pointer";
    });
  }, []);

  useEffect(() => {
    const tooltipTriggerList = document.querySelectorAll(
      '[data-bs-toggle="tooltip"]'
    );
    tooltipTriggerList.forEach((el) => {
      new Tooltip(el);
    });
  }, []);

  return (
    <div className="container mt-3 p-0 pb-4 mb-5">
      <div className="mb-3 d-flex justify-content-center align-items-center gap-3">
        <input
          type="text"
          className="form-control text-center"
          placeholder="SEARCH"
          value={localSearchQuery}
          onChange={handleSearch}
          style={{ maxWidth: "300%", "--placeholder-color": "#6c757d" }}
        />
      </div>

      <div className={`table-responsive ${isInfoPage ? "info-page" : ""}`}>
        {dataToShow ? (
          <>
            <table className="table table-dark">
              <thead>
                <tr>
                  <th className="text-center">Token <br /> Name</th>
                  <th className="text-center">Current <br /> Ratio</th>
                  <th className="text-center">Auctions</th>
                  <th className="text-center">DAV Vault</th>
                  <th className="text-center">Burned</th>
                  <th className="text-center">Burned LP <br />(Combined)</th>
                  <th className="text-center">Info</th>
                  <th className="text-center">
                    Your Est. {nativeSymbol} Value <br />
                    {loading ? (
                      <IOSpinner />
                    ) : (
                      `${totalSum} ${nativeSymbol}`
                    )}
                  </th>
                  <th className="col-auto"></th>
                </tr>
              </thead>
              <tbody>
                {sortedTokens.map((token) => (
                  <TokenRow
                    key={token.tokenName}
                    token={token}
                    tokenBalances={tokenBalances}
                    pstateToPlsRatio={pstateToPlsRatio}
                    chainId={chainId}
                    totalStateBurned={totalStateBurned}
                    showDot={greenDotEligibleTokens.includes(token.tokenName)}
                    handleAddToken={handleAddToken}
                    DavAddress={DavAddress}
                    setDavAndStateIntoSwap={setDavAndStateIntoSwap}
                    nativeSymbol={nativeSymbol}
                    explorerUrl={explorerUrl}
                  />
                ))}
              </tbody>
            </table>

            {loading && filteredTokens.length > 0 && (
              <div className="container text-center mt-5">
                <p className="funny-loading-text">
                  <IOSpinner /> Fetching..
                </p>
              </div>
            )}

            {!loading && filteredTokens.length === 0 && (
              <div className="alert alert-warning text-center" role="alert">
                No tokens found matching the search query.
              </div>
            )}
          </>
        ) : (
          <div className="alert alert-warning text-center" role="alert">
            No tokens available to display.
          </div>
        )}
      </div>
    </div>
  );
};

DetailsInfo.propTypes = {
  selectedToken: PropTypes.object,
};

export default memo(DetailsInfo);