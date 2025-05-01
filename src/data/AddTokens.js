// useAddTokens.js

import { ethers } from "ethers";
import FluxinLogo from "../assets/2.png";
import { useDAvContract } from "../Functions/DavTokenFunctions";
import { useSwapContract } from "../Functions/SwapContractFunctions";

// ✅ 1. First hook: for general token config
export const useAddTokens = () => {
	const { names, users, deployedAddress } = useDAvContract();

	const tokenConfigs = users.map((user, index) => ({
		user,
		name: names[index] || 'Unknown',
		contract: names[index] || user,
		image: FluxinLogo,
		tokenAddress: deployedAddress,
		timeLeft: 'N/A',
	}));

	return tokenConfigs.map(config => ({
		id: config.user,
		user: config.user,
		name: config.name,
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

	// Debug: Log raw UsersSupportedTokens
	console.log("Raw UsersSupportedTokens:", UsersSupportedTokens);

	let tokenList = [];

	if (UsersSupportedTokens) {
		try {
			// Handle array of { address, name } objects
			if (Array.isArray(UsersSupportedTokens)) {
				tokenList = UsersSupportedTokens;
			} else if (UsersSupportedTokens && typeof UsersSupportedTokens === "object") {
				tokenList = Object.values(UsersSupportedTokens).flat();
			}
		} catch (error) {
			console.error("Error processing UsersSupportedTokens:", error);
			tokenList = [];
		}
	}

	// Debug: Log processed tokenList
	console.log("Processed tokenList:", tokenList);

	const result = tokenList.map((token, index) => {
		let actualAddress = "0x000";
		let tokenName = `Token_${index + 1}`;

		// Handle token object with address and name
		if (token && typeof token === "object") {
			if (token.address && ethers.isAddress(token.address)) {
				actualAddress = token.address;
			}
			if (token.name) {
				tokenName = token.name;
			}
		} else if (typeof token === "string" && ethers.isAddress(token)) {
			// Fallback for address-only arrays
			actualAddress = token;
		}

		const tokenEntry = {
			name: tokenName,
			address: actualAddress,
		};

		console.log("Token entry:", tokenEntry);
		return tokenEntry;
	});

	return result;
};
