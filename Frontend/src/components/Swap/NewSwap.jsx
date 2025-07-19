
import { useState, useContext } from 'react'
import TokenSearchModal from './TokenSearchModal'
import { useAllTokens } from './Tokens'
import state from '../../assets/statelogo.png'
import pulsechainLogo from '../../assets/pls1.png'
import useSwapData from './useSwapData'
import { ContractContext } from '../../Functions/ContractInitialize'
import { useAccount } from 'wagmi'
import { ethers } from 'ethers'
import toast from 'react-hot-toast'

const NewSwap = () => {
    const TOKENS = useAllTokens()
    const { signer } = useContext(ContractContext)
    const { address } = useAccount()
    const [tokenIn, setTokenIn] = useState("STATE")
    const [tokenOut, setTokenOut] = useState("PLS")
    const [amountIn, setAmountIn] = useState("")
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [modalType, setModalType] = useState(null)
    const [isSwapping, setIsSwapping] = useState(false)
    const [needsApproval, setNeedsApproval] = useState(false)
    const [isApproving, setIsApproving] = useState(false)
    const [showTxModal, setShowTxModal] = useState(false)
    const [txStatus, setTxStatus] = useState("")
    const [confirmedAmountIn, setConfirmedAmountIn] = useState("")
    const [confirmedAmountOut, setConfirmedAmountOut] = useState("")
    const [error, setError] = useState("")

    const {
        amountOut,
        estimatedGas,
        quoteData,
        inputUsdValue,
        outputUsdValue,
        tokenInBalance,
        tokenOutBalance,
        isLoading,
    } = useSwapData({
        amountIn,
        tokenIn,
        tokenOut,
        slippage: 0.5,
        TOKENS,
    })

    const SPECIAL_TOKEN_LOGOS = {
        STATE: state,
        pSTATE: state,
        PulseChain: pulsechainLogo,
    }

    const getTokenLogo = (symbol) => {
        if (SPECIAL_TOKEN_LOGOS[symbol]) {
            return (
                <img
                    src={SPECIAL_TOKEN_LOGOS[symbol]}
                    alt={symbol}
                    width="24"
                    className="rounded-circle"
                />
            )
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
                    width="24"
                    className="rounded-circle"
                />
            )
        }
        if (TOKENS[symbol]?.emoji) {
            return <span style={{ fontSize: "1.1em" }}>{TOKENS[symbol].emoji}</span>
        }
        return (
            <img
                src="/default.png"
                alt={symbol}
                width="24"
                className="rounded-circle"
            />
        )
    }

    const openModal = (type) => {
        setModalType(type)
        setIsModalOpen(true)
    }

    const closeModal = () => {
        setIsModalOpen(false)
        setModalType(null)
    }

    const selectToken = (key) => {
        if (modalType === "in") setTokenIn(key)
        else setTokenOut(key)
        closeModal()
    }

    const getDisplaySymbol = (symbol) => {
        if (!symbol) return ''
        const singleLine = symbol.replace(/\s+/g, '')
        return singleLine.length > 6 ? singleLine.slice(0, 6) + '..' : singleLine
    }

    const ERC20_ABI = [
        "function allowance(address owner, address spender) view returns (uint256)",
        "function approve(address spender, uint256 amount) returns (bool)",
    ]

    const checkAllowance = async () => {
        if (tokenIn === "PLS") {
            setNeedsApproval(false)
            return
        }
        try {
            const tokenAddress = TOKENS[tokenIn].address
            const contract = new ethers.Contract(tokenAddress, ERC20_ABI, signer)
            const allowance = await contract.allowance(
                address,
                "0x6BF228eb7F8ad948d37deD07E595EfddfaAF88A6"
            )
            const amount = ethers.parseUnits(amountIn || "0", TOKENS[tokenIn].decimals)
            setNeedsApproval(BigInt(allowance) < BigInt(amount))
        } catch (err) {
            setNeedsApproval(false)
            console.error("Error checking allowance", err)
        }
    }

    const handleApprove = async () => {
        setIsApproving(true)
        setShowTxModal(true)
        setTxStatus("Approving")
        try {
            const tokenAddress = TOKENS[tokenIn].address
            const contract = new ethers.Contract(tokenAddress, ERC20_ABI, signer)
            const amount = ethers.parseUnits(amountIn, TOKENS[tokenIn].decimals)
            const tx = await contract.approve(
                "0x6BF228eb7F8ad948d37deD07E595EfddfaAF88A6",
                amount
            )
            await tx.wait()
            setNeedsApproval(false)
            setError("")
            setTxStatus("pending")
            await handleSwap()
        } catch (err) {
            setError("Approval failed. Try again.")
            console.error("Approval error", err)
            setTxStatus("error")
            setTimeout(() => setShowTxModal(false), 1200)
        } finally {
            setIsApproving(false)
        }
    }

    const handleSwitchTokens = () => {
        setTokenIn(tokenOut)
        setTokenOut(tokenIn)
    }

    const handleSwap = async () => {
        if (!signer || !quoteData) {
            setError("Wallet not connected or quote data missing.")
            return
        }

        setIsSwapping(true)
        setShowTxModal(true)
        setTxStatus("pending")
        setConfirmedAmountIn(amountIn)
        setConfirmedAmountOut(amountOut)
        try {
            const tx = await signer.sendTransaction({
                to: "0x6BF228eb7F8ad948d37deD07E595EfddfaAF88A6",
                value: quoteData.value,
                data: quoteData.calldata,
            })
            console.log("Transaction sent:", tx.hash)
            await tx.wait()
            console.log("Transaction confirmed:", tx.hash)
            setError("")
            setAmountIn("")
            setTxStatus("confirmed")
            setTimeout(() => setShowTxModal(false), 1200)

            // Show success toast
            toast.success(
                `${confirmedAmountIn} ${getDisplaySymbol(TOKENS[tokenIn]?.symbol || tokenIn)} → ${confirmedAmountOut} ${getDisplaySymbol(TOKENS[tokenOut]?.symbol || tokenOut)} Swap Complete!`,
                {
                    position: "top-center",
                    autoClose: 6000,
                    hideProgressBar: true,
                    closeOnClick: true,
                    pauseOnHover: false,
                    draggable: false,
                    theme: "dark",
                }
            )
        } catch (err) {
            console.error("Swap failed", err)
            setError("Swap failed. Try again.")
            setTxStatus("error")
            setTimeout(() => setShowTxModal(false), 1200)
        } finally {
            setIsSwapping(false)
            setAmountIn("")
        }
    }

    // Check allowance when amount or tokens change
    const checkAllowanceEffect = () => {
        if (signer && amountIn && !isNaN(amountIn)) {
            checkAllowance()
        } else {
            setNeedsApproval(false)
        }
    }

    // Call checkAllowance when dependencies change
    if (signer && amountIn && tokenIn) {
        checkAllowanceEffect()
    }

    return (
        <>
            <div className="container  datatablemarginbottom mt-3">
                <div className="table-responsive">
                    <table className="table table-dark">
                        <thead>
                            <tr>
                                <th className="text-center" colSpan={7}>Decentralised Exchange</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr style={{ height: "70px" }}>
                                <td>
                                    <div className='d-flex align-items-center justify-content-center gap-2' style={{ marginTop: "-5px" }}>
                                        <input
                                            type="number"
                                            className="form-control form-control-sm"
                                            placeholder="0.0"
                                            value={amountIn}
                                            onChange={(e) => setAmountIn(e.target.value)}
                                            style={{
                                                "--placeholder-color": "#6c757d",
                                                backgroundColor: (isApproving || isSwapping) ? "#343a40" : undefined
                                            }}
                                            disabled={isApproving || isSwapping}
                                        />
                                    </div>
                                    {inputUsdValue && (
                                        <div className="position-absolute  text-center mt-1">
                                            <small className="text-secondary">{inputUsdValue}</small>
                                        </div>
                                    )}
                                </td>
                                <td>
                                    <div className="position-relative">
                                        <button
                                            className='btn btn-primary d-flex align-items-center justify-content-between gap-2 px-2'
                                            onClick={() => openModal("in")}
                                            disabled={isApproving || isSwapping}
                                            style={{
                                                minWidth: "100px",
                                                fontSize: "0.875rem",
                                                padding: "4px 8px",
                                                height: "32px",
                                                transition: "all 0.2s ease-in-out"
                                            }}
                                        >
                                            <span className="d-flex align-items-center gap-2">
                                                {getTokenLogo(tokenIn)}
                                                <span style={{ fontWeight: 500 }}>
                                                    {getDisplaySymbol(TOKENS[tokenIn]?.symbol || tokenIn)}
                                                </span>
                                            </span>
                                            <span className="ms-2 d-flex align-items-center">
                                                <i className="bi bi-chevron-down" style={{ fontSize: "1.1em" }}></i>
                                            </span>
                                        </button>
                                        {tokenInBalance && (
                                            <div className="position-absolute text-center w-100" style={{ top: "100%", right: "22%" }}>
                                                <small className="text-light">
                                                    Bal: {parseFloat(tokenInBalance).toFixed(4)}
                                                </small>
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td>
                                    <div className="text-center" style={{ marginTop: "-5px" }}>
                                        <button
                                            className="btn btn-outline-primary btn-sm rounded-circle"
                                            onClick={handleSwitchTokens}
                                            disabled={isApproving || isSwapping}
                                            style={{ width: "32px", height: "32px", fontSize: "0.75rem" }}
                                        >
                                            ↔
                                        </button>
                                    </div>
                                </td>
                                <td>
                                    <div className='d-flex align-items-center justify-content-center gap-2' style={{ marginTop: "-5px" }}>
                                        <input
                                            type="text"
                                            className="form-control form-control-sm"
                                            placeholder="0.0"
                                            value={isLoading ? "Fetching..." : amountOut || "0.0"}
                                            readOnly
                                            disabled
                                            style={{
                                                "--placeholder-color": "#6c757d",
                                                backgroundColor: "#343a40",
                                                color: "#fff",
                                                cursor: "not-allowed"
                                            }}
                                        />
                                    </div>
                                    <div className="position-absolute  text-center mt-1 d-flex align-items-center justify-content-center gap-2">
                                        {outputUsdValue && estimatedGas && (
                                            <>
                                                <div>
                                                    <small className="text-secondary">{outputUsdValue}</small>
                                                </div>
                                                <div>
                                                    <small className="text-secondary">Network Fee: ${estimatedGas}</small>
                                                </div>
                                            </>
                                        )}

                                    </div>
                                </td>
                                <td>
                                    <div className="position-relative">
                                        <button
                                            className='btn btn-primary d-flex align-items-center justify-content-between gap-2 px-2'
                                            onClick={() => openModal("out")}
                                            disabled={isApproving || isSwapping}
                                            style={{
                                                minWidth: "100px",
                                                fontSize: "0.875rem",
                                                padding: "4px 8px",
                                                height: "32px",
                                                transition: "all 0.2s ease-in-out"
                                            }}
                                        >
                                            <span className="d-flex align-items-center gap-2">
                                                {getTokenLogo(tokenOut)}
                                                <span style={{ fontWeight: 500 }}>
                                                    {getDisplaySymbol(TOKENS[tokenOut]?.symbol || tokenOut)}
                                                </span>
                                            </span>
                                            <span className="ms-2 d-flex align-items-center">
                                                <i className="bi bi-chevron-down" style={{ fontSize: "1.1em" }}></i>
                                            </span>
                                        </button>
                                        {tokenOutBalance && (
                                            <div className="position-absolute text-center w-100" style={{ top: "100%", right: "20%" }}>
                                                <small className="text-light">
                                                    Bal: {parseFloat(tokenOutBalance).toFixed(4)}
                                                </small>
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td>
                                    {(isSwapping || isApproving || showTxModal) ? (
                                        <div className="tx-progress-container">
                                            <div className="step-line">
                                                <div className={`step ${txStatus === "initializing" || txStatus === "initiated" || txStatus === "Approving" || txStatus === "pending" || txStatus === "confirmed" ? "active" : ""}`}>
                                                    <span className="dot" />
                                                    <span className="label">Initializing</span>
                                                </div>
                                                <div className={`step ${txStatus === "initiated" || txStatus === "Approving" || txStatus === "pending" || txStatus === "confirmed" ? "active" : ""}`}>
                                                    <span className="dot" />
                                                    <span className="label">Initiated</span>
                                                </div>
                                                <div className={`step ${txStatus === "Approving" || txStatus === "pending" || txStatus === "confirmed" ? "active" : ""}`}>
                                                    <span className="dot" />
                                                    <span className="label">Approving</span>
                                                </div>
                                                <div className={`step ${txStatus === "pending" || txStatus === "confirmed" ? "active" : ""}`}>
                                                    <span className="dot" />
                                                    <span className="label">Swapping</span>
                                                </div>
                                                <div className={`step ${txStatus === "confirmed" || txStatus === "error" ? "active" : ""}`}>
                                                    <span className="dot" />
                                                    <span className="label">{txStatus === "error" ? "Error" : "Confirmed"}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="d-flex flex-column gap-2">
                                            {needsApproval ? (
                                                <button
                                                    className="btn btn-warning btn-sm"
                                                    onClick={handleApprove}
                                                    disabled={isApproving || isSwapping}
                                                    style={{
                                                        height: "38px",
                                                        fontSize: "0.75rem",
                                                        padding: "2px 8px",
                                                        minWidth: "60px"
                                                    }}
                                                >
                                                    {isApproving ? (
                                                        <>
                                                            <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                                                            Approving...
                                                        </>
                                                    ) : (
                                                        `Approve ${TOKENS[tokenIn]?.symbol || tokenIn}`
                                                    )}
                                                </button>
                                            ) : (
                                                <button
                                                    className="btn btn-primary btn-sm"
                                                    onClick={handleSwap}
                                                    disabled={!quoteData || isSwapping}
                                                    style={{
                                                        height: "38px",
                                                        fontSize: "0.75rem",
                                                        padding: "2px 8px",
                                                        minWidth: "60px"
                                                    }}
                                                >
                                                    {isSwapping ? (
                                                        <>
                                                            <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                                                            Swapping...
                                                        </>
                                                    ) : (
                                                        "SWAP"
                                                    )}
                                                </button>
                                            )}
                                            {error && (
                                                <small className="text-danger">{error}</small>
                                            )}
                                        </div>
                                    )}
                                </td>
                                <td></td>

                            </tr>
                        </tbody>
                    </table>


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
        </>
    )
}

export default NewSwap