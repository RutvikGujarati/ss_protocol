// useAddTokens.js

import { ethers } from "ethers";
import FluxinLogo from "../assets/2.png";
import { useDAvContract } from "../Functions/DavTokenFunctions";
import { useSwapContract } from "../Functions/SwapContractFunctions";

// ✅ 1. First hook: for general token config
export const useAddTokens = () => {
	const { names, users } = useDAvContract(); // tokenMap replaces deployedAddress
	const { tokenMap, TimeLeftClaim } = useSwapContract(); // tokenMap replaces deployedAddress

	const tokenConfigs = users.map((user, index) => {
		const name = names[index] || 'Unknown';
		const tokenAddress = tokenMap?.[name] || '0x0000000000000000000000000000000000000000';
		const timeLeft = TimeLeftClaim?.[name]
		return {
			user,
			name,
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

	console.log("Raw UsersSupportedTokens:", UsersSupportedTokens);

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

		if (token && typeof token === "object") {
			if (token.address && ethers.isAddress(token.address)) {
				actualAddress = token.address;
			}
			if (token.name) {
				tokenName = token.name;
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
		};

		console.log("Token entry:", tokenEntry);
		return tokenEntry;
	});

	return result;
};

// ✅ Exported Addresses Object: tokenName with tokenAddress

