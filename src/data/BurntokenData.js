import { useEffect, useState, useContext, useCallback } from "react";
import FluxinLogo from "../assets/FluxinLogo.png";
import { useDeepStateFunctions } from "../Functions/DeepStateContract";
import { ContractContext } from "../Functions/ContractInitialize";
import { ethers } from "ethers"; // Import ethers for conversion

export const useTokens = (userTotalBuyCounts) => {
	const { AllContracts, account } = useContext(ContractContext);
	const { CurrentSellPrice } = useDeepStateFunctions();
	const [buyRecords, setBuyRecords] = useState([]);

	// Define a function to fetch buy records
	const fetchBuyRecords = useCallback(async () => {
		if (!AllContracts?.DeepStateContract || !account) return;

		let records = [];
		for (let i = 1; i <= userTotalBuyCounts; i++) {
			try {
				const record = await AllContracts.DeepStateContract.getBuyRecord(account, i);
				const [BuyPrice, ethCost, tokenAmount,sold, profitOrLoss] = record;

				// Convert wei to ETH
				const buyPriceETH = ethers.formatUnits(BuyPrice, 18);
				const ethCostETH = ethers.formatUnits(ethCost, 18);
				const tokenAmountETH = ethers.formatUnits(tokenAmount, 18);
				const profitOrLossETH = ethers.formatUnits(profitOrLoss, 18);

				records.push({
					id: i,
					BuyCost: Number(buyPriceETH).toFixed(9),
					EthCost: Number(ethCostETH).toFixed(2),
					LPTAmount: Number(tokenAmountETH).toFixed(0),
					isSold:sold,
					CurrentValue: (Number(CurrentSellPrice) * Number(tokenAmountETH)).toFixed(4),
					ProfitLoss: Number(profitOrLossETH).toFixed(5),
					logo: FluxinLogo,
				});
			} catch (error) {
				console.error(`Error fetching buy record ${i}:`, error);
			}
		}
		setBuyRecords(records);
	}, [AllContracts, account, userTotalBuyCounts, CurrentSellPrice]); // Add dependencies

	// Run the effect whenever `userTotalBuyCounts` changes
	useEffect(() => {
		if (userTotalBuyCounts > 0) {
			fetchBuyRecords();
		}
	}, [userTotalBuyCounts, fetchBuyRecords]); // Dependencies to ensure updates

	return buyRecords;
};
