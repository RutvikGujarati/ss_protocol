import { useContext } from "react";
import {
	DAV_TESTNET,
	DAV_TOKEN_SONIC_ADDRESS,
	STATE_TESTNET,
	STATE_TOKEN_SONIC_ADDRESS,
} from "../ContractAddresses";
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
			address:STATE_TESTNET,
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

	return data.map((token) => {
		const key = token.key;
		const isState = token.name === "STATE";
		const emojiMap = Array.isArray(swap.TokenNames) && Array.isArray(Emojies)
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
			emoji: token.name == "DAV" ? "🧮" : token.name == "STATE" ? "🧮" : emojiMap[key.toLowerCase()],

			DavVault: swap.TokenBalance?.[key],
			burned: swap.burnedAmount?.[key],
			isSupported: token.name == "DAV" ? "true" : token.name == "STATE" ? "true" : swap.supportedToken?.[key],
			TokenAddress: token.address,
			Cycle: swap.CurrentCycleCount?.[key] ,
			handleAddTokens: () => swap[`handleAdd${key}`]?.(),
			renounceSmartContract:
				key === "OneDollar"
					? swap.isRenounced?.["oneD"]
					: swap.isRenounced?.[key] ?? "Unknown",
			actions: {
				...(token.actions || {}),
				ReanounceContract: swap[`Reanounce${key}Contract`] || swap.ReanounceContract,
				ReanounceSwapContract: swap[`Renounce${key}Swap`],
				...(isState && {
					AddTokenToContract: swap.AddTokens,
				}),
			},
		};
	});
};
