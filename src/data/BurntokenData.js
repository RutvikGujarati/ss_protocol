import XerionLogo from "../assets/XerionLogo.png";
import FluxinLogo from "../assets/FluxinLogo.png";

export const getTokens = (balances, bountyBalances, BurnCycleACtive, BurnOccuredForToken, ClickBurn,) => [
	{
		id: 1,
		name: "Fluxin",
		logo: FluxinLogo,
		burnCycle: BurnCycleACtive.Fluxin === "true",
		// burnCycle:"true",
		BurnOccured: BurnOccuredForToken.Fluxin === "true",
		burnRatio: "1/10000",
		bounty: bountyBalances.fluxinBounty,
		burnAmount: (balances.ratioFluxinBalance * 0.0001).toFixed(2),
		clickBurn: () => ClickBurn("fluxinRatio"),
	},
	{
		id: 2,
		name: "Xerion",
		logo: XerionLogo,
		burnCycle: BurnCycleACtive.Xerion === "true",
		BurnOccured: BurnOccuredForToken.Xerion === "true",
		burnRatio: "1/10000",
		bounty: bountyBalances.xerionBounty,
		burnAmount: (balances.ratioXerionBalance * 0.0001).toFixed(2),
		clickBurn: () => ClickBurn("XerionRatio"),
	},
];
