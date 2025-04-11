import { useContext } from "react";
import {
	$1, $10, Currus, CurrusRatioAddress, DAV_TOKEN_ADDRESS, DAV_TOKEN_SONIC_ADDRESS, Domus, DomusRatioAddress,
	Fluxin, OneDollarRatioAddress, Ratio_TOKEN_ADDRESS, Rieva, RievaRatioAddress,
	Sanitas,
	SanitasRatioAddress,
	STATE_TOKEN_ADDRESS, STATE_TOKEN_SONIC_ADDRESS, Teeah, TeeahRatioAddress, TenDollarRatioAddress, Valir, ValirRatioAddress, Xerion, XerionRatioAddress,
} from "../ContractAddresses";
import { PriceContext } from "../api/StatePrice";
import { useDAvContract } from "../Functions/DavTokenFunctions";
import { useSwapContract } from "../Functions/SwapContractFunctions";
import { useGeneralTokens } from "../Functions/GeneralTokensFunctions";
import { useGeneralAuctionFunctions } from "../Functions/GeneralAuctionFunctions";
import { useChainId } from "wagmi";

const shortenAddress = (addr) => addr ? `${addr.slice(0, 6)}...${addr.slice(-6)}` : "";

export const TokensDetails = () => {
	const prices = useContext(PriceContext);
	const { simpleSupplies, mintAdditionalTOkens } = useGeneralTokens();
	const { AuctionRunningLocalString, auctionDetails, TotalTokensBurned, auctionTimeLeft } = useGeneralAuctionFunctions();
	const { CurrentRatioPrice } = useGeneralTokens();
	const { Supply, DAVTokensWithdraw, DAVTokensFiveWithdraw, withdraw_5, withdraw_95 } = useDAvContract();
	const swap = useSwapContract();
	const chainId = useChainId()
	const tokens = [
		{
			name: "DAV",
			displayName: "pDAV",
			address: DAV_TOKEN_ADDRESS,
			supply: "5,000,000.00",
			price: 0,
			actions: {
				claimLiquidityDAVToken: withdraw_95,
				claimFiveDAVToken: withdraw_5,
				ReanounceContract: swap.ReanounceContract,
			},
		},
		{
			name: "Orxa",
			key: "Fluxin",
			address: Fluxin,
			RatioName: "fluxin",
			price: prices.FluxinUsdPrice,
			swapAddress: Ratio_TOKEN_ADDRESS,
			mintAmount: "250,000,000,000",
		},
		{
			name: "Layti",
			key: "Xerion",
			RatioName: "xerion",
			address: Xerion,
			price: prices.XerionUsdPrice,
			swapAddress: XerionRatioAddress,
			mintAmount: "125,000,000,000",
		},
		{
			name: "1$",
			key: "OneDollar",
			address: $1,
			price: prices.OneDollarUsdPrice,
			swapAddress: OneDollarRatioAddress,
			mintAmount: "25,000,000",
		},
		{
			name: "Rieva",
			key: "Rieva",
			address: Rieva,
			price: prices.RievaUsdPrice,
			swapAddress: RievaRatioAddress,
			mintAmount: "62,500,000,000",
		},
		{
			name: "Domus",
			key: "Domus",
			address: Domus,
			price: prices.DomusUsdPrice,
			swapAddress: DomusRatioAddress,
			mintAmount: "2,500,000,000,000",
		},
		{
			name: "Currus",
			key: "Currus",
			address: Currus,
			price: prices.CurrusUsdPrice,
			swapAddress: CurrusRatioAddress,
			mintAmount: "1,250,000,000,000",
		},
		{
			name: "Sanitas",
			key: "Sanitas",
			address: Sanitas,
			price: prices.SanitasUsdPrice,
			swapAddress: SanitasRatioAddress,
			mintAmount: "625,000,000,000",
		},
		{
			name: "Teeah",
			key: "Teeah",
			address: Teeah,
			price: prices.TeeahUsdPrice,
			swapAddress: TeeahRatioAddress,
			mintAmount: "125,000,000,000",
		},
		{
			name: "Valir",
			key: "Valir",
			address: Valir,
			price: prices.ValirUsdPrice,
			swapAddress: ValirRatioAddress,
			mintAmount: "31,250,000,000",
		},
		{
			name: "10$",
			key: "TenDollar",
			address: $10,
			price: prices.TenDollarUsdPrice,
			swapAddress: TenDollarRatioAddress,
			mintAmount: "6,250,000",
		},
		{
			name: "STATE",
			key: "state",
			address: STATE_TOKEN_ADDRESS,
			price: prices.stateUsdPrice,
			mintAmount: "1,000,000,000,000",
		},
	];

	const SonicTokens = [
		{
			name: "DAV",
			key: "dav",
			displayName: "sDAV",
			address: DAV_TOKEN_SONIC_ADDRESS,
			supply: "5,000,000.00",
			price: 0,
			actions: {
				claimLiquidityDAVToken: withdraw_95,
				ReanounceContract: swap.ReanounceContract,
			},
		},
		{
			name: "STATE",
			key: "state",
			address: STATE_TOKEN_SONIC_ADDRESS,
			price: "0.0000",
			mintAmount: "1,000,000,000,000",
		},
	]
	const data = chainId === 146 ? SonicTokens : tokens;

	return data.map((token) => {
		const key = token.key;
		const rn = token.RatioName;
		const isDAV = token.name === "DAV";
		const isState = token.name === "STATE";

		return {
			tokenName: token.name,
			key: shortenAddress(token.address),
			name: token.displayName || token.name,
			Supply: isDAV ? Supply : key == "OneDollar" ? simpleSupplies.oneDollarSupply : simpleSupplies[`${key}Supply`],
			Price: token.price,
			address: token.address,
			SwapContract: token.swapAddress,
			SwapShortContract: token.swapAddress ? shortenAddress(token.swapAddress) : undefined,
			claimDAVToken: isDAV ? DAVTokensWithdraw : undefined,
			claimFiveDAVTokenValue: isDAV ? DAVTokensFiveWithdraw : undefined,
			mintAddTOkens: token.mintAmount,
			claimLPToken: isState ? swap.LPStateTransferred : undefined,
			renounceSmartContract: key == "OneDollar" ? swap.isRenounced["oneD"] : swap.isRenounced?.[key] ?? "Unknown",

			percentage: key == "OneDollar" ? swap.decayPercentages["oneD"] : swap.decayPercentages[key],
			stateBalance: swap.balances[`State${key}`],
			target: swap.RatioTargetsofTokens[key],
			isReversing: swap.isReversed[key]?.toString(),
			WillStart: swap.ReverseForCycle[key],
			WillStartForNext: swap.ReverseForNextCycle[key],
			Balance: (key === "Fluxin" || key === "Xerion")
				? swap.balances[`${rn}Balance`] :
				key == "Teeah" ?
					"0"
					: swap.balances[`${key}Balance`],
			TotalTokensBurn: TotalTokensBurned[key],
			RatioBalance: swap.balances[`ratio${key}Balance`],
			Duration: auctionDetails[key],
			interval: auctionDetails[key],
			AuctionRunning: AuctionRunningLocalString?.[key]?.toString(),
			pair: `${token.name}/pSTATE`,
			Ratio: CurrentRatioPrice[key],
			AuctionTimeRunning: auctionTimeLeft[key],
			AuctionNextTime: auctionDetails[key],
			renounceSwapSmartContract: key == "OneDollar" ? swap.isRenounced["OneDollar"] : swap.isRenounced?.[`${key}Ratio`] ?? "Unknown",

			actions: {
				...(token.actions || {}), // Include any custom actions (e.g., for DAV)
				ReanounceContract: swap[`Reanounce${key}Contract`] || swap.ReanounceContract,
				ReanounceSwapContract: swap[`Renounce${key}Swap`],
				claimFiveDAVToken: withdraw_5,
				WithdrawState: swap[`Withdraw${key}`],
				mintAdditionalTOkens: token.mintAmount
					? () => mintAdditionalTOkens(
						key === "OneDollar"
							? "oneD"
							: key === "Fluxin"
								? "fluxin"
								: key,
						parseInt(token.mintAmount.replace(/,/g, ""), 10)
					)
					: undefined,

				SetDuration: (value) => swap.SetAUctionDuration(value, `${key == "Fluxin" ? rn : key}Ratio`),

				SetInterval: (value) => swap.SetAUctionInterval(value, `${key == "Fluxin" ? rn : key}Ratio`),
				AddTokenToContract: () => swap.AddTokensToContract(token.address, STATE_TOKEN_ADDRESS, CurrentRatioPrice[key]),
				setRatio: (value) => swap.setRatioTarget(value, `${key == "Fluxin" ? rn : key}Ratio`),
				setBurn: (value) => swap.setBurnRate(value, `${key == "Fluxin" ? rn : key}Ratio`),
				setReverseEnabled: () => swap.setReverseEnable(`${key == "Fluxin" ? rn : key}Ratio`),
				setReverse: (value, value2) => swap.setReverseTime(value, value2),
				setCurrentRatio: (value) => swap.setCurrentRatioTarget(value),
				DepositTokens: (value) => swap.DepositToken(`${key == "OneDollar" ? "oneD" : key}`, token.address, value, `${key == "Fluxin" ? rn : key}Ratio`),

				DepositStateTokens: (value) => swap.DepositToken("state", STATE_TOKEN_ADDRESS, value, `${key == "Fluxin" ? rn : key}Ratio`),
				StartingAuction: () => swap.StartAuction(`${key == "Fluxin" ? rn : key}Ratio`),

				...(isState && {

					WithdrawState: swap.WithdrawState,

					AddTokenToContract: swap.AddTokens,
					DepositTokens: (value) => swap.DepositToken("state", token.address, value),
				}),
			},
		};
	});
};