// SwapContractContext.js
import { createContext, useContext, useState, useEffect } from "react";
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
  Yees_testnet,
} from "../ContractAddresses";
import { useAccount, useChainId } from "wagmi";
import { useDAvContract } from "./DavTokenFunctions";

const SwapContractContext = createContext();

export const useSwapContract = () => useContext(SwapContractContext);

export const SwapContractProvider = ({ children }) => {
  const chainId = useChainId();
  const { loading, provider, signer, AllContracts } =
    useContext(ContractContext);
  const { fetchData } = useDAvContract();
  const { address } = useAccount();

  const [claiming, setClaiming] = useState(false);

  const [TotalCost, setTotalCost] = useState(null);

  const [InputAmount, setInputAmount] = useState({});
  const [AirDropAmount, setAirdropAmount] = useState("0.0");
  const [AuctionTime, setAuctionTime] = useState({});
  const [CurrentCycleCount, setCurrentCycleCount] = useState({});
  const [OutPutAmount, setOutputAmount] = useState({});
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
      setTotalCost(ethers.parseEther((amount * 1000000).toString()));
    }
  };

  const getInputAmount = async () => {
    try {
      const results = {};
      const tokenMap = await ReturnfetchUserTokenAddresses();

      console.log("Starting loop over Addresses:", tokenMap);

      for (const [tokenName, TokenAddress] of Object.entries(tokenMap)) {
        console.log(
          `Fetching input amount for ${tokenName} at ${TokenAddress}`
        );

        const inputAmountWei =
          await AllContracts.AuctionContract.calculateAuctionEligibleAmount(
            TokenAddress
          );

        const inputAmount = ethers.formatEther(inputAmountWei); // 👈 convert to ether
        const inputAmountNoDecimals = Math.floor(Number(inputAmount));
        console.log(`Input amount for ${tokenName}:`, inputAmountNoDecimals);

        results[tokenName] = inputAmountNoDecimals;
      }

      console.log("Final input amounts:", results);
      setInputAmount(results);
    } catch (e) {
      console.error("Error fetching input amounts:", e);
    }
  };
  const getAirdropAmount = async () => {
    try {
      const results = {};
      const tokenMap = await ReturnfetchUserTokenAddresses();

      console.log("Starting loop over Addresses:", tokenMap);

      for (const [tokenName, TokenAddress] of Object.entries(tokenMap)) {
        console.log(
          `Fetching airdrop amount for ${tokenName} at ${TokenAddress}`
        );

        const airdropAmountWei =
          await AllContracts.AuctionContract.getClaimableReward(
            address,
            TokenAddress
          ); // 👈 assuming this function accepts a token address

        const airdropAmount = ethers.formatEther(airdropAmountWei); // Convert from Wei
        const airdropAmountNoDecimals = Math.floor(Number(airdropAmount));
        console.log(
          `Airdrop amount for ${tokenName}:`,
          airdropAmountNoDecimals
        );

        results[tokenName] = airdropAmountNoDecimals;
      }

      console.log("Final airdrop amounts:", results);
      setAirdropAmount(results);
    } catch (e) {
      console.error("Error fetching airdrop amounts:", e);
    }
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
    try {
      const results = {};
      const tokenMap = await ReturnfetchUserTokenAddresses();
      console.log("Starting loop over Addresses:", tokenMap);

      for (const [tokenName, TokenAddress] of Object.entries(tokenMap)) {
        try {
          console.log(
            `Fetching input amount for ${tokenName} at ${TokenAddress}`
          );
          const CycleCountWei =
            await AllContracts.AuctionContract.getCurrentAuctionCycle(
              TokenAddress
            );
          const CycleCountNoDecimals = Math.floor(Number(CycleCountWei));
          console.log(`Input amount for ${tokenName}:`, CycleCountNoDecimals);
          results[tokenName] = CycleCountNoDecimals;
        } catch (innerError) {
          console.warn(
            `Error fetching cycle count for ${tokenName}:`,
            innerError
          );
          results[tokenName] = "not started"; // fallback value
        }
      }

      console.log("Final Cycle amounts:", results);
      setCurrentCycleCount(results);
    } catch (e) {
      console.error("Error fetching Cycle amounts:", e);
    }
  };

  const getOutPutAmount = async () => {
    try {
      const results = {};
      const tokenMap = await ReturnfetchUserTokenAddresses();
      console.log("Starting loop over Addresses:", tokenMap);

      for (const [tokenName, TokenAddress] of Object.entries(tokenMap)) {
        console.log(
          `Fetching Output amount for ${tokenName} at ${TokenAddress}`
        );

        const OutputAmountWei =
          await AllContracts.AuctionContract.getOutPutAmount(TokenAddress);

        const OutputAmount = ethers.formatEther(OutputAmountWei); // 👈 convert to ether
        const OutputAmountNoDecimals = Math.floor(Number(OutputAmount));
        console.log(`Input amount for ${tokenName}:`, OutputAmountNoDecimals);

        results[tokenName] = OutputAmountNoDecimals;
      }

      console.log("Final Output amounts:", results);
      setOutputAmount(results);
    } catch (e) {
      console.error("Error fetching input amounts:", e);
    }
  };
  useEffect(() => {
    const intervalHandles = {};
    const results = {};

    const initializeClaimCountdowns = async () => {
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
    };

    initializeClaimCountdowns();

    return () => {
      // Cleanup intervals
      Object.values(intervalHandles).forEach(clearInterval);
    };
  }, [AllContracts]);

  const getTokensBurned = async () => {
    try {
      const results = {};
      const tokenMap = await ReturnfetchUserTokenAddresses();
      const extendedMap = {
        ...tokenMap,
        state: STATE_TESTNET,
      };

      console.log("Starting loop over Addresses:", extendedMap);

      for (const [tokenName, TokenAddress] of Object.entries(extendedMap)) {
        console.log(
          `Fetching Output amount for ${tokenName} at ${TokenAddress}`
        );

        const OutputAmountWei =
          await AllContracts.AuctionContract.getTotalTokensBurned(TokenAddress);

        const OutputAmount = ethers.formatEther(OutputAmountWei); // 👈 convert to ether
        const OutputAmountNoDecimals = Math.floor(Number(OutputAmount));
        console.log(`Input amount for ${tokenName}:`, OutputAmountNoDecimals);

        results[tokenName] = OutputAmountNoDecimals;
      }

      console.log("Final Output amounts:", results);
      setBurnedAmount(results);
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

      console.log("Starting loop over Addresses:", extendedMap);

      for (const [tokenName, TokenAddress] of Object.entries(extendedMap)) {
        console.log(
          `Fetching token amount for ${tokenName} at ${TokenAddress}`
        );
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

      console.log("Final balance amounts:", results);
      setTokenbalance(results);
    } catch (e) {
      console.error("Error fetching input amounts:", e);
    }
  };

  const CheckIsReverse = async () => {
    try {
      const results = {};
      const tokenMap = await ReturnfetchUserTokenAddresses();
      console.log("Starting loop over Addresses:", tokenMap);

      for (const [tokenName, TokenAddress] of Object.entries(tokenMap)) {
        try {
          console.log(
            `Fetching AuctionActive for ${tokenName} at ${TokenAddress}`
          );
          const AuctionActive =
            await AllContracts.AuctionContract.isReverseAuctionActive(
              TokenAddress
            );
          const AuctionActiveString = AuctionActive.toString();
          console.log(`Auction Active for ${tokenName}:`, AuctionActiveString);
          results[tokenName] = AuctionActiveString;
        } catch (innerError) {
          console.warn(`Error checking auction for ${tokenName}:`, innerError);
          results[tokenName] = "not started"; // fallback if error
        }
      }

      console.log("Final IsReverse:", JSON.stringify(results));
      setIsReverse(results); // ✅ keep it as an object

      return results;
    } catch (e) {
      console.error("Error fetching reverse:", e);
      return {};
    }
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

      console.log(`Renounced ownership for ${tokenName}`);
      await isRenounced();
    } catch (error) {
      console.error(`Error renouncing ownership for ${tokenName}:`, error);
    }
  };

  const CheckIsAuctionActive = async () => {
    try {
      const results = {};
      const tokenMap = await ReturnfetchUserTokenAddresses();
      console.log("Starting loop over Addresses:", tokenMap);

      for (const [tokenName, TokenAddress] of Object.entries(tokenMap)) {
        try {
          console.log(
            `Fetching AuctionActive for ${tokenName} at ${TokenAddress}`
          );
          const AuctionActive =
            await AllContracts.AuctionContract.isAuctionActive(TokenAddress);
          const AuctionActiveString = AuctionActive.toString();
          console.log(`Auction Active for ${tokenName}:`, AuctionActiveString);
          results[tokenName] = AuctionActiveString;
        } catch (innerError) {
          console.warn(`Error checking auction for ${tokenName}:`, innerError);
          results[tokenName] = "not started"; // fallback if error
        }
      }

      console.log("Final AuctionActive:", results);
      setisAuctionActive(results);
    } catch (e) {
      console.error("Error fetching Auction Active:", e);
    }
  };

  const isRenounced = async () => {
    try {
      const results = {};
      const tokenMap = await ReturnfetchUserTokenAddresses();
      console.log("Starting loop over Addresses in renounce:", tokenMap);

      for (const [tokenName, TokenAddress] of Object.entries(tokenMap)) {
        console.log(`Fetching renouncing for ${tokenName} at ${TokenAddress}`);

        const renouncing = await AllContracts.AuctionContract.isTokenRenounced(
          TokenAddress
        );

        const renouncingString = renouncing.toString(); // 👈 convert to string

        console.log(`renounce Active for ${tokenName}:`, renouncingString);

        results[tokenName] = renouncingString;
      }

      console.log("Final renouncing:", results);
      setRenonced(results);
    } catch (e) {
      console.error("Error fetching renounce Active:", e);
    }
  };

  const HasReverseSwappedAucton = async () => {
    try {
      const results = {};
      const tokenMap = await ReturnfetchUserTokenAddresses();
      console.log("Starting loop over Addresses:", tokenMap);

      for (const [tokenName, TokenAddress] of Object.entries(tokenMap)) {
        console.log(
          `Fetching UserHasSwapped for ${tokenName} at ${TokenAddress}`
        );

        const UserHasSwapped =
          await AllContracts.AuctionContract.getUserHasReverseSwapped(
            address,
            TokenAddress
          );

        const UserHasSwappedString = UserHasSwapped.toString(); // 👈 convert to string

        console.log(`User has Swapped for ${tokenName}:`, UserHasSwappedString);

        results[tokenName] = UserHasSwappedString;
      }

      console.log("Final UserHasSwapped:", results);
      setUserHasReverseSwapped(results);
    } catch (e) {
      console.error("Error fetching reverse:", e);
    }
  };
  const HasSwappedAucton = async () => {
    try {
      const results = {};
      const tokenMap = await ReturnfetchUserTokenAddresses();
      console.log("Starting loop over Addresses:", tokenMap);

      for (const [tokenName, TokenAddress] of Object.entries(tokenMap)) {
        console.log(
          `Fetching UserHasSwapped for ${tokenName} at ${TokenAddress}`
        );

        const UserHasSwapped =
          await AllContracts.AuctionContract.getUserHasSwapped(
            address,
            TokenAddress
          );

        const UserHasSwappedString = UserHasSwapped.toString(); // 👈 convert to string

        console.log(`User has Swapped for ${tokenName}:`, UserHasSwappedString);

        results[tokenName] = UserHasSwappedString;
      }

      console.log("Final UserHasSwapped:", results);
      setUserHashSwapped(results);
    } catch (e) {
      console.error("Error fetching reverse:", e);
    }
  };
  const isAirdropClaimed = async () => {
    try {
      const results = {};
      const tokenMap = await ReturnfetchUserTokenAddresses();
      console.log("Starting loop over Addresses:", tokenMap);

      for (const [tokenName, TokenAddress] of Object.entries(tokenMap)) {
        console.log(
          `Fetching AirdropClaimed for ${tokenName} at ${TokenAddress}`
        );

        const AirdropClaimed =
          await AllContracts.AuctionContract.hasAirdroppedClaim(
            address,
            TokenAddress
          );

        const AirdropClaimedString = AirdropClaimed.toString(); // 👈 convert to string

        console.log(
          `User has Claimed Airdrop for ${tokenName}:`,
          AirdropClaimedString
        );

        results[tokenName] = AirdropClaimedString;
      }

      console.log("Final AirdropClaimed:", results);
      setAirdropClaimed(results);
    } catch (e) {
      console.error("Error fetching reverse:", e);
    }
  };
  const AddressesFromContract = async () => {
    if (!AllContracts?.AuctionContract) {
      console.warn("AuctionContract not found");
      return;
    }

    try {
      const davAddress = await AllContracts.AuctionContract.dav();
      const stateAddress = await AllContracts.AuctionContract.stateToken();

      console.log("DAV:", davAddress);
      console.log("State:", stateAddress);

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
      console.log("Token Names:", tokenNames);

      const tokenAddresses = {};

      // Step 2: Loop through names and get corresponding addresses
      for (const name of tokenNames) {
        const TokenAddress =
          await AllContracts.AuctionContract.getUserTokenAddress(name);
        tokenAddresses[name] = TokenAddress;
      }

      console.log("Token Addresses:", tokenAddresses);

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
      console.log("Token Names:", tokenNames);

      const tokenAddresses = {};

      // Step 2: Loop through names and get corresponding addresses
      for (const name of tokenNames) {
        const TokenAddress =
          await AllContracts.AuctionContract.getUserTokenAddress(name);
        tokenAddresses[name] = TokenAddress;
      }

      console.log("Token Addresses:", tokenAddresses);
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
        console.log(
          `Fetching token support status for ${tokenName} at ${TokenAddress}`
        );

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

      console.log("User's Token Addresses", tokenAddresses);

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

            console.log("pair addresses", pairAddress);
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

      console.log("Token Info with Pair Address:", tokenData);
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
      console.log(
        "Calling giveRewardToTokenOwner with tokenAddress:",
        tokenAddress
      );
      const tx = await AllContracts.AuctionContract.giveRewardToTokenOwner(
        tokenAddress
      );
      await tx.wait();
      console.log("Reward claimed successfully");
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

    try {
      // Replace these params if needed based on your contract's addToken function
      const tx = await AllContracts.AuctionContract.addToken(
        TokenAddress,
        PairAddress,
        Owner,
        name
      );
      const receipt = await tx.wait();
      if (receipt.status === 1) {
        console.log("Transaction successful");
        await CheckIsAuctionActive();
        await isTokenSupporteed(); // Corrected function name
        console.log("Token added successfully!");
      } else {
        console.error("Transaction failed");
      }
      console.log("Token added successfully!");
    } catch (error) {
      console.error("AddTokenIntoSwapContract failed:", error?.reason || error);
    }
  };
  console.log("Is array:", Array.isArray(UsersSupportedTokens));

  useEffect(() => {
    fetchUserTokenAddresses();
    getInputAmount();
    getOutPutAmount();
    getTokensBurned();
    CheckIsAuctionActive();
    // getAuctionTimeLeft();
    getAirdropAmount();
    CheckIsReverse();
    getTokenBalances();
    isAirdropClaimed();
    AddressesFromContract();
    isRenounced();
    getTokenNamesForUser();
    isTokenSupporteed();
    // getTokensByUser();
    getTokenNamesByUser();
    HasSwappedAucton();
    HasReverseSwappedAucton();
    getCurrentAuctionCycle();
  }, [AllContracts, address]); // Adjust based on when you want it to run

  const ERC20_ABI = [
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function allowance(address owner, address spender) external view returns (uint256)",
    "function balanceOf(address account) external view returns (uint256)",
  ];

  const SwapTokens = async (id, ContractName) => {
    try {
      setSwappingStates((prev) => ({ ...prev, [id]: true }));
      setButtonTextStates((prev) => ({
        ...prev,
        [id]: "Checking allowance...",
      }));

      const OutAmountsMapping = OutPutAmount[ContractName];
      const InAmountMapping = InputAmount[ContractName];

      const ContractAddressToUse = Auction_TESTNET;

      console.log("output amount:", OutAmountsMapping);
      console.log("reverse from swap", isReversed);
      console.log("input amount:", InAmountMapping);

      const amountInWei = ethers.parseUnits(OutAmountsMapping.toString(), 18);

      let approvalAmount;
      const tokenAddress = tokenMap[ContractName];
      console.log("rps", isReversed[ContractName]);

      let selectedContract;
      if (isReversed[ContractName] == "true") {
        selectedContract = new ethers.Contract(
          STATE_TESTNET,
          ERC20_ABI,
          signer
        );
        approvalAmount = ethers.parseUnits(OutAmountsMapping.toString(), 18);
        console.log("firs condition");
        console.log(
          "Reversed swap, approving OutBalance:",
          approvalAmount.toString()
        );
      } else {
        console.log("second condition");
        selectedContract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
        approvalAmount = ethers.parseUnits(InAmountMapping.toString(), 18);
        console.log(
          "Normal swap, approving OnePBalance:",
          approvalAmount.toString()
        );
      }

      approvalAmount = approvalAmount + ethers.parseUnits("100", 18); // Add extra amount
      console.log("Amount in wei:", amountInWei.toString());
      console.log("Approval Amount:", approvalAmount.toString());

      // Check current allowance
      const allowance = await selectedContract.allowance(
        address,
        ContractAddressToUse
      );
      console.log("Current allowance:", ethers.formatUnits(allowance, 18));

      if (allowance < approvalAmount) {
        setButtonTextStates((prev) => ({
          ...prev,
          [id]: "Approving input token...",
        }));
        console.log("Insufficient allowance. Sending approval transaction...");

        try {
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
          return false;
        }
      } else {
        console.log(
          "Sufficient allowance already granted. Proceeding to swap."
        );
      }

      setButtonTextStates((prev) => ({ ...prev, [id]: "Swapping..." }));

      // Perform the token swap
      const swapTx = await AllContracts.AuctionContract.swapTokens(
        address,
        tokenAddress
      );
      const swapReceipt = await swapTx.wait();

      if (swapReceipt.status === 1) {
        console.log("Swap Complete!");
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
        setButtonTextStates((prev) => ({ ...prev, [id]: "Swap failed" }));
      }
      await CheckIsAuctionActive();
      await HasSwappedAucton();
      await HasReverseSwappedAucton();
      await fetchData();
    } catch (error) {
      console.error("Error during token swap:", error);
      setButtonTextStates((prev) => ({ ...prev, [id]: "Swap failed" }));
    } finally {
      // Reset swapping state
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
  const handleAddYees = () => handleAddToken(Yees_testnet, "Yees");
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
        handleAddYees,
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
        fetchUserTokenAddresses,
        AirdropClaimed,
        isReversed,
        InputAmount,
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
        TimeLeftClaim,
        renounceTokenContract,
        tokenMap,
        IsAuctionActive,
      }}
    >
      {children}
    </SwapContractContext.Provider>
  );
};
SwapContractProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
