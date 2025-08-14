import { ethers } from "ethers";
import {
    getDAVContractAddress,
    getSTATEContractAddress,
    getAUCTIONContractAddress,
} from "../../Constants/ContractAddresses";

export const getContractAddresses = (chainId) => ({
    dav: getDAVContractAddress(chainId),
    state: getSTATEContractAddress(chainId),
    auction: getAUCTIONContractAddress(chainId),
});

export const formatTokenAmount = (amount, decimals = 18) => {
    return Math.floor(Number(ethers.formatUnits(amount, decimals)));
};

export const handleContractError = (error) => {
    const reason = error?.reason || error?.shortMessage || error?.message || "";
    const unsupported = /unsupported token/i.test(reason);

    if (unsupported) return "not listed";
    return "not started";
};

export const ERC20_ABI = [
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function allowance(address owner, address spender) external view returns (uint256)",
    "function balanceOf(address account) external view returns (uint256)",
    "function name() view returns (string)",
    "function decimals() view returns (uint8)"
];

export const TokenABI = [
    {
        type: "function",
        name: "renounceOwnership",
        inputs: [],
        outputs: [],
        stateMutability: "nonpayable",
    },
];

export const ERC20Name_ABI = ["function name() view returns (string)"];