import { useContext } from "react";
import { DAV_TOKEN_ADDRESS, Fluxin, STATE_TOKEN_ADDRESS, Xerion, useDAVToken } from "../Context/DavTokenContext";
import { PriceContext } from "../api/StatePrice";

const shortenAddress = (address) => {
	if (!address) return "";
	return `${address.slice(0, 6)}...${address.slice(-6)}`;
};
const davShortened = shortenAddress(DAV_TOKEN_ADDRESS);
const FluxinShortened = shortenAddress(Fluxin);
const stateShortened = shortenAddress(STATE_TOKEN_ADDRESS);
const XerionShortened = shortenAddress(Xerion);
export const TokensDetails = () => {
	const { FluxinRatioPrice, XerionRatioPrice, stateUsdPrice, FluxinUsdPrice, XerionUsdPrice } =
		useContext(PriceContext);

	const { Supply, LastDevShare, isRenounced, DAVTokensWithdraw, LastLiquidity, FluxinSupply, PercentageFluxin, balances, DAVTokensFiveWithdraw, XerionSupply, RatioTargetsofTokens, TotalTokensBurned, BurnTimeLeft, isReversed, withdraw_95, PercentageXerion, AuctionTimeRunningXerion, withdraw_5, ReanounceContract, TotalBounty, auctionDetails, AuctionRunningLocalString, SetAUctionDuration, mintAdditionalTOkens, WithdrawFluxin, AuctionTimeRunning, ReanounceFluxinContract, setRatioTarget, setReverseEnable, AddTokensToContract, SetAUctionInterval, setReverseTime, setCurrentRatioTarget, XerionTransactionHash, DepositToken, StartAuction, ReanounceXerionContract, WithdrawXerion, StateSupply, PercentageOfState, LPStateTransferred, RenounceState, WithdrawState, AddTokens } = useDAVToken();

	return [
		{
			tokenName: "DAV",
			key: davShortened,
			name: "pDAV",
			supply: "5,000,000.00",
			transactionHash:
				"0xa7edbeaf4dabb78ef6385220bc75f7266c144a4c9da19393245ab62999195d90",
			claimDAVToken: DAVTokensWithdraw,
			claimFiveDAVToken: DAVTokensFiveWithdraw,
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
			tokenName: "Fluxin",
			key: FluxinShortened,
			name: "Fluxin",
			supply: "1,000,000,000,000.00",
			Treasury: "1,000,000,000,000.00",
			Supply: FluxinSupply,
			percentage: PercentageFluxin,
			address: Fluxin,
			stateBalance: balances.StateFluxin,
			target: RatioTargetsofTokens["Fluxin"],
			isReversing: isReversed.Fluxin,
			Balance: balances.fluxinBalance,
			BurnTimeLeft: BurnTimeLeft.Fluxin,
			TotalTokensBurn: TotalTokensBurned.Fluxin,
			TotalBounty: TotalBounty.Fluxin,
			RatioBalance: balances.ratioFluxinBalance,
			Duration: auctionDetails["Fluxin"],
			interval: auctionDetails["Fluxin"],
			AuctionRunning: AuctionRunningLocalString.Fluxin,
			pair: "Fluxin/pSTATE",
			Ratio: FluxinRatioPrice,
			Price: FluxinUsdPrice,
			SetDuration: () => SetAUctionDuration(),
			AuctionTimeRunning: AuctionTimeRunning,
			AuctionNextTime: auctionDetails["Fluxin"],
			mintAddTOkens: "250,000,000,000",
			transactionHash:
				"0xcc7e04c885a56607fbc2417a9f894bda0fbdd68418ce189168adcb1c10406208",
			renounceSmartContract: isRenounced?.Fluxin ?? "Unknown",
			actions: {
				ReanounceContract: ReanounceFluxinContract,
				WithdrawState: WithdrawFluxin,
				mintAdditionalTOkens: mintAdditionalTOkens,
				SetDuration: (value) => SetAUctionDuration(value, "fluxinRatio"),
				SetInterval: (value) => SetAUctionInterval(value, "fluxinRatio"),
				AddTokenToContract: () =>
					AddTokensToContract(Fluxin, STATE_TOKEN_ADDRESS, FluxinRatioPrice),
				setRatio: (value) => setRatioTarget(value, "fluxinRatio"),
				setReverseEnabled: (value) => setReverseEnable(value, "fluxinRatio"),
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
			tokenName: "Xerion",
			key: XerionShortened,
			name: "Xerion",
			supply: "500,000,000,000.00",
			Supply: XerionSupply,
			target: RatioTargetsofTokens["Xerion"],
			Balance: balances.xerionBalance,
			percentage: PercentageXerion,
			Duration: auctionDetails["Xerion"],
			interval: auctionDetails["Xerion"],
			address: Xerion,
			TotalTokensBurn: TotalTokensBurned.Xerion,
			stateBalance: balances.StateXerion,
			RatioBalance: balances.ratioXerionBalance,
			isReversing: isReversed.Xerion,
			TotalBounty: TotalBounty.Xerion,
			Price: XerionUsdPrice,
			timeRunning: AuctionTimeRunningXerion,
			AuctionTimeRunning: AuctionTimeRunningXerion,
			BurnTimeLeft: BurnTimeLeft.Xerion,
			Ratio: XerionRatioPrice,
			AuctionRunning: AuctionRunningLocalString.Xerion,
			pair: "Xerion/pSTATE",
			AuctionNextTime: auctionDetails["Xerion"],
			mintAddTOkens: "125,000,000,000",
			ApproveAmount: "10,000,000,000",
			transactionHash: XerionTransactionHash,
			renounceSmartContract: isRenounced?.Xerion ?? "Unknown",
			actions: {
				ReanounceContract: ReanounceXerionContract,
				WithdrawState: WithdrawXerion,
				SetDuration: (value) => SetAUctionDuration(value, "XerionRatio"),
				SetInterval: (value) => SetAUctionInterval(value, "XerionRatio"),
				setRatio: (value) => setRatioTarget(value, "XerionRatio"),
				setReverseEnabled: (value) => setReverseEnable(value, "XerionRatio"),

				mintAdditionalTOkens: mintAdditionalTOkens,
				AddTokenToContract: () =>
					AddTokensToContract(Xerion, STATE_TOKEN_ADDRESS, XerionRatioPrice),

				DepositTokens: (value) =>
					DepositToken("Xerion", Xerion, value, "XerionRatio"),
				DepositStateTokens: (value) =>
					DepositToken("state", STATE_TOKEN_ADDRESS, value, "XerionRatio"),
				StartingAuction: () => StartAuction("XerionRatio"),
			},
		},
		{
			tokenName: "STATE",
			key: stateShortened,
			name: "pSTATE",
			supply: "999,000,000,000,000.00",
			Treasury: "999,000,000,000,000.00",
			Supply: StateSupply,
			percentage: PercentageOfState,
			Balance: balances.stateBalance,
			address: STATE_TOKEN_ADDRESS,
			claimLPToken: LPStateTransferred,
			mintAddTOkens: "1,000,000,000,000",
			ApproveAmount: "10,000,000,000",
			transactionHash:
				"0xf562341d1f0f5469809553f07cd9f19da479a9af3b074d0982594899a6595b10",
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