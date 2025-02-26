import { useContext } from 'react';
import FluxinLogo from "../assets/FluxinLogo.png";
import { Fluxin } from "../ContractAddresses";
import { useDAVToken } from "../Context/DavTokenContext";
import { PriceContext } from "../api/StatePrice";
import { useGeneralAuctionFunctions } from '../Functions/GeneralAuctionFunctions';
import { useGeneralTokens } from '../Functions/GeneralTokensFunctions';

// Custom hook to get auction tokens data
export const useAuctionTokens = () => {
	const {

		FluxinUsdPrice
	} = useContext(PriceContext);
	const { AuctionRunning } = useGeneralAuctionFunctions();
	const { CurrentRatioPrice } = useGeneralTokens();
	const { Distributed} = useGeneralTokens();

	const {
		SwapTokens,
		isReversed,
		RatioTargetsofTokens,
		outAmounts,
		userHashSwapped,
		userHasReverseSwapped,
		handleAddFluxin,
		OnePBalance,
	} = useDAVToken();
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
			onChart: "https://www.geckoterminal.com/pulsechain/pools/0x361afa3f5ef839bed6071c9f0c225b078eb8089a",
			distributedAmount: Distributed?.["Fluxin"] || 0,
			token: Fluxin,
			handleAddToken: handleAddFluxin,
			inputTokenAmount: `${OnePBalance.Fluxin || 0} Orxa`,
		SwapT: () => SwapTokens("Orxa", "Fluxin"),
			ratioPrice: CurrentRatioPrice.Fluxin,
			outputToken: `${outAmounts?.Fluxin || 0} State`,
		},
		// {
		// 	id: "Xerion",
		// 	name: "Xerion",
		// 	Pname: "Xerion - State - Xerion",
		// 	ReverseName: "State - Xerion",
		// 	ContractName: "Xerion",
		// 	image: XerionLogo,
		// 	ratio: `1:${RatioTargetsofTokens?.["Xerion"] || 0}`,
		// 	userHasSwapped: userHashSwapped.Xerion,
		// 	userHasReverse: userHasReverseSwapped.Xerion,
		// 	currentRatio: `1:${XerionRatioPrice || 0}`,
		// 	Price: XerionUsdPrice,
		// 	isReversing: isReversed?.Xerion.toString(),
		// 	currentTokenRatio: XerionRatioPrice,
		// 	ErrorName: "Xerion",
		// 	RatioTargetToken: RatioTargetsofTokens?.["Xerion"] || 0,
		// 	AuctionStatus: "false",
		// 	onChart: "https://www.geckoterminal.com/pulsechain/pools/0xc6359cd2c70f643888d556d377a4e8e25caadf77",
		// 	distributedAmount: Distributed?.["Xerion"] || 0,
		// 	token: Xerion,
		// 	SwapT: () => SwapTokens("Xerion", "Xerion"),
		// 	ratioPrice: XerionRatioPrice,
		// 	handleAddToken: handleAddXerion,
		// 	inputTokenAmount: `${OnePBalance.Xerion || 0} Xerion`,
		// 	outputToken: `${outAmounts?.Xerion || 0} State`,
		// },
	];

	return tokens;
};