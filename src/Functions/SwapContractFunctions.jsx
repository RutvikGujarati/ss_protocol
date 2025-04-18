// SwapContractContext.js
import { createContext, useContext, useState, useEffect, useRef } from "react";
import { ethers } from "ethers";
import PropTypes from "prop-types";
import toast from "react-hot-toast";
import { PriceContext } from "../api/StatePrice";
import { ContractContext } from "./ContractInitialize";
import {
  $1,
  $10,
  Currus,
  CurrusRatioAddress,
  DAV_TOKEN_ADDRESS,
  DAV_TOKEN_SONIC_ADDRESS,
  Domus,
  DomusRatioAddress,
  Fluxin,
  OneDollarRatioAddress,
  Ratio_TOKEN_ADDRESS,
  Rieva,
  RievaRatioAddress,
  Sanitas,
  SanitasRatioAddress,
  STATE_TOKEN_ADDRESS,
  STATE_TOKEN_SONIC_ADDRESS,
  Teeah,
  TeeahRatioAddress,
  TenDollarRatioAddress,
  Valir,
  ValirRatioAddress,
  Xerion,
  XerionRatioAddress,
} from "../ContractAddresses";
import { useGeneralTokens } from "./GeneralTokensFunctions";
import { useGeneralAuctionFunctions } from "./GeneralAuctionFunctions";
import { useAccount, useChainId } from "wagmi";

const SwapContractContext = createContext();

export const useSwapContract = () => useContext(SwapContractContext);

