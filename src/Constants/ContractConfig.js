import { $1, DAV_TOKEN_ADDRESS, DeepState, Fluxin, OneDollarRatioAddress, Ratio_TOKEN_ADDRESS, Rieva, RievaRatioAddress, STATE_TOKEN_ADDRESS, Xerion, XerionRatioAddress } from "../ContractAddresses";
import DAVTokenABI from "../ABI/DavTokenABI.json";
import StateABI from "../ABI/StateTokenABI.json";
import RatioABI from "../ABI/RatioABI.json";
import DeepStateABI from "../ABI/DeepState.json";


export const contractConfigs = {
	DeepStateContract: { address: DeepState, abi: DeepStateABI },
	davContract: { address: DAV_TOKEN_ADDRESS, abi: DAVTokenABI },
	stateContract: { address: STATE_TOKEN_ADDRESS, abi: StateABI },
	FluxinContract: { address: Fluxin, abi: StateABI },
	RievaContract: { address: Rieva, abi: StateABI },
	oneDollar: { address: $1, abi: StateABI },
	XerionContract: { address: Xerion, abi: StateABI },
	RatioContract: { address: Ratio_TOKEN_ADDRESS, abi: RatioABI },
	RievaRatioContract: { address: RievaRatioAddress, abi: RatioABI },
	OneDollarRatioContract: { address: OneDollarRatioAddress, abi: RatioABI },
	XerionRatioContract: { address: XerionRatioAddress, abi: RatioABI },
};

