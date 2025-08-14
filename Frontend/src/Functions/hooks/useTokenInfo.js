import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { ERC20_ABI, ERC20Name_ABI, formatTokenAmount } from './contractHelpers';
import { getAUCTIONContractAddress, getSTATEContractAddress } from '../../Constants/ContractAddresses';

export const useTokenInfo = (AllContracts, provider, address, chainId, ReturnfetchUserTokenAddresses) => {
    const [tokenMap, setTokenMap] = useState({});
    const [TokenNames, setTokenNames] = useState({});
    const [TokenBalance, setTokenbalance] = useState({});
    const [burnedAmount, setBurnedAmount] = useState({});
    const [burnedLPAmount, setBurnLpAmount] = useState({});
    const [UsersSupportedTokens, setUsersSupportedTokens] = useState("");
    const [DavAddress, setDavAddress] = useState("");
    const [StateAddress, setStateAddress] = useState("");
    const [supportedToken, setIsSupported] = useState(false);
    const [pstateToPlsRatio, setPstateToPlsRatio] = useState("0.0");

    const chainConfigs = {
        369: { name: "PulseChain", poolAddress: "0x5f5C53f62eA7c5Ed39D924063780dc21125dbDe7" },
        137: { name: "polygon_pos", poolAddress: "0x9ea86c309c2e024cc53f0d95a103b8187152654d" },
        // add more chains here
    };
    const fetchUserTokenAddresses = useCallback(async () => {
        if (!AllContracts?.AuctionContract) return;

        try {
            const proxyResult = await AllContracts.AuctionContract.getUserTokenNames();
            const tokenNames = Array.from(proxyResult);
            const tokenAddresses = {};

            for (const name of tokenNames) {
                const TokenAddress = await AllContracts.AuctionContract.getUserTokenAddress(name);
                tokenAddresses[name] = TokenAddress;
            }

            setTokenMap(tokenAddresses);
        } catch (error) {
            console.error("Error fetching token data:", error);
        }
    }, [AllContracts]);

    const getTokenNamesForUser = useCallback(async () => {
        try {
            const proxyResult = await AllContracts.AuctionContract.getUserTokenNames();
            const tokenNames = Array.from(proxyResult);
            setTokenNames(tokenNames);
            return tokenNames;
        } catch (error) {
            console.error("Failed to fetch token names:", error);
            return [];
        }
    }, [AllContracts]);

    const getTokenBalances = useCallback(async () => {
        try {
            const results = {};
            const tokenMap = await ReturnfetchUserTokenAddresses();

            const extendedMap = { ...tokenMap, state: getSTATEContractAddress(chainId) };

            for (const [tokenName, TokenAddress] of Object.entries(extendedMap)) {
                const tokenContract = new ethers.Contract(TokenAddress, ERC20_ABI, provider);
                const rawBalance = await tokenContract.balanceOf(getAUCTIONContractAddress(chainId));
                const formattedBalance = formatTokenAmount(rawBalance, 18);
                results[tokenName] = formattedBalance;
            }

            setTokenbalance(results);
        } catch (e) {
            console.error("Error fetching token balances:", e);
        }
    }, [provider, ReturnfetchUserTokenAddresses, chainId]);

    const getTokenNamesByUser = useCallback(async () => {
        if (!AllContracts?.AuctionContract || !provider) return;

        try {
            const result = await AllContracts.AuctionContract.getTokensByOwner(address);
            const tokenAddresses = Array.isArray(result) ? [...result] : Object.values(result);

            const tokenData = await Promise.all(
                tokenAddresses.map(async (tokenAddr) => {
                    try {
                        const tokenContract = new ethers.Contract(tokenAddr, ERC20Name_ABI, provider);
                        const name = await tokenContract.name();
                        const pairAddress = await AllContracts.AuctionContract.pairAddresses(tokenAddr);
                        const nextClaimTime = await AllContracts.AuctionContract.getNextClaimTime(tokenAddr);

                        return {
                            address: tokenAddr,
                            name,
                            pairAddress,
                            nextClaimTime: Number(nextClaimTime),
                        };
                    } catch (err) {
                        console.error(`Failed for token: ${tokenAddr}`, err);
                        return {
                            address: tokenAddr,
                            name: "Unknown",
                            pairAddress: "0x0000000000000000000000000000000000000000",
                            nextClaimTime: null,
                        };
                    }
                })
            );

            setUsersSupportedTokens(tokenData);
        } catch (error) {
            console.error("Error fetching token names or pair addresses:", error);
        }
    }, [AllContracts, provider, address]);

    const fetchBurnLpAmount = useCallback(async () => {
        if (!AllContracts?.AuctionContract || !provider) return {};

        try {
            const tokenMap = await ReturnfetchUserTokenAddresses();
            const targetAddress = "0x0000000000000000000000000000000000000369";
            const results = {};

            for (const [tokenName, tokenAddress] of Object.entries(tokenMap)) {
                try {
                    const pairAddress = await AllContracts.AuctionContract.pairAddresses(tokenAddress);
                    const lpTokenContract = new ethers.Contract(pairAddress, ERC20_ABI, provider);

                    const [balanceRaw, decimals] = await Promise.all([
                        lpTokenContract.balanceOf(targetAddress),
                        lpTokenContract.decimals()
                    ]);

                    const formattedBalance = parseFloat(ethers.formatUnits(balanceRaw, decimals)).toFixed(0);

                    results[tokenName] = {
                        pairAddress,
                        balance: formattedBalance
                    };
                } catch (err) {
                    console.error(`Error fetching LP data for ${tokenName}:`, err);
                }
            }

            // Handle STATE token separately
            try {
                const statePairAddress = "0x5f5c53f62ea7c5ed39d924063780dc21125dbde7";
                const lpTokenContract = new ethers.Contract(statePairAddress, ERC20_ABI, provider);

                const [balanceRaw, decimals] = await Promise.all([
                    lpTokenContract.balanceOf(targetAddress),
                    lpTokenContract.decimals()
                ]);

                const formattedBalance = ethers.formatUnits(balanceRaw, decimals);

                results["STATE"] = {
                    pairAddress: statePairAddress,
                    balance: formattedBalance
                };
            } catch (err) {
                console.error("Error fetching STATE LP balance:", err);
                results["STATE"] = { pairAddress: "error", balance: "0" };
            }

            setBurnLpAmount(results);
            return results;
        } catch (error) {
            console.error("Error fetching burn LP amounts:", error);
            return {};
        }
    }, [AllContracts, provider, ReturnfetchUserTokenAddresses]);

    const isTokenSupporteed = useCallback(async () => {
        if (!AllContracts?.AuctionContract) return;

        const results = {};
        const tokenMap = await ReturnfetchUserTokenAddresses();

        try {
            for (const [tokenName, TokenAddress] of Object.entries(tokenMap)) {
                const isSupported = await AllContracts.AuctionContract.isTokenSupported(TokenAddress);

                if (typeof isSupported === "boolean") {
                    results[tokenName] = isSupported;
                } else if (isSupported && isSupported !== "0x0000000000000000000000000000000000000000") {
                    results[tokenName] = true;
                } else {
                    results[tokenName] = false;
                }
            }

            setIsSupported(results);
        } catch (error) {
            console.error("Error fetching token support status:", error);
        }
    }, [AllContracts, ReturnfetchUserTokenAddresses]);

    const AddressesFromContract = useCallback(async () => {
        if (!AllContracts?.AuctionContract) return;

        try {
            const davAddress = await AllContracts.AuctionContract.dav();
            const stateAddress = await AllContracts.AuctionContract.stateToken();

            setDavAddress(davAddress);
            setStateAddress(stateAddress);
        } catch (error) {
            console.error("Error fetching addresses:", error);
        }
    }, [AllContracts]);

    const fetchPstateToPlsRatio = useCallback(async () => {
        const config = chainConfigs[chainId];
        console.log("Fetching PSTATE to PLS ratio for chainId:", config);
        if (!config) return console.error("Unsupported chainId:", chainId);
        try {
            const response = await fetch(
                `https://api.geckoterminal.com/api/v2/networks/${config.name.toLowerCase()}/pools/${config.poolAddress}`
            ); if (response.ok) {
                const data = await response.json();
                const ratio = parseFloat(data.data.attributes.base_token_price_quote_token);
                setPstateToPlsRatio(ratio.toString());
                return ratio;
            }
        } catch (err) {
            console.error("Error fetching pSTATE to PLS ratio:", err);
            return 0;
        }
    }, []);

    return {
        tokenMap,
        TokenNames,
        TokenBalance,
        burnedAmount,
        burnedLPAmount,
        UsersSupportedTokens,
        DavAddress,
        StateAddress,
        supportedToken,
        pstateToPlsRatio,
        fetchUserTokenAddresses,
        getTokenNamesForUser,
        getTokenBalances,
        getTokenNamesByUser,
        fetchBurnLpAmount,
        isTokenSupporteed,
        AddressesFromContract,
        fetchPstateToPlsRatio,
        setBurnedAmount,
    };
};
