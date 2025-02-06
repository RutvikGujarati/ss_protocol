// DAVTokenContext.js
import { createContext, useContext, useState, useEffect, useRef } from "react";
import { ethers } from "ethers";
// import DAVTokenABI from "../ABI/DavTokenABI.json";
// import StateABI from "../ABI/StateTokenABI.json";
// import RatioABI from "../ABI/RatioABI.json";
import PropTypes from "prop-types";
import { PriceContext } from "../api/StatePrice";
import { ContractContext } from "../Functions/ContractInitialize";
import {
  DAV_TOKEN_ADDRESS,
  Fluxin,
  Ratio_TOKEN_ADDRESS,
  STATE_TOKEN_ADDRESS,
  Xerion,
  XerionRatioAddress,
} from "../ContractAddresses";

const DAVTokenContext = createContext();

export const useDAVToken = () => useContext(DAVTokenContext);

export const DAVTokenProvider = ({ children }) => {
  const { stateUsdPrice, FluxinRatioPrice, XerionRatioPrice } =
    useContext(PriceContext);
  const { loading, provider, signer, account, AllContracts } =
    useContext(ContractContext);

  const [claiming, setClaiming] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState(null); // 'pending', 'success', or

  const [TotalCost, setTotalCost] = useState(null);

  const [loadingRatioPrice, setRatioPriceLoading] = useState(true); // Loading state to show loading message

  const [ButtonText, setButtonText] = useState();
  const [isReversed, setisReversed] = useState({
    Fluxin: false,
    Xerion: false,
  });
  const [StateHolds, setStateHoldings] = useState("0.0");
  const [LoadingState, setLoadingState] = useState(true);

  const [TotalStateHoldsInUS, setTotalStateHoldsInUS] = useState("0.00");

  const [OnePBalance, setOnePBalance] = useState({});
  const [FluxinOnepBalance, setFluxinOnepBalnce] = useState("0");
  const [DavRequiredAmount, setDavRequiredAmount] = useState("0");
  const [XerionOnepBalance, setXerionOnepBalnce] = useState("0");

  const [buttonTextStates, setButtonTextStates] = useState({});
  const [swappingStates, setSwappingStates] = useState({});

  const [StateBurnBalance, setStateBurnBalance] = useState({});
  const [RatioTargetsofTokens, setRatioTargetsOfTokens] = useState({});
  const [bountyBalances, setBountyBalances] = useState({
    fluxinBounty: 0,
    xerionBounty: 0,
  });
  const [PercentageOfState, setPercentage] = useState("0.0");
  const [PercentageFluxin, setFluxinPercentage] = useState("0.0");
  const [PercentageXerion, setXerionPercentage] = useState("0.0");
  const [Distributed, setViewDistributed] = useState({
    state: "0.0",
    Fluxin: "0.0",
    Xerion: "0.0",
    xerion2: "0.0",
    xerion3: "0.0",
  });

  const [auctionDetails, setAuctionDetails] = useState({});

  const [userHashSwapped, setUserHashSwapped] = useState({});
  const [userHasReverseSwapped, setUserHasReverseSwapped] = useState({});
  const [BurnOccuredForToken, setBurnOccuredForToken] = useState({});
  const [BurnCycleACtive, setBurnCycleActive] = useState({});
  const [BurnTimeLeft, setBurnTimeLeft] = useState({});
  const [TotalTokensBurned, setTotalTokenBurned] = useState({});
  const [TotalBounty, setTotalTokenBounty] = useState({});
  const [AuctionTimeRunning, SetAuctionTimeRunning] = useState("0");
  const [AuctionTimeRunningXerion, SetAuctionTimeRunningXerion] = useState("0");
  const [RatioValues, SetRatioTargets] = useState("1000");

  const handleContractCall = async (
    contract,
    method,
    args = [],
    formatter = (v) => v
  ) => {
    try {
      if (loading || !contract) return console.error("Contract not loaded");
      const result = await contract[method](...args);
      return formatter(result);
    } catch (error) {
      if (error.reason || error.data) {
        throw error;
      }
      console.log(error);
      throw new Error("Unknown contract call error");
    }
  };

  const CalculationOfCost = async (amount) => {
    setTotalCost(ethers.parseEther((amount * 250000).toString()));
  };

  const fetchStateHoldingsAndCalculateUSD = async () => {
    try {
      const holdings = await handleContractCall(
        AllContracts.stateContract,
        "balanceOf",
        [account],
        (h) => ethers.formatUnits(h, 18)
      );

      if (holdings) {
        const rawHoldings = parseFloat(holdings);
        const priceNum = Number(stateUsdPrice);

        const formattedHoldings = new Intl.NumberFormat("en-US").format(
          rawHoldings
        );
        setStateHoldings(formattedHoldings);

        console.log("Raw holdings (in Ether):", rawHoldings);
        console.log("Price of token:", priceNum);

        if (!isNaN(rawHoldings) && !isNaN(priceNum)) {
          console.log("second time raw", Number(rawHoldings));
          const holdingsInUSD = Number(rawHoldings * priceNum);
          console.log("Holdings in USD:", holdingsInUSD);
          setTotalStateHoldsInUS(
            holdingsInUSD === 0 ? "0.0" : holdingsInUSD.toFixed(2)
          );
        } else {
          console.error("Invalid values for calculation:", {
            rawHoldings,
            priceNum,
          });
          setTotalStateHoldsInUS("0.0");
        }
      } else {
        setStateHoldings("0");
        setTotalStateHoldsInUS("0.0");
        console.error("Failed to fetch state holdings.");
      }
      setLoadingState(false);
    } catch (error) {
      setStateHoldings("0");
      setTotalStateHoldsInUS("0.0");
      setLoadingState(false);
      console.error("Error fetching state holdings:", error);
    } finally {
      setLoadingState(false);
    }
  };

  useEffect(() => {
    let interval;

    const fetchLiveData = async () => {
      if (
        !AllContracts.davContract ||
        !AllContracts.stateContract ||
        !AllContracts.RatioContract ||
        !AllContracts.XerionRatioContract
      ) {
        console.warn("Waiting for contracts to load...");
        return;
      }

      try {
        await Promise.all([
          fetchStateHoldingsAndCalculateUSD(),
          RatioTargetValues(),
          getDecayPercentage("state"),
          getDecayPercentage("Xerion"),
          getDecayPercentage("Fluxin"),
          checkOwnershipStatus("state"),
          checkOwnershipStatus("dav"),
          checkOwnershipStatus("Fluxin"),
          checkOwnershipStatus("Xerion"),
          ViewDistributedTokens(),
          getCachedRatioTarget(),
          reverseSwapEnabled(),
          ContractStateBalance(),
          StateBurnAmount(),
          calculateBounty(),
          ContractFluxinBalance(),
          ContractFluxinStateBalance(),
          ContractXerionStateBalance(),
          ContractRatioFluxinBalance(),
          ContractRatioXerionBalance(),
          ContractXerionBalance(),
          SetOnePercentageOfBalance(AllContracts.RatioContract, "Fluxin"),
          SetOnePercentageOfBalance(AllContracts.XerionRatioContract, "Xerion"),
          calculateBalancesForAllContracts(),
          getDavRequiredAmount(),
          AmountOutTokens(),
          AmountOut(),
          AuctionTimeInterval(),
          HasReverseSwappedAucton(),
          HasSwappedAucton(),
          BurningOccurred(),
          BurnCycleActive(),
          BurnTimingLeft(),
          TotalTokensBurn(),
          TotalBountyAmount(),
        ]);
      } catch (error) {
        console.error("Error fetching live data:", error);
      }
    };

    fetchLiveData(); // Fetch data once initially
    interval = setInterval(fetchLiveData, 10000); // Poll every 10 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, [
    AllContracts.davContract,
    AllContracts.stateContract,
    AllContracts.RatioContract,
    AllContracts.XerionRatioContract,
    account,
  ]);

  // Ratio Token Contracts
  // -- auction

  const [isRenounced, setIsRenounced] = useState({
    state: null,
    dav: null,
    Fluxin: null,
    Xerion: null,
  });
  const setRenounceStatus = (name, status) => {
    setIsRenounced((prevState) => ({
      ...prevState,
      [name]: status,
    }));
  };
  const checkOwnershipStatus = async (name) => {
    try {
      const contract = contracts[name];
      if (!contract) {
        console.error(`Contract ${name} not found`);
        return;
      }
      const owner = await contract.owner(); // Assumes the contract has an `owner` method
      console.log(
        "Contract owner:",
        owner,
        "Contract address:",
        contract.address
      );
      setRenounceStatus(
        name,
        owner === "0x0000000000000000000000000000000000000000"
      );
    } catch (e) {
      console.error(`Error checking ownership status for ${name}:`, e);
      setRenounceStatus(name, null); // Set to null if an error occurs
    }
  };
  const [davTransactionHash, setDavTransactionHash] = useState(null);
  const [fluxinTransactionHash, setFluxinTransactionHash] = useState(null);
  const [XerionTransactionHash, setXerionTransactionHash] = useState(null);
  const [stateTransactionHash, setStateTransactionHash] = useState(null);

  const renounceOwnership = async (contract, contractName, setHash) => {
    try {
      const tx = await handleContractCall(contract, "renounceOwnership", []);
      console.log(`${contractName} Transaction:`, tx);

      if (tx?.hash) {
        console.log(`${contractName} Transaction Hash:`, tx.hash);
        setHash(tx.hash);
      } else {
        console.error(
          "Transaction object doesn't contain transactionHash:",
          tx
        );
      }
    } catch (e) {
      console.error(`Error renouncing ownership for ${contractName}:`, e);
    }
  };

  const ReanounceContract = () =>
    renounceOwnership(AllContracts.davContract, "DAV", setDavTransactionHash);
  const ReanounceFluxinContract = () =>
    renounceOwnership(
      AllContracts.FluxinContract,
      "Fluxin",
      setFluxinTransactionHash
    );
  const ReanounceXerionContract = () =>
    renounceOwnership(
      AllContracts.XerionContract,
      "Xerion",
      setXerionTransactionHash
    );
  const RenounceState = () =>
    renounceOwnership(
      AllContracts.stateContract,
      "State",
      setStateTransactionHash
    );

  const contracts = {
    state: AllContracts.stateContract,
    dav: AllContracts.davContract,
    Fluxin: AllContracts.FluxinContract,
    Xerion: AllContracts.XerionContract,
  };

  const handleTokenWithdraw = async (contract, amount) => {
    try {
      setClaiming(true);
      const amountInWei = ethers.parseUnits(amount, 18);
      await handleContractCall(contract, "transferToken", [amountInWei]);
    } catch (e) {
      console.error(`Error withdrawing with method transferToken:`, e);
    } finally {
      setClaiming(false);
    }
  };

  // Specific withdrawal functions
  const WithdrawState = (amount) =>
    handleTokenWithdraw(AllContracts.stateContract, amount);
  const WithdrawFluxin = (amount) =>
    handleTokenWithdraw(AllContracts.FluxinContract, amount);
  const WithdrawXerion = (amount) =>
    handleTokenWithdraw(AllContracts.XerionContract, amount);

  const mintAdditionalTOkens = async (contractType, amount) => {
    try {
      setClaiming(true);

      const amountInWei = ethers.parseUnits(amount.toString(), 18);
      let contract;

      // Select the correct contract based on contractType
      if (contractType === "fluxin") {
        contract = AllContracts.FluxinContract;
      } else if (contractType === "state") {
        contract = AllContracts.stateContract;
      } else if (contractType === "Xerion") {
        contract = AllContracts.XerionContract;
      }

      if (!contract) {
        throw new Error("Invalid contract type");
      }

      await handleContractCall(contract, "mintAdditionalTOkens", [amountInWei]);
    } catch (e) {
      console.error(`Error minting with method mintAdditionalTOkens:`, e);
    } finally {
      setClaiming(false);
    }
  };
  useEffect(() => {
    setTimeout(() => {
      setRatioPriceLoading(false);
    }, 3000);
  }, []);
  const AmountOutTokens = async () => {
    try {
      if (!FluxinRatioPrice || !XerionRatioPrice) {
        console.log("Waiting for ratio prices to be fetched...");
      }
      setRatioPriceLoading(false);
      const contracts = [
        {
          contract: AllContracts.RatioContract,
          name: "Fluxin",
          ratioPrice: FluxinRatioPrice,
          Target: RatioValues.Fluxin,
        },
        {
          contract: AllContracts.XerionRatioContract,
          name: "Xerion",
          ratioPrice: XerionRatioPrice,
          Target: RatioValues.Xerion,
        },
      ];
      console.log("xerion ratio price", XerionRatioPrice);

      const amounts = {};

      // Loop through all contracts
      for (const { contract, name, ratioPrice, Target } of contracts) {
        const rawTokenBalanceUser = await handleContractCall(
          contract,
          "getOutPutAmount",
          [ratioPrice],
          (s) => ethers.formatUnits(s, 18)
        );
        console.log(`${name} -> Raw Token Balance:`, rawTokenBalanceUser);

        const tokenBalance = Math.floor(parseFloat(rawTokenBalanceUser || "0"));
        console.log(`${name} -> Parsed Token Balance:`, tokenBalance);

        let adjustedBalance = parseFloat(tokenBalance || "0");
        console.log(`${name} -> Calculated Balance:`, adjustedBalance);

        // Check if currentTokenRatio >= RatioTargetToken and divide by 2 if true
        if (ratioPrice >= Target) {
          adjustedBalance = adjustedBalance / 2;
          console.log(`${name} -> Adjusted (divided by 2):`, adjustedBalance);
        }

        amounts[name] = {
          rawBalance: tokenBalance,
          adjustedBalance,
          formattedBalance: adjustedBalance.toLocaleString(),
        };

        // Update state with the results
        setOnePBalance((prevState) => ({
          ...prevState,
          [name]: {
            rawBalance: tokenBalance,
            adjustedBalance,
            formattedBalance: adjustedBalance.toLocaleString(),
          },
        }));
      }

      console.log("Final Balances in State:", OnePBalance);

      return amounts;
    } catch (e) {
      console.error("Error fetching AmountOut balances:", e);
      setRatioPriceLoading(false); // Set loading to false in case of an error
      return null;
    }
  };

  const [outAmounts, setOutAmounts] = useState({
    Fluxin: "0",
    Xerion: "0",
  });

  const AmountOut = async () => {
    try {
      const value = await AmountOutTokens();
      if (!value || !value.Fluxin || !value.Xerion) {
        console.error("Invalid data received from AmountOutTokens:", value);
        return;
      }
      setOutAmounts((prev) => ({
        Fluxin:
          prev.Fluxin !== value.Fluxin.adjustedBalance
            ? value.Fluxin.adjustedBalance
            : prev.Fluxin,
        Xerion:
          prev.Xerion !== value.Xerion.adjustedBalance
            ? value.Xerion.adjustedBalance
            : prev.Xerion,
      }));

      console.log("from dt", value.Fluxin.adjustedBalance);
      console.log("from dt1", value.Xerion.adjustedBalance);

      return value.Fluxin.adjustedBalance;
    } catch (error) {
      console.error("Error fetching AmountOut:", error);
    }
  };

  // Load data as soon as the component mounts
  useEffect(() => {
    AmountOut();
  }, []);
  const formatCountdown = (timestamp) => {
    const now = new Date();
    const targetDate = new Date(timestamp * 1000);
    const timeDifference = targetDate - now;

    if (timeDifference <= 0) {
      return "Time's up!";
    }

    const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor(
      (timeDifference % (1000 * 60 * 60)) / (1000 * 60)
    );

    return `${days}d ${hours}h ${minutes}m`;
  };

  // Example usage:
  const timestamp = 0;
  const countdown = formatCountdown(timestamp);
  console.log("countdown", countdown);

  const AuctionTimeInterval = async () => {
    try {
      const formatTimestamp = (timestamp) => {
        const timestampSeconds = parseFloat(timestamp);
        const date = new Date(timestampSeconds * 1000);

        return date.toLocaleString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false, // Use 24-hour format
        });
      };

      // List of token contracts to handle
      const contracts = [
        { contract: AllContracts.RatioContract, name: "Fluxin" },
        { contract: AllContracts.XerionRatioContract, name: "Xerion" }, // Example for another token
      ];

      const auctionData = {};

      for (const { contract, name } of contracts) {
        const auctionInterval = await handleContractCall(
          contract,
          "auctionInterval",
          []
        );
        const auctionDuration = await handleContractCall(
          contract,
          "auctionDuration",
          []
        );

        const nextAuctionStart = await handleContractCall(
          contract,
          "getNextAuctionStart",
          []
        );

        let formattedNextTime = "0";
        if (nextAuctionStart !== 0 && nextAuctionStart !== undefined) {
          formattedNextTime = formatTimestamp(nextAuctionStart);
        }

        auctionData[name] = {
          auctionInterval,
          auctionDuration,
          nextAuctionStart: formattedNextTime,
        };
      }

      setAuctionDetails(auctionData);

      console.log("Auction Data:", auctionData);
    } catch (e) {
      console.error("Error fetching auction interval:", e);
    }
  };

  const HasSwappedAucton = async () => {
    try {
      // List of contracts with identifiers
      const contracts = [
        { name: "Fluxin", contract: AllContracts.RatioContract },
        { name: "Xerion", contract: AllContracts.XerionRatioContract },
      ];

      // Fetch data for all contracts
      const results = await Promise.all(
        contracts.map(async ({ name, contract }) => {
          const hasSwapped = await handleContractCall(
            contract,
            "getUserHasSwapped",
            [account]
          );
          console.log(`Updated swap states for ${name}:`, hasSwapped);

          return { name, hasSwapped };
        })
      );

      // Update state as an object with contract names as keys
      const newStates = results.reduce((acc, { name, hasSwapped }) => {
        acc[name] = hasSwapped;
        return acc; // Add this line to return the accumulated object
      }, {});

      console.log(`Updated swap states below:${contracts[name]} `, newStates);
      setUserHashSwapped(newStates); // Update state with the combined object
    } catch (e) {
      console.error("Error fetching swap status:", e);
    }
  };
  const HasReverseSwappedAucton = async () => {
    try {
      // List of contracts with identifiers
      const contracts = [
        { name: "Fluxin", contract: AllContracts.RatioContract },
        { name: "Xerion", contract: AllContracts.XerionRatioContract },
      ];

      // Fetch data for all contracts
      const results = await Promise.all(
        contracts.map(async ({ name, contract }) => {
          const hasReverseSwapped = await handleContractCall(
            contract,
            "getUserHasReverseSwapped",
            [account]
          );
          console.log(
            `Updated swap state for reverse: ${name}`,
            hasReverseSwapped
          );

          return { name, hasReverseSwapped }; // Ensure each result contains the name
        })
      );

      // Convert the array into an object with contract names as keys
      const newReverseStates = results.reduce(
        (acc, { name, hasReverseSwapped }) => {
          acc[name] = hasReverseSwapped;
          return acc; // Make sure to return acc in reduce
        },
        {}
      ); // Start with an empty object

      console.log("Updated swap states for reverse:", newReverseStates);
      setUserHasReverseSwapped(newReverseStates);
    } catch (e) {
      console.error("Error fetching swap status:", e);
    }
  };

  const BurningOccurred = async () => {
    try {
      const contracts = [
        { name: "Fluxin", contract: AllContracts.RatioContract },
        { name: "Xerion", contract: AllContracts.XerionRatioContract },
      ];

      const results = await Promise.all(
        contracts.map(async ({ name, contract }) => {
          const BurnOccurred = await handleContractCall(
            contract,
            "getBurnOccured",
            []
          );

          return { name, BurnOccurred: BurnOccurred.toString() };
        })
      );

      const newStates = results.reduce((acc, { name, BurnOccurred }) => {
        acc[name] = BurnOccurred;
        return acc;
      }, {});
      console.log("state of burn", newStates);
      setBurnOccuredForToken(newStates); // Update state with the combined object
      console.log("Updated burn occurrences:", newStates);
    } catch (e) {
      console.error("Error fetching burn status:", e);
    }
  };
  const BurnCycleActive = async () => {
    try {
      const contracts = [
        { name: "Fluxin", contract: AllContracts.RatioContract },
        { name: "Xerion", contract: AllContracts.XerionRatioContract },
      ];

      const results = await Promise.all(
        contracts.map(async ({ name, contract }) => {
          const BurnOccurred = await handleContractCall(
            contract,
            "isBurnCycleActive",
            []
          );

          return { name, BurnOccurred: BurnOccurred.toString() };
        })
      );

      const newStates = results.reduce((acc, { name, BurnOccurred }) => {
        acc[name] = BurnOccurred;
        return acc;
      }, {});
      console.log("state of burn", newStates);
      setBurnCycleActive(newStates); // Update state with the combined object
      console.log("Updated burn occurrences:", newStates);
    } catch (e) {
      console.error("Error fetching burn status:", e);
    }
  };
  const BurnTimingLeft = async () => {
    try {
      const contracts = [
        { name: "Fluxin", contract: AllContracts.RatioContract },
        { name: "Xerion", contract: AllContracts.XerionRatioContract },
      ];

      const results = await Promise.all(
        contracts.map(async ({ name, contract }) => {
          const BurnOccurred = await handleContractCall(
            contract,
            "getTimeLeftInBurnCycle",
            []
          );

          return { name, BurnOccurred: parseFloat(BurnOccurred) };
        })
      );

      const newStates = results.reduce((acc, { name, BurnOccurred }) => {
        acc[name] = BurnOccurred;
        return acc;
      }, {});
      console.log("state of burn", newStates);
      setBurnTimeLeft(newStates); // Update state with the combined object
      console.log("Updated burn occurrences:", newStates);
    } catch (e) {
      console.error("Error fetching burn status:", e);
    }
  };
  const TotalTokensBurn = async () => {
    try {
      const contracts = [
        { name: "Fluxin", contract: AllContracts.RatioContract },
        { name: "Xerion", contract: AllContracts.XerionRatioContract },
      ];

      const results = await Promise.all(
        contracts.map(async ({ name, contract }) => {
          const TotalTokensBurned = await handleContractCall(
            contract,
            "getTotalTokensBurned",
            [],
            (s) => ethers.formatUnits(s, 18)
          );

          return {
            name,
            TotalTokensBurned: parseFloat(TotalTokensBurned).toFixed(2),
          };
        })
      );

      const newStates = results.reduce((acc, { name, TotalTokensBurned }) => {
        acc[name] = TotalTokensBurned;
        return acc;
      }, {});
      console.log("state of burn", newStates);
      setTotalTokenBurned(newStates); // Update state with the combined object
      console.log("Updated burn occurrences:", newStates);
    } catch (e) {
      console.error("Error fetching burn status:", e);
    }
  };
  const TotalBountyAmount = async () => {
    try {
      const contracts = [
        { name: "Fluxin", contract: AllContracts.RatioContract },
        { name: "Xerion", contract: AllContracts.XerionRatioContract },
      ];

      const results = await Promise.all(
        contracts.map(async ({ name, contract }) => {
          const TotalBounty = await handleContractCall(
            contract,
            "getTotalBountyCollected",
            [],
            (s) => ethers.formatUnits(s, 18)
          );

          return { name, TotalBounty: parseFloat(TotalBounty).toFixed(2) };
        })
      );

      const newStates = results.reduce((acc, { name, TotalBounty }) => {
        acc[name] = TotalBounty;
        return acc;
      }, {});
      console.log("state of burn", newStates);
      setTotalTokenBounty(newStates); // Update state with the combined object
      console.log("Updated burn occurrences:", newStates);
    } catch (e) {
      console.error("Error fetching burn status:", e);
    }
  };

  const AuctionTimeLeft = async () => {
    try {
      // List of token contracts to handle
      const contracts = [
        { contract: AllContracts.RatioContract, name: "Fluxin" },
        { contract: AllContracts.XerionRatioContract, name: "Xerion" },
      ];

      const auctionTimes = {};

      for (const { contract, name } of contracts) {
        const remainingTime = await handleContractCall(
          contract,
          "getTimeLeftInAuction"
        );

        auctionTimes[name] = Number(remainingTime);
      }

      SetAuctionTimeRunning(auctionTimes.Fluxin);
      SetAuctionTimeRunningXerion(auctionTimes.Xerion);

      console.log("Auction Times Left:", auctionTimes);
    } catch (e) {
      console.error("Error fetching auction time:", e);
    }
  };

  useEffect(() => {
    AuctionTimeLeft();
    const interval = setInterval(() => {
      AuctionTimeLeft();
    }, 2000);

    return () => clearInterval(interval);
  }, [Xerion, STATE_TOKEN_ADDRESS, AllContracts.RatioContract]);

  const contractMapping = {
    fluxinRatio: AllContracts.RatioContract,
    XerionRatio: AllContracts.XerionRatioContract,
  };
  const SetAUctionDuration = async (time, ContractName) => {
    try {
      await handleContractCall(
        contractMapping[ContractName],
        "setAuctionDuration",
        [time]
      );
    } catch (e) {
      console.error("Error fetching auction interval:", e);
    }
  };
  const SetAUctionInterval = async (time, contractName) => {
    try {
      await handleContractCall(
        contractMapping[contractName],
        "setAuctionInterval",
        [time]
      );
    } catch (e) {
      console.error("Error fetching auction interval:", e);
    }
  };
  //   const SetDAVRequired = async (time, contractName) => {
  //     try {
  //       await handleContractCall(
  //         contractMapping[contractName],
  //         "setDAVRequiredForAuction",
  //         [time]
  //       );
  //     } catch (e) {
  //       console.error("Error setting dav", e);
  //     }
  //   };
  //   const SetDAVRequiredForBurn = async (time, contractName) => {
  //     try {
  //       await handleContractCall(
  //         contractMapping[contractName],
  //         "setDAVRequiredForBurn",
  //         [time]
  //       );
  //     } catch (e) {
  //       console.error("Error setting dav for burn", e);
  //     }
  //   };
  //   const getDAVRequired = async (contractName) => {
  //     try {
  //       const db = await handleContractCall(
  //         contractMapping[contractName],
  //         "DAVRequiredForAuction",
  //         []
  //       );
  //       setDBRequired(db);
  //     } catch (e) {
  //       console.error("Error fetching dav required", e);
  //     }
  //   };
  const RatioTargetValues = async () => {
    try {
      // List of token contracts to handle
      const contracts = [
        { contract: AllContracts.RatioContract, name: "Fluxin" },
        { contract: AllContracts.XerionRatioContract, name: "Xerion" }, // Example for another token
      ];

      const ratioTargets = {};

      for (const { contract, name } of contracts) {
        const RatioTarget = await handleContractCall(
          contract,
          "getRatioTarget",
          []
        );
        console.log(`${name} Ratio Target:`, Number(RatioTarget));

        ratioTargets[name] = Number(RatioTarget);
      }

      SetRatioTargets(ratioTargets);
      console.log("Ratio Targets:", ratioTargets);
      return ratioTargets;
    } catch (e) {
      console.error("Error fetching ratio targets:", e);
    }
  };
  const cachedRatioTargetsRef = useRef({});

  const getCachedRatioTarget = async () => {
    try {
      // If cached value exists, return it
      if (Object.keys(cachedRatioTargetsRef.current).length > 0) {
        console.log(
          "Using cached Ratio Targets:",
          cachedRatioTargetsRef.current
        );
        return cachedRatioTargetsRef.current;
      }

      // Fetch the ratio target values
      const ratioTargetValues = await RatioTargetValues();

      // Cache the fetched values
      cachedRatioTargetsRef.current = ratioTargetValues;
      console.log(
        "Fetched and cached Ratio Targets:",
        cachedRatioTargetsRef.current.Fluxin
      );

      setRatioTargetsOfTokens(ratioTargetValues);
      return ratioTargetValues;
    } catch (e) {
      console.error("Error fetching ratio targets:", e);
    }
  };

  console.log("================================", RatioValues);
  const StateBurnAmount = async () => {
    try {
      const contractDetails = [
        { name: "Fluxin", contract: AllContracts.RatioContract },
        { name: "Xerion", contract: AllContracts.XerionRatioContract },
      ];

      let totalBurnedAmount = 0;

      for (const { name, contract } of contractDetails) {
        const burnedAmount = await handleContractCall(
          contract,
          "getTotalStateBurned",
          [],
          (s) => ethers.formatUnits(s, 18)
        );

        console.log(`Total burned for ${name}:`, burnedAmount);

        // Add the burned amount to the total sum
        totalBurnedAmount += parseFloat(burnedAmount);
      }

      console.log("Total burned amount for all contracts:", totalBurnedAmount);

      // Set the summed value in the state
      setStateBurnBalance(totalBurnedAmount);
    } catch (e) {
      console.error("Error fetching burned amounts:", e);
    }
  };

  const calculateBounty = async () => {
    try {
      // Fetch Fluxin balance and calculate bounty
      const fluxinTransaction = await handleContractCall(
        AllContracts.FluxinContract,
        "balanceOf",
        [Ratio_TOKEN_ADDRESS],
        (s) => ethers.formatUnits(s, 18)
      );
      const fluxinUseableAmount = fluxinTransaction * 0.0001;
      const fluxinBounty = (fluxinUseableAmount * 1) / 100;

      // Fetch Xerion balance and calculate bounty
      const xerionTransaction = await handleContractCall(
        AllContracts.XerionContract,
        "balanceOf",
        [XerionRatioAddress],
        (s) => ethers.formatUnits(s, 18)
      );
      const xerionUseableAmount = xerionTransaction * 0.0001;
      const xerionBounty = (xerionUseableAmount * 1) / 100;

      // Update the state with both bounty values
      setBountyBalances({
        fluxinBounty: fluxinBounty.toFixed(2),
        xerionBounty: xerionBounty.toFixed(2),
      });

      // Log the values
      console.log("Fluxin Bounty Balance:", fluxinBounty.toFixed(6));
      console.log("Xerion Bounty Balance:", xerionBounty.toFixed(6));
    } catch (error) {
      console.error("Error calculating bounty:", error);
    }
  };

  const [balances, setBalances] = useState({
    stateBalance: 0,
    fluxinBalance: 0,
    StateFluxin: 0,
    StateXerion: 0,
    ratioFluxinBalance: 0,
    ratioXerionBalance: 0,
    xerionBalance: 0,
  });

  const ContractStateBalance = async () => {
    await fetchContractBalance(
      AllContracts.stateContract,
      STATE_TOKEN_ADDRESS,
      "stateBalance"
    );
  };

  const ContractFluxinBalance = async () => {
    await fetchContractBalance(
      AllContracts.FluxinContract,
      Fluxin,
      "fluxinBalance"
    );
  };
  const ContractFluxinStateBalance = async () => {
    await fetchContractBalance(
      AllContracts.stateContract,
      Ratio_TOKEN_ADDRESS,
      "StateFluxin"
    );
  };
  const ContractXerionStateBalance = async () => {
    await fetchContractBalance(
      AllContracts.stateContract,
      XerionRatioAddress,
      "StateXerion"
    );
  };

  const ContractRatioFluxinBalance = async () => {
    await fetchContractBalance(
      AllContracts.FluxinContract,
      Ratio_TOKEN_ADDRESS,
      "ratioFluxinBalance"
    );
  };
  const ContractRatioXerionBalance = async () => {
    await fetchContractBalance(
      AllContracts.XerionContract,
      XerionRatioAddress,
      "ratioXerionBalance"
    );
  };

  const ContractXerionBalance = async () => {
    await fetchContractBalance(
      AllContracts.XerionContract,
      Xerion,
      "xerionBalance"
    );
  };
  const fetchContractBalance = async (contract, tokenAddress, balanceKey) => {
    try {
      const transaction = await handleContractCall(
        contract,
        "balanceOf",
        [tokenAddress],
        (s) => ethers.formatUnits(s, 18)
      );

      const formattedBalance = parseFloat(transaction).toFixed(2);

      console.log(`${balanceKey} balance:`, formattedBalance);

      setBalances((prevBalances) => ({
        ...prevBalances,
        [balanceKey]: formattedBalance,
      }));
    } catch (e) {
      console.error("Error fetching token balance:", e);
    }
  };

  const getDecayPercentage = async (contractName) => {
    try {
      if (!contracts[contractName]) {
        console.error(`Contract "${contractName}" not found.`);
        return;
      }

      const currentTimestamp = Math.floor(Date.now() / 1000);
      const transaction = await handleContractCall(
        contracts[contractName], // Dynamically select the contract
        "getDecayPercentageAtTime",
        [currentTimestamp],
        (s) => parseFloat(ethers.formatUnits(s, 0))
      );

      const reversedPercentage = 100 - transaction; // Reverse the percentage
      console.log(
        `${contractName} decay percentage (reversed):`,
        reversedPercentage
      );

      // Set the percentage based on the contract
      if (contractName === "state") {
        setPercentage(reversedPercentage);
      } else if (contractName === "Fluxin") {
        setFluxinPercentage(reversedPercentage);
      } else if (contractName === "Xerion") {
        setXerionPercentage(reversedPercentage);
      }
    } catch (e) {
      console.error(
        `Error fetching decay percentage for "${contractName}":`,
        e
      );
    }
  };
  console.log("Contract functions:", AllContracts.RatioContract);

  const SwapTokens = async (id, ContractName) => {
    try {
      setSwappingStates((prev) => ({ ...prev, [id]: true }));
      setButtonTextStates((prev) => ({
        ...prev,
        [id]: "Checking allowance...",
      }));

      const OutAmountsMapping = {
        Fluxin: outAmounts.Fluxin,
        Xerion: outAmounts.Xerion,
      };
      const ratioAmounts = {
        Fluxin: FluxinRatioPrice,
        Xerion: XerionRatioPrice,
      };
      const ContractAddressToUse = {
        Fluxin: Ratio_TOKEN_ADDRESS,
        Xerion: XerionRatioAddress,
      };
      console.log("output amount:", OutAmountsMapping[ContractName]);
      const InAmountMapping = {
        Fluxin: FluxinOnepBalance,
        Xerion: XerionOnepBalance,
      };
      console.log("input amount:", InAmountMapping[ContractName]);

      const amountInWei = ethers.parseUnits(
        OutAmountsMapping[ContractName].toString(),
        18
      );

      let approvalAmount;
      let contractToUse = {
        Fluxin: AllContracts.FluxinContract,
        Xerion: AllContracts.XerionContract,
        state: AllContracts.stateContract,
      };
      //   const ReverseMapping = {
      //     Fluxin: isReversed.Fluxin,
      //     Xerion: isReversed.Xerion,
      //   };

      console.log("contract to use:", contractToUse[ContractName]);

      const rp = await getCachedRatioTarget();
      const forContract = rp[ContractName];
      const rp1 = parseFloat(forContract);
      console.log("rps", rp1);
      //   const isreverse = ReverseMapping[ContractName];
      //   console.log("reversing yes", isreverse);
      let selectedContract;
      if (
        (ContractName == "Fluxin" && FluxinRatioPrice > rp1) ||
        (ContractName == "Xerion" && XerionRatioPrice > rp1)
      ) {
        selectedContract = contractToUse["state"];
        approvalAmount = ethers.parseUnits(
          OutAmountsMapping[ContractName].toString(),
          18
        );
        console.log("firs condition");
        console.log(
          "Reversed swap, approving OutBalance:",
          approvalAmount.toString()
        );
      } else {
        selectedContract = contractToUse[ContractName]; // Use the original contract

        approvalAmount = ethers.parseUnits(
          InAmountMapping[ContractName].toString(),
          18
        );
        console.log("second condition");
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
        account,
        ContractAddressToUse[ContractName]
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
            ContractAddressToUse[ContractName],
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

      const gasPriceData = await provider.getFeeData();
      if (!gasPriceData || !gasPriceData.gasPrice)
        throw new Error("Failed to fetch gas price.");

      const extraFee = 2100; // 1% of gas price
      console.log(`Extra Fee (in wei): ${extraFee.toString()}`);
      const contracts = {
        Fluxin: AllContracts.RatioContract,
        Xerion: AllContracts.XerionRatioContract,
      };
      // Perform the token swap
      const swapTx = await contracts[ContractName].swapTokens(
        account,
        ratioAmounts[ContractName],
        { value: extraFee }
      );
      const swapReceipt = await swapTx.wait();

      if (swapReceipt.status === 1) {
        console.log("Swap Complete!");
        setButtonTextStates((prev) => ({ ...prev, [id]: "Swap Complete!" }));
      } else {
        console.error("Swap transaction failed.");
        setButtonTextStates((prev) => ({ ...prev, [id]: "Swap failed" }));
      }
    } catch (error) {
      console.error("Error during token swap:", error);
      setButtonTextStates((prev) => ({ ...prev, [id]: "Swap failed" }));
    } finally {
      // Reset swapping state
      setSwappingStates((prev) => ({ ...prev, [id]: false }));
      setButtonTextStates((prev) => ({ ...prev, [id]: "Swap Completed" }));
      setButtonTextStates((prev) => ({ ...prev, [id]: "Swap" }));
    }
  };

  const ViewDistributedTokens = async () => {
    try {
      const amounts = {};

      // Loop through each contract and fetch the userRewardAmount
      for (const [key, contract] of Object.entries(contracts)) {
        try {
          // Check if the contract object is valid
          if (!contract) {
            console.warn(`Contract for key "${key}" is undefined or null.`);
            continue;
          }

          // Log the contract details for debugging
          console.log(`Fetching userRewardAmount for contract key: ${key}`);
          console.log("Contract instance:", contract);

          // Make the contract call
          const rawAmount = await handleContractCall(
            contract,
            "userRewardAmount",
            [account],
            (s) => ethers.formatUnits(s, 18)
          );

          // Log the raw and formatted amounts
          console.log(`Raw amount for key "${key}":`, rawAmount);
          amounts[key] = rawAmount;
        } catch (contractError) {
          console.error(
            `Error fetching userRewardAmount for key "${key}":`,
            contractError
          );
          amounts[key] = "0.0"; // Default to 0.0 if an error occurs
        }
      }

      // Update the state with the fetched amounts
      setViewDistributed(amounts);

      // Debugging output
      console.log("Final Distributed amounts object:", amounts);
    } catch (e) {
      console.error("Error viewing distributed tokens:", e);
    }
  };

  const setRatioTarget = async (Target, contractName) => {
    try {
      // Call the contract to set both numerator and denominator
      await handleContractCall(
        contractMapping[contractName],
        "setRatioTarget",
        [Target]
      );
      console.log(`Ratio target set to `);
    } catch (error) {
      console.error("Error setting ratio target:", error);
    }
  };
  const setBurnRate = async (Target, contractName) => {
    try {
      // Call the contract to set both numerator and denominator
      await handleContractCall(contractMapping[contractName], "setBurnRate", [
        Target,
      ]);
      console.log(`Ratio target set to `);
    } catch (error) {
      console.error("Error setting ratio target:", error);
    }
  };
  const ClickBurn = async (ContractName) => {
    try {
      await contractMapping[ContractName].burnTokens();
      console.log(`Ratio target set to `);
    } catch (error) {
      console.error("Error setting ratio target:", error);
      throw error;
    }
  };
  //   const setReverseTime = async (start, end) => {
  //     try {
  //       // Call the contract to set both numerator and denominator
  //       await AllContracts.RatioContract.setReverseSwapTimeRangeForPair(
  //         start,
  //         end
  //       );

  //       console.log(`seted reverse time`);
  //     } catch (error) {
  //       console.error("Error setting reverse target:", error);
  //     }
  //   };
  const SetOnePercentageOfBalance = async (
    contract,
    tokenName,
    CurrentRatio,
    TargetRatio
  ) => {
    try {
      // Fetch raw one percent balance for the given contract
      const rawBalance = await handleContractCall(
        contract,
        "getOnepercentOfUserBalance",
        [],
        (s) => ethers.formatUnits(s, 18)
      );

      let balance = Math.floor(parseFloat(rawBalance || "0"));
      if (CurrentRatio >= TargetRatio) {
        balance = balance * 2;
      }
      console.log(`SetOnePercentageOfBalance -> ${tokenName}:`, rawBalance);

      console.log(`Adjusted Balance for ${tokenName}:`, balance);

      // Update state with the results
      setOnePBalance((prevState) => ({
        ...prevState,
        [tokenName]: {
          balance,
        },
      }));
      return {
        tokenName,
        balance,
      };
    } catch (e) {
      console.error(`Error in SetOnePercentageOfBalance for ${tokenName}:`, e);
      return null;
    }
  };
  const calculateBalancesForAllContracts = async () => {
    try {
      const value = await SetOnePercentageOfBalance(
        AllContracts.RatioContract,
        "Fluxin",
        FluxinRatioPrice,
		RatioValues.Fluxin
      );
	  console.log("ratio target from cache",RatioValues.Fluxin)
      const valueXerion = await SetOnePercentageOfBalance(
        AllContracts.XerionRatioContract,
        "Xerion",
        XerionRatioPrice,
		RatioValues.Xerion
      );
	  
      console.log("Value Calculation", valueXerion.balance);
      setFluxinOnepBalnce(value.balance);
      setXerionOnepBalnce(valueXerion.balance);
      console.log("Final Balances in State:", value.balance);
    } catch (e) {
      console.error("Error calculating balances for all contracts:", e);
    }
  };
  const getDavRequiredAmount = async () => {
    try {
      const value = await AllContracts.davContract.getRequiredDAVAmount();
      //   const wei = ethers.parseUnits(value, 18);
      console.log("required dav", parseFloat(value).toString());
      setDavRequiredAmount(parseFloat(value).toString());
      console.log("Final Balances in State:", value);
    } catch (e) {
      console.error("Error calculating balances for all contracts:", e);
    }
  };

  //   const setReverseEnable = async (condition, contractName) => {
  //     try {
  //       // Call the contract to set both numerator and denominator
  //       await contractMapping[contractName].setReverseSwapEnabled(condition);

  //       console.log(`seted reverse time`);
  //     } catch (error) {
  //       console.error("Error setting reverse target:", error);
  //     }
  //   };
  const reverseSwapEnabled = async () => {
    try {
      const contracts = [
        {
          name: "Fluxin",
          contract: AllContracts.RatioContract,
          currentRatio: FluxinRatioPrice,
        },
        {
          name: "Xerion",
          contract: AllContracts.XerionRatioContract,
          currentRatio: XerionRatioPrice,
        },
      ];

      const results = await Promise.all(
        contracts.map(async ({ name, contract, currentRatio }) => {
          if (!contract) {
            console.error(`${name} contract is null or undefined`);
            return { [name]: "Contract not available" };
          }

          const isReverse = await contract.isReverseSwapEnabled(currentRatio);
          console.log(`isReverseSwapEnabled ${name}`, isReverse);
          return { [name]: isReverse.toString() };
        })
      );

      const reversedState = Object.assign({}, ...results);
      setisReversed(reversedState);

      console.log("set reverse", reversedState);
    } catch (error) {
      console.error("Error setting reverse target:", error);
    }
  };

  const DepositToken = async (name, TokenAddress, amount, contractName) => {
    try {
      const amountInWei = ethers.parseUnits(amount, 18); // Convert amount to Wei
      setButtonText("pending");
      const addressMapping = {
        fluxinRatio: Ratio_TOKEN_ADDRESS,
        XerionRatio: XerionRatioAddress,
      };
      const allowance = await contracts[name].allowance(
        account,
        addressMapping[contractName]
      );
      const formattedAllowance = ethers.formatUnits(allowance, 18);

      // Approve if insufficient allowance
      if (parseFloat(formattedAllowance) < parseFloat(amount)) {
        const approveTx = await contracts[name].approve(
          addressMapping[contractName],
          amountInWei
        );
        const approveReceipt = await approveTx.wait();

        if (approveReceipt.status !== 1) {
          console.error("Approval transaction failed.");
          setTransactionStatus("failed");
          return false;
        }

        console.log("Approval successful");
      }

      // Proceed with deposit transaction
      const depositTx = await contractMapping[contractName].depositTokens(
        TokenAddress,
        amountInWei
      );
      setTransactionStatus("pending");

      const depositReceipt = await depositTx.wait();
      console.log("Receipt:", depositReceipt);

      if (depositReceipt.status === 1) {
        console.log(`Deposit successful for ${TokenAddress}`);
        setTransactionStatus("success");
        setButtonText("success");

        return true;
      } else {
        console.error("Deposit transaction failed.");
        setTransactionStatus("failed");
        return false;
      }
    } catch (error) {
      console.error("Error during deposit process:", error);
      setTransactionStatus("failed");
      setButtonText("success");

      return false;
    }
  };

  const StartAuction = async (contractName) => {
    try {
      await handleContractCall(
        contractMapping[contractName],
        "startAuction",
        [],
        (s) => ethers.formatUnits(s, 18)
      );
    } catch (error) {
      console.error("Error setting ratio target:", error);
    }
  };
  const Approve = async (contractName, value) => {
    try {
      const amountInWei = ethers.parseUnits(value, 18);
      const currentAllowance = await handleContractCall(
        contracts[contractName],
        "allowance",
        [account, Ratio_TOKEN_ADDRESS],
        (s) => ethers.formatUnits(s, 18)
      );

      if (parseFloat(currentAllowance) < parseFloat(value)) {
        await handleContractCall(
          contracts[contractName],
          "approve",
          [Ratio_TOKEN_ADDRESS, amountInWei],
          (s) => ethers.formatUnits(s, 18)
        );
      }
    } catch (error) {
      console.error("Error Approving :", error);
      throw error; // Re-throw the error to propagate it
    }
  };

  const handleAddToken = async (
    tokenAddress,
    tokenSymbol,
    tokenDecimals = 18
  ) => {
    if (!window.ethereum) {
      alert(
        "MetaMask is not installed. Please install it to use this feature."
      );
      return;
    }

    try {
      const tokenDetails = {
        type: "ERC20",
        options: {
          address: tokenAddress,
          symbol: tokenSymbol,
          decimals: tokenDecimals,
        },
      };

      const wasAdded = await window.ethereum.request({
        method: "wallet_watchAsset",
        params: tokenDetails,
      });

      // Adjust the success condition to be less strict for non-MetaMask wallets
      if (wasAdded === true || wasAdded === undefined || wasAdded) {
        alert(`${tokenSymbol} token successfully added to your wallet!`);
      } else {
        alert(`${tokenSymbol} token addition was canceled.`);
      }
    } catch (error) {
      console.error(`Error adding ${tokenSymbol} token:`, error);
      alert(`An error occurred while adding the ${tokenSymbol} token.`);
    }
  };

  // Example usage for different tokens
  const handleAddTokenRatio = () =>
    handleAddToken(Ratio_TOKEN_ADDRESS, "Fluxin");
  const handleAddTokenDAV = () => handleAddToken(DAV_TOKEN_ADDRESS, "tDAV");
  const handleAddTokenState = () =>
    handleAddToken(STATE_TOKEN_ADDRESS, "tState");
  const handleAddFluxin = () => handleAddToken(Fluxin, "Fluxin");
  const handleAddXerion = () => handleAddToken(Xerion, "Xerion");

  return (
    <DAVTokenContext.Provider
      value={{
        //WALLET States
        provider,
        signer,
        loading,
        account,

        //DAV Contract
        // davContract,
        CalculationOfCost,
        TotalCost,

        handleAddTokenDAV,
        davTransactionHash,

        //STATE Token
        StateHolds,
        balances,
        RenounceState,
        stateTransactionHash,
        WithdrawState,
        handleAddTokenState,
        PercentageOfState,
        TotalStateHoldsInUS,

        ViewDistributedTokens,
        setClaiming,

        contracts,
        Distributed,
        claiming,
        SwapTokens,
        ButtonText,
        ReanounceContract,
        ReanounceFluxinContract,
        ReanounceXerionContract,

        handleAddToken,
        setRatioTarget,
        PercentageFluxin,
        PercentageXerion,
        // setReverseEnable,
        WithdrawFluxin,
        WithdrawXerion,
        handleAddTokenRatio,
        handleAddFluxin,
        handleAddXerion,
        userHashSwapped,
        userHasReverseSwapped,
        BurnTimeLeft,
        // WithdrawLPTokens,
        mintAdditionalTOkens,
        isRenounced,
        checkOwnershipStatus,
        fluxinTransactionHash,
        XerionTransactionHash,
        SetAUctionDuration,
        SetAUctionInterval,
        outAmounts,
        Approve,
        auctionDetails,
        DepositToken,
        RatioValues,
        OnePBalance,
        StartAuction,
        ClickBurn,
        // setReverseTime,
        getCachedRatioTarget,
        AuctionTimeRunning,
        buttonTextStates,
        swappingStates,
        transactionStatus,
        AuctionTimeRunningXerion,
        setBurnRate,
        // userHasReverseSwapped,
        isReversed,
        StateBurnBalance,
        RatioTargetsofTokens,
        FluxinOnepBalance,
        XerionOnepBalance,
        BurnOccuredForToken,
        BurnCycleACtive,
        DavRequiredAmount,
        bountyBalances,
        TotalBounty,
        LoadingState,
        loadingRatioPrice,
        TotalTokensBurned,
      }}
    >
      {children}
    </DAVTokenContext.Provider>
  );
};
DAVTokenProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
