import { createContext, useContext, useEffect, useCallback } from 'react';
import { useAccount, useChainId, useWalletClient } from 'wagmi';
import { ContractContext } from './ContractInitialize';
import { useTokenData } from './hooks/useTokenData';
import { useSwapActions } from './hooks/useSwapActions';
import { useTokenTimers } from './hooks/useTokenTimers';
import { useTokenOperations } from './hooks/useTokenOperations';
import { useTokenInfo } from './hooks/useTokenInfo';
import { useAuctionState } from './hooks/useAuctionState';
import PropTypes from 'prop-types';
import { getAUCTIONContractAddress, getSTATEContractAddress } from '../Constants/ContractAddresses';


const SwapContractContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useSwapContract = () => useContext(SwapContractContext);

export const SwapContractProvider = ({ children }) => {
  const chainId = useChainId();
  const { loading, provider, signer, AllContracts } = useContext(ContractContext);
  const { address, connector, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();

  // Custom hooks
  const { fetchTokenData, ReturnfetchUserTokenAddresses } = useTokenData();
  const { AuctionTime, TimeLeftClaim, initializeClaimCountdowns } = useTokenTimers(
    AllContracts,
    provider,
    ReturnfetchUserTokenAddresses
  );
  const tokenOperations = useTokenOperations(AllContracts, address,isConnected);
  const tokenInfo = useTokenInfo(AllContracts, provider, address, chainId, ReturnfetchUserTokenAddresses);
  const auctionState = useAuctionState(AllContracts, address, chainId, fetchTokenData, ReturnfetchUserTokenAddresses);
  const swapActions = useSwapActions(auctionState.CurrentCycleCount);
  // Handle chain changes
  useEffect(() => {
    if (!walletClient) return;

    walletClient.transport?.on?.('chainChanged', () => {
      window.location.reload();
    });

    connector?.getProvider().then((provider) => {
      if (provider?.on) {
        provider.on('chainChanged', () => {
          window.location.reload();
        });
      }
    });
  }, [walletClient, connector]);

  // Reset swaps when auction ends
  useEffect(() => {
    const resetSwapsIfAuctionEnded = async () => {
      const tokenMap = await ReturnfetchUserTokenAddresses();
      const extendedMap = { ...tokenMap, state: getSTATEContractAddress(chainId) };

      const swaps = JSON.parse(localStorage.getItem("auctionSwaps") || "{}");

      if (swaps[address]) {
        for (const tokenName of Object.keys(extendedMap)) {
          const currentCycleCount = Number(auctionState.CurrentCycleCount?.[tokenName] || 0);

          // loop through all stored cycles for this user
          for (const storedCycle of Object.keys(swaps[address] || {})) {
            const storedCycleNum = Number(storedCycle);

            // 🧹 if stored cycle < current cycle → remove it
            if (storedCycleNum < currentCycleCount) {
              console.log(
                `Cleaning old swaps → removing swaps for cycle ${storedCycleNum}, token = ${tokenName}`
              );

              if (swaps[address][storedCycle]) {
                delete swaps[address][storedCycle][tokenName];

                // cleanup empty cycle
                if (Object.keys(swaps[address][storedCycle]).length === 0) {
                  delete swaps[address][storedCycle];
                }
              }
            }
          }
        }

        // cleanup empty user
        if (Object.keys(swaps[address]).length === 0) {
          delete swaps[address];
        }

        localStorage.setItem("auctionSwaps", JSON.stringify(swaps));
      }
    };

    resetSwapsIfAuctionEnded();
  }, [
    address,
    chainId,
    auctionState.CurrentCycleCount,
    JSON.stringify(auctionState.IsAuctionActive),
    ReturnfetchUserTokenAddresses,
  ]);

  // Batch data fetching function
  const fetchAllData = useCallback(async () => {
    if (!AllContracts?.AuctionContract || !address) return;

    try {
      const dataFunctions = [
        tokenInfo.fetchUserTokenAddresses,
        auctionState.getInputAmount,
        auctionState.getOutPutAmount,
        tokenInfo.fetchBurnLpAmount,
        auctionState.getCurrentAuctionCycle,
        auctionState.getTokenRatio,
        auctionState.getTokensBurned,
        auctionState.getAirdropAmount,
        tokenInfo.getTokenBalances,
        auctionState.isAirdropClaimed,
        tokenInfo.AddressesFromContract,
        auctionState.isRenounced,
        tokenInfo.getTokenNamesForUser,
        tokenInfo.isTokenSupporteed,
        tokenInfo.getTokenNamesByUser,
        tokenInfo.getPairAddress,
        auctionState.HasSwappedAucton,
        auctionState.HasReverseSwappedAucton,
        tokenInfo.fetchPstateToPlsRatio,
      ];

      const results = await Promise.allSettled(dataFunctions.map((fn) => fn()));
      results.forEach((result, index) => {
        if (result.status === "rejected") {
          console.error(`Function ${dataFunctions[index].name} failed:`, result.reason);
        }
      });
    } catch (error) {
      console.error("Error in fetchAllData:", error);
    }
  }, [AllContracts, address, tokenInfo, auctionState]);

  // Initial data fetch with debouncing
  useEffect(() => {
    let timeoutId;

    const debouncedFetch = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(fetchAllData, 500);
    };

    if (AllContracts && address) {
      debouncedFetch();
    }

    return () => clearTimeout(timeoutId);
  }, [AllContracts, address, fetchAllData]);

  // Auction status polling
  useEffect(() => {
    if (!AllContracts || !address) return;

    const runAuctionChecks = async () => {
      await auctionState.CheckIsAuctionActive();
      await auctionState.CheckIsReverse();
    };

    runAuctionChecks();

    const auctionPollingInterval = setInterval(() => {
      runAuctionChecks();
    }, 10000);

    return () => {
      clearInterval(auctionPollingInterval);
    };
  }, [AllContracts, address, auctionState]);

  // 👇 Separate effect for account change

  useEffect(() => {
    if (!isConnected) return;

    // whenever wagmiAddress changes, trigger data refresh
    console.log("Account changed, refreshing data...");
    fetchAllData();
  }, [address, isConnected, fetchAllData]);

  // Regular data polling (less frequent)
  useEffect(() => {
    if (!AllContracts || !address) return;

    const dataPollingInterval = setInterval(() => {
      fetchAllData();
    }, 30000); // 30 seconds

    return () => {
      clearInterval(dataPollingInterval);
    };
  }, [AllContracts, address, fetchAllData]);

  // Enhanced SwapTokens function with proper dependencies
  const enhancedSwapTokens = useCallback(async (id, ContractName) => {
    return swapActions.SwapTokens(id, ContractName, {
      tokenMap: tokenInfo.tokenMap,
      InputAmount: auctionState.InputAmount,
      OutputAmount: auctionState.OutPutAmount,
      isReversed: auctionState.isReversed,
      getStateAddress: () => getSTATEContractAddress(chainId),
      getAuctionAddress: () => getAUCTIONContractAddress(chainId),
      onSuccess: () => {
        auctionState.CheckIsAuctionActive();
        auctionState.HasSwappedAucton();
        auctionState.HasReverseSwappedAucton();
      }
    });
  }, [swapActions, chainId, tokenInfo.tokenMap, auctionState]);

  // Enhanced DEX swap function
  const enhancedDexSwap = useCallback(async (id, amountIn) => {
    return swapActions.handleDexTokenSwap(
      id,
      amountIn,
      id,
      getSTATEContractAddress(chainId),
      auctionState.IsAuctionActive,
      ReturnfetchUserTokenAddresses
    );
  }, [swapActions, chainId, auctionState.IsAuctionActive, ReturnfetchUserTokenAddresses]);

  const value = {
    // Wallet & Provider info
    provider,
    signer,
    loading,
    address,
    chainId,

    // Token Info
    ...tokenInfo,

    // Auction State
    ...auctionState,

    // Token Operations
    ...tokenOperations,

    // Swap Actions
    ...swapActions,
    SwapTokens: enhancedSwapTokens,
    handleDexTokenSwap: enhancedDexSwap,

    // Timers
    AuctionTime,
    TimeLeftClaim,
    initializeClaimCountdowns,

    // Utility functions
    fetchAllData,
    ReturnfetchUserTokenAddresses,
  };

  return (
    <SwapContractContext.Provider value={value}>
      {children}
    </SwapContractContext.Provider>
  );
};
SwapContractProvider.propTypes = {
  children: PropTypes.node.isRequired,
};