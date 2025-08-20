import { ethers } from 'ethers';
import { useState, useCallback, useEffect } from 'react';
import { getDAVContractAddress, getSTATEContractAddress } from '../../Constants/ContractAddresses';

export const useAuctionState = (AllContracts, address, chainId, fetchTokenData, ReturnfetchUserTokenAddresses) => {
    const [InputAmount, setInputAmount] = useState({});
    const [OutPutAmount, setOutputAmount] = useState({});
    const [AirDropAmount, setAirdropAmount] = useState("0.0");
    const [CurrentCycleCount, setCurrentCycleCount] = useState({});
    const [TokenRatio, setTokenRatio] = useState({});
    const [isReversed, setIsReverse] = useState({});
    const [burnedAmount, setBurnedAmount] = useState({});
    const [IsAuctionActive, setisAuctionActive] = useState({});
    const [isTokenRenounce, setRenonced] = useState({});
    const [AirdropClaimed, setAirdropClaimed] = useState({});
    const [userHashSwapped, setUserHashSwapped] = useState({});
    const [userHasReverseSwapped, setUserHasReverseSwapped] = useState({});

    const getInputAmount = useCallback(async () => {
        await fetchTokenData({
            contractMethod: "calculateAuctionEligibleAmount",
            setState: setInputAmount,
            formatFn: (v) => Math.floor(Number(ethers.formatEther(v))),
        });
    }, [fetchTokenData]);

    const getOutPutAmount = useCallback(async () => {
        await fetchTokenData({
            contractMethod: "getOutPutAmount",
            setState: setOutputAmount,
            formatFn: (v) => Math.floor(Number(ethers.formatEther(v))),
        });
    }, [fetchTokenData]);

    const getAirdropAmount = useCallback(async () => {
        await fetchTokenData({
            contractMethod: "getClaimableReward",
            setState: setAirdropAmount,
            formatFn: (v) => Math.floor(Number(ethers.formatEther(v))),
            buildArgs: (tokenAddress) => [address, tokenAddress],
        });
    }, [fetchTokenData, address]);

    const getCurrentAuctionCycle = useCallback(async () => {
        await fetchTokenData({
            contractMethod: "getCurrentAuctionCycle",
            setState: setCurrentCycleCount,
            formatFn: (v) => Math.floor(Number(v)),
        });
    }, [fetchTokenData]);

    const getTokenRatio = useCallback(async () => {
        await fetchTokenData({
            contractMethod: "getRatioPrice",
            setState: setTokenRatio,
            formatFn: (v) => Math.floor(Number(ethers.formatEther(v))),
        });
    }, [fetchTokenData]);

    const CheckIsReverse = useCallback(async () => {
        await fetchTokenData({
            contractMethod: "isReverseAuctionActive",
            setState: setIsReverse,
        });
    }, [fetchTokenData]);

    const CheckIsAuctionActive = useCallback(async () => {
        await fetchTokenData({
            contractMethod: "isAuctionActive",
            setState: setisAuctionActive,
        });
    }, [fetchTokenData]);

    useEffect(() => {
        if (!AllContracts || !address) return;

        const runAuctionChecks = async () => {
            try {
                await CheckIsAuctionActive();
                await CheckIsReverse();
            } catch (err) {
                console.error("Auction check failed:", err);
            }
        };
        // run immediately once
        runAuctionChecks();
        // poll every 10 seconds
        const auctionPollingInterval = setInterval(runAuctionChecks, 10);
        return () => {
            clearInterval(auctionPollingInterval);
        };
    }, [AllContracts, address, CheckIsAuctionActive, CheckIsReverse]);

    const isRenounced = useCallback(async () => {
        try {
            const results = {};


            // Get token map and extend with STATE and DAV
            const tokenMap = await ReturnfetchUserTokenAddresses();
            const extendedMap = {
                ...tokenMap,
                STATE: getSTATEContractAddress(chainId),
                DAV: getDAVContractAddress(chainId),
            };

            for (const [tokenName, TokenAddress] of Object.entries(extendedMap)) {
                const renouncing = await AllContracts.AuctionContract.isTokenRenounced(TokenAddress);
                const renouncingString = renouncing.toString();

                let isOwnerZero = false;
                if (tokenName === "STATE") {
                    const owner = await AllContracts.stateContract.owner();
                    isOwnerZero = owner.toLowerCase() === "0x0000000000000000000000000000000000000000";
                } else if (tokenName === "DAV") {
                    const owner = await AllContracts.davContract.owner();
                    isOwnerZero = owner.toLowerCase() === "0x0000000000000000000000000000000000000000";
                }

                results[tokenName] = tokenName === "STATE" || tokenName === "DAV"
                    ? renouncingString === "true" && isOwnerZero
                    : renouncingString;
            }

            setRenonced(results);
        } catch (e) {
            console.error("Error fetching renounce status:", e);
        }
    }, [AllContracts, chainId, ReturnfetchUserTokenAddresses]);

    const HasReverseSwappedAucton = useCallback(async () => {
        await fetchTokenData({
            contractMethod: "getUserHasReverseSwapped",
            setState: setUserHasReverseSwapped,
            formatFn: (v) => v.toString(),
            buildArgs: (tokenAddress) => [address, tokenAddress],
        });
    }, [fetchTokenData, address]);

    const HasSwappedAucton = useCallback(async () => {
        await fetchTokenData({
            contractMethod: "getUserHasSwapped",
            setState: setUserHashSwapped,
            formatFn: (v) => v.toString(),
            buildArgs: (tokenAddress) => [address, tokenAddress],
        });
    }, [fetchTokenData, address]);

    const isAirdropClaimed = useCallback(async () => {
        await fetchTokenData({
            contractMethod: "hasAirdroppedClaim",
            setState: setAirdropClaimed,
            formatFn: (v) => v.toString(),
            buildArgs: (tokenAddress) => [address, tokenAddress],
        });
    }, [fetchTokenData, address]);

    const getTokensBurned = useCallback(async () => {
        try {
            await fetchTokenData({
                contractMethod: "getTotalTokensBurned",
                setState: setBurnedAmount,
                formatFn: (v) => Math.floor(Number(ethers.formatEther(v))),
                includeTestState: true,
            });
        } catch (e) {
            console.error("Error fetching burned amounts:", e);
        }
    }, [fetchTokenData]);

    return {
        InputAmount,
        OutPutAmount,
        AirDropAmount,
        CurrentCycleCount,
        TokenRatio,
        isReversed,
        IsAuctionActive,
        isTokenRenounce,
        AirdropClaimed,
        userHashSwapped,
        userHasReverseSwapped,
        getInputAmount,
        getOutPutAmount,
        getAirdropAmount,
        getCurrentAuctionCycle,
        getTokenRatio,
        CheckIsReverse,
        CheckIsAuctionActive,
        isRenounced,
        burnedAmount,
        HasReverseSwappedAucton,
        HasSwappedAucton,
        isAirdropClaimed,
        getTokensBurned,
        setInputAmount,
        setOutputAmount,
        setAirdropAmount,
    };
};
