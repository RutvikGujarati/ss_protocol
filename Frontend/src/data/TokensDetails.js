import { useState, useEffect, useCallback, useMemo } from "react";
import {
	getDAVContractAddress,
	getSTATEContractAddress,
} from "../Constants/ContractAddresses";
import { useSwapContract } from "../Functions/SwapContractFunctions";
import { useDAvContract } from "../Functions/DavTokenFunctions";
import { useChainId } from "wagmi";

export const shortenAddress = (addr) =>
	addr ? `${addr.slice(0, 6)}...${addr.slice(-6)}` : "";

// Cache implementation
class TokenCache {
	constructor(ttl = 30000) { // 30 seconds TTL
		this.cache = new Map();
		this.ttl = ttl;
	}

	set(key, value) {
		this.cache.set(key, {
			data: value,
			timestamp: Date.now()
		});
	}

	get(key) {
		const item = this.cache.get(key);
		if (!item) return null;

		if (Date.now() - item.timestamp > this.ttl) {
			this.cache.delete(key);
			return null;
		}

		return item.data;
	}

	clear() {
		this.cache.clear();
	}

	has(key) {
		const item = this.cache.get(key);
		if (!item) return false;

		if (Date.now() - item.timestamp > this.ttl) {
			this.cache.delete(key);
			return false;
		}

		return true;
	}
}

// Global cache instance
const tokenCache = new TokenCache();

export const TokensDetails = () => {
	const swap = useSwapContract();
	const { Emojies, names } = useDAvContract();
	const chainId = useChainId();
	const [loading, setLoading] = useState(true);
	const [tokens, setTokens] = useState([]);

	// Create cache key based on chain and critical data
	const cacheKey = useMemo(() =>
		`tokens_${chainId}_${swap.TokenNames?.length || 0}_${names?.length || 0}`,
		[chainId, swap.TokenNames?.length, names?.length]
	);

	// Get contract addresses for the connected chain
	const getDavAddress = useCallback(() => getDAVContractAddress(chainId), [chainId]);
	const getStateAddress = useCallback(() => getSTATEContractAddress(chainId), [chainId]);

	// Memoized name-to-emoji mapping
	const nameToEmoji = useMemo(() => {
		if (!Array.isArray(names) || !Array.isArray(Emojies) || names.length !== Emojies.length) {
			return {};
		}

		return names.reduce((acc, name, index) => {
			acc[name.toLowerCase()] = Emojies[index] || "🔹";
			return acc;
		}, {});
	}, [names, Emojies]);

	// Memoized static tokens
	const staticTokens = useMemo(() => [
		{
			name: "DAV",
			key: "DAV",
			displayName: "pDAV",
			address: getDavAddress(),
			supply: "5,000,000.00",
			price: 0,
			actions: {
				ReanounceContract: swap.ReanounceContract,
			},
		},
		{
			name: "STATE",
			key: "state",
			address: getStateAddress(),
		},
	], [getDavAddress, getStateAddress, swap.ReanounceContract]);

	// Memoized dynamic tokens
	const dynamicTokens = useMemo(() => {
		if (!swap.TokenNames) return [];

		return Array.from(swap.TokenNames)
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
	}, [swap.TokenNames, swap.tokenMap, nameToEmoji]);

	// Optimized token processing function
	const processTokens = useCallback(() => {
		const data = [...staticTokens, ...dynamicTokens];

		return data.map((token) => {
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
				BurnedLp: swap.burnedLPAmount?.[token.name]?.balance ?? "0",
				burned: swap.burnedAmount?.[key],
				isSupported:
					token.name === "DAV"
						? "true"
						: token.name === "STATE"
							? "true"
							: swap.supportedToken?.[key],
				TokenAddress: token.address,
				PairAddress: swap.TokenPariAddress?.[key] || "0x0000000000000000000000000000000000000000",
				Cycle:
					swap.CurrentCycleCount?.[key] === "not started"
						? "Not Started"
						: swap.CurrentCycleCount?.[key] + 1,
			};
		});
	}, [staticTokens, dynamicTokens, swap]);

	// Check if essential data is ready
	const isEssentialDataReady = useMemo(() => {
		return Boolean(
			swap.TokenNames?.length >= 0 && // Allow empty arrays
			nameToEmoji &&
			staticTokens?.length > 0
		);
	}, [swap.TokenNames, nameToEmoji, staticTokens]);

	// Check if all data is loaded
	const isAllDataLoaded = useMemo(() => {
		if (dynamicTokens.length === 0) return true;

		return Boolean(
			swap.tokenMap &&
			Object.keys(swap.tokenMap).length > 0 &&
			swap.TokenRatio &&
			swap.isTokenRenounce &&
			swap.TokenBalance &&
			swap.burnedAmount &&
			swap.supportedToken &&
			swap.CurrentCycleCount
		);
	}, [
		dynamicTokens.length,
		swap.tokenMap,
		swap.TokenRatio,
		swap.isTokenRenounce,
		swap.TokenBalance,
		swap.burnedAmount,
		swap.supportedToken,
		swap.CurrentCycleCount
	]);

	// Effect to handle data loading with caching
	useEffect(() => {
		// Check cache first
		if (tokenCache.has(cacheKey)) {
			const cachedTokens = tokenCache.get(cacheKey);
			setTokens(cachedTokens);
			setLoading(false);
			return;
		}

		// If essential data is ready, show partial data immediately
		if (isEssentialDataReady) {
			const processedTokens = processTokens();
			setTokens(processedTokens);

			// If all data is loaded, cache it and stop loading
			if (isAllDataLoaded) {
				tokenCache.set(cacheKey, processedTokens);
				setLoading(false);
			} else {
				// Show partial data but keep loading for complete data
				setLoading(true);
			}
		}
	}, [cacheKey, isEssentialDataReady, isAllDataLoaded, processTokens]);

	// Separate effect for final data completion
	useEffect(() => {
		if (isAllDataLoaded && isEssentialDataReady) {
			const processedTokens = processTokens();
			setTokens(processedTokens);
			tokenCache.set(cacheKey, processedTokens);
			setLoading(false);
		}
	}, [isAllDataLoaded, isEssentialDataReady, processTokens, cacheKey]);

	// Clear cache when chain changes
	useEffect(() => {
		return () => {
			if (chainId) {
				tokenCache.clear();
			}
		};
	}, [chainId]);

	return { tokens, loading };
};