import {
	$1, $10, Currus, CurrusRatioAddress, DAV_TOKEN_ADDRESS, DAV_TOKEN_SONIC_ADDRESS,
	Domus, DomusRatioAddress, Fluxin, OneDollarRatioAddress, Ratio_TOKEN_ADDRESS,
	Rieva, RievaRatioAddress, Sanitas, SanitasRatioAddress, STATE_TOKEN_ADDRESS, STATE_TOKEN_SONIC_ADDRESS, Teeah, TeeahRatioAddress, TenDollarRatioAddress,
	Valir, ValirRatioAddress, Xerion, XerionRatioAddress
} from "../ContractAddresses";

import DAVTokenABI from "../ABI/DavTokenABI.json";
import sDAVABI from "../ABI/sDAVToken.json";
import StateABI from "../ABI/StateTokenABI.json";
import RatioABI from "../ABI/RatioABI.json";

let currentChainId = 369; // Default chainId

export const setChainId = (chainId) => {
	currentChainId = chainId;
};

const getDAVAddress = () => (currentChainId == 146 ? DAV_TOKEN_SONIC_ADDRESS : DAV_TOKEN_ADDRESS);
const getStateAddress = () => (currentChainId == 146 ? STATE_TOKEN_SONIC_ADDRESS : STATE_TOKEN_ADDRESS);
const getDavABI = () => (currentChainId == 146 ? sDAVABI : DAVTokenABI);

export const getContractConfigs = () => ({
	davContract: { address: getDAVAddress(), abi: getDavABI() },
	stateContract: { address: getStateAddress(), abi: StateABI },
	FluxinContract: { address: Fluxin, abi: StateABI },
	RievaContract: { address: Rieva, abi: StateABI },
	DomusContract: { address: Domus, abi: StateABI },
	TeeahContract: { address: Teeah, abi: StateABI },
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
	SanitasRatioContract: { address: SanitasRatioAddress, abi: RatioABI },
	TeeahRatioContract: { address: TeeahRatioAddress, abi: RatioABI },
	OneDollarRatioContract: { address: OneDollarRatioAddress, abi: RatioABI },
	TenDollarRatioContract: { address: TenDollarRatioAddress, abi: RatioABI },
	XerionRatioContract: { address: XerionRatioAddress, abi: RatioABI },
});
