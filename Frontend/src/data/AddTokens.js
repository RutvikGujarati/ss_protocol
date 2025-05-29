// useAddTokens.js

import { ethers } from "ethers";
import FluxinLogo from "../assets/2.png";
import { useDAvContract } from "../Functions/DavTokenFunctions";
import { useSwapContract } from "../Functions/SwapContractFunctions";
import { useEffect, useState } from "react";

// ✅ 1. First hook: for general token config
export const useAddTokens = () => {
	const { names, users, Emojies, isUsed } = useDAvContract();
	const { tokenMap, TimeLeftClaim, supportedToken, isTokenRenounce } = useSwapContract();
	const [AuthLoading, setAuthLoading] = useState(true);

	useEffect(() => {
		console.log("useAddTokens Dependencies:", {
			names,
			users,
			Emojies,
			isUsed,
			tokenMap,
			TimeLeftClaim,
			supportedToken,
			isTokenRenounce,
		});

		const checkDataFetched = () => {
			const isDataReady =
				names?.length > 0 &&
				users?.length > 0 &&
				Emojies?.length > 0 &&
				isUsed?.length > 0 &&
				tokenMap &&
				Object.keys(tokenMap).length > 0 &&
				TimeLeftClaim &&
				supportedToken &&
				isTokenRenounce;

			console.log("isDataReady:", isDataReady);
			setAuthLoading(!isDataReady);
		};

		checkDataFetched();
	}, [names, users, Emojies, isUsed, tokenMap, TimeLeftClaim, supportedToken, isTokenRenounce]);

	const isUsedMap = names.reduce((acc, name, index) => {
		acc[name] = isUsed?.[index] ?? false;
		return acc;
	}, {});

	const tokenConfigs = users.map((user, index) => {
		const name = names[index] || `Unknown_${index}`;
		const isDeployed = isUsedMap[name] ?? false;
		const isRenounceToken = isTokenRenounce?.[name] ?? false;
		const isAdded = supportedToken?.[name] ?? false;
		const Emojis = Emojies[index] || "❓";
		const tokenAddress = tokenMap?.[name] || "0x0000000000000000000000000000000000000000";
		const timeLeft = TimeLeftClaim?.[name] || "0";
		return {
			user,
			name,
			Emojis,
			isDeployed,
			isAdded,
			isRenounceToken,
			contract: name || user,
			image: FluxinLogo,
			tokenAddress,
			timeLeft,
		};
	});

	return {
		tokens: tokenConfigs.map((config) => ({
			id: config.user,
			user: config.user,
			name: config.name,
			isDeployed: config.isDeployed,
			Emojis: config.Emojis,
			isRenounceToken: config.isRenounceToken,
			isAdded: config.isAdded,
			Pname: `${config.name} - State - ${config.name}`,
			ReverseName: `State - ${config.name}`,
			ContractName: config.contract === "OneDollar" ? "oneD" : config.contract,
			image: config.image,
			TokenAddress: config.tokenAddress,
			TimeLeft: config.timeLeft,
		})),
		AuthLoading,
	};
};

// ✅ 2. Second hook: for owner-specific supported tokens


export const useUsersOwnerTokens = () => {
	const { UsersSupportedTokens, StateDeposited, IsBurned } = useSwapContract();
	const { names, Emojies } = useDAvContract();
	console.log("names", names)
	console.log("Raw UsersSupportedTokens:", UsersSupportedTokens);
	console.log("Raw :", StateDeposited);

	// Create name → Emojies map
	const emojiesMap = names.reduce((acc, name, index) => {
		acc[name] = Emojies?.[index] ?? 'Unknown';
		return acc;
	}, {});


	let tokenList = [];

	if (UsersSupportedTokens) {
		try {
			// Handle array of { address, name, pairAddress } objects
			if (Array.isArray(UsersSupportedTokens)) {
				tokenList = UsersSupportedTokens;
			} else if (typeof UsersSupportedTokens === "object") {
				tokenList = Object.values(UsersSupportedTokens).flat();
			}
		} catch (error) {
			console.error("Error processing UsersSupportedTokens:", error);
			tokenList = [];
		}
	}

	console.log("Processed tokenList:", tokenList);

	const result = tokenList.map((token, index) => {
		let actualAddress = "0x0000000000000000000000000000000000000000";
		let tokenName = `Token_${index + 1}`;
		let pairAddress = "0x0000000000000000000000000000000000000000";
		let nextClaimTime = "0";
		let emojis = emojiesMap[tokenName] || 'Unknown';
		if (token && typeof token === "object") {
			if (token.address && ethers.isAddress(token.address)) {
				actualAddress = token.address;
			}
			if (token.name) {
				tokenName = token.name;
				emojis = emojiesMap[tokenName] || 'Unknown';

			}
			if (token.pairAddress && ethers.isAddress(token.pairAddress)) {
				pairAddress = token.pairAddress;
			}
			if (token.nextClaimTime) {
				nextClaimTime = token.nextClaimTime;
			}
		} else if (typeof token === "string" && ethers.isAddress(token)) {
			actualAddress = token;
		}

		const tokenEntry = {
			name: tokenName,
			address: actualAddress,
			pairAddress: pairAddress,
			nextClaimTime: nextClaimTime,
			Emojis: emojis,
			isDeposited: StateDeposited?.[actualAddress],
			isBurned: IsBurned?.[actualAddress],
		};

		console.log("Token entry:", tokenEntry);
		return tokenEntry;
	});

	return result;
};

// ✅ Exported Addresses Object: tokenName with tokenAddress

