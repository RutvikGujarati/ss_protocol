
import DAVTokenABI from "../ABI/DavTokenABI.json";
import StateABI from "../ABI/StateTokenABI.json";
import RatioABI from "../ABI/RatioABI.json";
import { 
  getContractAddresses, 
  getContractAddress, 
  CHAIN_IDS,
  getDAVContractAddress,
  getSTATEContractAddress,
  getAUCTIONContractAddress,
} from "./ContractAddresses";

let currentChainId = CHAIN_IDS.PULSECHAIN; // Default chainId

export const setChainId = (chainId) => {
	currentChainId = chainId;
};

export const getCurrentChainId = () => {
	return currentChainId;
};

// Get contract configs for the current chain
export const getContractConfigs = () => {
	const addresses = getContractAddresses(currentChainId);
	
	return {
		davContract: { 
			address: addresses.DAV_TOKEN, 
			abi: DAVTokenABI 
		},
		AuctionContract: { 
			address: addresses.AUCTION, 
			abi: RatioABI 
		},
		stateContract: { 
			address: addresses.STATE_TOKEN, 
			abi: StateABI 
		},
	};
};

// Get contract configs for a specific chain
export const getContractConfigsForChain = (chainId) => {
	const addresses = getContractAddresses(chainId);
	
	return {
		davContract: { 
			address: addresses.DAV_TOKEN, 
			abi: DAVTokenABI 
		},
		AuctionContract: { 
			address: addresses.AUCTION, 
			abi: RatioABI 
		},
		stateContract: { 
			address: addresses.STATE_TOKEN, 
			abi: StateABI 
		},
	};
};

// Check if a chain is supported
export const isChainSupported = (chainId) => {
	const supportedChains = Object.values(CHAIN_IDS);
	return supportedChains.includes(chainId);
};

// Legacy function for backward compatibility
const getDavABI = () => DAVTokenABI;

// Legacy export for backward compatibility - now uses dynamic addresses
export const getLegacyContractConfigs = () => ({
	davContract: { address: getDAVContractAddress(currentChainId), abi: getDavABI() },
	AuctionContract: { address: getAUCTIONContractAddress(currentChainId), abi: RatioABI },
	stateContract: { address: getSTATEContractAddress(currentChainId), abi: StateABI },
});
