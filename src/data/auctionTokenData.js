import { useContext } from 'react';
import FluxinLogo from "../assets/FluxinLogo.png";
import XerionLogo from "../assets/layti.png";
import RievaLogo from "../assets/rieva.png";
import oned from "../assets/oned.png";

import { $1, Fluxin, Rieva, Xerion } from "../ContractAddresses";
import { useSwapContract } from "../Functions/SwapContractFunctions";
import { PriceContext } from "../api/StatePrice";
import { useGeneralAuctionFunctions } from '../Functions/GeneralAuctionFunctions';
import { useGeneralTokens } from '../Functions/GeneralTokensFunctions';

// Custom hook to get auction tokens data
export const useAuctionTokens = () => {
	// Get the chain id

	const {
		FluxinUsdPrice,
		XerionUsdPrice,
		OneDollarUsdPrice,
		RievaUsdPrice
	} = useContext(PriceContext);
	const { AuctionRunning } = useGeneralAuctionFunctions();
	const { CurrentRatioPrice } = useGeneralTokens();
	const { Distributed } = useGeneralTokens();

	const {
		SwapTokens,
		isReversed,
		RatioTargetsofTokens,
		outAmounts,
		userHashSwapped,
		userHasReverseSwapped,
		handleAddFluxin,
		handleAddXerion,
		handleAddRieva,
		handleAddOneD,
		OnePBalance,
	} = useSwapContract();
	console.log("is running from obj", isReversed.Fluxin)
	console.log("is running from obj", OneDollarUsdPrice)

	const tokens = [
		{
			id: "Orxa",
			name: "Orxa",
			Pname: "Orxa - State - Orxa",
			ReverseName: "State - Orxa",
			ContractName: "Fluxin",
			image: FluxinLogo,
			ratio: `1:${RatioTargetsofTokens?.["Fluxin"] || 0}`,
			currentRatio: `1:${CurrentRatioPrice.Fluxin || 0}`,
			currentTokenRatio: CurrentRatioPrice.Fluxin,
			RatioTargetToken: RatioTargetsofTokens?.["Fluxin"] || 0,
			Price: FluxinUsdPrice,
			isReversing: isReversed?.Fluxin.toString(),
			AuctionStatus: AuctionRunning?.Fluxin,
			userHasSwapped: userHashSwapped?.Fluxin,
			userHasReverse: userHasReverseSwapped?.Fluxin,
			ErroutAmountsorName: "Fluxin",
			onChart: "https://www.geckoterminal.com/pulsechain/pools/0x5fda4e9db01df8747fd367abb98ea50447c5cb38",
			// distributedAmount: 20000,
			distributedAmount: Distributed?.["Fluxin"] || 0,
			token: Fluxin,
			handleAddToken: handleAddFluxin,
			onlyInputAmount: OnePBalance.Fluxin,
			inputTokenAmount: `${OnePBalance.Fluxin || 0} Orxa`,
			SwapT: () => SwapTokens("Orxa", "Fluxin"),
			ratioPrice: CurrentRatioPrice.Fluxin,
			outputToken: `${outAmounts?.Fluxin || 0} State`,
		},
		{
			id: "Layti",
			name: "Layti",
			Pname: "Layti - State - Layti",
			ReverseName: "State - Layti",
			ContractName: "Xerion",
			image: XerionLogo,
			ratio: `1:${RatioTargetsofTokens?.["Xerion"] || 0}`,
			userHasSwapped: userHashSwapped.Xerion,
			userHasReverse: userHasReverseSwapped.Xerion,
			currentRatio: `1:${CurrentRatioPrice.Xerion || 0}`,
			Price: XerionUsdPrice,
			isReversing: isReversed?.Xerion.toString(),
			currentTokenRatio: CurrentRatioPrice.Xerion,
			ErrorName: "Xerion",
			RatioTargetToken: RatioTargetsofTokens?.["Xerion"] || 0,
			AuctionStatus: AuctionRunning?.Xerion,
			onChart: "https://www.geckoterminal.com/pulsechain/pools/0xc7d4d22af7a4ef1ffe25235c4d4cce9b7ab77edf",
			distributedAmount: Distributed?.["Xerion"] || 0,
			token: Xerion,
			SwapT: () => SwapTokens("Layti", "Xerion"),
			ratioPrice: CurrentRatioPrice.Xerion,
			handleAddToken: handleAddXerion,
			onlyInputAmount: OnePBalance.Xerion,
			inputTokenAmount: `${OnePBalance.Xerion || 0} Layti`,
			outputToken: `${outAmounts?.Xerion || 0} State`,
		},
		{
			id: "1$",
			name: "1$",
			Pname: "1$ - State - 1$",
			ReverseName: "State - 1$",
			ContractName: "oneD",
			image: oned,
			ratio: `1:${RatioTargetsofTokens?.["OneDollar"] || 0}`,
			userHasSwapped: userHashSwapped.OneDollar,
			userHasReverse: userHasReverseSwapped.OneDollar,
			currentRatio: `1:${CurrentRatioPrice.OneDollar || 0}`,
			Price: OneDollarUsdPrice,
			isReversing: isReversed?.OneDollar.toString(),
			currentTokenRatio: CurrentRatioPrice.OneDollar,
			ErrorName: "OneDollar",
			RatioTargetToken: RatioTargetsofTokens?.["OneDollar"] || 0,
			AuctionStatus: AuctionRunning?.OneDollar,
			onChart: "https://www.geckoterminal.com/pulsechain/pools/0x6916be7b7a36d8bc1c09eae5487e92ff837626bb",
			distributedAmount: Distributed?.["oneD"] || 0,
			token: $1,
			SwapT: () => SwapTokens("1$", "OneDollar"),
			ratioPrice: CurrentRatioPrice.OneDollar,
			handleAddToken: handleAddOneD,
			onlyInputAmount: OnePBalance.OneDollar,
			inputTokenAmount: `${OnePBalance.OneDollar || 0} 1$`,
			outputToken: `${outAmounts?.OneDollar || 0} State`,
		},
		{
			id: "Rieva",
			name: "Rieva",
			Pname: "Rieva - State - Rieva",
			ReverseName: "State - Rieva",
			ContractName: "Rieva",
			image: RievaLogo,
			ratio: `1:${RatioTargetsofTokens?.["Rieva"] || 0}`,
			userHasSwapped: userHashSwapped.Rieva,
			userHasReverse: userHasReverseSwapped.Rieva,
			currentRatio: `1:${CurrentRatioPrice.Rieva || 0}`,
			Price: RievaUsdPrice,
			isReversing: isReversed?.Rieva.toString(),
			currentTokenRatio: CurrentRatioPrice.Rieva,
			ErrorName: "Rieva",
			RatioTargetToken: RatioTargetsofTokens?.["Rieva"] || 0,
			AuctionStatus: AuctionRunning?.Rieva,
			onChart: "https://www.geckoterminal.com/pulsechain/pools/0xc7d4d22af7a4ef1ffe25235c4d4cce9b7ab77edf",
			distributedAmount: Distributed?.["Rieva"] || 0,
			token: Rieva,
			SwapT: () => SwapTokens("Rieva", "Rieva"),
			ratioPrice: CurrentRatioPrice.Rieva,
			handleAddToken: handleAddRieva,
			onlyInputAmount: OnePBalance.Rieva,
			inputTokenAmount: `${OnePBalance.Rieva || 0} Rieva`,
			outputToken: `${outAmounts?.Rieva || 0} State`,
		},
	];

	return tokens;
};