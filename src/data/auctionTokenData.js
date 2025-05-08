

import { useContext } from "react";
import { PriceContext } from "../api/StatePrice";
import { useSwapContract } from "../Functions/SwapContractFunctions";
import { useDAvContract } from "../Functions/DavTokenFunctions";
export const useAuctionTokens = () => {
	const prices = useContext(PriceContext);
	const {
		SwapTokens, isReversed, AuctionTime, RatioTargetsofTokens, IsAuctionActive,
		userHashSwapped, userHasReverseSwapped, InputAmount, OutPutAmount,
		AirdropClaimed, TokenNames, tokenMap,
	} = useSwapContract();
	const { Emojies } = useDAvContract();

	const dynamicTokenNames = Array.from(TokenNames || []).filter(
		(name) => name !== "DAV" && name !== "STATE"
	);


	const handleAddMap = {
		second: () => { }, // Replace with actual handler if exists
		// Add more mappings
	};



	const tokenConfigs = dynamicTokenNames.map((contract, index) => {
		const id = contract;
		const handleAddToken = handleAddMap[contract] || (() => { });
		const address = tokenMap?.[contract] || "0x0000000000000000000000000000000000000000";

		return {
			id,
			name: id,
			emoji: Emojies?.[index] || "🔹", // fallback if no emoji

			ContractName: contract,
			token: address,
			handleAddToken,
			ratio: `1:${RatioTargetsofTokens?.[contract] || 0}`,
			currentRatio: `1:1000`,
			TimeLeft: AuctionTime?.[contract],
			AirdropClaimedForToken: AirdropClaimed?.[contract],
			isReversing: isReversed?.[contract],
			RatioTargetToken: RatioTargetsofTokens?.[contract] || 0,
			Price: prices?.[`${contract}UsdPrice`],
			address,
			AuctionStatus: IsAuctionActive?.[contract],
			userHasSwapped: userHashSwapped?.[contract],
			userHasReverse: userHasReverseSwapped?.[contract],
			SwapT: () => SwapTokens(id, contract),
			onlyInputAmount: InputAmount[contract],
			inputTokenAmount: `${InputAmount[contract] || 0} ${id}`,
			outputToken: `${OutPutAmount?.[contract] || 0} State`,
		};
	});


	return tokenConfigs;


};


