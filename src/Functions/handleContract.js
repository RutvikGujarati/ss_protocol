import { useContext } from "react";
import { ContractContext } from "./ContractInitialize";

export const useContractCall = () => {
	const { loading, contract } = useContext(ContractContext);

	const handleContractCall = async (method, args = [], formatter = (v) => v) => {
		try {
			if (loading || !contract) {
				console.error("Contract not loaded");
				return;
			}
			const result = await contract[method](...args);
			return formatter(result);
		} catch (error) {
			if (error.reason || error.data) {
				throw error;
			}
			console.log(error);
			throw new Error("Unknown contract call error");
		}
	};

	return { handleContractCall };
};
