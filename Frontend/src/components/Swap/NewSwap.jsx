
import { useState, useContext, useEffect } from 'react'
import TokenSearchModal from './TokenSearchModal'
import { useAllTokens } from './Tokens'
import state from '../../assets/statelogo.png'
import pulsechainLogo from '../../assets/pls1.png'
import useSwapData from './useSwapData'
import { ContractContext } from '../../Functions/ContractInitialize'
import { useAccount } from 'wagmi'
import { ethers } from 'ethers'
import toast from 'react-hot-toast'
import { useAuctionTokens } from '../../data/auctionTokenData'

const NewSwap = () => {
	const TOKENS = useAllTokens()
	const { signer } = useContext(ContractContext)
	const { address } = useAccount()
	const { tokens: auctionTokens } = useAuctionTokens()

	// Get active auctions
	const activeAuctions = auctionTokens.filter(
		({ isReversing, AuctionStatus }) =>
			AuctionStatus === "true" ||
			(AuctionStatus === "false" && isReversing === "true")
	)

	// Create swap rows based on auction length
	const swapRows = activeAuctions.map((auction, index) => ({
		id: index,
		tokenIn: "STATE",
		tokenOut: auction.name,
		amountIn: "",
		isSwapping: false,
		needsApproval: false,
		isApproving: false,
		showTxModal: false,
		txStatus: "",
		confirmedAmountIn: "",
		confirmedAmountOut: "",
		error: "",
		isAuctionActive: auction.AuctionStatus === "true"
	}))

	// Add extra row if no auctions are running
	if (activeAuctions.length === 0) {
		swapRows.push({
			id: 0,
			tokenIn: "STATE",
			tokenOut: "PLS",
			amountIn: "",
			isSwapping: false,
			needsApproval: false,
			isApproving: false,
			showTxModal: false,
			txStatus: "",
			confirmedAmountIn: "",
			confirmedAmountOut: "",
			error: "",
			isAuctionActive: false
		})
	}
	// State for managing multiple rows
	const [swapRowsState, setSwapRowsState] = useState(swapRows)
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [modalType, setModalType] = useState(null)
	const [currentRowIndex, setCurrentRowIndex] = useState(0)
	const [allTokenBalances, setAllTokenBalances] = useState({})
	const [isLoadingBalances, setIsLoadingBalances] = useState(false)
	const [isAuctionDataLoaded, setIsAuctionDataLoaded] = useState(false)

	// Get current row data
	const currentRow = swapRowsState[currentRowIndex] || swapRowsState[0]

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
		amountIn: currentRow?.amountIn || "",
		tokenIn: currentRow?.tokenIn || "STATE",
		tokenOut: currentRow?.tokenOut || (activeAuctions.length === 0 ? "PLS" : "PLS"),
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

	const openModal = (type, rowIndex) => {
		setModalType(type)
		setCurrentRowIndex(rowIndex)
		setIsModalOpen(true)
	}

	const closeModal = () => {
		setIsModalOpen(false)
		setModalType(null)
	}

	const selectToken = (key) => {
		const updatedRows = [...swapRowsState]
		const currentRow = updatedRows[currentRowIndex]

		// Don't allow changing tokens if this row is in an active auction
		if (currentRow.isAuctionActive) {
			console.log("Cannot change tokens in active auction")
			return
		}

		// Check if the token is in an active auction
		if (isTokenInActiveAuction(key)) {
			console.log("Cannot select token that is in active auction")
			return
		}

		if (modalType === "in") {
			currentRow.tokenIn = key
		} else {
			currentRow.tokenOut = key
		}
		setSwapRowsState(updatedRows)
		closeModal()
	}

	const getDisplaySymbol = (symbol) => {
		if (!symbol) return ''
		const singleLine = symbol.replace(/\s+/g, '')
		return singleLine.length > 6 ? singleLine.slice(0, 6) + '..' : singleLine
	}

	// Check if any swap is currently running
	const isAnySwapRunning = () => {
		return swapRowsState.some(row => row.isSwapping || row.isApproving)
	}

	// Check if a token is in an active auction
	const isTokenInActiveAuction = (tokenSymbol) => {
		return activeAuctions.some(auction =>
			auction.name === tokenSymbol && auction.AuctionStatus === "true"
		)
	}
	const ERC20_ABI = [
		"function allowance(address owner, address spender) view returns (uint256)",
		"function approve(address spender, uint256 amount) returns (bool)",
	]

	const checkAllowance = async (rowIndex) => {
		const row = swapRowsState[rowIndex]
		if (row.tokenIn === "PLS") {
			const updatedRows = [...swapRowsState]
			updatedRows[rowIndex].needsApproval = false
			setSwapRowsState(updatedRows)
			return
		}
		try {
			const tokenAddress = TOKENS[row.tokenIn].address
			const contract = new ethers.Contract(tokenAddress, ERC20_ABI, signer)
			const allowance = await contract.allowance(
				address,
				"0x6BF228eb7F8ad948d37deD07E595EfddfaAF88A6"
			)
			const amount = ethers.parseUnits(row.amountIn || "0", TOKENS[row.tokenIn].decimals)

			console.log(`Row ${rowIndex} - Token: ${row.tokenIn}, Amount: ${row.amountIn}, Allowance: ${ethers.formatEther(allowance)}, Needs Approval: ${BigInt(allowance) < BigInt(amount)}`)

			const updatedRows = [...swapRowsState]
			updatedRows[rowIndex].needsApproval = BigInt(allowance) < BigInt(amount)
			setSwapRowsState(updatedRows)
		} catch (err) {
			const updatedRows = [...swapRowsState]
			updatedRows[rowIndex].needsApproval = false
			setSwapRowsState(updatedRows)
			console.error("Error checking allowance", err)
		}
	}

	const handleApprove = async (rowIndex) => {
		const row = swapRowsState[rowIndex]
		const updatedRows = [...swapRowsState]
		updatedRows[rowIndex].isApproving = true
		updatedRows[rowIndex].showTxModal = true
		updatedRows[rowIndex].txStatus = "Approving"
		setSwapRowsState(updatedRows)

		try {
			const tokenAddress = TOKENS[row.tokenIn].address
			const contract = new ethers.Contract(tokenAddress, ERC20_ABI, signer)
			const amount = ethers.parseUnits(row.amountIn, TOKENS[row.tokenIn].decimals)
			const tx = await contract.approve(
				"0x6BF228eb7F8ad948d37deD07E595EfddfaAF88A6",
				amount
			)
			await tx.wait()
			updatedRows[rowIndex].needsApproval = false
			updatedRows[rowIndex].error = ""
			updatedRows[rowIndex].txStatus = "pending"
			setSwapRowsState(updatedRows)
			await handleSwap(rowIndex)
		} catch (err) {
			updatedRows[rowIndex].error = "Approval failed. Try again."
			console.error("Approval error", err)
			updatedRows[rowIndex].txStatus = "error"
			setSwapRowsState(updatedRows)
			setTimeout(() => {
				const finalRows = [...swapRowsState]
				finalRows[rowIndex].showTxModal = false
				setSwapRowsState(finalRows)
			}, 1200)
		} finally {
			const finalRows = [...swapRowsState]
			finalRows[rowIndex].isApproving = false
			setSwapRowsState(finalRows)
		}
	}

	const handleSwitchTokens = (rowIndex) => {
		const updatedRows = [...swapRowsState]
		const temp = updatedRows[rowIndex].tokenIn
		updatedRows[rowIndex].tokenIn = updatedRows[rowIndex].tokenOut
		updatedRows[rowIndex].tokenOut = temp
		setSwapRowsState(updatedRows)
	}

	const handleSwap = async (rowIndex) => {
		const row = swapRowsState[rowIndex]
		if (!signer || !quoteData) {
			const updatedRows = [...swapRowsState]
			updatedRows[rowIndex].error = "Wallet not connected or quote data missing."
			setSwapRowsState(updatedRows)
			return
		}

		const updatedRows = [...swapRowsState]
		updatedRows[rowIndex].isSwapping = true
		updatedRows[rowIndex].showTxModal = true
		updatedRows[rowIndex].txStatus = "pending"
		updatedRows[rowIndex].confirmedAmountIn = row.amountIn
		updatedRows[rowIndex].confirmedAmountOut = amountOut
		setSwapRowsState(updatedRows)

		try {
			const tx = await signer.sendTransaction({
				to: "0x6BF228eb7F8ad948d37deD07E595EfddfaAF88A6",
				value: quoteData.value,
				data: quoteData.calldata,
			})
			console.log("Transaction sent:", tx.hash)
			await tx.wait()
			console.log("Transaction confirmed:", tx.hash)
			updatedRows[rowIndex].error = ""
			updatedRows[rowIndex].amountIn = ""
			updatedRows[rowIndex].txStatus = "confirmed"
			setSwapRowsState(updatedRows)
			setTimeout(() => {
				const finalRows = [...swapRowsState]
				finalRows[rowIndex].showTxModal = false
				setSwapRowsState(finalRows)
			}, 1200)

			// Show success toast
			toast.success(
				`${row.amountIn} ${getDisplaySymbol(TOKENS[row.tokenIn]?.symbol || row.tokenIn)} → ${amountOut} ${getDisplaySymbol(TOKENS[row.tokenOut]?.symbol || row.tokenOut)} Swap Complete!`,
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
			updatedRows[rowIndex].error = "Swap failed. Try again."
			updatedRows[rowIndex].txStatus = "error"
			setSwapRowsState(updatedRows)
			setTimeout(() => {
				const finalRows = [...swapRowsState]
				finalRows[rowIndex].showTxModal = false
				setSwapRowsState(finalRows)
			}, 1200)
		} finally {
			const finalRows = [...swapRowsState]
			finalRows[rowIndex].isSwapping = false
			finalRows[rowIndex].amountIn = ""
			setSwapRowsState(finalRows)
		}
	}

	// Call checkAllowance when dependencies change for all rows - Fixed for approval
	useEffect(() => {
		const checkAllowances = async () => {
			if (!signer || !address) return

			console.log("Checking allowances for all rows...")

			const promises = swapRowsState.map(async (row, index) => {
				if (row.amountIn && row.tokenIn && !isNaN(row.amountIn) && row.amountIn !== "0") {
					console.log(`Checking allowance for row ${index}: ${row.tokenIn} - ${row.amountIn}`)
					await checkAllowance(index)
				}
			})

			await Promise.allSettled(promises)
		}

		// Reduced debounce to check allowances more frequently
		const timeoutId = setTimeout(checkAllowances, 500)

		return () => clearTimeout(timeoutId)
	}, [signer, address, swapRowsState]) // Added full array dependency to check when amounts change

	// Fetch balances for all tokens except STATE - Lazy loading optimized
	useEffect(() => {
		let isMounted = true
		let timeoutId

		const fetchNonStateBalances = async () => {
			if (!address || !signer || isLoadingBalances) return

			setIsLoadingBalances(true)

			try {
				const balances = {}

				// Get unique tokens from all rows (excluding STATE)
				const uniqueTokens = new Set()
				swapRowsState.forEach(row => {
					if (row.tokenIn !== "STATE") uniqueTokens.add(row.tokenIn)
					if (row.tokenOut !== "STATE") uniqueTokens.add(row.tokenOut)
				})

				// Only fetch if we have tokens to fetch
				if (uniqueTokens.size === 0) {
					setIsLoadingBalances(false)
					return
				}

				// Fetch balance for each unique token with timeout
				const balancePromises = Array.from(uniqueTokens).map(async (token) => {
					try {
						if (token === "PLS") {
							const balance = await Promise.race([
								signer.provider.getBalance(address),
								new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 2000))
							])
							return { token, balance: ethers.formatEther(balance) }
						} else if (TOKENS[token]?.address) {
							const tokenContract = new ethers.Contract(TOKENS[token].address, ERC20_ABI, signer)
							const balance = await Promise.race([
								tokenContract.balanceOf(address),
								new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 2000))
							])
							return { token, balance: ethers.formatEther(balance) }
						}
					} catch (err) {
						console.error(`Error fetching balance for ${token}:`, err)
						return { token, balance: "0" }
					}
				})

				const results = await Promise.allSettled(balancePromises)

				if (isMounted) {
					results.forEach((result) => {
						if (result.status === 'fulfilled' && result.value) {
							balances[result.value.token] = result.value.balance
						}
					})

					setAllTokenBalances(balances)
				}
			} catch (error) {
				console.error("Error fetching balances:", error)
			} finally {
				if (isMounted) {
					setIsLoadingBalances(false)
				}
			}
		}

		// Increased debounce to reduce lag
		timeoutId = setTimeout(fetchNonStateBalances, 1000)

		return () => {
			isMounted = false
			clearTimeout(timeoutId)
		}
	}, [address, signer, swapRowsState.length]) // Only depend on length, not full array

	// Update swap rows when auction data becomes available - Optimized
	useEffect(() => {
		if (auctionTokens.length > 0 && !isAuctionDataLoaded) {
			console.log("Auction data loaded, updating swap rows")
			setIsAuctionDataLoaded(true)
		}
	}, [auctionTokens.length]) // Only depend on length, not full array

	// Update swap rows when auction data changes - Optimized with debounce
	useEffect(() => {
		if (!isAuctionDataLoaded) return

		const updateRows = () => {
			const newSwapRows = activeAuctions.map((auction, index) => ({
				id: index,
				tokenIn: "STATE",
				tokenOut: auction.name,
				amountIn: "",
				isSwapping: false,
				needsApproval: false,
				isApproving: false,
				showTxModal: false,
				txStatus: "",
				confirmedAmountIn: "",
				confirmedAmountOut: "",
				error: "",
				isAuctionActive: auction.AuctionStatus === "true"
			}))

			// Add extra row if no auctions are running
			if (activeAuctions.length === 0) {
				newSwapRows.push({
					id: 0,
					tokenIn: "STATE",
					tokenOut: "PLS",
					amountIn: "",
					isSwapping: false,
					needsApproval: false,
					isApproving: false,
					showTxModal: false,
					txStatus: "",
					confirmedAmountIn: "",
					confirmedAmountOut: "",
					error: "",
					isAuctionActive: false
				})
			}

			setSwapRowsState(newSwapRows)
			console.log("Updated swap rows:", newSwapRows)
		}

		// Debounce row updates to prevent excessive re-renders
		const timeoutId = setTimeout(updateRows, 300)

		return () => clearTimeout(timeoutId)
	}, [activeAuctions.length, isAuctionDataLoaded]) // Only depend on length

	// Cleanup function to reset states when component unmounts
	useEffect(() => {
		return () => {
			// Reset all states when component unmounts to prevent memory leaks
			setSwapRowsState([])
			setAllTokenBalances({})
			setIsLoadingBalances(false)
			setIsAuctionDataLoaded(false)
			setCurrentRowIndex(0)
			setIsModalOpen(false)
			setModalType(null)
		}
	}, [])

	return (
		<>
			<div className="container  datatablemarginbottom mt-3">
				<div className="table-responsive">
					<table className="table table-dark">
						<thead>
							<tr>
								<th className="text-center" colSpan={7}>
									Decentralised Exchange
									{activeAuctions.length === 0 && (
										<div className="text-warning mt-1" style={{ fontSize: "0.8rem" }}>
											No active auctions - Standard swap mode
										</div>
									)}
								</th>
							</tr>
						</thead>
						<tbody>
							{(!isAuctionDataLoaded || isLoadingBalances) && swapRowsState.length === 0 ? (
								<tr>
									<td colSpan={7} className="text-center py-4">
										<div className="spinner-border text-primary" role="status">
											<span className="visually-hidden">Loading...</span>
										</div>
										<div className="mt-2">
											{!isAuctionDataLoaded ? "Loading auction data..." : "Loading swap interface..."}
										</div>
									</td>
								</tr>
							) : swapRowsState.length === 0 ? (
								<tr>
									<td colSpan={7} className="text-center py-4">
										<div className="text-warning">
											<i className="bi bi-exclamation-triangle me-2"></i>
											No auction data available
										</div>
									</td>
								</tr>
							) : (
								swapRowsState.map((row, rowIndex) => {
									// Use the current row's data for this specific row
									const isCurrentRow = rowIndex === currentRowIndex
									const rowSwapData = isCurrentRow ? {
										amountOut,
										estimatedGas,
										quoteData,
										inputUsdValue,
										outputUsdValue,
										tokenInBalance,
										tokenOutBalance,
										isLoading,
									} : {
										amountOut: "0",
										estimatedGas: "0",
										quoteData: null,
										inputUsdValue: "",
										outputUsdValue: "",
										tokenInBalance: "",
										tokenOutBalance: "",
										isLoading: false
									}

									return (
										<tr key={rowIndex} style={{ height: "70px" }}>
											<td>
												<div className='d-flex align-items-center justify-content-center gap-2' style={{ marginTop: "-5px" }}>
													{row.isAuctionActive && (
														<div className="position-absolute top-0 start-0">
															<small className="text-warning">🔄 Auction</small>
														</div>
													)}
													{!row.isAuctionActive && activeAuctions.length === 0 && rowIndex === 0 && (
														<div className="position-absolute top-0 start-0">
															<small className="text-info">💱 Standard</small>
														</div>
													)}
													<input
														type="number"
														className="form-control form-control-sm"
														placeholder="0.0"
														value={row.amountIn}
														onChange={(e) => {
															const updatedRows = [...swapRowsState]
															updatedRows[rowIndex].amountIn = e.target.value

															// Clear output amount when input is cleared
															if (!e.target.value || e.target.value === "0") {
																updatedRows[rowIndex].amountOut = ""
															}

															setSwapRowsState(updatedRows)
															// Update current row index when this row is modified
															setCurrentRowIndex(rowIndex)
														}}
														style={{
															"--placeholder-color": "#6c757d",
															backgroundColor: (row.isApproving || row.isSwapping || isAnySwapRunning()) ? "#343a40" : undefined
														}}
														disabled={row.isApproving || row.isSwapping || isAnySwapRunning()}
													/>
												</div>
												{rowSwapData.inputUsdValue && (
													<div className="position-absolute  text-center mt-1">
														<small className="text-secondary">{rowSwapData.inputUsdValue}</small>
													</div>
												)}
											</td>
											<td>
												<div className="position-relative">
													<button
														className='btn btn-primary d-flex align-items-center justify-content-between gap-2 px-2'
														onClick={() => openModal("in", rowIndex)}
														disabled={row.isApproving || row.isSwapping || isAnySwapRunning() || row.isAuctionActive}
														style={{
															minWidth: "100px",
															fontSize: "0.875rem",
															padding: "4px 8px",
															height: "32px",
															transition: "all 0.2s ease-in-out",
															opacity: row.isAuctionActive ? 0.6 : 1
														}}
													>
														<span className="d-flex align-items-center gap-2">
															{getTokenLogo(row.tokenIn)}
															<span style={{ fontWeight: 500 }}>
																{getDisplaySymbol(TOKENS[row.tokenIn]?.symbol || row.tokenIn)}
															</span>
															{row.isAuctionActive && (
																<span className="text-warning">🔒</span>
															)}
														</span>
														<span className="ms-2 d-flex align-items-center">
															<i className="bi bi-chevron-down" style={{ fontSize: "1.1em" }}></i>
														</span>
													</button>
													{rowSwapData.tokenInBalance && (
														<div className="position-absolute text-center w-100" style={{ top: "100%", right: "22%" }}>
															<small className="text-light">
																Bal: {parseFloat(rowSwapData.tokenInBalance).toFixed(4)}
															</small>
														</div>
													)}
													{/* Show STATE balance only when there's an input value */}
													{row.tokenIn === "STATE" && row.amountIn && row.amountIn !== "0" && !rowSwapData.tokenInBalance && tokenInBalance && (
														<div className="position-absolute text-center w-100" style={{ top: "100%", right: "22%" }}>
															<small className="text-light">
																Bal: {parseFloat(tokenInBalance).toFixed(4)}
															</small>
														</div>
													)}
													{/* Show balance for all other tokens only when there's an input value */}
													{row.tokenIn !== "STATE" && row.amountIn && row.amountIn !== "0" && allTokenBalances[row.tokenIn] && (
														<div className="position-absolute text-center w-100" style={{ top: "100%", right: "22%" }}>
															<small className="text-light">
																Bal: {parseFloat(allTokenBalances[row.tokenIn]).toFixed(4)}
															</small>
														</div>
													)}
												</div>
											</td>
											<td>
												<div className="text-center" style={{ marginTop: "-5px" }}>
													<button
														className="btn btn-outline-primary btn-sm rounded-circle"
														onClick={() => handleSwitchTokens(rowIndex)}
														disabled={row.isApproving || row.isSwapping || isAnySwapRunning()}
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
														value={rowSwapData.isLoading ? "Fetching..." : rowSwapData.amountOut || "0.0"}
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
													{rowSwapData.outputUsdValue && rowSwapData.estimatedGas && (
														<>
															<div>
																<small className="text-secondary">{rowSwapData.outputUsdValue}</small>
															</div>
															<div>
																<small className="text-secondary">Network Fee: ${rowSwapData.estimatedGas}</small>
															</div>
														</>
													)}
												</div>
											</td>
											<td>
												<div className="position-relative">
													<button
														className='btn btn-primary d-flex align-items-center justify-content-between gap-2 px-2'
														onClick={() => openModal("out", rowIndex)}
														disabled={row.isApproving || row.isSwapping || isAnySwapRunning() || row.isAuctionActive || isTokenInActiveAuction(row.tokenOut)}
														style={{
															minWidth: "100px",
															fontSize: "0.875rem",
															padding: "4px 8px",
															height: "32px",
															transition: "all 0.2s ease-in-out",
															opacity: row.isAuctionActive ? 0.6 : 1,
															cursor: row.isAuctionActive || isTokenInActiveAuction(row.tokenOut) ? "not-allowed" : "pointer"

														}}
													>
														<span className="d-flex align-items-center gap-2">
															{getTokenLogo(row.tokenOut)}
															<span style={{ fontWeight: 500 }}>
																{getDisplaySymbol(TOKENS[row.tokenOut]?.symbol || row.tokenOut)}
															</span>
															{row.isAuctionActive && (
																<span className="text-warning">🔒</span>
															)}
														</span>
														<span className="ms-2 d-flex align-items-center">
															<i className="bi bi-chevron-down" style={{ fontSize: "1.1em" }}></i>
														</span>
													</button>
													{rowSwapData.tokenOutBalance && (
														<div className="position-absolute text-center w-100" style={{ top: "100%", right: "20%" }}>
															<small className="text-light">
																Bal: {parseFloat(rowSwapData.tokenOutBalance).toFixed(4)}
															</small>
														</div>
													)}


												</div>
											</td>
											<td>
												{(row.isSwapping || row.isApproving || row.showTxModal) ? (
													<div className="tx-progress-container">
														<div className="step-line">
															<div className={`step ${row.txStatus === "initializing" || row.txStatus === "initiated" || row.txStatus === "Approving" || row.txStatus === "pending" || row.txStatus === "confirmed" ? "active" : ""}`}>
																<span className="dot" />
																<span className="label">Initializing</span>
															</div>
															<div className={`step ${row.txStatus === "initiated" || row.txStatus === "Approving" || row.txStatus === "pending" || row.txStatus === "confirmed" ? "active" : ""}`}>
																<span className="dot" />
																<span className="label">Initiated</span>
															</div>
															<div className={`step ${row.txStatus === "Approving" || row.txStatus === "pending" || row.txStatus === "confirmed" ? "active" : ""}`}>
																<span className="dot" />
																<span className="label">Approving</span>
															</div>
															<div className={`step ${row.txStatus === "pending" || row.txStatus === "confirmed" ? "active" : ""}`}>
																<span className="dot" />
																<span className="label">Swapping</span>
															</div>
															<div className={`step ${row.txStatus === "confirmed" || row.txStatus === "error" ? "active" : ""}`}>
																<span className="dot" />
																<span className="label">{row.txStatus === "error" ? "Error" : "Confirmed"}</span>
															</div>
														</div>
													</div>
												) : (
													<div className="d-flex flex-column gap-2">
														{row.needsApproval ? (
															<button
																className="btn btn-primary btn-sm"
																onClick={() => handleApprove(rowIndex)}
																disabled={row.isApproving || row.isSwapping || isAnySwapRunning()}
																style={{
																	height: "38px",
																	fontSize: "0.75rem",
																	padding: "2px 8px",
																	minWidth: "60px"
																}}
															>
																{row.isApproving ? (
																	<>
																		<span className="spinner-border spinner-border-sm me-1" role="status"></span>
																		Approving...
																	</>
																) : (
																	`Approve ${TOKENS[row.tokenIn]?.symbol || row.tokenIn}`
																)}
															</button>
														) : (
															<button
																className="btn btn-primary btn-sm"
																onClick={() => handleSwap(rowIndex)}
																disabled={!rowSwapData.quoteData || row.isSwapping || isAnySwapRunning()}
																style={{
																	height: "38px",
																	fontSize: "0.75rem",
																	padding: "2px 8px",
																	minWidth: "60px"
																}}
															>
																{row.isSwapping ? (
																	<>
																		<span className="spinner-border spinner-border-sm me-1" role="status"></span>
																		Swapping...
																	</>
																) : (
																	"SWAP"
																)}
															</button>
														)}

														{row.error && (
															<small className="text-danger">{row.error}</small>
														)}
													</div>
												)}
											</td>
											<td></td>
										</tr>
									)
								})
							)}
						</tbody>
					</table>
				</div>
			</div>

			{isModalOpen && (
				<TokenSearchModal
					tokens={TOKENS}
					excludeToken={modalType === "in" ? currentRow.tokenOut : currentRow.tokenIn}
					onSelect={selectToken}
					onClose={closeModal}
				/>
			)}
		</>
	)
}

export default NewSwap