export const SwapContractProvider = ({ children }) => {
  const { stateUsdPrice } = useContext(PriceContext);
  const chainId = useChainId();
  const { CurrentRatioPrice } = useGeneralTokens();
  const { isAuctionRunning, TotalTokensBurn } = useGeneralAuctionFunctions();
  const { loading, provider, signer, AllContracts } =
    useContext(ContractContext);
  const { address } = useAccount();

  const [claiming, setClaiming] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState(null); // 'pending', 'success', or

  const [TotalCost, setTotalCost] = useState(null);

  const [loadingRatioPrice, setRatioPriceLoading] = useState(true); // Loading state to show loading message

  const [ButtonText, setButtonText] = useState();
  const [isReversed, setisReversed] = useState({
    Fluxin: false,
    Xerion: false,
    Rieva: false,
    Domus: false,
    Teeah: false,
    Valir: false,
    Sanitas: false,
    Currus: false,
    TenDollar: false,
    OneDollar: false,
  });
  const [ReverseForCycle, setForCycle] = useState({
    Fluxin: false,
    Xerion: false,
    Rieva: false,
    Currus: false,
    Teeah: false,
    Sanitas: false,
    Valir: false,
    Domus: false,
    TenDollar: false,
    OneDollar: false,
  });
  const [ReverseForNextCycle, setForNextCycle] = useState({
    Fluxin: false,
    Xerion: false,
    Rieva: false,
    Valir: false,
    Teeah: false,
    Currus: false,
    Sanitas: false,
    Domus: false,
    TenDollar: false,
    OneDollar: false,
  });
  const [StateHolds, setStateHoldings] = useState("0.0");
  const [LoadingState, setLoadingState] = useState(true);

  const [TotalStateHoldsInUS, setTotalStateHoldsInUS] = useState("0.00");

  const [OnePBalance, setOnePBalance] = useState({});
  const [DavRequiredAmount, setDavRequiredAmount] = useState("0");

  const [buttonTextStates, setButtonTextStates] = useState({});
  const [swappingStates, setSwappingStates] = useState({});

  const [StateBurnBalance, setStateBurnBalance] = useState(0);
  const [RatioTargetsofTokens, setRatioTargetsOfTokens] = useState({});

  const [decayPercentages, setDecayPercentages] = useState({});

  const [userHashSwapped, setUserHashSwapped] = useState({});
  const [userHasReverseSwapped, setUserHasReverseSwapped] = useState({});
  const [RatioValues, SetRatioTargets] = useState("1000");

  const contracts = {
    state: AllContracts.stateContract,
    dav: AllContracts.davContract,
    Fluxin: AllContracts.FluxinContract,
    Rieva: AllContracts.RievaContract,
    Domus: AllContracts.DomusContract,
    Valir: AllContracts.ValirContract,
    Sanitas: AllContracts.SanitasContract,
    Teeah: AllContracts.TeeahContract,
    Currus: AllContracts.CurrusContract,
    oneD: AllContracts.oneDollar,
    TenDollar: AllContracts.TenDollarContract,
    Xerion: AllContracts.XerionContract,

    FluxinRatio: AllContracts.RatioContract,
    RievaRatio: AllContracts.RievaRatioContract,
    DomusRatio: AllContracts.DomusRatioContract,
    CurrusRatio: AllContracts.CurrusRatioContract,
    ValirRatio: AllContracts.ValirRatioContract,
    SanitasRatio: AllContracts.SanitasRatioContract,
    TeeahRatio: AllContracts.TeeahRatioContract,
    OneDollar: AllContracts.OneDollarRatioContract,
    TenDollarRatio: AllContracts.TenDollarRatioContract,
    XerionRatio: AllContracts.XerionRatioContract,
  };
  const Swapcontracts = {
    Fluxin: AllContracts.RatioContract,
    Xerion: AllContracts.XerionRatioContract,
    Rieva: AllContracts.RievaRatioContract,
    Currus: AllContracts.CurrusRatioContract,
    Domus: AllContracts.DomusRatioContract,
    Teeah: AllContracts.TeeahRatioContract,
    Valir: AllContracts.ValirRatioContract,
    Sanitas: AllContracts.SanitasRatioContract,
    OneDollar: AllContracts.OneDollarRatioContract,
    TenDollar: AllContracts.TenDollarRatioContract,
  };

  const contractMapping = {
    fluxinRatio: AllContracts.RatioContract,
    XerionRatio: AllContracts.XerionRatioContract,
    RievaRatio: AllContracts.RievaRatioContract,
    CurrusRatio: AllContracts.CurrusRatioContract,
    DomusRatio: AllContracts.DomusRatioContract,
    TeeahRatio: AllContracts.TeeahRatioContract,
    ValirRatio: AllContracts.ValirRatioContract,
    SanitasRatio: AllContracts.SanitasRatioContract,
    OneDollarRatio: AllContracts.OneDollarRatioContract,
    TenDollarRatio: AllContracts.TenDollarRatioContract,
  };

  const contractDetails = [
    { name: "Fluxin", contract: AllContracts.RatioContract },
    { name: "Xerion", contract: AllContracts.XerionRatioContract },
    {
      contract: AllContracts.RievaRatioContract,
      name: "Rieva",
    },
    {
      contract: AllContracts.DomusRatioContract,
      name: "Domus",
    },
    {
      contract: AllContracts.CurrusRatioContract,
      name: "Currus",
    },
    {
      contract: AllContracts.ValirRatioContract,
      name: "Valir",
    },
    {
      contract: AllContracts.TeeahRatioContract,
      name: "Teeah",
    },
    {
      contract: AllContracts.SanitasRatioContract,
      name: "Sanitas",
    },
    { name: "OneDollar", contract: AllContracts.OneDollarRatioContract },
    { name: "TenDollar", contract: AllContracts.TenDollarRatioContract },
  ];

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
    if (chainId == 146) {
      setTotalCost(ethers.parseEther((amount * 100).toString()));
    } else {
      setTotalCost(ethers.parseEther((amount * 500000).toString()));
    }
  };

  const fetchStateHoldingsAndCalculateUSD = async () => {
    setLoadingState(true);
    try {
      const [holdingsRaw] = await Promise.all([
        handleContractCall(
          AllContracts.stateContract,
          "balanceOf",
          [address],
          (h) => ethers.formatUnits(h, 18)
        ),
      ]);

      if (!holdingsRaw || !stateUsdPrice) {
        console.error("Invalid values for calculation:", {
          holdingsRaw,
          stateUsdPrice,
        });
        setStateHoldings("0");
        setTotalStateHoldsInUS("0.0");
        return;
      }

      const rawHoldings = parseFloat(holdingsRaw);
      const priceNum = parseFloat(stateUsdPrice); // Convert once, avoid unnecessary `Number()`

      const holdingsInUSD = rawHoldings * priceNum;

      setStateHoldings(Math.floor(rawHoldings).toLocaleString("en-US")); // Format once
      setTotalStateHoldsInUS(holdingsInUSD ? holdingsInUSD.toFixed(0) : "0.0");

      console.log(
        "Holdings:",
        rawHoldings,
        "Price:",
        priceNum,
        "Holdings in USD:",
        holdingsInUSD
      );
    } catch (error) {
      console.error("Error fetching state holdings:", error);
      setStateHoldings("0");
      setTotalStateHoldsInUS("0.0");
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
          fetchAllDecayPercentages(),
          checkOwnershipStatus(),
          getCachedRatioTarget(),
          reverseSwapEnabled(),
          CheckForCycle(),
          CheckForNextCycle(),
          StateBurnAmount(),
          fetchAllBalances(),
          AmountOut(),
          AmountOutTokens(),
          SetOnePercentageOfBalance(),
          getDavRequiredAmount(),
          HasReverseSwappedAucton(),
          HasSwappedAucton(),
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
    address,
  ]);

  // Ratio Token Contracts
  // -- auction

  const [isRenounced, setIsRenounced] = useState({}); // Empty object

  const checkOwnershipStatus = async () => {
    const contractNames = [
      "state",
      "dav",
      "Fluxin",
      "oneD",
      "Xerion",
      "TenDollar",
      "Rieva",
      "Domus",
      "Teeah",
      "Currus",
      "Valir",
      "Sanitas",
      "FluxinRatio",
      "SanitasRatio",
      "XerionRatio",
      "RievaRatio",
      "TeeahRatio",
      "CurrusRatio",
      "ValirRatio",
      "TenDollarRatio",
      "DomusRatio",
      "OneDollar",
    ];

    try {
      const statusUpdates = {};

      for (const name of contractNames) {
        const contract = contracts[name];
        if (!contract) {
          console.error(`Contract ${name} not found`);
          statusUpdates[name] = null;
          continue;
        }

        try {
          const owner = await contract.owner(); // Assumes each contract has an `owner` method
          console.log(`Contract: ${name}, Owner: ${owner}`);
          statusUpdates[name] =
            owner === "0x0000000000000000000000000000000000000000";
        } catch (e) {
          console.error(`Error checking ownership status for ${name}:`, e);
          statusUpdates[name] = null;
        }
      }

      setIsRenounced((prevState) => ({ ...prevState, ...statusUpdates }));
    } catch (e) {
      console.error("Error fetching ownership statuses:", e);
    }
  };
  const renounceOwnership = async (contract, contractName, setHash) => {
    try {
      const tx = await contract.renounceOwnership();
      console.log(`${contractName} Transaction:`, tx);

      if (tx?.hash) {
        console.log(`${contractName} Transaction Hash:`, tx.hash);
        setHash(tx.hash);

        const txStorage = await contract.setTransactionHash(tx.hash);
        await txStorage.wait(); // Wait for confirmation

        console.log(`${contractName} Hash stored on-chain!`);
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
    renounceOwnership(AllContracts.davContract, "DAV");
  const ReanounceFluxinContract = () =>
    renounceOwnership(AllContracts.FluxinContract, "Fluxin");
  const ReanounceCurrusContract = () =>
    renounceOwnership(AllContracts.CurrusContract, "Currus");
  const ReanounceXerionContract = () =>
    renounceOwnership(AllContracts.XerionContract, "Xerion");
  const ReanounceOneDollarContract = () =>
    renounceOwnership(AllContracts.oneDollar, "1$");
  const ReanounceTenDollarContract = () =>
    renounceOwnership(AllContracts.TenDollarContract, "10$");
  const ReanounceRievaContract = () =>
    renounceOwnership(AllContracts.RievaContract, "Rieva");
  const ReanounceDomusContract = () =>
    renounceOwnership(AllContracts.DomusContract, "Domus");
  const ReanounceValirContract = () =>
    renounceOwnership(AllContracts.ValirContract, "Valir");
  const ReanounceSanitasContract = () =>
    renounceOwnership(AllContracts.SanitasContract, "Sanitas");
  const ReanounceTeeahContract = () =>
    renounceOwnership(AllContracts.TeeahContract, "Teeah");

  const ReanounceOneDollarSwapContract = () =>
    renounceOwnership(AllContracts.OneDollarRatioContract, "1$");
  const ReanounceTenDollarSwapContract = () =>
    renounceOwnership(AllContracts.TenDollarRatioContract, "10$");
  const RenounceState = () =>
    renounceOwnership(AllContracts.stateContract, "State");
  const RenounceFluxinSwap = () =>
    renounceOwnership(AllContracts.RatioContract, "FluxinRatio");
  const RenounceXerionSwap = () =>
    renounceOwnership(AllContracts.XerionRatioContract, "XerionRatio");
  const RenounceRievaSwap = () =>
    renounceOwnership(AllContracts.RievaRatioContract, "RievaRatio");
  const RenounceDomusSwap = () =>
    renounceOwnership(AllContracts.DomusRatioContract, "DomusRatio");
  const RenounceCurrusSwap = () =>
    renounceOwnership(AllContracts.CurrusRatioContract, "CurrusRatio");
  const RenounceValirSwap = () =>
    renounceOwnership(AllContracts.ValirRatioContract, "ValirRatio");
  const RenounceSanitasSwap = () =>
    renounceOwnership(AllContracts.SanitasRatioContract, "SanitasRatio");
  const RenounceTeeahSwap = () =>
    renounceOwnership(AllContracts.TeeahRatioContract, "TeeahRatio");

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
  const WithdrawOneDollar = (amount) =>
    handleTokenWithdraw(AllContracts.oneDollar, amount);
  const WithdrawTenDollar = (amount) =>
    handleTokenWithdraw(AllContracts.TenDollarContract, amount);
  const WithdrawRieva = (amount) =>
    handleTokenWithdraw(AllContracts.RievaContract, amount);
  const WithdrawDomus = (amount) =>
    handleTokenWithdraw(AllContracts.DomusContract, amount);
  const WithdrawCurrus = (amount) =>
    handleTokenWithdraw(AllContracts.CurrusContract, amount);
  const WithdrawValir = (amount) =>
    handleTokenWithdraw(AllContracts.ValirContract, amount);
  const WithdrawSanitas = (amount) =>
    handleTokenWithdraw(AllContracts.SanitasContract, amount);
  const WithdrawTeeah = (amount) =>
    handleTokenWithdraw(AllContracts.TeeahContract, amount);

  useEffect(() => {
    setTimeout(() => {
      setRatioPriceLoading(false);
    }, 3000);
  }, []);

  const checkUserBalanceForToken = async (contractName) => {
    try {
      if (!contracts[contractName]) {
        console.error(`Contract "${contractName}" not found.`);
        return;
      }

      if (!address) {
        console.error("Account is undefined or null");
        return;
      }
      const userBalance = await contracts[contractName].balanceOf(address);
      const userBalanceInWei = ethers.formatEther(userBalance);
      console.log("user balance...", userBalanceInWei);
      return userBalanceInWei;
    } catch (error) {
      console.error("Error fetching user balance:", error);
    }
  };
  console.log("current ratio price", CurrentRatioPrice.Fluxin);
  const AmountOutTokens = async () => {
    try {
      if (!CurrentRatioPrice) {
        console.log("Waiting for ratio prices to be fetched...");
        return null;
      }

      setRatioPriceLoading(true);

      const contracts = [
        {
          contract: AllContracts.RatioContract,
          name: "Fluxin",
        },
        {
          contract: AllContracts.XerionRatioContract,
          name: "Xerion",
        },
        {
          contract: AllContracts.RievaRatioContract,
          name: "Rieva",
        },
        {
          contract: AllContracts.DomusRatioContract,
          name: "Domus",
        },
        {
          contract: AllContracts.CurrusRatioContract,
          name: "Currus",
        },
        {
          contract: AllContracts.TeeahRatioContract,
          name: "Teeah",
        },
        {
          contract: AllContracts.ValirRatioContract,
          name: "Valir",
        },
        {
          contract: AllContracts.SanitasRatioContract,
          name: "Sanitas",
        },
        {
          contract: AllContracts.OneDollarRatioContract,
          name: "OneDollar",
        },
        {
          contract: AllContracts.TenDollarRatioContract,
          name: "TenDollar",
        },
      ];

      //   console.log("Xerion Ratio Price:", XerionRatioPrice);

      const amounts = {};

      for (const { contract, name } of contracts) {
        try {
          const rawTokenBalanceUser = await handleContractCall(
            contract,
            "getOutPutAmount",
            [],
            (s) => ethers.formatUnits(s, 18)
          );

          console.log(`${name} -> Raw Token Balance:`, rawTokenBalanceUser);

          const tokenBalance = Math.floor(
            parseFloat(rawTokenBalanceUser || "0")
          );
          console.log(`${name} -> Parsed Token Balance:`, tokenBalance);

          const userBalance = await checkUserBalanceForToken("state");
          const adjustedBalance = parseFloat(tokenBalance || "0");

          amounts[name] = {
            rawBalance: tokenBalance,
            adjustedBalance:
              isReversed[name] && parseFloat(userBalance) < adjustedBalance
                ? "0.0"
                : adjustedBalance,
            formattedBalance: adjustedBalance.toLocaleString(),
          };

          console.log(`${name} -> Calculated Balance:`, amounts[name]);
        } catch (error) {
          console.error(`Error fetching balance for ${name}:`, error);
          amounts[name] = {
            rawBalance: 0,
            adjustedBalance: 0,
            formattedBalance: "0.0",
          };
        }
      }

      console.log("Final Balances:", amounts);
      setRatioPriceLoading(false);
      return amounts;
    } catch (e) {
      console.error("Error fetching AmountOut balances:", e);
      setRatioPriceLoading(false);
      return null;
    }
  };

  const [outAmounts, setOutAmounts] = useState({
    Fluxin: "0",
    Xerion: "0",
    OneDollar: "0",
  });

  const AmountOut = async () => {
    try {
      const value = await AmountOutTokens();
      if (!value || !value.Fluxin) {
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
        OneDollar:
          prev.OneDollar !== value.OneDollar.adjustedBalance
            ? value.OneDollar.adjustedBalance
            : prev.OneDollar,
        Rieva:
          prev.Rieva !== value.Rieva.adjustedBalance
            ? value.Rieva.adjustedBalance
            : prev.Rieva,
        Domus:
          prev.Domus !== value.Domus.adjustedBalance
            ? value.Domus.adjustedBalance
            : prev.Domus,
        TenDollar:
          prev.TenDollar !== value.TenDollar.adjustedBalance
            ? value.TenDollar.adjustedBalance
            : prev.TenDollar,
        Currus:
          prev.Currus !== value.Currus.adjustedBalance
            ? value.Currus.adjustedBalance
            : prev.Currus,
        Valir:
          prev.Valir !== value.Valir.adjustedBalance
            ? value.Valir.adjustedBalance
            : prev.Valir,
        Sanitas:
          prev.Sanitas !== value.Sanitas.adjustedBalance
            ? value.Sanitas.adjustedBalance
            : prev.Sanitas,
        Teeah:
          prev.Teeah !== value.Teeah.adjustedBalance
            ? value.Teeah.adjustedBalance
            : prev.Teeah,
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

  const HasSwappedAucton = async () => {
    try {
      // List of contracts with identifiers

      // Fetch data for all contracts
      const results = await Promise.all(
        contractDetails.map(async ({ name, contract }) => {
          const hasSwapped = await handleContractCall(
            contract,
            "getUserHasSwapped",
            [address]
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
      // Fetch data for all contracts
      const results = await Promise.all(
        contractDetails.map(async ({ name, contract }) => {
          const hasReverseSwapped = await handleContractCall(
            contract,
            "getUserHasReverseSwapped",
            [address]
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

  const RatioTargetValues = async () => {
    try {
      const results = await Promise.all(
        contractDetails.map(async ({ contract, name }) => {
          try {
            const ratioTarget = await handleContractCall(
              contract,
              "getRatioTarget",
              [],
              (s) => ethers.formatUnits(s, 18)
            );
            return { name, value: Number(ratioTarget) };
          } catch (error) {
            console.error(`Error fetching Ratio Target for ${name}:`, error);
            return null;
          }
        })
      );

      const ratioTargets = results.reduce((acc, entry) => {
        if (entry) acc[entry.name] = entry.value;
        return acc;
      }, {});

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
      if (Object.keys(cachedRatioTargetsRef.current).length > 0) {
        console.log(
          "Using cached Ratio Targets:",
          cachedRatioTargetsRef.current
        );
        return cachedRatioTargetsRef.current;
      }

      const ratioTargetValues = await RatioTargetValues();
      if (ratioTargetValues) {
        cachedRatioTargetsRef.current = ratioTargetValues;
        setRatioTargetsOfTokens(ratioTargetValues);
        console.log("Fetched and cached Ratio Targets:", ratioTargetValues);
      }

      return ratioTargetValues;
    } catch (e) {
      console.error("Error fetching ratio targets:", e);
    }
  };

  console.log("================================", RatioValues);
  const StateBurnAmount = async () => {
    try {
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

  const [balances, setBalances] = useState({});

  const balanceConfigs = [
    {
      contract: AllContracts.stateContract,
      token: STATE_TOKEN_ADDRESS,
      key: "stateBalance",
    },
    {
      contract: AllContracts.FluxinContract,
      token: Fluxin,
      key: "fluxinBalance",
    },
    {
      contract: AllContracts.ValirContract,
      token: Valir,
      key: "ValirBalance",
    },
    {
      contract: AllContracts.TeeahContract,
      token: Teeah,
      key: "TeeahBalance",
    },
    {
      contract: AllContracts.CurrusContract,
      token: Currus,
      key: "CurrusBalance",
    },
    {
      contract: AllContracts.SanitasContract,
      token: Sanitas,
      key: "SanitasBalance",
    },
    {
      contract: AllContracts.TenDollarContract,
      token: $10,
      key: "TenDollarBalance",
    },
    {
      contract: AllContracts.RievaContract,
      token: Rieva,
      key: "RievaBalance",
    },
    {
      contract: AllContracts.DomusContract,
      token: Domus,
      key: "DomusBalance",
    },
    {
      contract: AllContracts.XerionContract,
      token: Xerion,
      key: "xerionBalance",
    },
    {
      contract: AllContracts.oneDollar,
      token: $1,
      key: "OneDollarBalance",
    },
    {
      contract: AllContracts.stateContract,
      token: Ratio_TOKEN_ADDRESS,
      key: "StateFluxin",
    },
    {
      contract: AllContracts.stateContract,
      token: TeeahRatioAddress,
      key: "StateTeeah",
    },
    {
      contract: AllContracts.stateContract,
      token: TenDollarRatioAddress,
      key: "StateTenDollar",
    },
    {
      contract: AllContracts.stateContract,
      token: DomusRatioAddress,
      key: "StateDomus",
    },
    {
      contract: AllContracts.stateContract,
      token: ValirRatioAddress,
      key: "StateValir",
    },
    {
      contract: AllContracts.stateContract,
      token: SanitasRatioAddress,
      key: "StateSanitas",
    },
    {
      contract: AllContracts.stateContract,
      token: CurrusRatioAddress,
      key: "StateCurrus",
    },
    {
      contract: AllContracts.stateContract,
      token: RievaRatioAddress,
      key: "StateRieva",
    },
    {
      contract: AllContracts.stateContract,
      token: DomusRatioAddress,
      key: "StateDomusRieva",
    },
    {
      contract: AllContracts.stateContract,
      token: XerionRatioAddress,
      key: "StateXerion",
    },
    {
      contract: AllContracts.stateContract,
      token: OneDollarRatioAddress,
      key: "StateOneDollar",
    },

    {
      contract: AllContracts.FluxinContract,
      token: Ratio_TOKEN_ADDRESS,
      key: "ratioFluxinBalance",
    },
    {
      contract: AllContracts.TeeahContract,
      token: TeeahRatioAddress,
      key: "ratioTeeahBalance",
    },
    {
      contract: AllContracts.RievaContract,
      token: RievaRatioAddress,
      key: "ratioRievaBalance",
    },
    {
      contract: AllContracts.ValirContract,
      token: ValirRatioAddress,
      key: "ratioValirBalance",
    },
    {
      contract: AllContracts.CurrusContract,
      token: CurrusRatioAddress,
      key: "ratioCurrusBalance",
    },
    {
      contract: AllContracts.SanitasContract,
      token: SanitasRatioAddress,
      key: "ratioSanitasBalance",
    },
    {
      contract: AllContracts.TenDollarContract,
      token: TenDollarRatioAddress,
      key: "ratioTenDollarBalance",
    },
    {
      contract: AllContracts.DomusContract,
      token: DomusRatioAddress,
      key: "ratioDomusBalance",
    },
    {
      contract: AllContracts.XerionContract,
      token: XerionRatioAddress,
      key: "ratioXerionBalance",
    },
    {
      contract: AllContracts.oneDollar,
      token: OneDollarRatioAddress,
      key: "ratioOneDollarBalance",
    },
  ];

  const fetchAllBalances = async () => {
    try {
      const results = await Promise.all(
        balanceConfigs.map(async ({ contract, token, key }) => {
          try {
            const transaction = await handleContractCall(
              contract,
              "balanceOf",
              [token],
              (s) => ethers.formatUnits(s, 18)
            );

            const balanceValue = Math.floor(parseFloat(transaction).toFixed(2));
            return { key, balance: balanceValue };
          } catch (error) {
            console.error(`Error fetching balance for ${key}:`, error);
            return null;
          }
        })
      );

      const updatedBalances = results.reduce((acc, entry) => {
        if (entry) acc[entry.key] = entry.balance;
        return acc;
      }, {});

      setBalances(updatedBalances);
      console.log("Updated balances:", updatedBalances);
    } catch (e) {
      console.error("Error fetching balances:", e);
    }
  };

  const getDecayPercentage = async (contractName) => {
    try {
      const contract = contracts[contractName];
      if (!contract) {
        console.error(`Contract "${contractName}" not found.`);
        return;
      }

      const currentTimestamp = Math.floor(Date.now() / 1000);
      const transaction = await handleContractCall(
        contract,
        "getDecayPercentageAtTime",
        [currentTimestamp],
        (s) => parseFloat(ethers.formatUnits(s, 0))
      );

      const reversedPercentage = 100 - transaction;
      console.log(
        `${contractName} decay percentage (reversed):`,
        reversedPercentage
      );

      // Update state with the new percentage for the specific contract
      setDecayPercentages((prev) => ({
        ...prev,
        [contractName]: reversedPercentage,
      }));
    } catch (e) {
      console.error(
        `Error fetching decay percentage for "${contractName}":`,
        e
      );
    }
  };
  const fetchAllDecayPercentages = async () => {
    await Promise.all(Object.keys(contracts).map(getDecayPercentage));
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
        Rieva: outAmounts.Rieva,
        Valir: outAmounts.Valir,
        Sanitas: outAmounts.Sanitas,
        Domus: outAmounts.Domus,
        Teeah: outAmounts.Teeah,
        Currus: outAmounts.Currus,
        OneDollar: outAmounts.OneDollar,
        TenDollar: outAmounts.TenDollar,
      };

      const ContractAddressToUse = {
        Fluxin: Ratio_TOKEN_ADDRESS,
        Rieva: RievaRatioAddress,
        Domus: DomusRatioAddress,
        Teeah: TeeahRatioAddress,
        Currus: CurrusRatioAddress,
        Valir: ValirRatioAddress,
        Sanitas: SanitasRatioAddress,
        Xerion: XerionRatioAddress,
        OneDollar: OneDollarRatioAddress,
        TenDollar: TenDollarRatioAddress,
      };
      console.log("output amount:", OutAmountsMapping[ContractName]);
      const InAmountMapping = {
        Fluxin: OnePBalance.Fluxin,
        Rieva: OnePBalance.Rieva,
        Domus: OnePBalance.Domus,
        Teeah: OnePBalance.Teeah,
        Currus: OnePBalance.Currus,
        Valir: OnePBalance.Valir,
        Sanitas: OnePBalance.Sanitas,
        Xerion: OnePBalance.Xerion,
        OneDollar: OnePBalance.OneDollar,
        TenDollar: OnePBalance.TenDollar,
      };
      console.log("reverse from swap", isReversed);
      console.log("input amount:", InAmountMapping[ContractName]);

      const amountInWei = ethers.parseUnits(
        OutAmountsMapping[ContractName].toString(),
        18
      );

      let approvalAmount;
      let contractToUse = {
        Fluxin: AllContracts.FluxinContract,
        Rieva: AllContracts.RievaContract,
        Domus: AllContracts.DomusContract,
        Currus: AllContracts.CurrusContract,
        Valir: AllContracts.ValirContract,
        Teeah: AllContracts.TeeahContract,
        Sanitas: AllContracts.SanitasContract,
        OneDollar: AllContracts.oneDollar,
        TenDollar: AllContracts.TenDollarContract,
        Xerion: AllContracts.XerionContract,
        state: AllContracts.stateContract,
      };

      console.log("contract to use:", contractToUse[ContractName]);
      console.log("rps", isReversed.Fluxin);
      let selectedContract;
      if (
        (ContractName == "Fluxin" && isReversed.Fluxin == "true") ||
        (ContractName == "Rieva" && isReversed.Rieva == "true") ||
        (ContractName == "Domus" && isReversed.Domus == "true") ||
        (ContractName == "Xerion" && isReversed.Xerion == "true") ||
        (ContractName == "Valir" && isReversed.Valir == "true") ||
        (ContractName == "Sanitas" && isReversed.Sanitas == "true") ||
        (ContractName == "Teeah" && isReversed.Teeah == "true") ||
        (ContractName == "Currus" && isReversed.Currus == "true") ||
        (ContractName == "TenDollar" && isReversed.TenDollar == "true") ||
        (ContractName == "OneDollar" && isReversed.OneDollar == "true")
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
        address,
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

      const contracts = {
        Fluxin: AllContracts.RatioContract,
        Xerion: AllContracts.XerionRatioContract,
        Rieva: AllContracts.RievaRatioContract,
        Domus: AllContracts.DomusRatioContract,
        Valir: AllContracts.ValirRatioContract,
        Sanitas: AllContracts.SanitasRatioContract,
        Teeah: AllContracts.TeeahRatioContract,
        Currus: AllContracts.CurrusRatioContract,
        OneDollar: AllContracts.OneDollarRatioContract,
        TenDollar: AllContracts.TenDollarRatioContract,
      };
      // Perform the token swap
      const swapTx = await contracts[ContractName].swapTokens(address);
      const swapReceipt = await swapTx.wait();

      if (swapReceipt.status === 1) {
        console.log("Swap Complete!");
        setButtonTextStates((prev) => ({ ...prev, [id]: "Swap Complete!" }));
        TotalTokensBurn();
        StateBurnAmount();
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

  const setRatioTarget = async (Target, contractName) => {
    try {
      // Call the contract to set both numerator and denominator
      const amountInWei = ethers.parseUnits(Target, 18);

      await handleContractCall(
        contractMapping[contractName],
        "setRatioTarget",
        [amountInWei]
      );
      console.log(`Ratio target set to `);
      await RatioTargetValues();
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
  const reverseSwapEnabled = async () => {
    try {
      const results = await Promise.all(
        contractDetails.map(async ({ name, contract }) => {
          if (!contract) {
            console.error(`${name} contract is null or undefined`);
            return { [name]: "Contract not available" };
          }

          const isReverse = await contract.isReverseAuctionActive();
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
  const CheckForCycle = async () => {
    try {
      const results = await Promise.all(
        contractDetails.map(async ({ name, contract }) => {
          if (!contract) {
            console.error(`${name} contract is null or undefined`);
            return { [name]: "Contract not available" };
          }
          const getCurrentCycle = await contract.getCurrentAuctionCycle();
          const isReverse = await contract.reverseAuctionActive(
            getCurrentCycle
          );
          console.log(`is reverse for cycle ${name}`, isReverse);
          return { [name]: isReverse.toString() };
        })
      );

      const reversedState = Object.assign({}, ...results);
      setForCycle(reversedState);

      console.log("set reverse for cycle", ReverseForCycle.Fluxin);
    } catch (error) {
      console.error("Error setting reverse target:", error);
    }
  };
  const CheckForNextCycle = async () => {
    try {
      const results = await Promise.all(
        contractDetails.map(async ({ name, contract }) => {
          if (!contract) {
            console.error(`${name} contract is null or undefined`);
            return { [name]: "Contract not available" };
          }
          const getCurrentCycle = await contract.getCurrentAuctionCycle();
          const getNextCycle = getCurrentCycle + BigInt(1);
          const isReverse = await contract.reverseAuctionActive(getNextCycle);
          console.log(`is reverse for next cycle ${name}`, isReverse);
          return { [name]: isReverse.toString() };
        })
      );

      const reversedState = Object.assign({}, ...results);
      setForNextCycle(reversedState);

      console.log("set reverse for cycle", ReverseForCycle.Fluxin);
    } catch (error) {
      console.error("Error setting reverse target:", error);
    }
  };

  const SetOnePercentageOfBalance = async () => {
    try {
      const balances = {};

      for (const [tokenName, contract] of Object.entries(Swapcontracts)) {
        // Fetch raw one percent balance
        const rawBalance = await handleContractCall(
          contract,
          "calculateAuctionEligibleAmount",
          [],
          (s) => ethers.formatUnits(s, 18)
        );
        let balance;
        if (tokenName == "OneDollar") {
          balance = parseFloat(rawBalance || "0").toFixed(2); // Keeps 2 decimal places
        } else if (tokenName == "TenDollar") {
          balance = parseFloat(rawBalance || "0").toFixed(2);
        } else {
          balance = Math.floor(parseFloat(rawBalance || "0"));
        }

        console.log(`SetOnePercentageOfBalance -> ${tokenName}:`, rawBalance);
        console.log(`Adjusted Balance for ${tokenName}:`, balance);
        const userBalance = await checkUserBalanceForToken(tokenName);
        console.log(`Adjusted user Balance for ${tokenName}:`, userBalance);

        if (!isReversed[tokenName]) {
          balances[tokenName] =
            parseFloat(userBalance) < balance ? "0.0" : balance;
        } else {
          balances[tokenName] = balance;
        }
      }

      // Update state with the results
      setOnePBalance((prevState) => ({
        ...prevState,
        ...balances,
      }));
      console.log("SetOnePercentageOfBalance cache:", OnePBalance.OneDollar);
      //   return balances;
    } catch (e) {
      console.error("Error in SetOnePercentageOfBalance:", e);
      return null;
    }
  };
  console.log("SetOnePercentageOfBalance cache:", OnePBalance.OneDollar);

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

  const setReverseEnable = async (contractName) => {
    try {
      await contractMapping[contractName].checkAndActivateReverseForNextCycle();

      console.log(`started  reverse time`);
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
        RievaRatio: RievaRatioAddress,
        DomusRatio: DomusRatioAddress,
        TeeahRatio: TeeahRatioAddress,
        ValirRatio: ValirRatioAddress,
        SanitasRatio: SanitasRatioAddress,
        CurrusRatio: CurrusRatioAddress,
        OneDollarRatio: OneDollarRatioAddress,
        TenDollarRatio: TenDollarRatioAddress,
      };
      const allowance = await contracts[name].allowance(
        address,
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
        await fetchAllBalances();
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
      await isAuctionRunning();
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
        [address, Ratio_TOKEN_ADDRESS],
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

  // Example usage for different tokens
  const handleAddTokenRatio = () =>
    handleAddToken(Ratio_TOKEN_ADDRESS, "Fluxin");
  const handleAddTokenDAV = () => handleAddToken(DAV_TOKEN_ADDRESS, "pDAV");
  const handleAddTokensDAV = () =>
    handleAddToken(DAV_TOKEN_SONIC_ADDRESS, "sDAV");
  const handleAddTokenState = () =>
    handleAddToken(STATE_TOKEN_ADDRESS, "pState");
  const handleAddTokensState = () =>
    handleAddToken(STATE_TOKEN_SONIC_ADDRESS, "sState");
  const handleAddFluxin = () => handleAddToken(Fluxin, "Orxa");
  const handleAddOneD = () => handleAddToken($1, "1$");
  const handleAddXerion = () => handleAddToken(Xerion, "Layti");
  const handleAddRieva = () => handleAddToken(Rieva, "Rieva");
  const handleAddDomus = () => handleAddToken(Domus, "Domus");
  const handleAddTenDollar = () => handleAddToken($10, "10$");
  const handleAddCurrus = () => handleAddToken(Currus, "Currus");
  const handleAddValir = () => handleAddToken(Valir, "Valir");
  const handleAddSanitas = () => handleAddToken(Sanitas, "Sanitas");
  const handleAddTeeah = () => handleAddToken(Teeah, "Teeah");

  return (
    <SwapContractContext.Provider
      value={{
        //WALLET States
        provider,
        signer,
        loading,
        address,

        //DAV Contract
        // davContract,
        CalculationOfCost,
        TotalCost,
        WithdrawTeeah,
        handleAddTokenDAV,
        handleAddTokensDAV,
        //STATE Token
        StateHolds,
        balances,
        RenounceState,
        WithdrawState,
        handleAddTokenState,
        handleAddTokensState,
        TotalStateHoldsInUS,
        ReanounceTeeahContract,
        setClaiming,
        RenounceTeeahSwap,
        contracts,
        claiming,
        SwapTokens,
        ButtonText,
        ReanounceContract,
        ReanounceFluxinContract,
        ReanounceXerionContract,
        ReanounceTenDollarSwapContract,
        handleAddToken,
        setRatioTarget,
        // setReverseEnable,
        WithdrawFluxin,
        WithdrawXerion,
        handleAddTokenRatio,
        handleAddFluxin,
        handleAddXerion,
        handleAddRieva,
        handleAddSanitas,
        handleAddDomus,
        userHashSwapped,
        userHasReverseSwapped,
        // WithdrawLPTokens,
        isRenounced,
        checkOwnershipStatus,
        SetAUctionDuration,
        SetAUctionInterval,
        outAmounts,
        Approve,
        DepositToken,
        RatioValues,
        OnePBalance,
        StartAuction,
        ClickBurn,
        // setReverseTime,
        getCachedRatioTarget,
        buttonTextStates,
        swappingStates,
        transactionStatus,
        setBurnRate,
        handleAddCurrus,
        RenounceSanitasSwap,
        handleAddValir,
        // userHasReverseSwapped,
        isReversed,
        StateBurnBalance,
        RatioTargetsofTokens,
        DavRequiredAmount,
        LoadingState,
        loadingRatioPrice,
        WithdrawOneDollar,
        ReanounceOneDollarSwapContract,
        setReverseEnable,
        RenounceFluxinSwap,
        RenounceXerionSwap,
        ReanounceOneDollarContract,
        ReanounceRievaContract,
        ReanounceDomusContract,
        ReanounceSanitasContract,
        ReanounceValirContract,
        ReanounceTenDollarContract,
        ReanounceCurrusContract,
        RenounceCurrusSwap,
        RenounceValirSwap,
        renounceOwnership,
        SetOnePercentageOfBalance,
        ReverseForNextCycle,
        handleAddOneD,
        handleAddTenDollar,
        WithdrawTenDollar,
        handleAddTeeah,
        WithdrawSanitas,
        decayPercentages,
        ReverseForCycle,
        RenounceRievaSwap,
        RenounceDomusSwap,
        WithdrawRieva,
        WithdrawDomus,
        WithdrawCurrus,
        WithdrawValir,
      }}
    >
      {children}
    </SwapContractContext.Provider>
  );
};
SwapContractProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
