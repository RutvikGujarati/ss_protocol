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


const SwapContractContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useSwapContract = () => useContext(SwapContractContext);

export const SwapContractProvider = ({ children }) => {
  const chainId = useChainId();
  const { loading, provider, signer, AllContracts } = useContext(ContractContext);
  const { address, connector } = useAccount();
  const { data: walletClient } = useWalletClient();

  // Custom hooks
  const { fetchTokenData, ReturnfetchUserTokenAddresses, getAddresses } = useTokenData();
  const swapActions = useSwapActions();
  const { AuctionTime, TimeLeftClaim, initializeClaimCountdowns } = useTokenTimers(
    AllContracts,
    provider,
    ReturnfetchUserTokenAddresses
  );
  const tokenOperations = useTokenOperations(AllContracts, provider, signer, address, getAddresses);
  const tokenInfo = useTokenInfo(AllContracts, provider, address, getAddresses, ReturnfetchUserTokenAddresses);
  const auctionState = useAuctionState(AllContracts, address, getAddresses, fetchTokenData, ReturnfetchUserTokenAddresses);

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
      const addresses = getAddresses();
      const extendedMap = { ...tokenMap, state: addresses.state };

      const swaps = JSON.parse(localStorage.getItem("auctionSwaps") || "{}");

      if (swaps[address]) {
        for (const [, tokenAddress] of Object.entries(extendedMap)) {
          if (auctionState.IsAuctionActive[tokenAddress] == "false" && address) {
            const currentSwaps = JSON.parse(localStorage.getItem("auctionSwaps") || "{}");

            if (currentSwaps[address]?.[tokenAddress]) {
              delete currentSwaps[address][tokenAddress];

              if (Object.keys(currentSwaps[address]).length === 0) {
                delete currentSwaps[address];
              }

              localStorage.setItem("auctionSwaps", JSON.stringify(currentSwaps));
            }
          }
        }
      }
    };

    resetSwapsIfAuctionEnded();
  }, [address, auctionState.IsAuctionActive, ReturnfetchUserTokenAddresses, getAddresses]);

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

    // Handle account changes
    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        console.log('Please connect to MetaMask.');
      } else if (accounts[0] !== address) {
        console.log('Account changed, refreshing data...');
        fetchAllData();
      }
    };

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
    }

    return () => {
      clearInterval(auctionPollingInterval);
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, [AllContracts, address, auctionState, fetchAllData]);

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
      getStateAddress: () => getAddresses().state,
      getAuctionAddress: () => getAddresses().auction,
      onSuccess: () => {
        auctionState.CheckIsAuctionActive();
        auctionState.HasSwappedAucton();
        auctionState.HasReverseSwappedAucton();
      }
    });
  }, [swapActions, tokenInfo.tokenMap, auctionState, getAddresses]);

  // Enhanced DEX swap function
  const enhancedDexSwap = useCallback(async (id, amountIn) => {
    return swapActions.handleDexTokenSwap(
      id,
      amountIn,
      id,
      getAddresses().state,
      auctionState.IsAuctionActive,
      ReturnfetchUserTokenAddresses
    );
  }, [swapActions, getAddresses, auctionState.IsAuctionActive, ReturnfetchUserTokenAddresses]);

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
    getAddresses,
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