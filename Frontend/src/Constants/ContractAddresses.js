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
        DAV_TOKEN: "0x11aacD890824bd05BFD51925b57D840d39e2C04e",
        STATE_TOKEN: "0x6E76680b7AB936D1613b20f1a7589EaB3A3b862A",
        AUCTION: "0xD1C3485Cc4cc39F21Fe7779998F08eC141f7A7dA",
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
    369: "https://midgard.wtf/address/",        // PulseChain Mainnet
};

// Get all contract addresses for a chain
export const getContractAddressesForChain = (chainId) => {
    return {
        DAV_TOKEN: getDAVContractAddress(chainId),
        STATE_TOKEN: getSTATEContractAddress(chainId),
        AUCTION: getAUCTIONContractAddress(chainId),
    };
};