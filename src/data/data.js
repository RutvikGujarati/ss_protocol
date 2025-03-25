import { useContext } from "react";
import { useSwapContract } from "../Functions/SwapContractFunctions";
import { useDAvContract } from "../Functions/DavTokenFunctions";
import { useGeneralTokens } from "../Functions/GeneralTokensFunctions";
import { useGeneralAuctionFunctions } from "../Functions/GeneralAuctionFunctions";
import { PriceContext } from "../api/StatePrice";
import {
	$1, $10, Currus, CurrusRatioAddress, DAV_TOKEN_ADDRESS, Domus, DomusRatioAddress,
	Fluxin, OneDollarRatioAddress, Ratio_TOKEN_ADDRESS, Rieva, RievaRatioAddress,
	STATE_TOKEN_ADDRESS, TenDollarRatioAddress, Valir, ValirRatioAddress, Xerion, XerionRatioAddress
} from "../ContractAddresses";

const shortenAddress = (address) => address ? `${address.slice(0, 6)}...${address.slice(-6)}` : "";

const addresses = {
	dav: DAV_TOKEN_ADDRESS, Fluxin, Domus, Currus, Xerion, oneD: $1, Rieva, TenDollar: $10, tenD: TenDollarRatioAddress,
	FluxinSwap: Ratio_TOKEN_ADDRESS, RievaSwap: RievaRatioAddress, DomusSwap: DomusRatioAddress,
	XerionSwap: XerionRatioAddress, CurrusSwap: CurrusRatioAddress, OneDollarSwap: OneDollarRatioAddress,
	TenDollarSwap: TenDollarRatioAddress, state: STATE_TOKEN_ADDRESS
};

const shortenedAddresses = Object.fromEntries(Object.entries(addresses).map(([key, val]) => [key, shortenAddress(val)]));

