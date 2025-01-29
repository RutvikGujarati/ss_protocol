import XerionLogo from "../assets/XerionLogo.png";
import FluxinLogo from "../assets/FluxinLogo.png";

export const getTokens = (balances, bountyBalances, BurnCycleACtive, BurnOccuredForToken, ClickBurn) => [
	{
		id: 1,
		name: "Fluxin",
		logo: FluxinLogo,
		burnCycle: BurnCycleACtive.Fluxin === "true",
		BurnOccured: BurnOccuredForToken.Fluxin === "true",
		burnRatio: 0.00001,
		bounty: bountyBalances.fluxinBounty,
		burnAmount: (balances.ratioFluxinBalance * 0.00001).toFixed(7),
		clickBurn: () => ClickBurn("fluxinRatio"),
	},
	{
		id: 2,
		name: "Xerion",
		logo: XerionLogo,
		burnCycle: BurnCycleACtive.Xerion === "true",
		BurnOccured: BurnOccuredForToken.Xerion === "true",
		burnRatio: 0.00001,
		bounty: bountyBalances.xerionBounty,
		burnAmount: (balances.ratioXerionBalance * 0.00001).toFixed(7),
		clickBurn: () => ClickBurn("XerionRatio"),
	},
];
