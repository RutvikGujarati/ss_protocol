import { useContext } from "react";
import {
	DAV_TOKEN_ADDRESS, DAV_TOKEN_SONIC_ADDRESS,
	STATE_TOKEN_ADDRESS, STATE_TOKEN_SONIC_ADDRESS,
	Yees_testnet
} from "../ContractAddresses";
import { PriceContext } from "../api/StatePrice";
import { useSwapContract } from "../Functions/SwapContractFunctions";
import { useGeneralTokens } from "../Functions/GeneralTokensFunctions";
import { useChainId } from "wagmi";

export const shortenAddress = (addr) => addr ? `${addr.slice(0, 6)}...${addr.slice(-6)}` : "";

export const TokensDetails = () => {
	const prices = useContext(PriceContext);

	const { CurrentRatioPrice } = useGeneralTokens();

	const swap = useSwapContract();
	const chainId = useChainId()
	const tokens = [
		{
			name: "DAV",
			key:"DAV",
			displayName: "pDAV",
			address: DAV_TOKEN_ADDRESS,
			supply: "5,000,000.00",
			price: 0,
			actions: {

				ReanounceContract: swap.ReanounceContract,
			},
		},


		{
			name: "STATE",
			key: "state",
			address: STATE_TOKEN_ADDRESS,
			price: prices.stateUsdPrice,

		},
		{
			name: "Yees",
			key: "Yees",
			address: Yees_testnet,
			price: prices.FluxinUsdPrice,

		},
	];

	const SonicTokens = [
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
	]
	const data = chainId === 146 ? SonicTokens : tokens;

	return data.map((token) => {
		const key = token.key;
		const isState = token.name === "STATE";

		return {
			tokenName: token.name,
			key: shortenAddress(token.address),
			name: token.displayName || token.name,
			Price: token.price,
			address: token.address,
			Cycle: swap.CurrentCycleCount[key],
			handleAddTokens: () => swap[`handleAdd${key}`](),
			renounceSmartContract: key == "OneDollar" ? swap.isRenounced["oneD"] : swap.isRenounced?.[key] ?? "Unknown",

			actions: {
				...(token.actions || {}), // Include any custom actions (e.g., for DAV)
				ReanounceContract: swap[`Reanounce${key}Contract`] || swap.ReanounceContract,
				ReanounceSwapContract: swap[`Renounce${key}Swap`],
				AddTokenToContract: () => swap.AddTokensToContract(token.address, STATE_TOKEN_ADDRESS, CurrentRatioPrice[key]),
				...(isState && {
					AddTokenToContract: swap.AddTokens,
				}),
			},
		};
	});
};