export const TokensDetailsData = () => {
	const priceCtx = useContext(PriceContext);
	const { simpleSupplies, mintAdditionalTOkens, CurrentRatioPrice } = useGeneralTokens();
	const { AuctionRunningLocalString, auctionDetails, TotalTokensBurned, auctionTimeLeft } = useGeneralAuctionFunctions();
	const { DAVTokensWithdraw, DAVTokensFiveWithdraw, withdraw_5, withdraw_95 } = useDAvContract();
	const swapContract = useSwapContract();

	const tokenConfig = [
		{ name: "DAV", key: "dav", supply: "5,000,000.00", claim: DAVTokensWithdraw, claimFive: DAVTokensFiveWithdraw, renounce: "dav", price: 0, actions: { liquidity: withdraw_95, claimFive: withdraw_5 } },
		{ name: "Orxa", key: "Fluxin", supply: "1,000,000,000,000.00", treasury: "1,000,000,000,000.00", mintAmount: 250000000000, pair: "Fluxin/pSTATE", priceKey: "FluxinUsdPrice", auctionKey: "Fluxin" },
		{ name: "Layti", key: "Xerion", supply: "1,000,000,000,000.00", treasury: "1,000,000,000,000.00", mintAmount: 125000000000, pair: "Layti/pSTATE", priceKey: "XerionUsdPrice", auctionKey: "Xerion" },
		{ name: "1$", key: "OneDollar", mintAmount: 25000000, pair: "Layti/pSTATE", priceKey: "OneDollarUsdPrice", auctionKey: "OneDollar" },
		{ name: "Rieva", key: "Rieva", mintAmount: 62500000000, pair: "Layti/pSTATE", priceKey: "RievaUsdPrice", auctionKey: "Rieva" },
		{ name: "10$", key: "TenDollar", mintAmount: 6250000, pair: "Layti/pSTATE", priceKey: "TenDollarUsdPrice", auctionKey: "TenDollar" },
		{ name: "Domus", key: "Domus", mintAmount: 2500000000000, pair: "Domus/pSTATE", priceKey: "DomusUsdPrice", auctionKey: "Domus" },
		{ name: "Currus", key: "Currus", mintAmount: 2500000000000, pair: "Currus/pSTATE", priceKey: "CurrusUsdPrice", auctionKey: "Currus" },
		{ name: "STATE", key: "state", supply: "999,000,000,000,000.00", treasury: "999,000,000,000,000.00", mintAmount: 1000000000000, claimLP: swapContract.LPStateTransferred, priceKey: "stateUsdPrice" },
	];

	return tokenConfig.map(token => ({
		tokenName: token.name,
		key: shortenedAddresses[token.key],
		name: token.name,
		supply: token.supply ?? simpleSupplies[token.key + "Supply"],
		treasury: token.treasury,
		Supply: token.name == "1$" ? simpleSupplies.oneDollarSupply : simpleSupplies[token.key + "Supply"],
		percentage: token.name == "1$" ? swapContract.decayPercentages["oneD"] : swapContract.decayPercentages[token.key],
		address: addresses[token.key],
		SwapContract: addresses[token.key + "Swap"],
		SwapShortContract: shortenedAddresses[token.key + "Swap"],
		stateBalance: swapContract.balances["State" + token.key],
		target: swapContract.RatioTargetsofTokens[token.key],
		isReversing: swapContract.isReversed[token.key]?.toString(),
		WillStart: swapContract.ReverseForCycle[token.key],
		WillStartForNext: swapContract.ReverseForNextCycle[token.key],
		Balance: token.name == "Orxa" ? swapContract.balances["fluxinBalance"] ? token.name == "Layti" : swapContract.balances["xerionBalance"] : swapContract.balances[token.key + "Balance"],
		TotalTokensBurn: TotalTokensBurned[token.key],
		RatioBalance: swapContract.balances?.["ratio" + token.key + "Balance"],
		Duration: auctionDetails[token.auctionKey],
		interval: auctionDetails[token.auctionKey],
		AuctionRunning: AuctionRunningLocalString[token.auctionKey]?.toString(),
		pair: token.pair,
		claimDAVToken: DAVTokensWithdraw,
		claimFiveDAVTokenValue: DAVTokensFiveWithdraw,
		Ratio: CurrentRatioPrice[token.key],
		Price: priceCtx[token.priceKey],
		SetDuration: (value) => swapContract.SetAUctionDuration(value, token.auctionKey),
		AuctionTimeRunning: auctionTimeLeft[token.auctionKey],
		AuctionNextTime: auctionDetails[token.auctionKey],
		mintAddTOkens: token.mintAmount?.toLocaleString(),
		renounceSmartContract: swapContract.isRenounced?.[token.key] ?? "Unknown",
		renounceSwapSmartContract: swapContract.isRenounced?.[token.key + "Ratio"] ?? "Unknown",
		actions: {
			claimLiquidityDAVToken: withdraw_95,
			claimFiveDAVToken: withdraw_5,
			ReanounceContract: swapContract["Reanounce" + token.key + "Contract"],
			ReanounceSwapContract: swapContract["Renounce" + token.key + "Swap"],
			WithdrawState: swapContract["Withdraw" + token.key],
			mintAdditionalTOkens: () => mintAdditionalTOkens(token.key, token.mintAmount),
			SetInterval: (value) => swapContract.SetAUctionInterval(value, token.auctionKey),
			AddTokenToContract: () => swapContract.AddTokensToContract(addresses[token.key], STATE_TOKEN_ADDRESS, CurrentRatioPrice[token.key]),
			setRatio: (value) => swapContract.setRatioTarget(value, token.auctionKey),
			setBurn: (value) => swapContract.setBurnRate(value, token.auctionKey),
			setReverseEnabled: () => swapContract.setReverseEnable(token.auctionKey),
			setReverse: (value, value2) => swapContract.setReverseTime(value, value2),
			setCurrentRatio: (value) => swapContract.setCurrentRatioTarget(value),
			DepositTokens: (value) => swapContract.DepositToken(token.key, addresses[token.key], value, token.auctionKey),
			DepositStateTokens: (value) => swapContract.DepositToken("state", STATE_TOKEN_ADDRESS, value, token.auctionKey),
			StartingAuction: () => swapContract.StartAuction(token.auctionKey),
			...(token.claim && { claimDAVToken: token.claim }),
			...(token.claimFive && { claimFiveDAVTokenValue: token.claimFive }),
			...(token.actions && token.actions),
		},
	}));
};




