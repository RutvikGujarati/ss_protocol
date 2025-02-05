import { useContext } from 'react';
import XerionLogo from "../assets/XerionLogo.png";
import FluxinLogo from "../assets/FluxinLogo.png";
import { Fluxin, Xerion } from "../ContractAddresses";
import { useDAVToken } from "../Context/DavTokenContext";
import { PriceContext } from "../api/StatePrice";
import { useGeneralAuctionFunctions } from '../Functions/GeneralAuctionFunctions';

// Custom hook to get auction tokens data
export const useAuctionTokens = () => {
	const {
		XerionUsdPrice,
		XerionRatioPrice,
		FluxinRatioPrice,
		FluxinUsdPrice
	} = useContext(PriceContext);
	const { AuctionRunning } = useGeneralAuctionFunctions();

	const {
		SwapTokens,
		isReversed,
		RatioTargetsofTokens,
		outAmounts,
		Distributed,
		userHashSwapped,
		XerionOnepBalance,
		userHasReverseSwapped,
		handleAddFluxin,
		handleAddXerion,
		FluxinOnepBalance,
	} = useDAVToken();
	console.log("is running from obj", isReversed.Fluxin)
	const tokens = [
		{
			id: "Fluxin",
			name: "Fluxin",
			Pname: "Fluxin - State - Fluxin",
			ReverseName: "State - Fluxin",
			ContractName: "Fluxin",
			image: FluxinLogo,
			ratio: `1:${RatioTargetsofTokens?.["Fluxin"] || 0}`,
			currentRatio: `1:${FluxinRatioPrice || 0}`,
			currentTokenRatio: FluxinRatioPrice,
			RatioTargetToken: RatioTargetsofTokens?.["Fluxin"] || 0,
			Price: FluxinUsdPrice,
			isReversing: isReversed?.Fluxin.toString(),
			AuctionStatus: AuctionRunning?.Fluxin,
			userHasSwapped: userHashSwapped?.Fluxin,
			userHasReverse: userHasReverseSwapped?.Fluxin,
			ErrorName: "Fluxin",
			onChart: "https://www.geckoterminal.com/pulsechain/pools/0x361afa3f5ef839bed6071c9f0c225b078eb8089a",
			distributedAmount: Distributed?.["Fluxin"] || 0,
			token: Fluxin,
			handleAddToken: handleAddFluxin,
			inputTokenAmount: (FluxinRatioPrice >= (RatioTargetsofTokens?.["Fluxin"] || 0))
				? `${(FluxinOnepBalance || 0) * 2} Fluxin`
				: `${FluxinOnepBalance || 0} Fluxin`,
			SwapT: () => SwapTokens("Fluxin", "Fluxin"),
			ratioPrice: FluxinRatioPrice,
			outputToken: (FluxinRatioPrice >= (RatioTargetsofTokens?.["Fluxin"] || 0)) ? `${outAmounts?.Fluxin / 2 || 0} State` : `${outAmounts?.Fluxin || 0} State`,
		},
		{
			id: "Xerion",
			name: "Xerion",
			Pname: "Xerion - State - Xerion",
			ReverseName: "State - Xerion",
			ContractName: "Xerion",
			image: XerionLogo,
			ratio: `1:${RatioTargetsofTokens?.["Xerion"] || 0}`,
			userHasSwapped: userHashSwapped.Xerion,
			userHasReverse: userHasReverseSwapped.Xerion,
			currentRatio: `1:${XerionRatioPrice || 0}`,
			Price: XerionUsdPrice,
			isReversing: isReversed?.Xerion.toString(),
			currentTokenRatio: XerionRatioPrice,
			ErrorName: "Xerion",
			RatioTargetToken: RatioTargetsofTokens?.["Xerion"] || 0,
			AuctionStatus: AuctionRunning?.Xerion,
			onChart: "https://www.geckoterminal.com/pulsechain/pools/0xc6359cd2c70f643888d556d377a4e8e25caadf77",
			distributedAmount: Distributed?.["Xerion"] || 0,
			token: Xerion,
			SwapT: () => SwapTokens("Xerion", "Xerion"),
			ratioPrice: XerionRatioPrice,
			handleAddToken: handleAddXerion,
			inputTokenAmount: (XerionRatioPrice >= (RatioTargetsofTokens?.["Xerion"] || 0))
				? `${(XerionOnepBalance || 0) * 2} Xerion`
				: `${XerionOnepBalance || 0} Xerion`,
			outputToken: (XerionRatioPrice >= (RatioTargetsofTokens?.["Xerion"] || 0)) ? `${outAmounts?.Xerion / 2 || 0} State` : `${outAmounts?.Xerion || 0} State`,
		},
	];

	return tokens;
};