import { useEffect, useState, useContext } from "react";
import FluxinLogo from "../assets/FluxinLogo.png";
import { useDeepStateFunctions } from "../Functions/DeepStateContract";
import { ContractContext } from "../Functions/ContractInitialize";
import { ethers } from "ethers"; // Import ethers for conversion

export const useTokens = (userTotalBuyCounts) => {
	const { AllContracts, account } = useContext(ContractContext);
	const { CurrentSellprice } = useDeepStateFunctions();
	const [buyRecords, setBuyRecords] = useState([]);

	useEffect(() => {
		const fetchBuyRecords = async () => {
			if (!AllContracts?.DeepStateContract || !account) return;

			let records = [];
			for (let i = 1; i <= userTotalBuyCounts; i++) {
				try {
					const record = await AllContracts.DeepStateContract.getBuyRecord(account, i);
					const [BuyPrice, ethCost, tokenAmount, profitOrLoss] = record;

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
						CurrentValue: (Number(CurrentSellprice) * Number(tokenAmountETH) || 0).toFixed(6),
						ProfitLoss: profitOrLossETH,
						logo: FluxinLogo,
					});
				} catch (error) {
					console.error(`Error fetching buy record ${i}:`, error);
				}
			}
			setBuyRecords(records);
		};

		if (userTotalBuyCounts > 0) {
			fetchBuyRecords();
		}
	}, [AllContracts, account, userTotalBuyCounts, CurrentSellprice]);

	return buyRecords;
};
