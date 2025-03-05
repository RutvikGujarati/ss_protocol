import { $1, DAV_TOKEN_ADDRESS, Fluxin, Ratio_TOKEN_ADDRESS, STATE_TOKEN_ADDRESS, Xerion, XerionRatioAddress } from "../ContractAddresses";
import DAVTokenABI from "../ABI/DavTokenABI.json";
import StateABI from "../ABI/StateTokenABI.json";
import RatioABI from "../ABI/RatioABI.json";


export const contractConfigs = {
	davContract: { address: DAV_TOKEN_ADDRESS, abi: DAVTokenABI },
	stateContract: { address: STATE_TOKEN_ADDRESS, abi: StateABI },
	FluxinContract: { address: Fluxin, abi: StateABI },
	oneDollar: { address: $1, abi: StateABI },
	XerionContract: { address: Xerion, abi: StateABI },
	RatioContract: { address: Ratio_TOKEN_ADDRESS, abi: RatioABI },
	XerionRatioContract: { address: XerionRatioAddress, abi: RatioABI },
};

