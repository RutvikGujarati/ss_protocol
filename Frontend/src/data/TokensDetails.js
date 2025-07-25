import { useState, useEffect } from "react";
import {
	DAV_TESTNET,
	DAV_TOKEN_SONIC_ADDRESS,
	STATE_TESTNET,
	STATE_TOKEN_SONIC_ADDRESS,
} from "../Constants/ContractAddresses";
import { useSwapContract } from "../Functions/SwapContractFunctions";
import { useDAvContract } from "../Functions/DavTokenFunctions";
import { useChainId } from "wagmi";


export const shortenAddress = (addr) =>
	addr ? `${addr.slice(0, 6)}...${addr.slice(-6)}` : "";

export const TokensDetails = () => {
	const swap = useSwapContract();
	const { Emojies, names } = useDAvContract(); // Add names from useDAvContract
	const chainId = useChainId();
	const [loading, setLoading] = useState(true);

	// Create a name-to-emoji mapping
	const nameToEmoji = Array.isArray(names) && Array.isArray(Emojies) && names.length === Emojies.length
		? names.reduce((acc, name, index) => {
			acc[name.toLowerCase()] = Emojies[index] || "🔹";
			return acc;
		}, {})
		: {};

	// Log for debugging


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
		.map((name) => {
			const emoji = nameToEmoji[name.toLowerCase()];
			return {
				name,
				key: name,
				address: swap.tokenMap?.[name] || "0x0000000000000000000000000000000000000000",
				price: 0,
				emoji: emoji || "🔹",
			};
		});

	const data = chainId === 146 ? sonicTokens : [...staticTokens, ...dynamicTokens];

	const tokens = data.map((token) => {
		const key = token.key;
		let emoji = token.emoji || "🔹";

		return {
			tokenName: token.name,
			key: shortenAddress(token.address),
			name: token.displayName || token.name,
			Price: token.price,
			ratio: swap.TokenRatio?.[key],
			emoji,
			isRenounced: swap.isTokenRenounce?.[token.name],
			DavVault: swap.TokenBalance?.[key],
			burned: swap.burnedAmount?.[key],
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

	useEffect(() => {
		const checkDataFetched = () => {
			if (dynamicTokens.length === 0) {
				setLoading(false);
				return;
			}

			const isDataReady =
				swap.TokenNames?.length > 0 &&
				swap.tokenMap &&
				Object.keys(swap.tokenMap).length > 0 &&
				Emojies?.length > 0 &&
				names?.length > 0 &&
				swap.isTokenRenounce &&
				swap.TokenBalance &&
				swap.burnedAmount &&
				swap.supportedToken &&
				swap.CurrentCycleCount;

			setLoading(!isDataReady); // Now it's using isDataReady correctly
		};


		checkDataFetched();
	}, [
		swap.TokenNames,
		swap.tokenMap,
		Emojies,
		names,
		swap.isTokenRenounce,
		swap.TokenBalance,
		swap.burnedAmount,
		swap.supportedToken,
		swap.CurrentCycleCount,
		dynamicTokens.length,
	]);


	return { tokens, loading };
};