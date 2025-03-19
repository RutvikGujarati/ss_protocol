import { useMemo } from "react";
import FluxinLogo from "../assets/FluxinLogo.png";
import { useDeepStateFunctions } from "../Functions/DeepStateContract";

export const useTokens = () => {
	const {
		PLSPrice,
		UsersTokens,
		CurrentBuyprice,
		TotalInvested,
		CurrentSellprice,
	} = useDeepStateFunctions();

	const tokens = useMemo(() => [
		{
			id: 1,
			EthCost: (Number(PLSPrice) * Number(UsersTokens) || 0).toFixed(2), // Ensure valid number
			BuyCost: (Number(CurrentBuyprice) || 0).toFixed(8), // Convert before using .toFixed()
			LPTAmount: (Number(UsersTokens) || 0).toFixed(2),
			logo: FluxinLogo,
			CurrentValue: (Number(CurrentSellprice) * Number(UsersTokens) || 0).toFixed(6),

			BurnOccured: "0",
			ProfitLoss: (Number(CurrentSellprice) * Number(UsersTokens) - TotalInvested || 0).toFixed(6),
			burnAmount: (0).toFixed(2),
		},
	], [PLSPrice, UsersTokens, CurrentBuyprice]); // Add dependencies

	return tokens;
};
