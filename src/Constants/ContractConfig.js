import { $1, $10, DAV_TOKEN_ADDRESS, Domus, DomusRatioAddress, DeepState, Fluxin, OneDollarRatioAddress, Ratio_TOKEN_ADDRESS, Rieva, RievaRatioAddress, STATE_TOKEN_ADDRESS, TenDollarRatioAddress, Xerion, XerionRatioAddress } from "../ContractAddresses";
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
	DomusContract: { address: Domus, abi: StateABI },
	oneDollar: { address: $1, abi: StateABI },
	TenDollarContract: { address: $10, abi: StateABI },
	XerionContract: { address: Xerion, abi: StateABI },
	RatioContract: { address: Ratio_TOKEN_ADDRESS, abi: RatioABI },
	RievaRatioContract: { address: RievaRatioAddress, abi: RatioABI },
	DomusRatioContract: { address: DomusRatioAddress, abi: RatioABI },
	OneDollarRatioContract: { address: OneDollarRatioAddress, abi: RatioABI },
	TenDollarRatioContract: { address: TenDollarRatioAddress, abi: RatioABI },
	XerionRatioContract: { address: XerionRatioAddress, abi: RatioABI },
};

