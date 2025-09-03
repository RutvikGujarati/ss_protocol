// SwapContractContext.js
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { ethers } from "ethers";
import PropTypes from "prop-types";
import toast from "react-hot-toast";
import { ContractContext } from "./ContractInitialize";
import {
  getDAVContractAddress,
  getSTATEContractAddress,
  getAUCTIONContractAddress,
} from "../Constants/ContractAddresses";
import { useAccount, useChainId, useWalletClient } from "wagmi";
import { useDAvContract } from "./DavTokenFunctions";
import { notifyError, notifySuccess, PULSEX_ROUTER_ABI, PULSEX_ROUTER_ADDRESS, WPLS_ADDRESS } from "../Constants/Constants";

const SwapContractContext = createContext();

export const useSwapContract = () => useContext(SwapContractContext);

export const SwapContractProvider = ({ children }) => {
  const { fetchStateHolding } = useDAvContract();
  const chainId = useChainId();
  const { loading, provider, signer, AllContracts } =
    useContext(ContractContext);
  const { address, connector } = useAccount();
  const { data: walletClient } = useWalletClient();
  const toastId = useRef(null);
  useEffect(() => {
    if (!walletClient) return;

    walletClient.transport?.on?.('chainChanged', () => {
      window.location.reload();
    });

    // For injected providers like MetaMask
    connector?.getProvider().then((provider) => {
      if (provider?.on) {
        provider.on('chainChanged', () => {
          window.location.reload();
        });
      }
    });
  }, [walletClient, connector]);
  // Get contract addresses for the connected chain
  const getDavAddress = () => getDAVContractAddress(chainId);
  const getStateAddress = () => getSTATEContractAddress(chainId);
  const getAuctionAddress = () => getAUCTIONContractAddress(chainId);

  const [claiming, setClaiming] = useState(false);
  const [txStatusForSwap, setTxStatusForSwap] = useState("");
  const [txStatusForAdding, setTxStatusForAdding] = useState("");
  const [TotalCost, setTotalCost] = useState(null);
  const [DaipriceChange, setDaiPriceChange] = useState("0.0");
  const [InputAmount, setInputAmount] = useState({});
  const [AirDropAmount, setAirdropAmount] = useState("0.0");
  const [AuctionTime, setAuctionTime] = useState({});
  const [TokenPariAddress, setPairAddresses] = useState({});
  const [CurrentCycleCount, setCurrentCycleCount] = useState({});
  const [OutPutAmount, setOutputAmount] = useState({});
  const [TokenRatio, setTokenRatio] = useState({});
  const [TimeLeftClaim, setTimeLeftClaim] = useState({});
  const [burnedAmount, setBurnedAmount] = useState({});
  const [burnedLPAmount, setBurnLpAmount] = useState({});
  const [TokenBalance, setTokenbalance] = useState({});
  const [isReversed, setIsReverse] = useState({});
  const [IsAuctionActive, setisAuctionActive] = useState({});
  const [isTokenRenounce, setRenonced] = useState({});
  const [tokenMap, setTokenMap] = useState({});
  const [TokenNames, setTokenNames] = useState({});

  const [buttonTextStates, setButtonTextStates] = useState({});
  const [DexbuttonTextStates, setDexButtonTextStates] = useState({});
  const [swappingStates, setSwappingStates] = useState({});
  const [DexswappingStates, setDexSwappingStates] = useState({});

  const [userHashSwapped, setUserHashSwapped] = useState({});
  const [DavAddress, setDavAddress] = useState("");
  const [supportedToken, setIsSupported] = useState(false);
  const [UsersSupportedTokens, setUsersSupportedTokens] = useState("");
  const [StateAddress, setStateAddress] = useState("");
  const [AirdropClaimed, setAirdropClaimed] = useState({});
  const [userHasReverseSwapped, setUserHasReverseSwapped] = useState({});

  const [isCliamProcessing, setIsCllaimProccessing] = useState(null);

  // Add new state variables for token value calculations
  const [pstateToPlsRatio, setPstateToPlsRatio] = useState("0.0");

  const CalculationOfCost = async (amount) => {
    if (chainId == 146) {
      setTotalCost(ethers.parseEther((amount * 100).toString()));
    } else {
      try {
        // Get DavMintFee directly from the contract
        const davMintFee = await AllContracts.davContract.TOKEN_COST();
        const davMintFeeFormatted = parseFloat(ethers.formatUnits(davMintFee, 18));
        setTotalCost(ethers.parseEther((amount * davMintFeeFormatted).toString()));
      } catch (error) {
        console.error("Error getting DavMintFee:", error);
        // Fallback to a default value
        setTotalCost(ethers.parseEther((amount * 10).toString()));
      }
    }
  };

  const ReturnfetchUserTokenAddresses = async () => {
    if (!AllContracts?.AuctionContract) {
      console.warn("AuctionContract not found");
      return {};
    }

    try {
      // Step 1: Get token names
      const proxyResult =
        await AllContracts.AuctionContract.getUserTokenNames();
      const tokenNames = Array.from(proxyResult);

      const tokenAddresses = {};

      // Step 2: Loop through names and get corresponding addresses
      for (const name of tokenNames) {
        const TokenAddress =
          await AllContracts.AuctionContract.getUserTokenAddress(name);
        tokenAddresses[name] = TokenAddress;
      }

      return tokenAddresses; // 🔁 return result directly
    } catch (error) {
      console.error("Error fetching token data:", error);
      return {};
    }
  };
  const fetchTokenData = async ({
    contractMethod,
    setState,
    formatFn = (v) => v.toString(),
    includeTestState = false,
    buildArgs,
    useAddressAsKey = false, // New: Control whether to key results by address
  }) => {
    try {
      const results = {};
      const tokenMap = await ReturnfetchUserTokenAddresses();

      const extendedMap = includeTestState
        ? { ...tokenMap, state: getStateAddress() }
        : tokenMap;

      for (const [tokenName, tokenAddress] of Object.entries(extendedMap)) {
        try {
          const contract = AllContracts.AuctionContract;

          if (!contract || typeof contract[contractMethod] !== "function") {
            throw new Error(`Method ${contractMethod} not found on contract`);
          }

          const args = buildArgs
            ? buildArgs(tokenAddress, tokenName)
            : [tokenAddress];
          const rawResult = await contract[contractMethod](...args);
          const formattedResult = formatFn(rawResult);

          const key = useAddressAsKey ? tokenAddress : tokenName;
          results[key] = formattedResult;
        } catch (err) {
          const reason =
            err?.reason || // ethers v5 style
            err?.shortMessage || // ethers v6 style
            err?.error?.errorName ||
            err?.message ||
            "";

          const unsupported = /unsupported token/i.test(reason);

          const key = useAddressAsKey ? tokenAddress : tokenName;
          if (unsupported) {
            results[key] = "not listed";
          } else {
            results[key] = "not started";
          }

          console.error(
            `Error calling ${contractMethod} for ${tokenName} (${tokenAddress}):`,
            reason || err
          );
        }
      }

      setState(results);
      return results;
    } catch (err) {
      console.error("Top-level error in fetchTokenData:", err);
      return {};
    }
  };

  const getInputAmount = async () => {
    await fetchTokenData({
      contractMethod: "calculateAuctionEligibleAmount",
      setState: setInputAmount,
      formatFn: (v) => Math.floor(Number(ethers.formatEther(v))),
    });
  };

  const getOutPutAmount = async () => {
    await fetchTokenData({
      contractMethod: "getOutPutAmount",
      setState: setOutputAmount,
      formatFn: (v) => Math.floor(Number(ethers.formatEther(v))),
    });
  };

  const getAirdropAmount = async () => {
    await fetchTokenData({
      contractMethod: "getClaimableReward",
      setState: setAirdropAmount,
      formatFn: (v) => Math.floor(Number(ethers.formatEther(v))),
      buildArgs: (tokenAddress) => [address, tokenAddress],
    });
  };
  const getPairAddresses = async () => {
    await fetchTokenData({
      contractMethod: "pairAddresses", // AuctionContract method
      setState: setPairAddresses,      // your state setter
      formatFn: (v) => v.toString(),   // default formatting
      buildArgs: (tokenAddress) => [tokenAddress], // pairAddresses(tokenAddress)
    });
  };

  useEffect(() => {
    const intervalHandles = {};
    const results = {};

    const initializeCountdowns = async () => {
      if (!AllContracts?.AuctionContract || !provider) return;

      const tokenMap = await ReturnfetchUserTokenAddresses();

      for (const [tokenName, TokenAddress] of Object.entries(tokenMap)) {
        try {
          // Get current block timestamp from the contract
          const currentBlock = await provider.getBlock('latest');
          const currentBlockTime = currentBlock.timestamp;

          // Fetch the remaining auction time from the smart contract
          const AuctionTimeInWei = await AllContracts.AuctionContract.getAuctionTimeLeft(TokenAddress);
          const timeLeft = Math.floor(Number(AuctionTimeInWei));

          // Store the end time based on blockchain timestamp
          const endTime = currentBlockTime + timeLeft;
          results[tokenName] = timeLeft >= 0 ? timeLeft : 0;

          // Set up blockchain-synchronized countdown
          intervalHandles[tokenName] = setInterval(async () => {
            try {
              // Get latest block timestamp
              const latestBlock = await provider.getBlock('latest');
              const latestBlockTime = latestBlock.timestamp;

              // Calculate remaining time based on blockchain time
              const remainingTime = Math.max(0, endTime - latestBlockTime);

              setAuctionTime((prev) => {
                const newTime = { ...prev };
                newTime[tokenName] = remainingTime;

                // Check auction status when time runs low
                if (remainingTime <= 300) { // 5 minutes or less
                  CheckIsAuctionActive();
                  CheckIsReverse();
                }

                return newTime;
              });
            } catch (error) {
              console.error(`Error updating timer for ${tokenName}:`, error);
            }
          }, 1000);
        } catch (e) {
          results[tokenName] = 0;
          console.error(`Error fetching auction time for ${tokenName} (${TokenAddress}):`, e);
        }
      }

      // Update state only if results are valid
      if (Object.keys(results).length > 0) {
        setAuctionTime(results);
      } else {
        console.warn("No valid auction times fetched, skipping state update");
      }
    };

    if (AllContracts?.AuctionContract && provider) {
      initializeCountdowns();
    }

    return () => {
      Object.values(intervalHandles).forEach(clearInterval);
    };
  }, [AllContracts, provider]);

  const getCurrentAuctionCycle = async () => {
    await fetchTokenData({
      contractMethod: "getCurrentAuctionCycle",
      setState: setCurrentCycleCount,
      formatFn: (v) => Math.floor(Number(v)), // assuming the result is a number-like BigNumber
    });
  };

  const getTokenRatio = async () => {
    await fetchTokenData({
      contractMethod: "getRatioPrice",
      setState: setTokenRatio,
      formatFn: (v) => Math.floor(Number(ethers.formatEther(v))),
    });
  };

  const intervalHandlesRef = useRef({}); // useRef to persist across renders

  const initializeClaimCountdowns = useCallback(async () => {
    const intervalHandles = intervalHandlesRef.current;
    const results = {};

    // Clear existing intervals
    Object.values(intervalHandles).forEach(clearInterval);
    intervalHandlesRef.current = {};

    const tokenMap = await ReturnfetchUserTokenAddresses();

    for (const [tokenName, TokenAddress] of Object.entries(tokenMap)) {
      try {
        // Get current block timestamp
        const currentBlock = await provider.getBlock('latest');
        const currentBlockTime = currentBlock.timestamp;

        const timeLeftInSeconds =
          await AllContracts.AuctionContract.getNextClaimTime(TokenAddress);

        const timeLeft = Number(timeLeftInSeconds);

        // Store the end time based on blockchain timestamp
        const endTime = currentBlockTime + timeLeft;
        results[tokenName] = timeLeft;

        // Start blockchain-synchronized countdown interval
        intervalHandles[tokenName] = setInterval(async () => {
          try {
            // Get latest block timestamp
            const latestBlock = await provider.getBlock('latest');
            const latestBlockTime = latestBlock.timestamp;

            // Calculate remaining time based on blockchain time
            const remainingTime = Math.max(0, endTime - latestBlockTime);

            setTimeLeftClaim((prev) => {
              const updated = { ...prev };
              updated[tokenName] = remainingTime;
              return updated;
            });
          } catch (error) {
            console.error(`Error updating claim timer for ${tokenName}:`, error);
          }
        }, 1000);
      } catch (err) {
        console.warn(`Error getting claim time for ${tokenName}`, err);
        results[tokenName] = 0;
      }
    }

    setTimeLeftClaim(results);
  }, [AllContracts, provider]);
  useEffect(() => {
    initializeClaimCountdowns();

    return () => {
      const intervalHandles = intervalHandlesRef.current;
      Object.values(intervalHandles).forEach(clearInterval);
    };
  }, [initializeClaimCountdowns]);

  const getTokensBurned = async () => {
    try {
      fetchTokenData({
        contractMethod: "getTotalTokensBurned",
        setState: setBurnedAmount,
        formatFn: (v) => Math.floor(Number(ethers.formatEther(v))),
        includeTestState: true,
      });
    } catch (e) {
      console.error("Error fetching input amounts:", e);
    }
  };

  const getTokenBalances = async () => {
    try {
      const results = {};
      const tokenMap = await ReturnfetchUserTokenAddresses();
      const extendedMap = {
        ...tokenMap,
        state: getStateAddress(),
      };

      for (const [tokenName, TokenAddress] of Object.entries(extendedMap)) {
        const tokenContract = new ethers.Contract(
          TokenAddress,
          ERC20_ABI,
          provider
        );
        const rawBalance = await tokenContract.balanceOf(getAuctionAddress());

        // Convert to string in full units, then floor to get whole number
        const formattedBalance = Math.floor(
          Number(ethers.formatUnits(rawBalance, 18))
        );

        results[tokenName] = formattedBalance;
      }

      setTokenbalance(results);
    } catch (e) {
      console.error("Error fetching input amounts:", e);
    }
  };

  const CheckIsReverse = async () => {
    await fetchTokenData({
      contractMethod: "isReverseAuctionActive",
      setState: setIsReverse,
    });
  };
  const TokenABI = [
    {
      type: "function",
      name: "renounceOwnership",
      inputs: [],
      outputs: [],
      stateMutability: "nonpayable",
    },
  ];

  const renounceTokenContract = async (tokenAddress, tokenName) => {
    try {
      const tokenContract = new ethers.Contract(tokenAddress, TokenABI, signer);

      const tx = await tokenContract.renounceOwnership();
      await tx.wait();

      await isRenounced();
    } catch (error) {
      console.error(`Error renouncing ownership for ${tokenName}:`, error);
    }
  };

  const CheckIsAuctionActive = async () => {
    try {
      fetchTokenData({
        contractMethod: "isAuctionActive",
        setState: setisAuctionActive,
      });
    } catch (e) {
      console.error("Error fetching Auction Active:", e);
    }
  };

  const isRenounced = async () => {
    try {
      const results = {};

      const tokenMap = await ReturnfetchUserTokenAddresses();
      const extendedMap = {
        ...tokenMap,
        STATE: getStateAddress(),
        DAV: getDavAddress(),
      };

      for (const [tokenName, TokenAddress] of Object.entries(extendedMap)) {
        const renouncing = await AllContracts.AuctionContract.isTokenRenounced(
          TokenAddress
        );
        const renouncingString = renouncing.toString();

        // Additional check for "state" token: verify owner is zero address
        let isOwnerZero = false;
        if (tokenName === "STATE") {
          const owner = await AllContracts.stateContract.owner();
          isOwnerZero =
            owner.toLowerCase() ===
            "0x0000000000000000000000000000000000000000";
        } else if (tokenName === "DAV") {
          const owner = await AllContracts.davContract.owner();
          isOwnerZero =
            owner.toLowerCase() ===
            "0x0000000000000000000000000000000000000000";
        }

        results[tokenName] =
          tokenName === "STATE"
            ? renouncingString === "true" && isOwnerZero
            : tokenName === "DAV"
              ? renouncingString === "true" && isOwnerZero
              : renouncingString;
      }

      setRenonced(results);
    } catch (e) {
      console.error("Error fetching renounce status:", e);
    }
  };

  const HasReverseSwappedAucton = async () => {
    await fetchTokenData({
      contractMethod: "getUserHasReverseSwapped",
      setState: setUserHasReverseSwapped,
      formatFn: (v) => v.toString(), // ensures consistent string output
      buildArgs: (tokenAddress) => [address, tokenAddress], // user address + token
    });
  };

  const HasSwappedAucton = async () => {
    await fetchTokenData({
      contractMethod: "getUserHasSwapped",
      setState: setUserHashSwapped,
      formatFn: (v) => v.toString(), // ensures consistent string output
      buildArgs: (tokenAddress) => [address, tokenAddress], // user address + token
    });
  };

  const isAirdropClaimed = async () => {
    await fetchTokenData({
      contractMethod: "hasAirdroppedClaim",
      setState: setAirdropClaimed,
      formatFn: (v) => v.toString(), // Convert boolean to string
      buildArgs: (tokenAddress) => [address, tokenAddress], // Pass user address and token address
    });
  };

  const AddressesFromContract = async () => {
    if (!AllContracts?.AuctionContract) {
      console.warn("AuctionContract not found");
      return;
    }

    try {
      const davAddress = await AllContracts.AuctionContract.dav();
      const stateAddress = await AllContracts.AuctionContract.stateToken();

      setDavAddress(davAddress);
      setStateAddress(stateAddress);
    } catch (error) {
      console.error("Error fetching addresses:", error);
    }
  };

  const fetchUserTokenAddresses = async () => {
    if (!AllContracts?.AuctionContract) {
      console.warn("AuctionContract not found");
      return;
    }

    try {
      // Step 1: Get token names
      const proxyResult =
        await AllContracts.AuctionContract.getUserTokenNames();
      const tokenNames = Array.from(proxyResult);

      const tokenAddresses = {};

      // Step 2: Loop through names and get corresponding addresses
      for (const name of tokenNames) {
        const TokenAddress =
          await AllContracts.AuctionContract.getUserTokenAddress(name);
        tokenAddresses[name] = TokenAddress;
      }

      // Optionally set to state
      setTokenMap(tokenAddresses); // You need to define `tokenMap` with `useState({})`
    } catch (error) {
      console.error("Error fetching token data:", error);
    }
  };


  const getTokenNamesForUser = async () => {
    try {
      const proxyResult =
        await AllContracts.AuctionContract.getUserTokenNames();
      const tokenNames = Array.from(proxyResult); // handle Proxy return
      setTokenNames(tokenNames);
      return tokenNames;
    } catch (error) {
      console.error("Failed to fetch token names:", error);
      return [];
    }
  };

  const isTokenSupporteed = async () => {
    if (!AllContracts?.AuctionContract) {
      console.warn("AuctionContract not found");
      return;
    }

    const results = {};
    const tokenMap = await ReturnfetchUserTokenAddresses();

    try {
      for (const [tokenName, TokenAddress] of Object.entries(tokenMap)) {
        // Fetch support status (expecting a boolean or address)
        const isSupported = await AllContracts.AuctionContract.isTokenSupported(
          TokenAddress
        );

        // If it's an address and should check if valid or if it's a boolean, handle accordingly
        if (typeof isSupported === "boolean") {
          results[tokenName] = isSupported; // Directly store the boolean result
        } else if (
          isSupported &&
          isSupported !== "0x0000000000000000000000000000000000000000"
        ) {
          // If it's an address, check if it is a valid address
          results[tokenName] = true;
        } else {
          results[tokenName] = false;
        }
      }

      // Update state with results
      setIsSupported(results);
    } catch (error) {
      console.error("Error fetching token support status:", error);
    }
  };

  const ERC20Name_ABI = ["function name() view returns (string)"];

  const getTokenNamesByUser = async () => {
    if (!AllContracts?.AuctionContract || !provider) {
      console.warn("AuctionContract or provider not found");
      return;
    }

    try {
      const result = await AllContracts.AuctionContract.getTokensByOwner(
        address
      );
      const tokenAddresses = Array.isArray(result)
        ? [...result]
        : Object.values(result);

      const tokenData = await Promise.all(
        tokenAddresses.map(async (tokenAddr) => {
          try {
            const tokenContract = new ethers.Contract(
              tokenAddr,
              ERC20Name_ABI,
              provider
            );
            const name = await tokenContract.name();

            const pairAddress =
              await AllContracts.AuctionContract.pairAddresses(tokenAddr);
            const nextClaimTime =
              await AllContracts.AuctionContract.getNextClaimTime(tokenAddr);

            return {
              address: tokenAddr,
              name,
              pairAddress,
              nextClaimTime: Number(nextClaimTime), // in seconds
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

      setUsersSupportedTokens(tokenData); // [{ address, name, pairAddress }]
    } catch (error) {
      console.error("Error fetching token names or pair addresses:", error);
    }
  };

  const fetchBurnLpAmount = async () => {
    if (!AllContracts?.AuctionContract || !provider) {
      console.warn("AuctionContract or provider not found");
      return {};
    }

    try {
      // Step 1: Get all token addresses for user
      const tokenMap = await ReturnfetchUserTokenAddresses(); // { tokenName: tokenAddress }
      const ERC20_ABI = [
        "function balanceOf(address owner) view returns (uint256)",
        "function decimals() view returns (uint8)"
      ];
      const targetAddress = "0x0000000000000000000000000000000000000369";

      const results = {};

      // Step 2: Loop through token map and fetch pair address + balance
      for (const [tokenName, tokenAddress] of Object.entries(tokenMap)) {
        try {
          // ✅ Fetch LP pair address for token
          const pairAddress = await AllContracts.AuctionContract.pairAddresses(tokenAddress);

          // ✅ Create ERC20 contract for LP token
          const lpTokenContract = new ethers.Contract(pairAddress, ERC20_ABI, provider);

          // ✅ Fetch balance & decimals in parallel
          const [balanceRaw, decimals] = await Promise.all([
            lpTokenContract.balanceOf(targetAddress),
            lpTokenContract.decimals()
          ]);

          // ✅ Format balance
          const formattedBalance = parseFloat(ethers.formatUnits(balanceRaw, decimals)).toFixed(0);

          results[tokenName] = {
            pairAddress,
            balance: formattedBalance
          };
        } catch (err) {
          const reason =
            err?.reason ||
            err?.shortMessage ||
            err?.error?.errorName ||
            err?.message ||
            "";

          console.error(`Error fetching LP data for ${tokenName}:`, reason || err);
        }
      }
      try {
        const statePairAddress = "0x5f5c53f62ea7c5ed39d924063780dc21125dbde7";
        const lpTokenContract = new ethers.Contract(statePairAddress, ERC20_ABI, provider);

        const [balanceRaw, decimals] = await Promise.all([
          lpTokenContract.balanceOf(targetAddress),
          lpTokenContract.decimals()
        ]);

        const formattedBalance = ethers.utils.formatUnits(balanceRaw, decimals);

        results["STATE"] = {
          pairAddress: statePairAddress,
          balance: formattedBalance
        };
      } catch (err) {
        console.error("Error fetching STATE LP balance:", err);
        results["STATE"] = { pairAddress: "error", balance: "0" };
      }
      // Step 3: Update state once after loop
      setBurnLpAmount(results);
      return results;
    } catch (error) {
      console.error("Error fetching burn LP amounts:", error);
      return {};
    }
  };

  const setDavAndStateIntoSwap = async () => {
    if (!AllContracts?.AuctionContract || !address) return;

    try {
      const tx = await AllContracts.AuctionContract.setTokenAddress(
        getStateAddress(),
        getDavAddress()
      );
      await tx.wait();
      await AddressesFromContract();
    } catch (error) {
      console.error("Error fetching claimable amount:", error);
    }
  };
  const giveRewardForAirdrop = async (tokenAddress) => {
    if (!AllContracts?.AuctionContract || !address || !tokenAddress) {
      console.warn("Missing contract, user address, or token address");
      return;
    }
    // Validate tokenAddress
    if (!ethers.isAddress(tokenAddress)) {
      console.error("Invalid token address:", tokenAddress);
      return;
    }
    try {
      setIsCllaimProccessing(tokenAddress);

      const tx = await AllContracts.AuctionContract.giveRewardToTokenOwner(
        tokenAddress
      );
      await tx.wait();
      await initializeClaimCountdowns();
    } catch (error) {
      console.error("Error claiming reward:", error);
    } finally {
      setIsCllaimProccessing(null);
    }
  };

  const AddTokenIntoSwapContract = async (
    TokenAddress,
    PairAddress,
    Owner,
    name
  ) => {
    if (!AllContracts?.AuctionContract || !address) return;
    setTxStatusForAdding("initiated");
    try {
      // Replace these params if needed based on your contract's addToken function
      setTxStatusForAdding("Adding");
      const tx = await AllContracts.AuctionContract.addToken(
        TokenAddress,
        PairAddress,
        Owner
      );
      await tx.wait();
      setTxStatusForAdding("Status Updating");
      const tx2 = await AllContracts.davContract.updateTokenStatus(
        Owner,
        name,
        1
      );
      const receipt2 = await tx2.wait();
      if (receipt2.status === 1) {
        setTxStatusForAdding("confirmed");
        await CheckIsAuctionActive();
        await isTokenSupporteed(); // Corrected function name
      } else {
        console.error("Transaction failed");
        setTxStatusForAdding("error");
      }
      setTxStatusForAdding("confirmed");
    } catch (error) {
      const errorMessage =
        error.reason || error.message || "Unknown error occurred";
      console.error("AddTokenIntoSwapContract failed:", error);
      setTxStatusForAdding("");
      alert(`Failed to add token: ${errorMessage}`);
      console.error("AddTokenIntoSwapContract failed:", error?.reason || error);
    } finally {
      setTxStatusForAdding("confirmed");
    }
  };
  useEffect(() => {
    if (!AllContracts || !address) return;

    const runAuctionChecks = async () => {
      await CheckIsAuctionActive();
      await CheckIsReverse();
    };

    runAuctionChecks();

    // Set up polling to check auction status every 10 seconds
    const auctionPollingInterval = setInterval(() => {
      runAuctionChecks();
    }, 10000); // 10 seconds

    // Listen for account changes in MetaMask
    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        console.log('Please connect to MetaMask.');
      } else if (accounts[0] !== address) {
        console.log('Account changed, refreshing data...');
        // Force refresh all data when account changes
        runAuctionChecks();
        fetchUserTokenAddresses();
        getInputAmount();
        getOutPutAmount();
        fetchBurnLpAmount();
        getCurrentAuctionCycle();
        getTokenRatio();
        getTokensBurned();
        getAirdropAmount();
        getPairAddresses();
        getTokenBalances();
        isAirdropClaimed();
        AddressesFromContract();
        isRenounced();
        getTokenNamesForUser();
        isTokenSupporteed();
        getTokenNamesByUser();
        HasSwappedAucton();
        HasReverseSwappedAucton();
      }
    };

    // Add event listener for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
    }

    return () => {
      clearInterval(auctionPollingInterval);
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, [AllContracts, address]);

  useEffect(() => {
    const functions = [
      fetchUserTokenAddresses,
      getInputAmount,
      getOutPutAmount,
      fetchBurnLpAmount,
      getCurrentAuctionCycle,
      getTokenRatio,
      getTokensBurned,
      getAirdropAmount,
      getPairAddresses,
      fetchDaiLastPrice,
      getTokenBalances,
      isAirdropClaimed,
      AddressesFromContract,
      isRenounced,
      getTokenNamesForUser,
      isTokenSupporteed,
      getTokenNamesByUser,
      HasSwappedAucton,
      HasReverseSwappedAucton,
      fetchPstateToPlsRatio,
    ];

    const runAll = async () => {
      const results = await Promise.allSettled(functions.map((fn) => fn()));
      results.forEach((result, index) => {
        if (result.status === "rejected") {
          console.error(
            `Function ${functions[index].name} failed:`,
            result.reason
          );
        }
      });
    };

    runAll();

    // Set up polling to refresh all data every 30 seconds
    const dataPollingInterval = setInterval(() => {
      runAll();
    }, 30000); // 30 seconds

    return () => {
      clearInterval(dataPollingInterval);
    };
  }, [AllContracts, address]);

  const ERC20_ABI = [
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function allowance(address owner, address spender) external view returns (uint256)",
    "function balanceOf(address account) external view returns (uint256)",
  ];

  const SwapTokens = async (id, ContractName) => {
    try {
      setTxStatusForSwap("initiated");
      setSwappingStates((prev) => ({ ...prev, [id]: true }));
      setButtonTextStates((prev) => ({
        ...prev,
        [id]: "Checking allowance...",
      }));

      const OutAmountsMapping = OutPutAmount[ContractName];
      const InAmountMapping = InputAmount[ContractName];

      const ContractAddressToUse = getAuctionAddress();

      let approvalAmount;
      const tokenAddress = tokenMap[ContractName];

      let selectedContract;
      if (isReversed[ContractName] == "true") {
        selectedContract = new ethers.Contract(
          getStateAddress(),
          ERC20_ABI,
          signer
        );
        approvalAmount = ethers.parseUnits(OutAmountsMapping.toString(), 18);
      } else {
        selectedContract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
        approvalAmount = ethers.parseUnits(InAmountMapping.toString(), 18);
      }

      approvalAmount = approvalAmount + ethers.parseUnits("100", 18); // Add extra amount

      // Check current allowance
      const allowance = await selectedContract.allowance(
        address,
        ContractAddressToUse
      );

      if (allowance < approvalAmount) {
        setButtonTextStates((prev) => ({
          ...prev,
          [id]: "Approving input token...",
        }));
        console.log("Insufficient allowance. Sending approval transaction...");

        try {
          setTxStatusForSwap("Approving");
          // Approve unlimited amount (max uint256)
          const maxUint256 = BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");
          const approveTx = await selectedContract.approve(
            ContractAddressToUse,
            maxUint256
          );
          await approveTx.wait();
          console.log("Approval successful!");
        } catch (approvalError) {
          console.error("Approval transaction failed:", approvalError);
          setButtonTextStates((prev) => ({ ...prev, [id]: "Approval failed" }));
          setSwappingStates((prev) => ({ ...prev, [id]: false }));
          setTxStatusForSwap("error");
          return false;
        }
      } else {
        console.log(
          "Sufficient allowance already granted. Proceeding to swap."
        );
      }

      setButtonTextStates((prev) => ({ ...prev, [id]: "Swapping..." }));
      setTxStatusForSwap("pending");
      // Perform the token swap
      const swapTx = await AllContracts.AuctionContract.swapTokens(
        address,
        tokenAddress
      );
      const swapReceipt = await swapTx.wait();

      if (swapReceipt.status === 1) {
        console.log("Swap Complete!");
        setTxStatusForSwap("confirmed");
        notifySuccess(`Swap successful with ${ContractName}`);
        fetchStateHolding();
        setButtonTextStates((prev) => ({ ...prev, [id]: "Swap Complete!" }));
      } else {
        console.error("Swap transaction failed.");
        setTxStatusForSwap("error");
        setButtonTextStates((prev) => ({ ...prev, [id]: "Swap failed" }));
      }
      await CheckIsAuctionActive();
      await HasSwappedAucton();
      await HasReverseSwappedAucton();
    } catch (error) {
      console.error("Error during token swap:", error);

      // 👇 Detect user rejection
      if (error?.code === 4001) {
        setTxStatusForSwap("cancelled");
        notifyError("Transaction cancelled by user.")
        setButtonTextStates((prev) => ({ ...prev, [id]: "Cancelled" }));
        return;
      }

      setTxStatusForSwap("error");

      let errorMessage = "An error occurred during swap.";

      // Extract message from known places
      if (error?.reason) {
        errorMessage = error.reason;
      } else if (error?.data?.message) {
        errorMessage = error.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      if (errorMessage.includes("execution reverted (unknown custom error)")) {
        errorMessage = "Check Token Balance on your account or Make Airdrop";
      }
      notifyError(errorMessage)
      setButtonTextStates((prev) => ({ ...prev, [id]: "Swap failed" }));
    } finally {
      // Reset swapping state
      setTxStatusForSwap("");
      setSwappingStates((prev) => ({ ...prev, [id]: false }));
      setButtonTextStates((prev) => ({ ...prev, [id]: "Swap Completed" }));
      setButtonTextStates((prev) => ({ ...prev, [id]: "Swap" }));
      await CheckIsAuctionActive();
      await HasSwappedAucton();
      await HasReverseSwappedAucton();
    }
  };

  const CheckMintBalance = async (TokenAddress) => {
    try {
      const tx = await AllContracts.AuctionContract.distributeReward(
        address,
        TokenAddress
      );
      await tx.wait();
      await isAirdropClaimed();
      await getInputAmount();
      await getOutPutAmount();
      await getTokensBurned();
    } catch (e) {
      console.error("Error claiming tokens:", e);
      throw e;
    }
  };

  const handleAddToken = async (
    tokenAddress,
    tokenSymbol,
    tokenDecimals = 18
  ) => {
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

    // 👇 store toast ID so we can dismiss it later
    const toastId = toast.loading(`Adding ${tokenSymbol} to wallet...`);

    try {
      const wasAdded = await window.ethereum.request({
        method: "wallet_watchAsset",
        params: tokenDetails,
      });

      toast.dismiss(toastId); // ✅ always dismiss loading toast

      if (wasAdded) {
        toast.success(`${tokenSymbol} added to wallet!`);
      } else {
        toast("Token addition cancelled.");
      }
    } catch (err) {
      console.error(err);
      toast.dismiss(toastId); // ✅ dismiss loading toast on error
      toast.error(`Failed to add ${tokenSymbol}.`);
    }
  };

  // Fetch pSTATE to PLS ratio from API
  const fetchPstateToPlsRatio = async () => {
    try {
      const routerContract = new ethers.Contract(
        PULSEX_ROUTER_ADDRESS,
        PULSEX_ROUTER_ABI,
        signer
      );

      // 1 pSTATE (18 decimals)
      const onePstate = ethers.parseUnits("1", 18);

      // Path from pSTATE → WPLS
      const path = [getStateAddress(chainId), WPLS_ADDRESS];

      const amountsOut = await routerContract.getAmountsOut(onePstate, path);

      // The last element in amountsOut is the output amount of WPLS
      const plsAmount = amountsOut[amountsOut.length - 1];
      // Convert from wei to human-readable
      const plsAmountFormatted = ethers.formatUnits(plsAmount, 18);
      setPstateToPlsRatio(plsAmountFormatted.toString());
      console.log("pSTATE to PLS ratio:", plsAmountFormatted);

    } catch (err) {
      console.error("Error fetching pSTATE to PLS ratio:", err);
      return 0;
    }
  };

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
    address
  ]);

  //using event listner on transaciton and mark true
  const handleDexTokenSwap = async (
    id,
    amountIn,
    signer,
    address,
    tokenOutAddress,
    ERC20_ABI,
    stateAddress,
  ) => {
    // Input validation
    setTxStatusForSwap("initiated");
    setDexSwappingStates((prev) => ({ ...prev, [id]: true }));
    setDexButtonTextStates((prev) => ({
      ...prev,
      [id]: "fetching quote...",
    }));
    const swaps = JSON.parse(localStorage.getItem("auctionSwaps") || "{}");
    if (IsAuctionActive[tokenOutAddress] == "false") {
      if (swaps[address]?.[tokenOutAddress]) {
        notifyError("You have already swapped this token in this auction period.")
        return;
      }
    }

    if (!amountIn) {
      notifyError("Invalid input parameters.")
      return;
    }

    // Step 1: Fetch Quote
    let quoteData;
    try {
      const amount = ethers.parseUnits(amountIn, 18).toString();
      const tokenInAddress = stateAddress;
      let url;
      console.log("chainid from swap fun", chainId)
      if (chainId == 369) {
        url = `https://sdk.piteas.io/quote?tokenInAddress=${tokenInAddress}&tokenOutAddress=${tokenOutAddress}&amount=${amount}&allowedSlippage=0.5`;
      } else {
        const url = new URL(`https://api.sushi.com/swap/v7/${chainId}`);
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
      notifyError('Failed to fetch quote. Try again.')
      setDexSwappingStates((prev) => ({ ...prev, [id]: false })); // <-- reset here
      setTxStatusForSwap("error");
      return;
    }

    // Step 2: Check Allowance
    let swapContractAddress;
    if (chainId == 369) {
      swapContractAddress = "0x6BF228eb7F8ad948d37deD07E595EfddfaAF88A6"
    } else {
      swapContractAddress = quoteData.to;
    }
    try {
      const contract = new ethers.Contract(stateAddress, ERC20_ABI, signer);
      const allowance = await contract.allowance(address, swapContractAddress);
      const amount = ethers.parseUnits(amountIn || '0', 18);
      const needsApproval = BigInt(allowance) < BigInt(amount);

      // Step 3: Approve if necessary
      if (needsApproval) {
        setDexButtonTextStates((prev) => ({
          ...prev,
          [id]: "Checking allowance...",
        }));
        setTxStatusForSwap("Approving");
        try {
          const maxUint256 = BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');
          const tx = await contract.approve(swapContractAddress, maxUint256);
          await tx.wait();
        } catch (err) {
          console.error('Approval error:', err);
          setTxStatusForSwap("error");
          notifyError('Approval failed. Try again.')
          return;
        }
      }
    } catch (err) {
      console.error('Error checking allowance:', err);
      notifyError('Failed to check allowance. Try again.')
      setDexSwappingStates((prev) => ({ ...prev, [id]: false }));
      return;
    }

    try {
      setTxStatusForSwap("pending");
      setDexButtonTextStates((prev) => ({
        ...prev,
        [id]: "Swapping...",
      }));
      let tx;
      if (chainId == 369) {
        tx = await signer.sendTransaction({
          to: swapContractAddress,
          value: quoteData.methodParameters.value,
          data: quoteData.methodParameters.calldata,
        });
      } else {
        const txData = {
          to: quoteData.to,
          data: quoteData.data,
        };
        tx = await signer.sendTransaction(txData);
      }
      console.log('Transaction sent:', tx.hash);
      await tx.wait();
      console.log('Transaction confirmed:', tx.hash);
      setTxStatusForSwap("confirmed");
      const updatedSwaps = {
        ...swaps,
        [address]: {
          ...(swaps[address] || {}),
          [String(CurrentCycleCount?.[id])]: {   // cycle as parent
            ...(swaps[address]?.[String(CurrentCycleCount?.[id])] || {}),
            [id]: {                 // token name as sub-key
              ...(swaps[address]?.[String(CurrentCycleCount?.[id])]?.[id] || {}),
              [tokenOutAddress]: true,     // mark tokenOutAddress as swapped
            },
          },
        },
      };
      fetchStateHolding();
      localStorage.setItem("auctionSwaps", JSON.stringify(updatedSwaps));
    } catch (err) {
      setTxStatusForSwap("error");
      console.error('Swap failed:', err);
      if (err?.code === 4001) {
        setTxStatusForSwap("cancelled");
        notifyError("Transaction cancelled by user.")
        return;
      }
      setDexSwappingStates((prev) => ({ ...prev, [id]: false }));
      setTxStatusForSwap("error");
    } finally {
      setDexSwappingStates((prev) => ({ ...prev, [id]: false }));
      setTxStatusForSwap("error")
    }
  };

  const fetchDaiLastPrice = async () => {
    try {
      const response = await fetch('https://api.geckoterminal.com/api/v2/networks/pulsechain/tokens/0xa1077a294dde1b09bb078844df40758a5d0f9a27/pools?page=1');
      if (!response.ok) throw new Error('Failed to fetch DAI price');
      const data = await response.json();
      // Take the first pool result
      const pool = data.data[0];
      const priceChange24h = pool.attributes.price_change_percentage.h24;

      console.log("DAI 24h price change %:", priceChange24h);
      setDaiPriceChange(priceChange24h);
    } catch (error) {
      console.error("Error fetching DAI price:", error);
    }
  }
  useEffect(() => {
    const processingStates = ["initiated","Adding","Approving", "pending", "loading"];

    const isProcessing =
      processingStates.includes(txStatusForSwap) ||
      processingStates.includes(txStatusForAdding);

    if (isProcessing) {
      if (toastId.current === null) {
        toastId.current = toast.loading(`Processing…`, {
          position: "top-center",
          autoClose: false,
        });
      }
    } else if (toastId.current !== null) {
      toast.dismiss(toastId.current);
      toastId.current = null;
    }
  }, [txStatusForSwap, txStatusForAdding]);
  return (
    <SwapContractContext.Provider
      value={{
        //WALLET States
        provider,
        signer,
        loading,
        address,
        handleDexTokenSwap,
        CalculationOfCost,
        setDexSwappingStates,
        DexswappingStates,
        UsersSupportedTokens,
        TotalCost,
        isAirdropClaimed,
        setClaiming,
        TokenBalance,
        claiming,
        SwapTokens,
        setDavAndStateIntoSwap,
        handleAddToken,
        // setReverseEnable,
        userHashSwapped,
        userHasReverseSwapped,
        isCliamProcessing,
        isTokenRenounce,
        // WithdrawLPTokens,
        AddTokenIntoSwapContract,
        isTokenSupporteed,
        burnedAmount,
        buttonTextStates,
        DexbuttonTextStates,
        DavAddress,
        StateAddress,
        swappingStates,
        TokenPariAddress,
        AuctionTime,
        txStatusForSwap,
        fetchUserTokenAddresses,
        AirdropClaimed,
        isReversed,
        InputAmount,
        burnedLPAmount,
        DaipriceChange,
        setTxStatusForSwap,
        AirDropAmount,
        getAirdropAmount,
        supportedToken,
        OutPutAmount,
        CurrentCycleCount,
        giveRewardForAirdrop,
        CheckMintBalance,
        getInputAmount,
        TokenNames,
        getOutPutAmount,
        txStatusForAdding,
        setTxStatusForAdding,
        TimeLeftClaim,
        renounceTokenContract,
        tokenMap,
        IsAuctionActive,
        TokenRatio,
        pstateToPlsRatio,
      }}
    >
      {children}
    </SwapContractContext.Provider>
  );
};
SwapContractProvider.propTypes = {
  children: PropTypes.node.isRequired,
};