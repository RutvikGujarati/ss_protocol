import {
	$1, $10, Currus, CurrusRatioAddress, DAV_TOKEN_ADDRESS, DAV_TOKEN_SONIC_ADDRESS,
	Domus, DomusRatioAddress, Fluxin, OneDollarRatioAddress, Ratio_TOKEN_ADDRESS,
	Rieva, RievaRatioAddress, Sanitas, STATE_TOKEN_ADDRESS, STATE_TOKEN_SONIC_ADDRESS, TenDollarRatioAddress,
	Valir, ValirRatioAddress, Xerion, XerionRatioAddress
} from "../ContractAddresses";

import DAVTokenABI from "../ABI/DavTokenABI.json";
import StateABI from "../ABI/StateTokenABI.json";
import RatioABI from "../ABI/RatioABI.json";

const getDAVAddress = (chainId) => (chainId == 146 ? DAV_TOKEN_SONIC_ADDRESS : DAV_TOKEN_ADDRESS);
const StateAddress = (chainId) => (chainId == 146 ? STATE_TOKEN_SONIC_ADDRESS : STATE_TOKEN_ADDRESS);

export const getContractConfigs = (chainId) => ({
	davContract: { address: getDAVAddress(chainId), abi: DAVTokenABI },
	stateContract: { address: StateAddress(chainId), abi: StateABI },
	FluxinContract: { address: Fluxin, abi: StateABI },
	RievaContract: { address: Rieva, abi: StateABI },
	DomusContract: { address: Domus, abi: StateABI },
	CurrusContract: { address: Currus, abi: StateABI },
	ValirContract: { address: Valir, abi: StateABI },
	SanitasContract: { address: Sanitas, abi: StateABI },
	oneDollar: { address: $1, abi: StateABI },
	TenDollarContract: { address: $10, abi: StateABI },
	XerionContract: { address: Xerion, abi: StateABI },
	RatioContract: { address: Ratio_TOKEN_ADDRESS, abi: RatioABI },
	RievaRatioContract: { address: RievaRatioAddress, abi: RatioABI },
	DomusRatioContract: { address: DomusRatioAddress, abi: RatioABI },
	CurrusRatioContract: { address: CurrusRatioAddress, abi: RatioABI },
	ValirRatioContract: { address: ValirRatioAddress, abi: RatioABI },
	OneDollarRatioContract: { address: OneDollarRatioAddress, abi: RatioABI },
	TenDollarRatioContract: { address: TenDollarRatioAddress, abi: RatioABI },
	XerionRatioContract: { address: XerionRatioAddress, abi: RatioABI },
});
