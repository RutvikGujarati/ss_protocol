import { useContext } from "react";
import { useSwapContract } from "../Functions/SwapContractFunctions";
import {
	DAV_TOKEN_ADDRESS,
	Fluxin,
	Ratio_TOKEN_ADDRESS,
	STATE_TOKEN_ADDRESS,

} from "../ContractAddresses";
import { PriceContext } from "../api/StatePrice";
import { useDAvContract } from "../Functions/DavTokenFunctions";
import { useGeneralTokens } from "../Functions/GeneralTokensFunctions";
import { useGeneralAuctionFunctions } from "../Functions/GeneralAuctionFunctions";
const shortenAddress = (address) => {
	if (!address) return "";
	return `${address.slice(0, 6)}...${address.slice(-6)}`;
};
const davShortened = shortenAddress(DAV_TOKEN_ADDRESS);
const FluxinShortened = shortenAddress(Fluxin);
const FluxinSwapShortened = shortenAddress(Ratio_TOKEN_ADDRESS);
const stateShortened = shortenAddress(STATE_TOKEN_ADDRESS);
export const TokensDetails = () => {
	const { stateUsdPrice, FluxinUsdPrice } =
		useContext(PriceContext);
	const { simpleSupplies, mintAdditionalTOkens } = useGeneralTokens()
	const { AuctionRunningLocalString, auctionDetails, TotalTokensBurned, auctionTimeLeft } = useGeneralAuctionFunctions()
	const { CurrentRatioPrice } = useGeneralTokens();

	const { Supply, DAVTokensWithdraw, DAVTokensFiveWithdraw, withdraw_5,
		withdraw_95, } =
		useDAvContract();
	const { LastDevShare, ReverseForCycle, ReverseForNextCycle, isRenounced, LastLiquidity, PercentageFluxin, balances, isReversed, RatioTargetsofTokens, ReanounceContract, SetAUctionDuration, WithdrawFluxin, ReanounceFluxinContract, setRatioTarget, setReverseEnable, AddTokensToContract, SetAUctionInterval, setReverseTime, setCurrentRatioTarget, DepositToken, StartAuction, PercentageOfState, LPStateTransferred, RenounceState, RenounceFluxinSwap, WithdrawState, AddTokens, setBurnRate } = useSwapContract();
	console.log("isReversing", isReversed.Fluxin)
	return [
		{
			tokenName: "DAV",
			key: davShortened,
			name: "pDAV",
			supply: "5,000,000.00",
			claimDAVToken: DAVTokensWithdraw,
			claimFiveDAVTokenValue: DAVTokensFiveWithdraw,
			address: DAV_TOKEN_ADDRESS,
			renounceSmartContract: isRenounced?.dav ?? "Unknown",
			Supply: Supply,
			Price: 0,
			LastDevShare: LastDevShare,
			LastLiquidity: LastLiquidity,
			actions: {
				claimLiquidityDAVToken: withdraw_95,
				claimFiveDAVToken: withdraw_5,
				ReanounceContract: ReanounceContract,
			},
		},
		{
			tokenName: "Orxa",
			key: FluxinShortened,
			name: "Orxa",
			supply: "1,000,000,000,000.00",
			Treasury: "1,000,000,000,000.00",
			Supply: simpleSupplies.FluxinSupply,
			percentage: PercentageFluxin,
			address: Fluxin,
			SwapContract: Ratio_TOKEN_ADDRESS,
			SwapShortContract: FluxinSwapShortened,
			stateBalance: balances.StateFluxin,
			target: RatioTargetsofTokens["Fluxin"],
			isReversing: isReversed.Fluxin.toString(),
			WillStart: ReverseForCycle.Fluxin,
			WillStartForNext: ReverseForNextCycle.Fluxin,
			Balance: balances.fluxinBalance,
			TotalTokensBurn: TotalTokensBurned.Fluxin,
			RatioBalance: balances.ratioFluxinBalance,
			Duration: auctionDetails["Fluxin"],
			interval: auctionDetails["Fluxin"],
			AuctionRunning: AuctionRunningLocalString.Fluxin.toString(),
			pair: "Fluxin/pSTATE",
			Ratio: CurrentRatioPrice.Fluxin,
			Price: FluxinUsdPrice,
			SetDuration: () => SetAUctionDuration(),
			AuctionTimeRunning: auctionTimeLeft.Fluxin,
			AuctionNextTime: auctionDetails["Fluxin"],
			mintAddTOkens: "250,000,000,000",
			renounceSmartContract: isRenounced?.Fluxin ?? "Unknown",
			renounceSwapSmartContract: isRenounced?.FluxinRatio ?? "Unknown",
			actions: {
				ReanounceContract: ReanounceFluxinContract,
				ReanounceSwapContract: RenounceFluxinSwap,
				WithdrawState: WithdrawFluxin,
				mintAdditionalTOkens: mintAdditionalTOkens,
				SetDuration: (value) => SetAUctionDuration(value, "fluxinRatio"),
				SetInterval: (value) => SetAUctionInterval(value, "fluxinRatio"),
				AddTokenToContract: () =>
					AddTokensToContract(Fluxin, STATE_TOKEN_ADDRESS, CurrentRatioPrice.Fluxin),
				setRatio: (value) => setRatioTarget(value, "fluxinRatio"),
				setBurn: (value) => setBurnRate(value, "fluxinRatio"),
				setReverseEnabled: () => setReverseEnable("fluxinRatio"),
				setReverse: (value, value2) => setReverseTime(value, value2),
				setCurrentRatio: (value) => setCurrentRatioTarget(value),
				DepositTokens: (value) =>
					DepositToken("Fluxin", Fluxin, value, "fluxinRatio"),
				DepositStateTokens: (value) =>
					DepositToken("state", STATE_TOKEN_ADDRESS, value, "fluxinRatio"),
				StartingAuction: () => StartAuction("fluxinRatio"),
			},
		},
		// {
		// 	tokenName: "Xerion",
		// 	key: XerionShortened,
		// 	name: "Xerion",
		// 	supply: "500,000,000,000.00",
		// 	Supply: simpleSupplies.XerionSupply,
		// 	target: RatioTargetsofTokens["Xerion"],
		// 	Balance: balances.xerionBalance,
		// 	percentage: PercentageXerion,
		// 	Duration: auctionDetails["Xerion"],
		// 	interval: auctionDetails["Xerion"],
		// 	address: Xerion,
		// 	TotalTokensBurn: TotalTokensBurned.Xerion,
		// 	stateBalance: balances.StateXerion,
		// 	RatioBalance: balances.ratioXerionBalance,
		// 	isReversing: isReversed.Xerion.toString(),
		// 	WillStart: ReverseForCycle.Xerion,
		// 	WillStartForNext: ReverseForNextCycle.Xerion,
		// 	TotalBounty: TotalBounty.Xerion,
		// 	Price: XerionUsdPrice,
		// 	AuctionTimeRunning: auctionTimeLeft.Xerion,
		// 	BurnTimeLeft: BurnTimeLeft.Xerion,
		// 	Ratio: XerionRatioPrice,
		// 	AuctionRunning: "false",
		// 	pair: "Xerion/pSTATE",
		// 	AuctionNextTime: auctionDetails["Xerion"],
		// 	mintAddTOkens: "125,000,000,000",
		// 	ApproveAmount: "10,000,000,000",
		// 	transactionHash: transactionHashes.xerion,
		// 	renounceSmartContract: isRenounced?.Xerion ?? "Unknown",
		// 	actions: {
		// 		ReanounceContract: ReanounceXerionContract,
		// 		WithdrawState: WithdrawXerion,
		// 		SetDuration: (value) => SetAUctionDuration(value, "XerionRatio"),
		// 		SetInterval: (value) => SetAUctionInterval(value, "XerionRatio"),
		// 		setRatio: (value) => setRatioTarget(value, "XerionRatio"),
		// 		setBurn: (value) => setBurnRate(value, "XerionRatio"),
		// 		setReverseEnabled: () => setReverseEnable("XerionRatio"),

		// 		mintAdditionalTOkens: mintAdditionalTOkens,
		// 		AddTokenToContract: () =>
		// 			AddTokensToContract(Xerion, STATE_TOKEN_ADDRESS, XerionRatioPrice),

		// 		DepositTokens: (value) =>
		// 			DepositToken("Xerion", Xerion, value, "XerionRatio"),
		// 		DepositStateTokens: (value) =>
		// 			DepositToken("state", STATE_TOKEN_ADDRESS, value, "XerionRatio"),
		// 		StartingAuction: () => StartAuction("XerionRatio"),
		// 	},
		// },
		{
			tokenName: "STATE",
			key: stateShortened,
			name: "pSTATE",
			supply: "999,000,000,000,000.00",
			Treasury: "999,000,000,000,000.00",
			Supply: simpleSupplies.stateSupply,
			percentage: PercentageOfState,
			Balance: balances.stateBalance,
			address: STATE_TOKEN_ADDRESS,
			claimLPToken: LPStateTransferred,
			mintAddTOkens: "1,000,000,000,000",
			ApproveAmount: "10,000,000,000",
			Price: stateUsdPrice,
			renounceSmartContract: isRenounced?.state ?? "Unknown",
			actions: {
				ReanounceContract: RenounceState,
				WithdrawState: WithdrawState,
				mintAdditionalTOkens: mintAdditionalTOkens,
				AddTokenToContract: () => AddTokens(),
				DepositTokens: (value) =>
					DepositToken("state", STATE_TOKEN_ADDRESS, value),
			},
		},
	];
}