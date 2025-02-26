import { useMemo } from "react";
import FluxinLogo from "../assets/FluxinLogo.png";

export const useTokens = (balances, bountyBalances, BurnCycleACtive, BurnOccuredForToken, ClickBurn) => {
    const tokens = useMemo(() => [
        // {
        //     id: 1,
        //     name: "Orxa",
        //     logo: FluxinLogo,
        //     burnCycle: BurnCycleACtive.Fluxin === "true",
        //     BurnOccured: BurnOccuredForToken.Fluxin === "true",
        //     burnRatio: "1/10000",
        //     // bounty: bountyBalances.fluxinBounty,
        //     burnAmount: (balances.ratioFluxinBalance * 0.00001).toFixed(2),
        //     clickBurn: () => ClickBurn("fluxinRatio"),
        // },
    ], [balances, BurnCycleACtive, BurnOccuredForToken, ClickBurn]);

    return tokens;
};

