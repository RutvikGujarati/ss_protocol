import { useContext } from 'react';
import FluxinLogo from "../assets/2.png";

import {  Yees_testnet } from "../ContractAddresses";
import { useSwapContract } from "../Functions/SwapContractFunctions";
import { PriceContext } from "../api/StatePrice";

export const useAuctionTokens = () => {
	const prices = useContext(PriceContext);
	const {
		SwapTokens, isReversed,AuctionTime, RatioTargetsofTokens, IsAuctionActive,
		userHashSwapped, userHasReverseSwapped, InputAmount,OutPutAmount,
		handleAddYees,AirdropClaimed
	} = useSwapContract();

	const tokenConfigs = [
		["Yees", "Yees", FluxinLogo, Yees_testnet, handleAddYees],

	];

	// console.log("auction yees time",AuctionTime["Yees"])
	return tokenConfigs.map(([id, contract, image, token, handleAddToken]) => ({
		id, name: id, Pname: `${id} - State - ${id}`, ReverseName: `State - ${id}`,
		ContractName: contract === "OneDollar" ? "oneD" : contract, image, token, handleAddToken,
		ratio: `1:${RatioTargetsofTokens?.[contract] || 0}`,
		currentRatio: `1:1000`,
		TimeLeft : AuctionTime?.[contract],
		AirdropClaimedForToken:AirdropClaimed[contract],
		isReversing: isReversed?.[contract],
		// currentTokenRatio: CurrentRatioPrice[contract],
		RatioTargetToken: RatioTargetsofTokens?.[contract] || 0,
		Price: prices?.[`${contract}UsdPrice`],
		// isReversing: isReversed?.[contract],
		address: Yees_testnet,
		// AuctionStatus: "true",
		AuctionStatus: IsAuctionActive?.[contract],
		userHasSwapped: userHashSwapped?.[contract],
		userHasReverse: userHasReverseSwapped?.[contract],
		SwapT: () => SwapTokens(id, contract),
		onlyInputAmount: InputAmount[contract],
		inputTokenAmount: `${InputAmount[contract] || 0} ${id}`,
		outputToken: `${OutPutAmount?.[contract] || 0} State`,
		onChart: `https://www.geckoterminal.com/pulsechain/pools/${getChartId(contract)}`,
	}));

	function getChartId(contract) {
		const chartIds = {
			Fluxin: "0x5fda4e9db01df8747fd367abb98ea50447c5cb38",
			Xerion: "0xc7d4d22af7a4ef1ffe25235c4d4cce9b7ab77edf",
			OneDollar: "0x6916be7b7a36d8bc1c09eae5487e92ff837626bb",  // Keeps "OneDollar" for all other references
			Rieva: "0x3c504c7d2a99e212c186aa0bc47a9e94dd7ac827",
			TenDollar: "0x86e8330efe0dfc20ab8f63dcf95a6a8d66f60c1d",
			Domus: "0x7019ee4173420ee652edc9a26bffc91469c753db",
			Currus: "0xe4a02db896cee9dbf32d730dc9874eb058f0ca3f",
			Valir: "0x1d3796d78ffdca93b501ff442aba4123bb334cd1",
			Sanitas: "0xbab8540dee05ba25cec588ce5124aa50b1d7d425"
		};
		return chartIds[contract] || "";
	}
};
