import { useContext } from 'react';
import FluxinLogo from "../assets/FluxinLogo.png";
import XerionLogo from "../assets/layti.png";
import oned from "../assets/oned.png";
import { $1, Fluxin, Xerion } from "../ContractAddresses";
import { useSwapContract } from "../Functions/SwapContractFunctions";
import { PriceContext } from "../api/StatePrice";
import { useGeneralAuctionFunctions } from '../Functions/GeneralAuctionFunctions';
import { useGeneralTokens } from '../Functions/GeneralTokensFunctions';

export const useAuctionTokens = () => {
	const { FluxinUsdPrice, XerionUsdPrice, OneDollarUsdPrice } = useContext(PriceContext);
	const { AuctionRunning } = useGeneralAuctionFunctions();
	const { CurrentRatioPrice, Distributed } = useGeneralTokens();
	const { SwapTokens, isReversed, RatioTargetsofTokens, outAmounts, userHashSwapped, userHasReverseSwapped, handleAddFluxin, handleAddXerion, handleAddOneD, OnePBalance } = useSwapContract();

	const tokenData = [
		{ id: "Orxa", name: "Orxa", contract: "Fluxin", image: FluxinLogo, token: Fluxin, handleAdd: handleAddFluxin, price: FluxinUsdPrice },
		{ id: "Layti", name: "Layti", contract: "Xerion", image: XerionLogo, token: Xerion, handleAdd: handleAddXerion, price: XerionUsdPrice },
		{ id: "1$", name: "1$", contract: "OneDollar", image: oned, token: $1, handleAdd: handleAddOneD, price: OneDollarUsdPrice }
	];

	return tokenData.map(({ id, name, contract, image, token, handleAdd, price }) => ({
		id,
		name,
		Pname: `${name} - State - ${name}`,
		ReverseName: `State - ${name}`,
		ContractName: contract,
		image,
		ratio: `1:${RatioTargetsofTokens?.[contract] || 0}`,
		currentRatio: `1:${CurrentRatioPrice[contract] || 0}`,
		currentTokenRatio: CurrentRatioPrice[contract],
		RatioTargetToken: RatioTargetsofTokens?.[contract] || 0,
		Price: price,
		isReversing: isReversed?.[contract]?.toString(),
		AuctionStatus: AuctionRunning?.[contract],
		userHasSwapped: userHashSwapped?.[contract],
		userHasReverse: userHasReverseSwapped?.[contract],
		onChart: `https://www.geckoterminal.com/pulsechain/pools/${token}`,
		distributedAmount: Distributed?.[contract] || 0,
		token,
		handleAddToken: handleAdd,
		onlyInputAmount: OnePBalance[contract],
		inputTokenAmount: `${OnePBalance[contract] || 0} ${name}`,
		SwapT: () => SwapTokens(id, contract),
		ratioPrice: CurrentRatioPrice[contract],
		outputToken: `${outAmounts?.[contract] || 0} State`,
	}));
};
