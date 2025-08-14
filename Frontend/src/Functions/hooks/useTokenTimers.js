import { useState, useEffect, useRef, useCallback } from 'react';

export const useTokenTimers = (AllContracts, provider, ReturnfetchUserTokenAddresses) => {
    const [AuctionTime, setAuctionTime] = useState({});
    const [TimeLeftClaim, setTimeLeftClaim] = useState({});
    const intervalHandlesRef = useRef({});

    const initializeCountdowns = useCallback(async () => {
        const intervalHandles = {};
        const results = {};

        if (!AllContracts?.AuctionContract || !provider) return {};

        const tokenMap = await ReturnfetchUserTokenAddresses();

        for (const [tokenName, TokenAddress] of Object.entries(tokenMap)) {
            try {
                const currentBlock = await provider.getBlock('latest');
                const currentBlockTime = currentBlock.timestamp;

                const AuctionTimeInWei = await AllContracts.AuctionContract.getAuctionTimeLeft(TokenAddress);
                const timeLeft = Math.floor(Number(AuctionTimeInWei));

                const endTime = currentBlockTime + timeLeft;
                results[tokenName] = timeLeft >= 0 ? timeLeft : 0;

                intervalHandles[tokenName] = setInterval(async () => {
                    try {
                        const latestBlock = await provider.getBlock('latest');
                        const latestBlockTime = latestBlock.timestamp;
                        const remainingTime = Math.max(0, endTime - latestBlockTime);

                        setAuctionTime(prev => ({
                            ...prev,
                            [tokenName]: remainingTime
                        }));
                    } catch (error) {
                        console.error(`Error updating timer for ${tokenName}:`, error);
                    }
                }, 1000);
            } catch (e) {
                results[tokenName] = 0;
                console.error(`Error fetching auction time for ${tokenName}:`, e);
            }
        }

        if (Object.keys(results).length > 0) {
            setAuctionTime(results);
        }

        return intervalHandles;
    }, [AllContracts, provider, ReturnfetchUserTokenAddresses]);

    const initializeClaimCountdowns = useCallback(async () => {
        const intervalHandles = intervalHandlesRef.current;
        const results = {};

        // Clear existing intervals
        Object.values(intervalHandles).forEach(clearInterval);
        intervalHandlesRef.current = {};

        if (!AllContracts?.AuctionContract || !provider) return;

        const tokenMap = await ReturnfetchUserTokenAddresses();

        for (const [tokenName, TokenAddress] of Object.entries(tokenMap)) {
            try {
                const currentBlock = await provider.getBlock('latest');
                const currentBlockTime = currentBlock.timestamp;

                const timeLeftInSeconds = await AllContracts.AuctionContract.getNextClaimTime(TokenAddress);
                const timeLeft = Number(timeLeftInSeconds);
                const endTime = currentBlockTime + timeLeft;
                results[tokenName] = timeLeft;

                intervalHandles[tokenName] = setInterval(async () => {
                    try {
                        const latestBlock = await provider.getBlock('latest');
                        const latestBlockTime = latestBlock.timestamp;
                        const remainingTime = Math.max(0, endTime - latestBlockTime);

                        setTimeLeftClaim(prev => ({
                            ...prev,
                            [tokenName]: remainingTime
                        }));
                    } catch (error) {
                        console.error(`Error updating claim timer for ${tokenName}:`, error);
                    }
                }, 1000);
            } catch (err) {
                console.warn(`Error getting claim time for ${tokenName}`, err);
                results[tokenName] = 0;
            }
        }

        intervalHandlesRef.current = intervalHandles;
        setTimeLeftClaim(results);
    }, [AllContracts, provider, ReturnfetchUserTokenAddresses]);

    useEffect(() => {
        let intervalHandles = {};

        if (AllContracts?.AuctionContract && provider) {
            initializeCountdowns().then(handles => {
                intervalHandles = handles;
            });
        }

        return () => {
            Object.values(intervalHandles).forEach(clearInterval);
        };
    }, [AllContracts, provider, initializeCountdowns]);

    useEffect(() => {
        initializeClaimCountdowns();

        return () => {
            const intervalHandles = intervalHandlesRef.current;
            Object.values(intervalHandles).forEach(clearInterval);
        };
    }, [initializeClaimCountdowns]);

    return {
        AuctionTime,
        TimeLeftClaim,
        initializeClaimCountdowns
    };
};
