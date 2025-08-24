import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';
import { TokenABI } from './contractHelpers';
import { getDAVContractAddress, getSTATEContractAddress } from '../../Constants/ContractAddresses';
import { useChainId, useWalletClient } from 'wagmi';

export const useTokenOperations = (AllContracts, address) => {
    const chainId = useChainId();
    const [claiming, setClaiming] = useState(false);
    const [isCliamProcessing, setIsCllaimProccessing] = useState(null);
    const [TotalCost, setTotalCost] = useState(null);
    const { data: walletClient } = useWalletClient();

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
            console.log("Claiming reward for token:", tokenAddress);
            const tx = await AllContracts.AuctionContract.giveRewardToTokenOwner(tokenAddress);
            await tx.wait();
        } catch (error) {
            console.error("Error claiming reward:", error);
            let message = "Transaction failed";
            if (error?.reason) {
                message = error.reason;
            } else if (error?.error?.message) {
                message = error.error.message;
            } else if (error?.message) {
                message = error.message;
            }

            toast.dismiss();
            toast.error(message, {
                position: "top-center",
                autoClose: 12000,
            });
            throw error;
        } finally {
            setIsCllaimProccessing(null);
        }
    }, [AllContracts, address]);

    const CheckMintBalance = useCallback(async (TokenAddress) => {
        if (!ethers.isAddress(TokenAddress)) {
            throw new Error(`Invalid token address: ${TokenAddress}`);
        }
        try {
            const tx = await AllContracts.AuctionContract.distributeReward(address, TokenAddress);
            await tx.wait();
        } catch (e) {
            console.error("Error claiming tokens:", e);
            throw e;
        }
    }, [AllContracts, address]);


    const renounceTokenContract = useCallback(
        async (tokenAddress, tokenName) => {
            try {
                if (!walletClient) {
                    console.error("No wallet connected");
                    return;
                }
                // Wrap wagmi walletClient into ethers provider + signer
                const provider = new ethers.BrowserProvider(walletClient.transport);
                const signer = await provider.getSigner();

                const tokenContract = new ethers.Contract(tokenAddress, TokenABI, signer);
                const tx = await tokenContract.renounceOwnership();
                await tx.wait();

                console.log(`✅ Ownership renounced for ${tokenName}`);
            } catch (error) {
                console.error(`❌ Error renouncing ownership for ${tokenName}:`, error);
            }
        }, [walletClient]);


    const handleAddToken = useCallback(async (tokenAddress, tokenSymbol, tokenDecimals = 18) => {
        if (!walletClient) {
            toast.error("No wallet connected.");
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
            const wasAdded = await walletClient.request({
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
    }, [walletClient]);

    const setDavAndStateIntoSwap = useCallback(async () => {
        if (!AllContracts?.AuctionContract || !address) return;
        console.log("chainId from adding", chainId);
        const stateAddress = getSTATEContractAddress(chainId);
        const davAddress = getDAVContractAddress(chainId);

        console.log("STATE Address:", stateAddress);
        console.log("DAV Address from adding token:", davAddress);

        if (!davAddress || davAddress === ethers.ZeroAddress) {
            console.error("❌ DAV address is zero. Aborting transaction.");
            return;
        }

        try {
            const tx = await AllContracts.AuctionContract.setTokenAddress(
                stateAddress,
                davAddress,
            );
            await tx.wait();
            console.log("✅ Addresses set successfully");
        } catch (error) {
            console.error("Error setting addresses:", error);
        }
    }, [AllContracts, address, chainId]);


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
