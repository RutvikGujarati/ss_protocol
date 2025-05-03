// useAddTokens.js

import { ethers } from "ethers";
import FluxinLogo from "../assets/2.png";
import { useDAvContract } from "../Functions/DavTokenFunctions";
import { useSwapContract } from "../Functions/SwapContractFunctions";

// ✅ 1. First hook: for general token config
export const useAddTokens = () => {
	const { names, users, Emojies, isUsed } = useDAvContract(); // tokenMap replaces deployedAddress
	const { tokenMap, TimeLeftClaim, supportedToken, isTokenRenounce } = useSwapContract(); // tokenMap replaces deployedAddress


	// Create name → isUsed map
	const isUsedMap = names.reduce((acc, name, index) => {
		acc[name] = isUsed?.[index] ?? false;
		return acc;
	}, {});


	const tokenConfigs = users.map((user, index) => {
		const name = names[index] || 'Unknown';
		const isDeployed = isUsedMap[name];
		const isRenounceToken = isTokenRenounce[name];
		const isAdded = supportedToken[name];
		const Emojis = Emojies[index] || 'Unknown';
		const tokenAddress = tokenMap?.[name] || '0x0000000000000000000000000000000000000000';
		const timeLeft = TimeLeftClaim?.[name]
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
			timeLeft: timeLeft,
		};
	});

	return tokenConfigs.map(config => ({
		id: config.user,
		user: config.user,
		name: config.name,
		isDeployed: config.isDeployed,
		Emojis: config.Emojis,
		isRenounceToken: config.isRenounceToken,
		isAdded: config.isAdded,
		Pname: `${config.name} - State - ${config.name}`,
		ReverseName: `State - ${config.name}`,
		ContractName: config.contract === 'OneDollar' ? 'oneD' : config.contract,
		image: config.image,
		TokenAddress: config.tokenAddress,
		TimeLeft: config.timeLeft,
	}));
};


// ✅ 2. Second hook: for owner-specific supported tokens


export const useUsersOwnerTokens = () => {
	const { UsersSupportedTokens } = useSwapContract();
	const { names, Emojies } = useDAvContract();

	console.log("Raw UsersSupportedTokens:", UsersSupportedTokens);

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
		};

		console.log("Token entry:", tokenEntry);
		return tokenEntry;
	});

	return result;
};

// ✅ Exported Addresses Object: tokenName with tokenAddress

