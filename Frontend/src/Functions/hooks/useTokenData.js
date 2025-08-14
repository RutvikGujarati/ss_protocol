import { useCallback, useContext } from 'react';
import { getContractAddresses, handleContractError } from './contractHelpers';
import { useChainId } from 'wagmi';
import { ContractContext } from '../ContractInitialize';

export const useTokenData = () => {
    const chainId = useChainId();
    const { AllContracts } = useContext(ContractContext);

    const getAddresses = useCallback(() => {
        return getContractAddresses(chainId);
    }, [chainId]);

    const ReturnfetchUserTokenAddresses = useCallback(async () => {
        if (!AllContracts?.AuctionContract) {
            console.warn("AuctionContract not found");
            return {};
        }

        try {
            const proxyResult = await AllContracts.AuctionContract.getUserTokenNames();
            const tokenNames = Array.from(proxyResult);
            const tokenAddresses = {};

            for (const name of tokenNames) {
                const TokenAddress = await AllContracts.AuctionContract.getUserTokenAddress(name);
                tokenAddresses[name] = TokenAddress;
            }

            return tokenAddresses;
        } catch (error) {
            console.error("Error fetching token data:", error);
            return {};
        }
    }, [AllContracts]);

    const fetchTokenData = useCallback(async ({
        contractMethod,
        setState,
        formatFn = (v) => v.toString(),
        includeTestState = false,
        buildArgs,
        useAddressAsKey = false,
    }) => {
        try {
            const results = {};
            const tokenMap = await ReturnfetchUserTokenAddresses();

            const extendedMap = includeTestState
                ? { ...tokenMap, state: getAddresses().state }
                : tokenMap;

            for (const [tokenName, tokenAddress] of Object.entries(extendedMap)) {
                try {
                    const contract = AllContracts.AuctionContract;
                    if (!contract || typeof contract[contractMethod] !== "function") {
                        throw new Error(`Method ${contractMethod} not found on contract`);
                    }

                    const args = buildArgs ? buildArgs(tokenAddress, tokenName) : [tokenAddress];
                    const rawResult = await contract[contractMethod](...args);
                    const formattedResult = formatFn(rawResult);

                    const key = useAddressAsKey ? tokenAddress : tokenName;
                    results[key] = formattedResult;
                } catch (err) {
                    const key = useAddressAsKey ? tokenAddress : tokenName;
                    results[key] = handleContractError(err, tokenName);
                    console.error(`Error calling ${contractMethod} for ${tokenName}:`, err);
                }
            }

            setState(results);
            return results;
        } catch (err) {
            console.error("Error in fetchTokenData:", err);
            return {};
        }
    }, [AllContracts, ReturnfetchUserTokenAddresses, getAddresses]);

    return {
        fetchTokenData,
        ReturnfetchUserTokenAddresses,
        getAddresses
    };
};