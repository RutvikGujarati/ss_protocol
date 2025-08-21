import { useState, useContext } from 'react';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';
import { ERC20_ABI } from './contractHelpers';
import { useAccount, useChainId } from 'wagmi';
import { ContractContext } from '../ContractInitialize';
import { getSTATEContractAddress } from '../../Constants/ContractAddresses';
import { useDAvContract } from '../DavTokenFunctions';

export const useSwapActions = (currentCycleCount) => {
    const chainId = useChainId();
    const { AllContracts, signer } = useContext(ContractContext);
    const { address } = useAccount();
    const { fetchData } = useDAvContract(); // Access fetchData from DAVContext

    const [swappingStates, setSwappingStates] = useState({});
    const [DexswappingStates, setDexSwappingStates] = useState({});
    const [buttonTextStates, setButtonTextStates] = useState({});
    const [DexbuttonTextStates, setDexButtonTextStates] = useState({});
    const [txStatusForSwap, setTxStatusForSwap] = useState("");
    const [txStatusForAdding, setTxStatusForAdding] = useState("");

    const SwapTokens = async (id, ContractName, {
        tokenMap,
        InputAmount,
        OutputAmount,
        isReversed,
        getStateAddress,
        getAuctionAddress,
        onSuccess
    }) => {
        try {
            setTxStatusForSwap("initiated");
            setSwappingStates(prev => ({ ...prev, [id]: true }));
            setButtonTextStates(prev => ({ ...prev, [id]: "Checking allowance..." }));

            const OutAmountsMapping = OutputAmount[ContractName];
            const InAmountMapping = InputAmount[ContractName];
            const ContractAddressToUse = getAuctionAddress();

            let approvalAmount;
            const tokenAddress = tokenMap[ContractName];
            let selectedContract;

            if (isReversed[ContractName] == "true") {
                selectedContract = new ethers.Contract(getStateAddress(), ERC20_ABI, signer);
                approvalAmount = ethers.parseUnits(OutAmountsMapping.toString(), 18);
            } else {
                selectedContract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
                approvalAmount = ethers.parseUnits(InAmountMapping.toString(), 18);
            }

            approvalAmount = approvalAmount + ethers.parseUnits("100", 18);

            // Check allowance
            const allowance = await selectedContract.allowance(address, ContractAddressToUse);

            if (allowance < approvalAmount) {
                setButtonTextStates(prev => ({ ...prev, [id]: "Approving input token..." }));
                setTxStatusForSwap("Approving");

                try {
                    const maxUint256 = BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");
                    const approveTx = await selectedContract.approve(ContractAddressToUse, maxUint256);
                    await approveTx.wait();
                } catch (approvalError) {
                    console.error("Approval transaction failed:", approvalError);
                    setButtonTextStates(prev => ({ ...prev, [id]: "Approval failed" }));
                    setSwappingStates(prev => ({ ...prev, [id]: false }));
                    setTxStatusForSwap("error");
                    return false;
                }
            }

            setButtonTextStates(prev => ({ ...prev, [id]: "Swapping..." }));
            setTxStatusForSwap("pending");

            const swapTx = await AllContracts.AuctionContract.swapTokens(address, tokenAddress);
            const swapReceipt = await swapTx.wait();

            if (swapReceipt.status === 1) {
                setTxStatusForSwap("confirmed");
                toast.success(`Swap successful with ${ContractName}`, {
                    position: "top-center",
                    autoClose: 18000,
                });
                setButtonTextStates(prev => ({ ...prev, [id]: "Swap Complete!" }));
                await fetchData();
                onSuccess && onSuccess();
            } else {
                setTxStatusForSwap("error");
                setButtonTextStates(prev => ({ ...prev, [id]: "Swap failed" }));
                await fetchData();
            }

        } catch (error) {
            console.error("Error during token swap:", error);

            if (error?.code === 4001) {
                setTxStatusForSwap("cancelled");
                toast.error("Transaction cancelled by user.", {
                    position: "top-center",
                    autoClose: 3000,
                });
                setButtonTextStates(prev => ({ ...prev, [id]: "Cancelled" }));
                return;
            }

            setTxStatusForSwap("error");

            let errorMessage = "An error occurred during swap.";
            if (error?.reason) {
                errorMessage = error.reason;
            } else if (error?.message) {
                errorMessage = error.message;
            }

            if (errorMessage.includes("execution reverted (unknown custom error)")) {
                errorMessage = "Check Token Balance on your account or Make Airdrop";
            }

            toast.error(errorMessage, {
                position: "top-center",
                autoClose: 5000,
            });

            setButtonTextStates(prev => ({ ...prev, [id]: "Swap failed" }));
        } finally {
            setTxStatusForSwap("");
            setSwappingStates(prev => ({ ...prev, [id]: false }));
            setButtonTextStates(prev => ({ ...prev, [id]: "Swap" }));
        }
    };

    const handleDexTokenSwap = async (
        id,
        amountIn,
        tokenName, // Changed from tokenOutAddress to tokenName
        stateAddress,
        IsAuctionActive,
        ReturnfetchUserTokenAddresses
    ) => {
        setTxStatusForSwap("initiated");
        setDexSwappingStates(prev => ({ ...prev, [id]: true }));
        setDexButtonTextStates(prev => ({ ...prev, [id]: "fetching quote..." }));
        // Fetch token addresses using the same method as other functions
        const tokenMap = await ReturnfetchUserTokenAddresses();
        const extendedMap = { ...tokenMap, state: getSTATEContractAddress(chainId) };

        // Get the actual token address from the token name
        const tokenOutAddress = extendedMap[tokenName];
        if (!tokenOutAddress) {
            toast.error(`Token ${tokenName} not found in supported tokens.`, {
                position: "top-center",
                autoClose: 3000,
            });
            setDexSwappingStates(prev => ({ ...prev, [id]: false }));
            return;
        }

        // Check if user has already swapped this token
        const swaps = JSON.parse(localStorage.getItem("auctionSwaps") || "{}");

        if (IsAuctionActive[tokenName] == "false") {
            if (swaps[address]?.[tokenOutAddress]) {
                toast.error("You have already swapped this token in this auction period.", {
                    position: "top-center",
                    autoClose: 3000,
                });
                setDexSwappingStates(prev => ({ ...prev, [id]: false }));
                return;
            }
        }

        if (!amountIn) {
            toast.error('Invalid input parameters.');
            return;
        }

        // Fetch Quote
        let quoteData;
        try {
            const amount = ethers.parseUnits(amountIn, 18).toString();
            const tokenInAddress = stateAddress;
            let url;

            if (chainId == 369) {
                url = `https://sdk.piteas.io/quote?tokenInAddress=${tokenInAddress}&tokenOutAddress=${tokenOutAddress}&amount=${amount}&allowedSlippage=1`;
            } else {
                url = new URL(`https://api.sushi.com/swap/v7/${chainId}`);
                url.searchParams.set("tokenIn", tokenInAddress);
                url.searchParams.set("tokenOut", tokenOutAddress);
                url.searchParams.set("amount", amount);
                url.searchParams.set("sender", address || "0x0000000000000000000000000000000000000000");
            }

            const response = await fetch(url);
            if (!response.ok) throw new Error('Quote fetch failed.');
            quoteData = await response.json();
        } catch (err) {
            console.error('Error fetching quote:', err);
            toast.error('Failed to fetch quote. Try again.');
            return;
        }

        // Check Allowance and Approve
        let swapContractAddress = chainId == 369 ?
            "0x6BF228eb7F8ad948d37deD07E595EfddfaAF88A6" :
            quoteData.to;

        try {
            const contract = new ethers.Contract(stateAddress, ERC20_ABI, signer);
            const allowance = await contract.allowance(address, swapContractAddress);
            const amount = ethers.parseUnits(amountIn || '0', 18);
            const needsApproval = BigInt(allowance) < BigInt(amount);
            if (needsApproval) {
                setDexButtonTextStates(prev => ({ ...prev, [id]: "Checking allowance..." }));
                setTxStatusForSwap("Approving");

                try {
                    const maxUint256 = BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');
                    const tx = await contract.approve(swapContractAddress, maxUint256);
                    await tx.wait();
                } catch (err) {
                    setTxStatusForSwap("error");
                    console.log("error", err)
                    toast.error('Approval failed. Try again.');
                    return;
                }
            }

            // Execute Swap
            setTxStatusForSwap("pending");
            setDexButtonTextStates(prev => ({ ...prev, [id]: "Swapping..." }));

            let tx;
            if (chainId == 369) {
                tx = await signer.sendTransaction({
                    to: swapContractAddress,
                    value: quoteData.methodParameters.value,
                    data: quoteData.methodParameters.calldata,
                });

            } else {
                tx = await signer.sendTransaction({
                    to: quoteData.to,
                    data: quoteData.data,
                });
            }

            const swapReceipt = await tx.wait();

            if (swapReceipt.status === 1) {
                const updatedSwaps = {
                    ...swaps,
                    [address]: {
                        ...(swaps[address] || {}),
                        [String(currentCycleCount?.[tokenName])]: {   // cycle as parent
                            ...(swaps[address]?.[String(currentCycleCount?.[tokenName])] || {}),
                            [tokenName]: {                 // token name as sub-key
                                ...(swaps[address]?.[String(currentCycleCount?.[tokenName])]?.[tokenName] || {}),
                                [tokenOutAddress]: true,     // mark tokenOutAddress as swapped
                            },
                        },
                    },
                };
                await fetchData();
                localStorage.setItem("auctionSwaps", JSON.stringify(updatedSwaps));
                setTxStatusForSwap("confirmed");
                toast.success(`Swap successful with ${tokenOutAddress}`, {
                    position: "top-center",
                    autoClose: 18000,
                });

                setButtonTextStates(prev => ({ ...prev, [id]: "Swap Complete!" }));
                await fetchData();
                onSuccess && onSuccess();
            } else {
                setTxStatusForSwap("error");
                setButtonTextStates(prev => ({ ...prev, [id]: "Swap failed" }));
            }
            // Save swap history using the token address
        } catch (err) {
            if (err?.code === 4001) {
                setTxStatusForSwap("cancelled");
                toast.error("Transaction cancelled by user.");
                return;
            }
            await fetchData();
            setTxStatusForSwap("error");
            console.error('Swap failed:', err);
        } finally {
            setDexSwappingStates(prev => ({ ...prev, [id]: false }));
        }
    };

    const AddTokenIntoSwapContract = async (TokenAddress, PairAddress, Owner, name) => {
        if (!AllContracts?.AuctionContract || !address) return;

        setTxStatusForAdding("initiated");
        try {
            setTxStatusForAdding("Adding");
            const tx = await AllContracts.AuctionContract.addToken(TokenAddress, PairAddress, Owner);
            await tx.wait();

            setTxStatusForAdding("Status Updating");
            const tx2 = await AllContracts.davContract.updateTokenStatus(Owner, name, 1);
            const receipt2 = await tx2.wait();

            if (receipt2.status === 1) {
                setTxStatusForAdding("confirmed");
            } else {
                setTxStatusForAdding("error");
            }
        } catch (error) {
            const errorMessage = error.reason || error.message || "Unknown error occurred";
            console.error("AddTokenIntoSwapContract failed:", error);
            setTxStatusForAdding("error");
            alert(`Failed to add token: ${errorMessage}`);
        }
    };

    return {
        SwapTokens,
        handleDexTokenSwap,
        AddTokenIntoSwapContract,
        swappingStates,
        DexswappingStates,
        buttonTextStates,
        DexbuttonTextStates,
        txStatusForSwap,
        txStatusForAdding,
        setTxStatusForSwap,
        setTxStatusForAdding,
        setDexSwappingStates,
    };
};
