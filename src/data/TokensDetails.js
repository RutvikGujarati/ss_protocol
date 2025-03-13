import { useContext } from "react";
import { useSwapContract } from "../Functions/SwapContractFunctions";
import {
	$1,
	DAV_TOKEN_ADDRESS,
	Domus,
	DomusRatioAddress,
	Fluxin,
	OneDollarRatioAddress,
	Ratio_TOKEN_ADDRESS,
	Rieva,
	RievaRatioAddress,
	STATE_TOKEN_ADDRESS,
	Xerion,
	XerionRatioAddress,

} from "../ContractAddresses";
import { PriceContext } from "../api/StatePrice";
import { useDAvContract } from "../Functions/DavTokenFunctions";
import { useGeneralTokens } from "../Functions/GeneralTokensFunctions";
import { useGeneralAuctionFunctions } from "../Functions/GeneralAuctionFunctions";
const shortenAddress = (address) => {
	if (!address) return "";
	return `${address.slice(0, 6)}...${address.slice(-6)}`;
};
const addresses = {
	davShortened: DAV_TOKEN_ADDRESS,
	FluxinShortened: Fluxin,
	DomusShortened: Domus,
	XerionShortened: Xerion,
	OneDShortened: $1, // Ensure $1 is correctly defined
	RievaShortened: Rieva,
	FluxinSwapShortened: Ratio_TOKEN_ADDRESS,
	RievaSwapShortened: RievaRatioAddress,
	DomusSwapShortened: DomusRatioAddress,
	XerionSwapShortened: XerionRatioAddress,
	OneDollarSwapShortened: OneDollarRatioAddress,
	stateShortened: STATE_TOKEN_ADDRESS,
};
const shortenedAddresses = Object.fromEntries(
	Object.entries(addresses).map(([key, value]) => [key, shortenAddress(value)])
);

