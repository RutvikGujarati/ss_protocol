import { useMemo } from "react";
import FluxinLogo from "../assets/FluxinLogo.png";

export const useTokens = () => {
	const tokens = useMemo(() => [
		{
			id: 1,
			EthCost:"0.001",
			BuyCost:"0.01",
			LPTAmount: "100", logo: FluxinLogo,
			CurrentValue: "1000",
			Action: "5000",
			BurnOccured: "0",
			ProfitLoss: "1000",
			// bounty: bountyBalances.fluxinBounty,
			burnAmount: 0,
		},
	], []);

	return tokens;
};

