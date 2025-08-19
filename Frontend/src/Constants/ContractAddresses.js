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
        DAV_TOKEN: "0x709D562f48b5471b39F1b253fa457dfAcb00CA45",
        STATE_TOKEN: "0xa5C07C73Dec7b71cD8F8fbf0DA4bE174c018CFa8",
        AUCTION: "0xEAb44423F199Eea322a09b39eA7244939a075Da1",
    },
    [CHAIN_IDS.POLYGON]: {
        DAV_TOKEN: "0x0F7782ef1Bd024E75a47d344496022563F0C1A38", // Add Polygon mainnet addresses when available
        STATE_TOKEN: "0x50Bb32FCB594978967265135E4d41849d7F646e0",
        AUCTION: "0x81Ba02Ca510a58560D183F0F5eE42E47D1846245",
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