const addrMap = {
	dav: DAV_TOKEN_ADDRESS, Fluxin, Domus, Currus, Xerion, OneD: $1, Rieva, Valir, TenDollar: $10,
	FluxinSwap: Ratio_TOKEN_ADDRESS, RievaSwap: RievaRatioAddress, DomusSwap: DomusRatioAddress,
	XerionSwap: XerionRatioAddress, ValirSwap: ValirRatioAddress, CurrusSwap: CurrusRatioAddress,
	OneDollarSwap: OneDollarRatioAddress, TenDollarSwap: TenDollarRatioAddress, state: STATE_TOKEN_ADDRESS
};
const shortAddrs = Object.fromEntries(Object.entries(addrMap).map(([k, v]) => [k, shortenAddress(v)]));

export const TokensDetails = () => {
	const prices = useContext(PriceContext);
	const { simpleSupplies, mintAdditionalTOkens } = useGeneralTokens();
	const { AuctionRunningLocalString, auctionDetails, TotalTokensBurned, auctionTimeLeft } = useGeneralAuctionFunctions();
	const { CurrentRatioPrice } = useGeneralTokens();
	const { Supply, DAVTokensWithdraw, DAVTokensFiveWithdraw, withdraw_5, withdraw_95 } = useDAvContract();
	const swap = useSwapContract();

	const tokenConfigs = [
		["DAV", "pDAV", shortAddrs.dav, DAV_TOKEN_ADDRESS, "5,000,000.00", 0, { claimLiquidityDAVToken: withdraw_95, claimFiveDAVToken: withdraw_5, ReanounceContract: swap.ReanounceContract }],
		["Orxa", "Orxa", shortAddrs.Fluxin, Fluxin, "1,000,000,000,000.00", prices.FluxinUsdPrice, { mint: "250,000,000,000" }],
		["Layti", "Layti", shortAddrs.Xerion, Xerion, "1,000,000,000,000.00", prices.XerionUsdPrice, { mint: "125,000,000,000" }],
		["1$", "1$", shortAddrs.OneD, $1, null, prices.OneDollarUsdPrice, { mint: "25,000,000" }],
		["Rieva", "Rieva", shortAddrs.Rieva, Rieva, null, prices.RievaUsdPrice, { mint: "62,500,000,000" }],
		["Domus", "Domus", shortAddrs.Domus, Domus, null, prices.DomusUsdPrice, { mint: "2,500,000,000,000" }],
		["Currus", "Currus", shortAddrs.Currus, Currus, null, prices.CurrusUsdPrice, { mint: "1,250,000,000,000" }],
		["Valir", "Valir", shortAddrs.Valir, Valir, null, prices.ValirUsdPrice, { mint: "31,250,000,000" }],
		["10$", "10$", shortAddrs.TenDollar, $10, null, prices.TenDollarUsdPrice, { mint: "6,250,000" }],
		["STATE", "pSTATE", shortAddrs.state, STATE_TOKEN_ADDRESS, "999,000,000,000,000.00", prices.stateUsdPrice, { mint: "1,000,000,000,000" }],
	];

	const swapContracts = {
		Fluxin: Ratio_TOKEN_ADDRESS, Xerion: XerionRatioAddress, OneD: OneDollarRatioAddress,
		Rieva: RievaRatioAddress, Domus: DomusRatioAddress, Currus: CurrusRatioAddress, Valir: ValirRatioAddress,
		TenDollar: TenDollarRatioAddress
	};

	return tokenConfigs.map(([name, displayName, key, addr, supply, price, extra]) => {
		const contract = name === "1$" ? "OneD" : name === "10$" ? "TenDollar" : name;
		const swapKey = `${contract}Swap`;
		const isDAV = name === "DAV";
		const isState = name === "STATE";
		return {
			tokenName: name, key, name: displayName, supply: supply || simpleSupplies[`${contract}Supply`],
			Supply: isDAV ? Supply : simpleSupplies[`${contract}Supply`], Price: price,
			address: addr, SwapContract: swapContracts[contract], SwapShortContract: shortAddrs[swapKey],
			claimDAVToken: isDAV ? DAVTokensWithdraw : undefined, claimFiveDAVTokenValue: isDAV ? DAVTokensFiveWithdraw : undefined,
			renounceSmartContract: swap.isRenounced?.[contract.toLowerCase()] ?? "Unknown",
			renounceSwapSmartContract: swapContracts[contract] ? swap.isRenounced?.[`${contract}Ratio`] ?? "Unknown" : undefined,
			percentage: swap.decayPercentages[contract], stateBalance: swap.balances[`State${contract}`],
			target: swap.RatioTargetsofTokens[contract], isReversing: swap.isReversed[contract]?.toString(),
			WillStart: swap.ReverseForCycle[contract], WillStartForNext: swap.ReverseForNextCycle[contract],
			Balance: swap.balances[`${contract}Balance`], TotalTokensBurn: TotalTokensBurned[contract],
			RatioBalance: swap.balances?.[`ratio${contract}Balance`], Duration: auctionDetails[contract],
			interval: auctionDetails[contract], AuctionRunning: AuctionRunningLocalString?.[contract]?.toString(),
			pair: isState ? undefined : `${name}/pSTATE`, Ratio: CurrentRatioPrice[contract],
			AuctionTimeRunning: auctionTimeLeft[contract], AuctionNextTime: auctionDetails[contract],
			mintAddTOkens: extra?.mint, LastDevShare: isDAV ? swap.LastDevShare : undefined,
			LastLiquidity: isDAV ? swap.LastLiquidity : undefined, claimLPToken: isState ? swap.LPStateTransferred : undefined,
			actions: {
				...(extra || {}),
				ReanounceContract: swap[`Reanounce${contract}Contract`],
				ReanounceSwapContract: swapContracts[contract] ? swap[`Renounce${contract}Swap`] : undefined,
				WithdrawState: swap[`Withdraw${isState ? 'State' : contract}`],
				mintAdditionalTOkens: extra?.mint ? () => mintAdditionalTOkens(contract, parseInt(extra.mint.replace(/,/g, ''))) : undefined,
				SetDuration: swapContracts[contract] ? (v) => swap.SetAUctionDuration(v, `${contract}Ratio`) : undefined,
				SetInterval: swapContracts[contract] ? (v) => swap.SetAUctionInterval(v, `${contract}Ratio`) : undefined,
				AddTokenToContract: swapContracts[contract] ? () => swap.AddTokensToContract(addr, STATE_TOKEN_ADDRESS, CurrentRatioPrice[contract]) : isState ? swap.AddTokens : undefined,
				setRatio: swapContracts[contract] ? (v) => swap.setRatioTarget(v, `${contract}Ratio`) : undefined,
				setBurn: swapContracts[contract] ? (v) => swap.setBurnRate(v, `${contract}Ratio`) : undefined,
				setReverseEnabled: swapContracts[contract] ? () => swap.setReverseEnable(`${contract}Ratio`) : undefined,
				setReverse: swapContracts[contract] ? (v, v2) => swap.setReverseTime(v, v2) : undefined,
				setCurrentRatio: swapContracts[contract] ? (v) => swap.setCurrentRatioTarget(v) : undefined,
				DepositTokens: swapContracts[contract] ? (v) => swap.DepositToken(contract.toLowerCase(), addr, v, `${contract}Ratio`) : isState ? (v) => swap.DepositToken("state", addr, v) : undefined,
				DepositStateTokens: swapContracts[contract] ? (v) => swap.DepositToken("state", STATE_TOKEN_ADDRESS, v, `${contract}Ratio`) : undefined,
				StartingAuction: swapContracts[contract] ? () => swap.StartAuction(`${contract}Ratio`) : undefined,
			}
		};
	});
};