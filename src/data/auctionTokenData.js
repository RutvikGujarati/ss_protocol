import { useContext } from 'react';
import FluxinLogo from "../assets/FluxinLogo.png";
import XerionLogo from "../assets/layti.png";
import oned from "../assets/oned.png";

import { Fluxin, Xerion } from "../ContractAddresses";
import { useSwapContract } from "../Functions/SwapContractFunctions";
import { PriceContext } from "../api/StatePrice";
import { useGeneralAuctionFunctions } from '../Functions/GeneralAuctionFunctions';
import { useGeneralTokens } from '../Functions/GeneralTokensFunctions';

// Custom hook to get auction tokens data
export const useAuctionTokens = () => {
	const {
		FluxinUsdPrice,
		XerionUsdPrice
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
		OnePBalance,
	} = useSwapContract();
	console.log("is running from obj", isReversed.Fluxin)

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
			AuctionStatus:  AuctionRunning?.Xerion,
			onChart: "https://www.geckoterminal.com/pulsechain/pools/0xc7d4d22af7a4ef1ffe25235c4d4cce9b7ab77edf",
			distributedAmount: Distributed?.["Xerion"] || 0,
			token: Xerion,
			SwapT: () => SwapTokens("Layti", "Xerion"),
			ratioPrice: CurrentRatioPrice.Xerion,
			handleAddToken: handleAddXerion,
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
			ratio: `1:${RatioTargetsofTokens?.["Xerion"] || 0}`,
			userHasSwapped: userHashSwapped.Xerion,
			userHasReverse: userHasReverseSwapped.Xerion,
			currentRatio: `1:${CurrentRatioPrice.Xerion || 0}`,
			Price: XerionUsdPrice,
			isReversing: isReversed?.Xerion.toString(),
			currentTokenRatio: CurrentRatioPrice.Xerion,
			ErrorName: "Xerion",
			RatioTargetToken: RatioTargetsofTokens?.["Xerion"] || 0,
			AuctionStatus:  AuctionRunning?.Xerion,
			onChart: "https://www.geckoterminal.com/pulsechain/pools/0xc7d4d22af7a4ef1ffe25235c4d4cce9b7ab77edf",
			distributedAmount: Distributed?.["Xerion"] || 0,
			token: Xerion,
			SwapT: () => SwapTokens("Layti", "Xerion"),
			ratioPrice: CurrentRatioPrice.Xerion,
			handleAddToken: handleAddXerion,
			inputTokenAmount: `${OnePBalance.Xerion || 0} Layti`,
			outputToken: `${outAmounts?.Xerion || 0} State`,
		},
	];

	return tokens;
};