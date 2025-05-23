
import DAVTokenABI from "../ABI/DavTokenABI.json";
import StateABI from "../ABI/StateTokenABI.json";
import RatioABI from "../ABI/RatioABI.json";
import { Auction_TESTNET, DAV_TESTNET, STATE_TESTNET } from "./ContractAddresses";

let currentChainId = 369; // Default chainId

export const setChainId = (chainId) => {
	currentChainId = chainId;
};

// const getStateAddress = () => (currentChainId == 146 ? STATE_TOKEN_SONIC_ADDRESS : STATE_TOKEN_ADDRESS);
const getDavABI = () => (currentChainId == 146 ? DAVTokenABI : DAVTokenABI);

export const getContractConfigs = () => ({
	davContract: { address: DAV_TESTNET, abi: getDavABI() },
	AuctionContract: { address: Auction_TESTNET, abi: RatioABI },
	stateContract: { address: STATE_TESTNET, abi: StateABI },
});
