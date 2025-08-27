import { useState, useEffect, useContext, useRef } from "react";
import { formatUnits, parseUnits } from "ethers";
import { useAccount } from "wagmi";
import { ethers } from "ethers";
import { ContractContext } from "../../Functions/ContractInitialize";
import { useChainId } from 'wagmi';

const useSwapData = ({ amountIn, tokenIn, tokenOut, TOKENS }) => {
	const chainId = useChainId();
	const { signer } = useContext(ContractContext);
	const { address } = useAccount();
	const [amountOut, setAmountOut] = useState("");
	const [estimatedGas, setEstimatedGas] = useState(null);
	const [quoteData, setQuoteData] = useState(null);
	const [routeDetails, setRouteDetails] = useState(null);
	const [tokenPrices, setTokenPrices] = useState({});
	const [inputUsdValue, setInputUsdValue] = useState("");
	const [outputUsdValue, setOutputUsdValue] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [tokenInBalance, setTokenInBalance] = useState("");
	const [tokenOutBalance, setTokenOutBalance] = useState("");

	// Add a ref to track the latest request id
	const requestIdRef = useRef(0);

	const getApiTokenAddress = (symbol) => {
		if (symbol === "PulseChain from pump.tires") return "PLS";
		return TOKENS[symbol]?.address;
	};

	const fetchTokenBalance = async (tokenSymbol, setBalance) => {
		if (!signer || !address || !tokenSymbol || !TOKENS[tokenSymbol]) {
			setBalance("");
			return;
		}
		try {
			if (tokenSymbol === "PulseChain from pump.tires") {
				const bal = await signer.provider.getBalance(address);
				setBalance(ethers.formatUnits(bal, 18));
			} else {
				const tokenAddress = TOKENS[tokenSymbol].address;
				const contract = new ethers.Contract(
					tokenAddress,
					["function balanceOf(address) view returns (uint256)"],
					signer
				);
				const bal = await contract.balanceOf(address);
				setBalance(ethers.formatUnits(bal, TOKENS[tokenSymbol].decimals));
			}
		} catch (err) {
			console.error("Error fetching balance", err);
			setBalance("");
		}
	};

	const fetchQuote = async () => {
		if (!amountIn || isNaN(amountIn)) {
			setAmountOut("");
			setQuoteData(null);
			setRouteDetails([]);
			setEstimatedGas(null);
			return;
		}

		requestIdRef.current += 1;
		const thisRequestId = requestIdRef.current;

		try {
			setIsLoading(true);
			setAmountOut(""); // Clear output while fetching

			const amount = parseUnits(amountIn, TOKENS[tokenIn].decimals).toString();
			const tokenInAddress = getApiTokenAddress(tokenIn);
			const tokenOutAddress = getApiTokenAddress(tokenOut);

			let data;

			if (chainId === 369) {
				// Piteas API
				const url = `https://sdk.piteas.io/quote?tokenInAddress=${tokenInAddress}&tokenOutAddress=${tokenOutAddress}&amount=${amount}&allowedSlippage=0.5`;
				const response = await fetch(url);
				if (!response.ok) throw new Error("Quote fetch failed.");
				data = await response.json();
			} else {
				// SushiSwap API for other chains
				const SWAP_API_URL = new URL(`https://api.sushi.com/swap/v7/${chainId}`);
				SWAP_API_URL.searchParams.set("tokenIn", tokenInAddress);
				SWAP_API_URL.searchParams.set("tokenOut", tokenOutAddress);
				SWAP_API_URL.searchParams.set("amount", amount);
				SWAP_API_URL.searchParams.set("sender", address || "0x0000000000000000000000000000000000000000");
				console.log("SushiSwap Quote API:", SWAP_API_URL.toString()); // ✅ Logs the final API URL

				const response = await fetch(SWAP_API_URL.toString());
				if (!response.ok) throw new Error("SushiSwap quote fetch failed.");
				data = await response.json();
			}


			// Only update state if this is the latest request
			if (requestIdRef.current === thisRequestId) {
				if (chainId === 369) {
					setAmountOut(Number(formatUnits(data.destAmount, TOKENS[tokenOut].decimals)).toFixed(4));
					setEstimatedGas(data.gasUseEstimateUSD?.toFixed(4) || null);
					setQuoteData(data.methodParameters);
					setRouteDetails(data.route || { swaps: [] });
				} else {
					// SushiSwap API response format
					if (data.status === 'Success') {
						const amountOutRaw = data.assumedAmountOut ?? 0;
						setAmountOut(Number(formatUnits(amountOutRaw, TOKENS[tokenOut].decimals)).toFixed(4));

						// Sushi's swapPrice is the network fee (in native currency)
						setEstimatedGas(data.swapPrice ? Number(data.swapPrice).toFixed(6) : null);

						setQuoteData(data.tx);
						setRouteDetails(data.route || { swaps: [] });
					} else if (data.status === 'NoWay') {
						console.warn(`No swap route found for ${tokenIn} → ${tokenOut} on chain ${chainId}`);
						setAmountOut("");
						setEstimatedGas(null);
						setQuoteData(null);
						setRouteDetails([]);
					} else {
						throw new Error(`SushiSwap status: ${data.status}`);
					}
				}
			}


			console.log("data", data);

		} catch (err) {
			if (requestIdRef.current === thisRequestId) {
				console.error(err);
				setAmountOut("");
				setRouteDetails([]);
				setEstimatedGas(null);
				setQuoteData(null);
			}
		} finally {
			if (requestIdRef.current === thisRequestId) {
				setIsLoading(false);
			}
		}
	};

	const fetchTokenPrices = async () => {
		try {
			const prices = {};

			if (tokenIn !== "PulseChain from pump.tires" && TOKENS[tokenIn]?.address) {
				try {
					const response = await fetch(`https://api.geckoterminal.com/api/v2/networks/pulsechain/tokens/${TOKENS[tokenIn].address}`);
					if (response.ok) {
						const data = await response.json();
						prices[TOKENS[tokenIn].address.toLowerCase()] = data.data?.attributes?.price_usd || 0;
						console.log(`Price for ${tokenIn}:`, data.data?.attributes?.price_usd);
					}
				} catch (err) {
					console.error(`Error fetching price for ${tokenIn}:`, err);
				}
			}

			if (tokenOut !== "PulseChain from pump.tires" && TOKENS[tokenOut]?.address && tokenOut !== tokenIn) {
				try {
					const response = await fetch(`https://api.geckoterminal.com/api/v2/networks/pulsechain/tokens/${TOKENS[tokenOut].address}`);
					if (response.ok) {
						const data = await response.json();
						prices[TOKENS[tokenOut].address.toLowerCase()] = data.data?.attributes?.price_usd || 0;
						console.log(`Price for ${tokenOut}:`, data.data?.attributes?.price_usd);
					}
				} catch (err) {
					console.error(`Error fetching price for ${tokenOut}:`, err);
				}
			}

			if (tokenIn === "PulseChain from pump.tires" || tokenOut === "PulseChain from pump.tires") {
				try {
					const plsResponse = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=pulsechain&vs_currencies=usd");
					const plsData = await plsResponse.json();
					if (plsData.pulsechain) {
						prices["PulseChain from pump.tires"] = plsData.pulsechain.usd;
						console.log("PLS price:", plsData.pulsechain.usd);
					}
				} catch (err) {
					console.error("Error fetching PLS price:", err);
				}
			}

			const fallbackPrices = {};
			Object.keys(fallbackPrices).forEach((address) => {
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

	const calculateUsdValues = () => {
		if (!amountIn || isNaN(amountIn)) {
			setInputUsdValue("");
			setOutputUsdValue("");
			return;
		}

		let inputPrice = 0;
		if (tokenIn === "PulseChain from pump.tires") {
			inputPrice = tokenPrices["PulseChain from pump.tires"] || 0;
		} else if (TOKENS[tokenIn]?.address) {
			inputPrice = tokenPrices[TOKENS[tokenIn].address.toLowerCase()] || 0;
		}
		const inputUsd = parseFloat(amountIn) * inputPrice;
		setInputUsdValue(inputUsd > 0 ? `$${inputUsd.toFixed(4)}` : "");

		if (amountOut && !isNaN(amountOut)) {
			let outputPrice = 0;
			if (tokenOut === "PulseChain from pump.tires") {
				outputPrice = tokenPrices["PulseChain from pump.tires"] || 0;
			} else if (TOKENS[tokenOut]?.address) {
				outputPrice = tokenPrices[TOKENS[tokenOut].address.toLowerCase()] || 0;
			}
			const outputUsd = parseFloat(amountOut) * outputPrice;
			setOutputUsdValue(outputUsd > 0 ? `$${outputUsd.toFixed(4)}` : "");
		} else {
			setOutputUsdValue("");
		}
	};

	useEffect(() => {
		fetchQuote();
	}, [amountIn, tokenIn, tokenOut]);

	useEffect(() => {
		fetchTokenPrices();
	}, [tokenIn, tokenOut]);

	useEffect(() => {
		calculateUsdValues();
	}, [amountIn, amountOut, tokenPrices, tokenIn, tokenOut]);

	// Fetch balances when tokens or wallet changes
	useEffect(() => {
		fetchTokenBalance(tokenIn, setTokenInBalance);
	}, [signer, address, tokenIn, TOKENS]);

	useEffect(() => {
		fetchTokenBalance(tokenOut, setTokenOutBalance);
	}, [signer, address, tokenOut, TOKENS]);

	return {
		amountOut,
		estimatedGas,
		quoteData,
		routeDetails,
		tokenPrices,
		inputUsdValue,
		outputUsdValue,
		tokenInBalance,
		tokenOutBalance,
		fetchQuote,
		fetchTokenPrices,
		isLoading,
	};
};

export default useSwapData;