import { useContext, useState, useEffect } from "react";
import {
	DAV_TESTNET,
	DAV_TOKEN_SONIC_ADDRESS,
	STATE_TESTNET,
	STATE_TOKEN_SONIC_ADDRESS,
} from  "../Constants/ContractAddresses";
import { PriceContext } from "../api/StatePrice";
import { useSwapContract } from "../Functions/SwapContractFunctions";
import { useChainId } from "wagmi";
import { useDAvContract } from "../Functions/DavTokenFunctions";

export const shortenAddress = (addr) =>
	addr ? `${addr.slice(0, 6)}...${addr.slice(-6)}` : "";

export const TokensDetails = () => {
	const prices = useContext(PriceContext);
	const swap = useSwapContract();
	const { Emojies } = useDAvContract();
	const chainId = useChainId();
	const [loading, setLoading] = useState(true); // Add loading state

	const staticTokens = [
		{
			name: "DAV",
			key: "DAV",
			displayName: "pDAV",
			address: DAV_TESTNET,
			supply: "5,000,000.00",
			price: 0,
			actions: {
				ReanounceContract: swap.ReanounceContract,
			},
		},
		{
			name: "STATE",
			key: "state",
			address: STATE_TESTNET,
			price: prices.stateUsdPrice,
		},
	];

	const sonicTokens = [
		{
			name: "DAV",
			key: "dav",
			displayName: "sDAV",
			address: DAV_TOKEN_SONIC_ADDRESS,
			supply: "5,000,000.00",
			price: 0,
			actions: {
				ReanounceContract: swap.ReanounceContract,
			},
		},
		{
			name: "STATE",
			key: "state",
			address: STATE_TOKEN_SONIC_ADDRESS,
			price: "0.0000",
			mintAmount: "1,000,000,000,000",
		},
	];

	const dynamicTokens = Array.from(swap.TokenNames || [])
		.filter((name) => name !== "DAV" && name !== "STATE")
		.map((name) => ({
			name,
			key: name,
			address: swap.tokenMap?.[name] || "0x0000000000000000000000000000000000000000",
			price: 0,
		}));

	const data = chainId === 146 ? sonicTokens : [...staticTokens, ...dynamicTokens];

	const tokens = data.map((token) => {
		const key = token.key;
		const emojiMap =
			Array.isArray(swap.TokenNames) && Array.isArray(Emojies)
				? swap.TokenNames.reduce((acc, name, index) => {
					acc[name.toLowerCase()] = Emojies[index];
					return acc;
				}, {})
				: {};

		return {
			tokenName: token.name,
			key: shortenAddress(token.address),
			name: token.displayName || token.name,
			Price: token.price,
			ratio:swap.TokenRatio?.[key],
			emoji:
				token.name === "DAV"
					? "🧮"
					: token.name === "STATE"
						? "🧮"
						: emojiMap[key.toLowerCase()] || "🔹", // Fallback emoji for dynamic tokens
			isRenounced: swap.isTokenRenounce[token.name],
			DavVault: swap.TokenBalance?.[key],
			burned: swap.burnedAmount?.[key],
			isDeposited: swap.StateDeposited?.[token.address],
			isSupported:
				token.name === "DAV"
					? "true"
					: token.name === "STATE"
						? "true"
						: swap.supportedToken?.[key],
			TokenAddress: token.address,
			Cycle:
				swap.CurrentCycleCount?.[key] === "not started"
					? "Not Started"
					: swap.CurrentCycleCount?.[key] + 1,
		};
	});

	// Check if all required data for dynamic tokens is fetched
	useEffect(() => {
		const checkDataFetched = () => {
			// If there are no dynamic tokens, set loading to false as only static tokens (DAV and STATE) are present
			if (dynamicTokens.length === 0) {
				setLoading(false);
				return;
			}

			// Ensure all required arrays/objects for dynamic tokens are non-empty and defined
			const isDataReady =
				swap.TokenNames?.length > 0 &&
				swap.tokenMap &&
				Object.keys(swap.tokenMap).length > 0 &&
				Emojies?.length > 0 &&
				swap.isTokenRenounce &&
				swap.TokenBalance &&
				swap.burnedAmount &&
				swap.supportedToken &&
				swap.CurrentCycleCount &&
				prices;

			if (isDataReady) {
				setLoading(false); // All data for dynamic tokens is fetched
			} else {
				setLoading(true); // Keep loading until all data is ready
			}
		};

		checkDataFetched();

		// Re-check when any of the dependencies change
	}, [
		swap.TokenNames,
		swap.tokenMap,
		Emojies,
		swap.isTokenRenounce,
		swap.TokenBalance,
		swap.burnedAmount,
		swap.supportedToken,
		swap.CurrentCycleCount,
		prices,
		dynamicTokens.length, // Add dynamicTokens.length to handle case when no dynamic tokens exist
	]);

	return { tokens, loading }; // Return tokens and loading state
};