import { useContext } from 'react';
import FluxinLogo from "../assets/FluxinLogo.png";
import XerionLogo from "../assets/layti.png";
import RievaLogo from "../assets/rieva.png";
import TenDollarLogo from "../assets/TenDollar.png";
import DomusLogo from "../assets/domus.png";
import CurrusLogo from "../assets/Currus.png";
import oned from "../assets/oned.png";

import { $1, $10, Currus, Domus, Fluxin, Rieva, Xerion } from "../ContractAddresses";
import { useSwapContract } from "../Functions/SwapContractFunctions";
import { PriceContext } from "../api/StatePrice";
import { useGeneralAuctionFunctions } from '../Functions/GeneralAuctionFunctions';
import { useGeneralTokens } from '../Functions/GeneralTokensFunctions';

export const useAuctionTokens = () => {
	const prices = useContext(PriceContext);
	const { AuctionRunning } = useGeneralAuctionFunctions();
	const { CurrentRatioPrice, Distributed } = useGeneralTokens();
	const {
		SwapTokens, isReversed, RatioTargetsofTokens, outAmounts,
		userHashSwapped, userHasReverseSwapped, OnePBalance,
		handleAddFluxin, handleAddXerion, handleAddRieva, handleAddDomus,
		handleAddOneD, handleAddTenDollar, handleAddCurrus
	} = useSwapContract();

	const tokenConfigs = [
		["Orxa", "Fluxin", FluxinLogo, Fluxin, handleAddFluxin],
		["Layti", "Xerion", XerionLogo, Xerion, handleAddXerion],
		["1$", "OneDollar", oned, $1, handleAddOneD, "oneD"],
		["Rieva", "Rieva", RievaLogo, Rieva, handleAddRieva],
		["10$", "TenDollar", TenDollarLogo, $10, handleAddTenDollar],
		["Domus", "Domus", DomusLogo, Domus, handleAddDomus],
		["Currus", "Currus", CurrusLogo, Currus, handleAddCurrus]
	];

	return tokenConfigs.map(([id, contract, image, token, handleAddToken]) => ({
		id, name: id, Pname: `${id} - State - ${id}`, ReverseName: `State - ${id}`,
		ContractName: contract === "OneDollar" ? "oneD" : contract, image, token, handleAddToken,
		ratio: `1:${RatioTargetsofTokens?.[contract] || 0}`,
		currentRatio: `1:${CurrentRatioPrice[contract] || 0}`,
		currentTokenRatio: CurrentRatioPrice[contract],
		RatioTargetToken: RatioTargetsofTokens?.[contract] || 0,
		Price: prices?.[`${contract}UsdPrice`],
		isReversing: isReversed?.[contract]?.toString(),
		AuctionStatus: AuctionRunning?.[contract],
		userHasSwapped: userHashSwapped?.[contract],
		userHasReverse: userHasReverseSwapped?.[contract],
		distributedAmount: contract === "OneDollar" ? Distributed?.["oneD"] || 0 : Distributed?.[contract] || 0, // Fix: Special case for "OneDollar"
		SwapT: () => SwapTokens(id, contract),
		ratioPrice: CurrentRatioPrice[contract],
		onlyInputAmount: OnePBalance[contract],
		inputTokenAmount: `${OnePBalance[contract] || 0} ${id}`,
		outputToken: `${outAmounts?.[contract] || 0} State`,
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
			Currus: "0xe4a02db896cee9dbf32d730dc9874eb058f0ca3f"
		};
		return chartIds[contract] || "";
	}
};