export const TokensDetails = () => {
	const { stateUsdPrice, FluxinUsdPrice, XerionUsdPrice,DomusUsdPrice, OneDollarUsdPrice, RievaUsdPrice } =
		useContext(PriceContext);
	const { simpleSupplies, mintAdditionalTOkens } = useGeneralTokens()
	const { AuctionRunningLocalString, auctionDetails, TotalTokensBurned, auctionTimeLeft } = useGeneralAuctionFunctions()

	const { CurrentRatioPrice } = useGeneralTokens();
	const { Supply, DAVTokensWithdraw, DAVTokensFiveWithdraw, withdraw_5,
		withdraw_95, } =
		useDAvContract();
	const { LastDevShare, ReverseForCycle, ReverseForNextCycle, isRenounced, LastLiquidity, decayPercentages, ReanounceOneDollarSwapContract, RenounceXerionSwap, balances, isReversed,
		RenounceRievaSwap, RatioTargetsofTokens, ReanounceContract, SetAUctionDuration, WithdrawFluxin, WithdrawXerion, ReanounceFluxinContract, ReanounceXerionContract,
		WithdrawRieva,WithdrawDomus, ReanounceOneDollarContract, ReanounceRievaContract,ReanounceDomusContract, RenounceDomusSwap,setRatioTarget, setReverseEnable, AddTokensToContract, SetAUctionInterval, setReverseTime, setCurrentRatioTarget, DepositToken, StartAuction, LPStateTransferred, RenounceState, RenounceFluxinSwap, WithdrawState, AddTokens, setBurnRate, WithdrawOneDollar } = useSwapContract();
	console.log("isReversing", isReversed.Fluxin)
	console.log("isReversing", balances.OneDollarBalance)
	return [
		{
			tokenName: "DAV",
			key: shortenedAddresses.davShortened,
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
			key: shortenedAddresses.FluxinShortened,
			name: "Orxa",
			supply: "1,000,000,000,000.00",
			Treasury: "1,000,000,000,000.00",
			Supply: simpleSupplies.FluxinSupply,
			percentage: decayPercentages["Fluxin"],
			address: Fluxin,
			SwapContract: Ratio_TOKEN_ADDRESS,
			SwapShortContract: shortenedAddresses.FluxinSwapShortened,
			stateBalance: balances.StateFluxin,
			target: RatioTargetsofTokens["Fluxin"],
			isReversing: isReversed.Fluxin.toString(),
			WillStart: ReverseForCycle.Fluxin,
			WillStartForNext: ReverseForNextCycle.Fluxin,
			Balance: balances.fluxinBalance,
			TotalTokensBurn: TotalTokensBurned.Fluxin,
			RatioBalance: balances?.ratioFluxinBalance,
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
		{
			tokenName: "Layti",
			key: shortenedAddresses.XerionShortened,
			name: "Layti",
			supply: "1,000,000,000,000.00",
			Treasury: "1,000,000,000,000.00",
			Supply: simpleSupplies.XerionSupply,
			percentage: decayPercentages["Xerion"],
			address: Xerion,
			SwapContract: XerionRatioAddress,
			SwapShortContract: shortenedAddresses.XerionSwapShortened,
			stateBalance: balances.StateXerion,
			target: RatioTargetsofTokens["Xerion"],
			isReversing: isReversed.Xerion.toString(),
			WillStart: ReverseForCycle.Xerion,
			WillStartForNext: ReverseForNextCycle.Xerion,
			Balance: balances.xerionBalance,
			TotalTokensBurn: TotalTokensBurned.Xerion,
			RatioBalance: balances?.ratioXerionBalance,
			Duration: auctionDetails["Xerion"],
			interval: auctionDetails["Xerion"],
			AuctionRunning: AuctionRunningLocalString.Xerion.toString(),
			pair: "Layti/pSTATE",
			Ratio: CurrentRatioPrice.Xerion,
			Price: XerionUsdPrice,
			SetDuration: () => SetAUctionDuration(),
			AuctionTimeRunning: auctionTimeLeft.Xerion,
			AuctionNextTime: auctionDetails["Xerion"],
			mintAddTOkens: "125,000,000,000",
			renounceSmartContract: isRenounced?.Xerion ?? "Unknown",
			renounceSwapSmartContract: isRenounced?.XerionRatio ?? "Unknown",
			actions: {
				ReanounceContract: ReanounceXerionContract,
				ReanounceSwapContract: RenounceXerionSwap,
				WithdrawState: WithdrawXerion,
				mintAdditionalTOkens: mintAdditionalTOkens,
				SetDuration: (value) => SetAUctionDuration(value, "XerionRatio"),
				SetInterval: (value) => SetAUctionInterval(value, "XerionRatio"),
				AddTokenToContract: () =>
					AddTokensToContract(Xerion, STATE_TOKEN_ADDRESS, CurrentRatioPrice.Xerion),
				setRatio: (value) => setRatioTarget(value, "XerionRatio"),
				setBurn: (value) => setBurnRate(value, "XerionRatio"),
				setReverseEnabled: () => setReverseEnable("XerionRatio"),
				setReverse: (value, value2) => setReverseTime(value, value2),
				setCurrentRatio: (value) => setCurrentRatioTarget(value),
				DepositTokens: (value) =>
					DepositToken("Xerion", Xerion, value, "XerionRatio"),
				DepositStateTokens: (value) =>
					DepositToken("state", STATE_TOKEN_ADDRESS, value, "XerionRatio"),
				StartingAuction: () => StartAuction("XerionRatio"),
			},
		},
		{
			tokenName: "1$",
			key: shortenedAddresses.OneDShortened,
			name: "1$",
			Supply: simpleSupplies.oneDollarSupply,
			percentage: decayPercentages["oneD"],
			address: $1,
			SwapContract: OneDollarRatioAddress,
			SwapShortContract: shortenedAddresses.OneDollarSwapShortened,
			stateBalance: balances.StateOneDollar,
			target: RatioTargetsofTokens["OneDollar"],
			isReversing: isReversed.OneDollar.toString(),
			WillStart: ReverseForCycle.OneDollar,
			WillStartForNext: ReverseForNextCycle.OneDollar,
			Balance: balances.OneDollarBalance,
			TotalTokensBurn: TotalTokensBurned.OneDollar,
			RatioBalance: balances?.ratioOneDollarBalance,
			Duration: auctionDetails["OneDollar"],
			interval: auctionDetails["OneDollar"],
			AuctionRunning: AuctionRunningLocalString.OneDollar.toString(),
			pair: "Layti/pSTATE",
			Ratio: CurrentRatioPrice.OneDollar,
			Price: OneDollarUsdPrice,
			SetDuration: () => SetAUctionDuration(),
			AuctionTimeRunning: auctionTimeLeft.OneDollar,
			AuctionNextTime: auctionDetails["OneDollar"],
			mintAddTOkens: "25,000,000",
			renounceSmartContract: isRenounced?.oneD ?? "Unknown",
			renounceSwapSmartContract: isRenounced?.OneDollar ?? "Unknown",
			actions: {
				ReanounceContract: ReanounceOneDollarContract,
				ReanounceSwapContract: ReanounceOneDollarSwapContract,
				WithdrawState: WithdrawOneDollar,
				mintAdditionalTOkens: mintAdditionalTOkens,
				SetDuration: (value) => SetAUctionDuration(value, "OneDollarRatio"),
				SetInterval: (value) => SetAUctionInterval(value, "OneDollarRatio"),
				AddTokenToContract: () =>
					AddTokensToContract($1, STATE_TOKEN_ADDRESS, CurrentRatioPrice.OneDollar),
				setRatio: (value) => setRatioTarget(value, "OneDollarRatio"),
				setBurn: (value) => setBurnRate(value, "OneDollarRatio"),
				setReverseEnabled: () => setReverseEnable("OneDollarRatio"),
				setReverse: (value, value2) => setReverseTime(value, value2),
				setCurrentRatio: (value) => setCurrentRatioTarget(value),
				DepositTokens: (value) =>
					DepositToken("oneD", $1, value, "OneDollarRatio"),
				DepositStateTokens: (value) =>
					DepositToken("state", STATE_TOKEN_ADDRESS, value, "OneDollarRatio"),
				StartingAuction: () => StartAuction("OneDollarRatio"),
			},
		},
		{
			tokenName: "Rieva",
			key: shortenedAddresses.RievaShortened,
			name: "Rieva",
			Supply: simpleSupplies.RievaSupply,
			percentage: decayPercentages["Rieva"],
			address: Rieva,
			SwapContract: RievaRatioAddress,
			SwapShortContract: shortenedAddresses.RievaSwapShortened,
			stateBalance: balances.StateRieva,
			target: RatioTargetsofTokens["Rieva"],
			isReversing: isReversed.Rieva.toString(),
			WillStart: ReverseForCycle.Rieva,
			WillStartForNext: ReverseForNextCycle.Rieva,
			Balance: balances.RievaBalance,
			TotalTokensBurn: TotalTokensBurned.Rieva,
			RatioBalance: balances?.ratioRievaBalance,
			Duration: auctionDetails["Rieva"],
			interval: auctionDetails["Rieva"],
			AuctionRunning: AuctionRunningLocalString.Rieva.toString(),
			pair: "Layti/pSTATE",
			Ratio: CurrentRatioPrice.Rieva,
			Price: RievaUsdPrice,
			SetDuration: () => SetAUctionDuration(),
			AuctionTimeRunning: auctionTimeLeft.Rieva,
			AuctionNextTime: auctionDetails["Rieva"],
			mintAddTOkens: "62,500,000,000",
			renounceSmartContract: isRenounced?.Rieva ?? "Unknown",
			renounceSwapSmartContract: isRenounced?.RievaRatio ?? "Unknown",
			actions: {
				ReanounceContract: ReanounceRievaContract,
				ReanounceSwapContract: RenounceRievaSwap,
				WithdrawState: WithdrawRieva,
				mintAdditionalTOkens: mintAdditionalTOkens,
				SetDuration: (value) => SetAUctionDuration(value, "RievaRatio"),
				SetInterval: (value) => SetAUctionInterval(value, "RievaRatio"),
				AddTokenToContract: () =>
					AddTokensToContract(Rieva, STATE_TOKEN_ADDRESS, CurrentRatioPrice.Rieva),
				setRatio: (value) => setRatioTarget(value, "RievaRatio"),
				setBurn: (value) => setBurnRate(value, "RievaRatio"),
				setReverseEnabled: () => setReverseEnable("RievaRatio"),
				setReverse: (value, value2) => setReverseTime(value, value2),
				setCurrentRatio: (value) => setCurrentRatioTarget(value),
				DepositTokens: (value) =>
					DepositToken("Rieva", Rieva, value, "RievaRatio"),
				DepositStateTokens: (value) =>
					DepositToken("state", STATE_TOKEN_ADDRESS, value, "RievaRatio"),
				StartingAuction: () => StartAuction("RievaRatio"),
			},
		},
		{
			tokenName: "Domus",
			key: shortenedAddresses.DomusShortened,
			name: "Domus",
			Supply: simpleSupplies.DomusSupply,
			percentage: decayPercentages["Domus"],
			address: Domus,
			SwapContract: DomusRatioAddress,
			SwapShortContract: shortenedAddresses.DomusSwapShortened,
			stateBalance: balances.StateDomus,
			target: RatioTargetsofTokens["Domus"],
			isReversing: isReversed.Domus.toString(),
			WillStart: ReverseForCycle.Domus,
			WillStartForNext: ReverseForNextCycle.Domus,
			Balance: balances.DomusBalance,
			TotalTokensBurn: TotalTokensBurned.Domus,
			RatioBalance: balances?.ratioDomusBalance,
			Duration: auctionDetails["Domus"],
			interval: auctionDetails["Domus"],
			AuctionRunning: AuctionRunningLocalString.Domus.toString(),
			pair: "Domus/pSTATE",
			Ratio: CurrentRatioPrice.Domus,
			Price: DomusUsdPrice,
			SetDuration: () => SetAUctionDuration(),
			AuctionTimeRunning: auctionTimeLeft.Domus,
			AuctionNextTime: auctionDetails["Domus"],
			mintAddTOkens: "2,500,000,000,000",
			renounceSmartContract: isRenounced?.Domus ?? "Unknown",
			renounceSwapSmartContract: isRenounced?.DomusRatio ?? "Unknown",
			actions: {
				ReanounceContract: ReanounceDomusContract,
				ReanounceSwapContract: RenounceDomusSwap,
				WithdrawState: WithdrawDomus,
				mintAdditionalTOkens: mintAdditionalTOkens,
				SetDuration: (value) => SetAUctionDuration(value, "DomusRatio"),
				SetInterval: (value) => SetAUctionInterval(value, "DomusRatio"),
				AddTokenToContract: () =>
					AddTokensToContract(Domus, STATE_TOKEN_ADDRESS, CurrentRatioPrice.Domus),
				setRatio: (value) => setRatioTarget(value, "DomusRatio"),
				setBurn: (value) => setBurnRate(value, "DomusRatio"),
				setReverseEnabled: () => setReverseEnable("DomusRatio"),
				setReverse: (value, value2) => setReverseTime(value, value2),
				setCurrentRatio: (value) => setCurrentRatioTarget(value),
				DepositTokens: (value) =>
					DepositToken("Domus", Domus, value, "DomusRatio"),
				DepositStateTokens: (value) =>
					DepositToken("state", STATE_TOKEN_ADDRESS, value, "DomusRatio"),
				StartingAuction: () => StartAuction("DomusRatio"),
			},
		},
		{
			tokenName: "STATE",
			key: shortenedAddresses.stateShortened,
			name: "pSTATE",
			supply: "999,000,000,000,000.00",
			Treasury: "999,000,000,000,000.00",
			Supply: simpleSupplies.stateSupply,
			percentage: decayPercentages["state"],
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