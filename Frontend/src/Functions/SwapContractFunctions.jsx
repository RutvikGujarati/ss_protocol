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
  Auction_TESTNET,
  DAV_TESTNET,
  DAV_TOKEN_SONIC_ADDRESS,
  STATE_TESTNET,
  STATE_TOKEN_SONIC_ADDRESS,
} from "../Constants/ContractAddresses";
import { useAccount, useChainId } from "wagmi";
import { useDAvContract } from "./DavTokenFunctions";

const SwapContractContext = createContext();

export const useSwapContract = () => useContext(SwapContractContext);

export const SwapContractProvider = ({ children }) => {
  const chainId = useChainId();
  const { loading, provider, signer, AllContracts } =
    useContext(ContractContext);
  const { fetchData, DavMintFee } = useDAvContract();
  const { address } = useAccount();

  const [claiming, setClaiming] = useState(false);
  const [txStatusForSwap, setTxStatusForSwap] = useState("");
  const [txStatusForAdding, setTxStatusForAdding] = useState("");
  const [TotalCost, setTotalCost] = useState(null);

  const [InputAmount, setInputAmount] = useState({});
  const [AirDropAmount, setAirdropAmount] = useState("0.0");
  const [AuctionTime, setAuctionTime] = useState({});
  const [CurrentCycleCount, setCurrentCycleCount] = useState({});
  const [OutPutAmount, setOutputAmount] = useState({});
  const [TokenRatio, setTokenRatio] = useState({});
  const [TimeLeftClaim, setTimeLeftClaim] = useState({});
  const [burnedAmount, setBurnedAmount] = useState({});
  const [TokenBalance, setTokenbalance] = useState({});
  const [isReversed, setIsReverse] = useState({});
  const [IsAuctionActive, setisAuctionActive] = useState({});
  const [isTokenRenounce, setRenonced] = useState({});
  const [tokenMap, setTokenMap] = useState({});
  const [TokenNames, setTokenNames] = useState({});

  const [buttonTextStates, setButtonTextStates] = useState({});
  const [swappingStates, setSwappingStates] = useState({});

  const [userHashSwapped, setUserHashSwapped] = useState({});
  const [DavAddress, setDavAddress] = useState("");
  const [supportedToken, setIsSupported] = useState(false);
  const [UsersSupportedTokens, setUsersSupportedTokens] = useState("");
  const [StateAddress, setStateAddress] = useState("");
  const [AirdropClaimed, setAirdropClaimed] = useState({});
  const [userHasReverseSwapped, setUserHasReverseSwapped] = useState({});

  const [isCliamProcessing, setIsCllaimProccessing] = useState(null);
  const CalculationOfCost = async (amount) => {
    if (chainId == 146) {
      setTotalCost(ethers.parseEther((amount * 100).toString()));
    } else {
      setTotalCost(ethers.parseEther((amount * DavMintFee).toString()));
    }
  };
  const fetchTokenData = async ({
    contractMethod,
    setState,
    formatFn = (v) => v.toString(),
    includeTestState = false,
    customContractInstance = null,
    buildArgs,
    useAddressAsKey = false, // New: Control whether to key results by address
  }) => {
    try {
      const results = {};
      const tokenMap = await ReturnfetchUserTokenAddresses();

      const extendedMap = includeTestState
        ? { ...tokenMap, state: STATE_TESTNET }
        : tokenMap;

      for (const [tokenName, tokenAddress] of Object.entries(extendedMap)) {
        try {
          const contract = customContractInstance
            ? customContractInstance(tokenAddress)
            : AllContracts.AuctionContract;

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

  useEffect(() => {
    const intervalHandles = {};
    const results = {};

    const initializeCountdowns = async () => {
      const tokenMap = await ReturnfetchUserTokenAddresses();
      for (const [tokenName, TokenAddress] of Object.entries(tokenMap)) {
        try {
          const AuctionTimeInWei =
            await AllContracts.AuctionContract.getAuctionTimeLeft(TokenAddress);
          const totalSeconds = Math.floor(Number(AuctionTimeInWei));

          results[tokenName] = totalSeconds;

          intervalHandles[tokenName] = setInterval(() => {
            setAuctionTime((prev) => {
              const newTime = { ...prev };
              if (newTime[tokenName] > 0) {
                newTime[tokenName] = newTime[tokenName] - 1;
              }
              return newTime;
            });
          }, 1000);
        } catch (e) {
          results[tokenName] = 0;
          console.log("error", e);
        }
      }

      setAuctionTime(results);
    };

    initializeCountdowns();

    return () => {
      Object.values(intervalHandles).forEach(clearInterval);
    };
  }, [AllContracts]);

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
        const timeLeftInSeconds =
          await AllContracts.AuctionContract.getNextClaimTime(TokenAddress);

        const timeLeft = Number(timeLeftInSeconds);
        results[tokenName] = timeLeft;

        // Start countdown interval
        intervalHandles[tokenName] = setInterval(() => {
          setTimeLeftClaim((prev) => {
            const updated = { ...prev };
            if (updated[tokenName] > 0) {
              updated[tokenName] = updated[tokenName] - 1;
            }
            return updated;
          });
        }, 1000);
      } catch (err) {
        console.warn(`Error getting claim time for ${tokenName}`, err);
        results[tokenName] = 0;
      }
    }

    setTimeLeftClaim(results);
  }, [AllContracts]);
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
        state: STATE_TESTNET,
      };

      for (const [tokenName, TokenAddress] of Object.entries(extendedMap)) {
        const tokenContract = new ethers.Contract(
          TokenAddress,
          ERC20_ABI,
          provider
        );
        const rawBalance = await tokenContract.balanceOf(Auction_TESTNET);

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
        STATE: STATE_TESTNET,
        DAV: DAV_TESTNET,
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

  const setDavAndStateIntoSwap = async () => {
    if (!AllContracts?.AuctionContract || !address) return;

    try {
      const tx = await AllContracts.AuctionContract.setTokenAddress(
        STATE_TESTNET,
        DAV_TESTNET
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
  }, [AllContracts, address]);

  useEffect(() => {
    const functions = [
      fetchUserTokenAddresses,
      getInputAmount,
      getOutPutAmount,
      getCurrentAuctionCycle,
      getTokenRatio,
      getTokensBurned,
      getAirdropAmount,
      getTokenBalances,
      isAirdropClaimed,
      AddressesFromContract,
      isRenounced,
      getTokenNamesForUser,
      isTokenSupporteed,
      getTokenNamesByUser,
      HasSwappedAucton,
      HasReverseSwappedAucton,
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
  }, [AllContracts, address]);
  // Adjust based on when you want it to run

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

      const ContractAddressToUse = Auction_TESTNET;

      let approvalAmount;
      const tokenAddress = tokenMap[ContractName];

      let selectedContract;
      if (isReversed[ContractName] == "true") {
        selectedContract = new ethers.Contract(
          STATE_TESTNET,
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
          const approveTx = await selectedContract.approve(
            ContractAddressToUse,
            approvalAmount
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
        toast.success(`swapped success with ${ContractName} `, {
          position: "top-center", // Centered
          autoClose: 18000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        setButtonTextStates((prev) => ({ ...prev, [id]: "Swap Complete!" }));
      } else {
        console.error("Swap transaction failed.");
        setTxStatusForSwap("error");
        setButtonTextStates((prev) => ({ ...prev, [id]: "Swap failed" }));
      }
      await CheckIsAuctionActive();
      await HasSwappedAucton();
      await HasReverseSwappedAucton();
      await fetchData();
    } catch (error) {
      console.error("Error during token swap:", error);

      // 👇 Detect user rejection
      if (error?.code === 4001) {
        setTxStatusForSwap("cancelled");
        toast.info("Transaction cancelled by user.", {
          position: "top-center",
          autoClose: 3000,
        });
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

      toast.error(errorMessage, {
        position: "top-center",
        autoClose: 5000,
      });

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
      await fetchData();
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

  const handleAddDAV = () => handleAddToken(DAV_TESTNET, "pDAV");
  const handleAddTokensDAV = () =>
    handleAddToken(DAV_TOKEN_SONIC_ADDRESS, "sDAV");

  const handleAddTokensState = () =>
    handleAddToken(STATE_TOKEN_SONIC_ADDRESS, "sState");
  //   console.log("dav and state address", DavAddress, StateAddress);
  return (
    <SwapContractContext.Provider
      value={{
        //WALLET States
        provider,
        signer,
        loading,
        address,

        CalculationOfCost,
        handleAddDAV,
        UsersSupportedTokens,
        handleAddTokensDAV,
        handleAddTokensState,
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
        DavAddress,
        StateAddress,
        swappingStates,
        AuctionTime,
        txStatusForSwap,
        fetchUserTokenAddresses,
        AirdropClaimed,
        isReversed,
        InputAmount,
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
      }}
    >
      {children}
    </SwapContractContext.Provider>
  );
};
SwapContractProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
