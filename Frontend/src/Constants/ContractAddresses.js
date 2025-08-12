// Chain IDs
export const CHAIN_IDS = {
    PULSECHAIN: 369,
    POLYGON: 137,
    SONIC: 146,
    MAINNET: 1,
    PULSECHAIN_TESTNET: 943,
};

// Contract addresses organized by chain
export const CONTRACT_ADDRESSES = {
    [CHAIN_IDS.PULSECHAIN]: {
        DAV_TOKEN: "0x68426cF2C581C2Bb271DA70F43Ed69D0116075AC",
        STATE_TOKEN: "0x7b1411B3562e48e7a56F63BB7e59eb75a97c661d",
        AUCTION: "0x870280Fd978EFf5A7B630C07982975E44AAe659E",
    },
    [CHAIN_IDS.POLYGON]: {
        DAV_TOKEN: "0xb0D4923bDAD80998A473EA6874A3005DB2bD19A1", // Add Polygon mainnet addresses when available
        STATE_TOKEN: "0x9E7f120EA417515303A80DBF1c13a238bd1D365E",
        AUCTION: "0x610E1044C026fCf6AB24B49cad1FF4c616647636",
    },
    [CHAIN_IDS.MAINNET]: {
        DAV_TOKEN: "", // Add Ethereum mainnet addresses when available
        STATE_TOKEN: "",
        AUCTION: "",
    },
};

// Helper function to get contract addresses for a specific chain
export const getContractAddresses = (chainId) => {
    return CONTRACT_ADDRESSES[chainId] || CONTRACT_ADDRESSES[CHAIN_IDS.PULSECHAIN];
};

// Helper function to get a specific contract address
export const getContractAddress = (chainId, contractType) => {
    const addresses = getContractAddresses(chainId);
    return addresses[contractType];
};

// Simple functions to get contract addresses for connected chain
export const getDAVContractAddress = (chainId) => {
    return getContractAddress(chainId, 'DAV_TOKEN') || getContractAddress(CHAIN_IDS.PULSECHAIN, 'DAV_TOKEN');
};

export const getSTATEContractAddress = (chainId) => {
    return getContractAddress(chainId, 'STATE_TOKEN') || getContractAddress(CHAIN_IDS.PULSECHAIN, 'STATE_TOKEN');
};

export const getAUCTIONContractAddress = (chainId) => {
    return getContractAddress(chainId, 'AUCTION') || getContractAddress(CHAIN_IDS.PULSECHAIN, 'AUCTION');
};
export const explorerUrls = {
    1: "https://etherscan.io/address/",          // Ethereum Mainnet
    137: "https://polygonscan.com/address/",     // Polygon Mainnet
    10: "https://optimistic.etherscan.io/address/", // Optimism
    369: "https://kekxplorer.avecdra.pro/address/", 
};

// Get all contract addresses for a chain
export const getContractAddressesForChain = (chainId) => {
    return {
        DAV_TOKEN: getDAVContractAddress(chainId),
        STATE_TOKEN: getSTATEContractAddress(chainId),
        AUCTION: getAUCTIONContractAddress(chainId),
    };
};