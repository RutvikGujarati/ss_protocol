import "bootstrap/dist/css/bootstrap.min.css";
import "../../Styles/InfoCards.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { useContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import PLSLogo from "../../assets/pls1.png";
import BNBLogo from "../../assets/bnb.png";
import matic from "../../assets/matic-token-icon.png";
import sonic from "../../assets/S_token.svg";
import { calculatePlsValueNumeric, formatWithCommas } from ".././DetailsInfo";
import { TokensDetails } from "../../data/TokensDetails";
import { useDAvContract } from "../../Functions/DavTokenFunctions";
import DotAnimation from "../../Animations/Animation";
import { useAccount, useChainId } from "wagmi";
import { faCheck, faCopy } from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";
import { useSwapContract } from "../../Functions/SwapContractFunctions";
import { chainCurrencyMap } from "../../../WalletConfig";
import TxProgressModal from "../TxProgressModal";
import useTokenBalances from "../Swap/UserTokenBalances";
import { useAllTokens } from "../Swap/Tokens";
import { ContractContext } from "../../Functions/ContractInitialize";

const AuctionSection = () => {
    const chainId = useChainId();
    const { tokens } = TokensDetails();
    const TOKENS = useAllTokens();
    const { signer } = useContext(ContractContext);
    const tokenBalances = useTokenBalances(TOKENS, signer);
    const { address } = useAccount();
    const {
        mintDAV,
        claimableAmount,
        isLoading,
        claimAmount,
        davHolds,
        davExpireHolds,
        ReferralAMount,
        stateHolding,
        DavMintFee,
        txStatus,
        ReferralCodeOfUser,
        davGovernanceHolds,
        totalInvestedPls,
    } = useDAvContract();
    const { CalculationOfCost, TotalCost, getAirdropAmount, getInputAmount, getOutPutAmount, pstateToPlsRatio } = useSwapContract();
    const [amount, setAmount] = useState("");
    const [Refferalamount, setReferralAmount] = useState("");
    const [load, setLoad] = useState(false);
    const [copied, setCopied] = useState(false);
    const [copiedCode, setCopiedCode] = useState("");
    const AuthAddress = import.meta.env.VITE_AUTH_ADDRESS;
    const nativeSymbol = chainCurrencyMap[chainId] || 'PLS';
    const setBackLogo = () => {
        if (chainId === 369) return PLSLogo;
        else if (chainId === 56) return BNBLogo;
        else if (chainId === 137) return matic;
        else if (chainId === 146) return sonic;
        return PLSLogo;
    };
    const mintSteps = [
        { key: "initiated", label: "Initiated" },
        { key: "pending", label: "Pending" },
        { key: "confirmed", label: "Confirmed" },
        { key: "error", label: "Error" },
    ];
    const getLogoSize = () => {
        return chainId === 56
            ? { width: "170px", height: "140px" }
            : chainId === 369
                ? { width: "110px", height: "110px" }
                : chainId === 137
                    ? { width: "110px", height: "110px" }
                    : { width: "110px", height: "140px" }
    };

    const handleMint = () => {
        if (!amount) {
            toast.error("Please enter the mint amount!", {
                position: "top-center",
                autoClose: 12000,
            });
            return;
        }
        setLoad(true);
        setTimeout(async () => {
            try {
                await mintDAV(amount, Refferalamount);
                await getAirdropAmount();
                await getInputAmount();
                await getOutPutAmount();
                setAmount("");
                setReferralAmount("");
            } catch (error) {
                console.error("Error minting:", error);
                toast.error("Minting failed! Please try again.", {
                    position: "top-center",
                    autoClose: 12000,
                });
            } finally {
                setLoad(false);
            }
        }, 0);
    };

    const handleInputChange = (e) => {
        if (/^\d*$/.test(e.target.value)) {
            setAmount(e.target.value);
        }
        CalculationOfCost(e.target.value);
    };
    // Helper to calculate total sum
    const calculateTotalSum = () => {
        return tokens.reduce((sum, token) => {
            return sum + calculatePlsValueNumeric(token, tokenBalances, pstateToPlsRatio);
        }, 0);
    };
    const handleOptionalInputChange = (e) => {
        setReferralAmount(e.target.value);
    };

    function formatNumber(number) {
        if (!number) return "0";
        return new Intl.NumberFormat("en-US", {
            maximumFractionDigits: 0,
        }).format(number);
    }

    useEffect(() => {
        CalculationOfCost(amount);
    }, [CalculationOfCost, amount]);

    return (
        <div className="container mt-4">
            <div className="row g-4 d-flex align-items-stretch pb-1">
                <div className="col-md-4 p-0 m-2 cards">
                    <div className="card bg-dark text-light border-light p-3 text-center w-100" style={{ minHeight: "260px" }}>
                        <div className="mb-2 d-flex justify-content-center align-items-center gap-2">
                            <div className="floating-input-container" style={{ maxWidth: "300px" }}>
                                <input
                                    type="text"
                                    id="affiliateLink"
                                    list="referralSuggestions"
                                    className={`form-control text-center fw-bold ${Refferalamount ? "filled" : ""}`}
                                    value={Refferalamount}
                                    onChange={handleOptionalInputChange}
                                    style={{ height: "38px", color: "#ffffff" }}
                                />
                                <label htmlFor="affiliateLink" className="floating-label">
                                    Affiliate Link - Optional
                                </label>
                                <datalist id="referralSuggestions">
                                    {copiedCode && <option value={copiedCode} />}
                                </datalist>
                            </div>
                        </div>
                        <div className="mt-2 mb-2 d-flex justify-content-center align-items-center">
                            <div className="floating-input-container" style={{ maxWidth: "300px" }}>
                                <input
                                    type="text"
                                    id="mintAmount"
                                    className={`form-control text-center fw-bold ${amount ? "filled" : ""}`}
                                    value={amount}
                                    onChange={handleInputChange}
                                    required
                                    style={{ height: "38px", color: "#ffffff" }}
                                />
                                <label htmlFor="mintAmount" className="floating-label">
                                    Mint DAV Token - Enter Amount
                                </label>
                            </div>
                        </div>
                        <h5 className="detailAmount">1 DAV TOKEN = {formatWithCommas(Math.floor(DavMintFee))} {nativeSymbol}</h5>
                        <h5 className="detailAmount mb-4">{TotalCost ? formatNumber(ethers.formatUnits(TotalCost, 18)) : "0"} {nativeSymbol} </h5>

                        <div className="d-flex justify-content-center">
                            <button
                                onClick={handleMint}
                                className="btn btn-primary btn-sm mb-0"
                                style={{ width: "200px" }}
                                disabled={load}
                            >
                                Mint
                            </button>
                        </div>
                        {/* <TxProgressModal
                            isOpen={load}
                            txStatus={txStatus}
                            steps={mintSteps}
                        /> */}
                    </div>
                </div>
                <div className="col-md-4 p-0 m-2 cards">
                    <div className="card bg-dark text-light border-light p-3 d-flex w-100">
                        <img
                            src={setBackLogo()}
                            alt="native currency Logo"
                            style={{
                                position: "absolute",
                                ...getLogoSize(),
                                opacity: 0.1,
                                top: "25%",
                                left: "80%",
                                transform: "translate(-50%, -50%)",
                                zIndex: 0,
                                pointerEvents: "none",
                            }}
                        />
                        <div>
                            <div className="carddetaildiv uppercase d-flex justify-content-between align-items-center">
                                <div className="carddetails2">
                                    <div className="d-flex">
                                        <p className="mb-1 detailText">ACTIVE DAV / EXPIRED DAV</p>
                                    </div>
                                    <div className="d-flex">
                                        <h5>
                                            {address == AuthAddress ? (
                                                <>{isLoading ? <DotAnimation /> : davGovernanceHolds}</>
                                            ) : (
                                                <>{isLoading ? <DotAnimation /> : davHolds}</>
                                            )}{" "}
                                            / {isLoading ? <DotAnimation /> : davExpireHolds}
                                        </h5>
                                    </div>
                                </div>
                            </div>
                            <div className="carddetails2 mt-1">
                                <h6 className="detailText d-flex" style={{ fontSize: "14px", textTransform: "capitalize" }}>
                                    {chainId == 146 ? "SONIC - SWAP LEVY" : "GAS SWAP LEVY"}
                                </h6>
                                <h5>{formatWithCommas(claimableAmount)} {nativeSymbol}</h5>
                                <div className="d-flex justify-content-center">
                                    <button
                                        onClick={async () => {
                                            setTimeout(async () => {
                                                try {
                                                    await claimAmount();
                                                } catch (error) {
                                                    console.error("Error claiming:", error);
                                                    alert("Claiming failed! Please try again.");
                                                }
                                            }, 100);
                                        }}
                                        className="btn btn-primary d-flex btn-sm justify-content-center align-items-center mx-5 mt-4"
                                        style={{ width: "190px" }}
                                        disabled={Number(claimableAmount) === 0}
                                    >
                                        Claim
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
                                    <h6 className="detailText">INFO</h6>
                                    <p className="mb-1">
                                        <span className="detailText">
                                            State Token Holding -{" "}
                                        </span>
                                        <span>{formatWithCommas(stateHolding)}</span>
                                    </p>
                                    <p className="mb-1">
                                        <span className="detailText">Affiliate com received - </span>
                                        <span>{formatWithCommas(ReferralAMount)} {nativeSymbol}</span>
                                    </p>
                                    <p className="mb-1 d-flex align-items-center gap-2 flex-wrap">
                                        <span className="detailText">Your Affiliate Link - </span>
                                        <span style={{ textTransform: "none" }}>{ReferralCodeOfUser}</span>
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(ReferralCodeOfUser);
                                                setCopied(true);
                                                setCopiedCode(ReferralCodeOfUser);
                                                setTimeout(() => setCopied(false), 2000);
                                            }}
                                            className="btn btn-outline-light btn-sm py-0 px-2"
                                            style={{ fontSize: "14px" }}
                                            title={copied ? "Copied!" : "Copy"}
                                        >
                                            <FontAwesomeIcon icon={copied ? faCheck : faCopy} />
                                        </button>
                                    </p>
                                    <p className="mb-1">
                                        <span className="detailText">
                                            ROI / {nativeSymbol} -
                                        </span>
                                        <span className="ms-2">
                                            {isLoading ? <DotAnimation /> : `${(formatWithCommas(totalInvestedPls)) || "0"}`} / {" "}
                                            <span style={{
                                                color: calculateTotalSum() > (totalInvestedPls || 0) ? '#28a745' : '#ff4081'
                                            }}>
                                                {isLoading ? (
                                                    <DotAnimation />
                                                ) : isNaN(calculateTotalSum()) ? (
                                                    "Token Listing Process.."
                                                ) : (
                                                    formatWithCommas(calculateTotalSum()) || "0"
                                                )}
                                            </span>
                                        </span>
                                    </p>
                                    <p className="mb-1">
                                        <span className="detailText">USER ROI % -</span>
                                        <span className="ms-2">
                                            {isLoading ? (
                                                <DotAnimation />
                                            ) : isNaN(calculateTotalSum() / totalInvestedPls) || !totalInvestedPls ? (
                                                "0"
                                            ) : (
                                                formatWithCommas(((calculateTotalSum() / totalInvestedPls) * 100).toFixed(0)) 
                                            )} %
                                        </span>
                                    </p>

                                    <p className="mb-1">
                                        <span className="detailText">
                                            USER APR % -
                                        </span>
                                        <span className="ms-2">
                                            {isLoading ? (
                                                <DotAnimation />
                                            ) : isNaN(calculateTotalSum() / totalInvestedPls) || !totalInvestedPls ? (
                                                "0"
                                            ) : (
                                                formatWithCommas(((calculateTotalSum() / totalInvestedPls) * 36500).toFixed(0)) || "0"
                                            )} %
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default AuctionSection;