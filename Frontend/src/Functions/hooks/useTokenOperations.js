import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';
import {  TokenABI} from './contractHelpers';

export const useTokenOperations = (AllContracts,signer, address, getAddresses) => {
    const [claiming, setClaiming] = useState(false);
    const [isCliamProcessing, setIsCllaimProccessing] = useState(null);
    const [TotalCost, setTotalCost] = useState(null);

    const CalculationOfCost = useCallback(async (amount, chainId) => {
        if (chainId == 146) {
            setTotalCost(ethers.parseEther((amount * 100).toString()));
        } else {
            try {
                const davMintFee = await AllContracts.davContract.TOKEN_COST();
                const davMintFeeFormatted = parseFloat(ethers.formatUnits(davMintFee, 18));
                setTotalCost(ethers.parseEther((amount * davMintFeeFormatted).toString()));
            } catch (error) {
                console.error("Error getting DavMintFee:", error);
                setTotalCost(ethers.parseEther((amount * 10).toString()));
            }
        }
    }, [AllContracts]);

    const giveRewardForAirdrop = useCallback(async (tokenAddress) => {
        if (!AllContracts?.AuctionContract || !address || !tokenAddress) {
            console.warn("Missing contract, user address, or token address");
            return;
        }

        if (!ethers.isAddress(tokenAddress)) {
            console.error("Invalid token address:", tokenAddress);
            return;
        }

        try {
            setIsCllaimProccessing(tokenAddress);
            const tx = await AllContracts.AuctionContract.giveRewardToTokenOwner(tokenAddress);
            await tx.wait();
        } catch (error) {
            console.error("Error claiming reward:", error);
        } finally {
            setIsCllaimProccessing(null);
        }
    }, [AllContracts, address]);

    const CheckMintBalance = useCallback(async (TokenAddress) => {
        try {
            const tx = await AllContracts.AuctionContract.distributeReward(address, TokenAddress);
            await tx.wait();
        } catch (e) {
            console.error("Error claiming tokens:", e);
            throw e;
        }
    }, [AllContracts, address]);

    const renounceTokenContract = useCallback(async (tokenAddress, tokenName) => {
        try {
            const tokenContract = new ethers.Contract(tokenAddress, TokenABI, signer);
            const tx = await tokenContract.renounceOwnership();
            await tx.wait();
        } catch (error) {
            console.error(`Error renouncing ownership for ${tokenName}:`, error);
        }
    }, [signer]);

    const handleAddToken = useCallback(async (tokenAddress, tokenSymbol, tokenDecimals = 18) => {
        if (!window.ethereum) {
            toast.error("MetaMask is not installed.");
            return;
        }

        const tokenDetails = {
            type: "ERC20",
            options: {
                address: tokenAddress,
                symbol: tokenSymbol,
                decimals: tokenDecimals,
            },
        };

        const toastId = toast.loading(`Adding ${tokenSymbol} to wallet...`);

        try {
            const wasAdded = await window.ethereum.request({
                method: "wallet_watchAsset",
                params: tokenDetails,
            });

            toast.dismiss(toastId);

            if (wasAdded) {
                toast.success(`${tokenSymbol} added to wallet!`);
            } else {
                toast("Token addition cancelled.");
            }
        } catch (err) {
            console.error(err);
            toast.dismiss(toastId);
            toast.error(`Failed to add ${tokenSymbol}.`);
        }
    }, []);

    const setDavAndStateIntoSwap = useCallback(async () => {
        if (!AllContracts?.AuctionContract || !address) return;

        try {
            const addresses = getAddresses();
            const tx = await AllContracts.AuctionContract.setTokenAddress(
                addresses.state,
                addresses.dav
            );
            await tx.wait();
        } catch (error) {
            console.error("Error setting addresses:", error);
        }
    }, [AllContracts, address, getAddresses]);

    return {
        claiming,
        setClaiming,
        isCliamProcessing,
        TotalCost,
        CalculationOfCost,
        giveRewardForAirdrop,
        CheckMintBalance,
        renounceTokenContract,
        handleAddToken,
        setDavAndStateIntoSwap,
    };
};
