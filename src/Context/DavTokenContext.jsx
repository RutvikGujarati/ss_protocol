// DAVTokenContext.js
import { createContext, useContext, useState, useEffect } from "react";
import { ethers } from "ethers";
import DAVTokenABI from "../ABI/DavTokenABI.json";
import StateABI from "../ABI/StateTokenABI.json";
import RatioABI from "../ABI/RatioABI.json";
import PropTypes from "prop-types";
import { PriceContext } from "../api/StatePrice";
import { createWalletClient, http } from "viem";
import { pulsechainV4 } from "viem/chains";

const DAVTokenContext = createContext();
//0xd75fA7c2380f539320F9ABD29D09f48DbEB0E13E
export const DAV_TOKEN_ADDRESS = "0xDBfb087D16eF29Fd6c0872C4C0525B38fBAEB319";
export const STATE_TOKEN_ADDRESS = "0x5Fe613215C6B6EFB846B92B24409E11450398aC5";
export const Ratio_TOKEN_ADDRESS = "0x1e66FD350dBb84A55Ed46A93B358ee374864cC8A";

export const Fluxin = "0xdE45C7EEED1E776dC266B58Cf863b9B9518cb7aa";
export const Xerion = "0xda5eF27FE698970526dFA7E47E824A843907AC71";

export const useDAVToken = () => useContext(DAVTokenContext);

export const DAVTokenProvider = ({ children }) => {
  const { stateUsdPrice, FluxinRatioPrice } = useContext(PriceContext);

  //contract initialization states
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);
  const [DavBalance, setDavBalance] = useState(null);

  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState(null); // 'pending', 'success', or 'failed'

  //contract state
  const [davContract, setDavContract] = useState(null);
  const [stateContract, setStateContract] = useState(null);
  const [FluxinContract, setFluxinContract] = useState(null);
  const [XerionContract, setXerionContract] = useState(null);
  const [RatioContract, setRatioContract] = useState(null);

  const [TotalCost, setTotalCost] = useState(null);
  const [AuctionRunning, setIsAuctionRunning] = useState({
    Fluxin: false,
    Xerion: false,
    state: true,
  });
  const [AuctionRunningLocalString, setIsAuctionRunningLocalString] = useState({
    Fluxin: false,
    Xerion: false,
    state: true,
  });
  const [ButtonText, setButtonText] = useState();
  const [davHolds, setDavHoldings] = useState("0.0");
  const [isReversed, setisReversed] = useState(false);
  const [StateHolds, setStateHoldings] = useState("0.0");

  const [TotalStateHoldsInUS, setTotalStateHoldsInUS] = useState("0.00");

  const [davPercentage, setDavPercentage] = useState("0.0");
  const [Supply, setSupply] = useState("0.0");
  const [StateSupply, setStateSupply] = useState("0.0");
  const [FluxinSupply, setFluxinSupply] = useState("0.0");
  const [XerionSupply, setXerionSupply] = useState("0.0");
  const [DAVTokensWithdraw, setDAvTokens] = useState("0.0");
  const [OnePBalance, setOnePBalance] = useState("0");
  const [FormattedInbalance, setFormatedBalance] = useState("0");
  const [OutBalance, setOutBalance] = useState({
    Fluxin: "0",
    formattedFluxin: "0",
  });

  const [buttonTextStates, setButtonTextStates] = useState({});
  const [swappingStates, setSwappingStates] = useState({});
  const [DAVTokensFiveWithdraw, setFiveAvTokens] = useState("0.0");
  const [StateBalance, setStateBalance] = useState("0.0");
  const [FluxinBalance, setFluxinBalance] = useState("0.0");
  const [XerionBalance, setXerionBalance] = useState("0.0");
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

  const [AuctionTime, SetAuctionTime] = useState("0");
  const [userHashSwapped, setUserHashSwapped] = useState(false);
  const [AuctionDuration, SetAuctionDuration] = useState("0");
  const [AuctionTimeRunning, SetAuctionTimeRunning] = useState("0");
  const [AuctionNextTime, SetAuctionNextTime] = useState("0");
  const [RatioValues, SetRatioTarget] = useState("0");
  const [userSwapped, SetUserSwapped] = useState("0");

  const walletClient = createWalletClient({
    chain: pulsechainV4, // Change to your desired chain, e.g., goerli, polygon, etc.
    transport: http("pulsechain-testnet-rpc.publicnode.com"), // Replace with your RPC URL
    account: account, // Your wallet address
  });

  console.log("walletClient", walletClient);

  useEffect(() => {
    const initialize = async () => {
      if (typeof window.ethereum !== "undefined") {
        try {
          const newProvider = new ethers.BrowserProvider(
            window.ethereum,
            "any"
          );
          const accounts = await newProvider.send("eth_requestAccounts", []);
          const newSigner = await newProvider.getSigner();

          setProvider(newProvider);
          setSigner(newSigner);
          setAccount(accounts[0]);

          setDavContract(
            new ethers.Contract(DAV_TOKEN_ADDRESS, DAVTokenABI, newSigner)
          );
          setStateContract(
            new ethers.Contract(STATE_TOKEN_ADDRESS, StateABI, newSigner)
          );
          setFluxinContract(new ethers.Contract(Fluxin, StateABI, newSigner));
          setXerionContract(new ethers.Contract(Xerion, StateABI, newSigner));

          setRatioContract(
            new ethers.Contract(Ratio_TOKEN_ADDRESS, RatioABI, newSigner)
          );
        } catch (error) {
          console.error("Error initializing contract:", error);
        } finally {
          setLoading(false);
        }
      } else {
        console.error("Ethereum wallet is not installed");
        setLoading(false);
      }
    };
    initialize();
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          initialize();
        } else {
          setAccount(null);
          setSigner(null);
          setProvider(null);
        }
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners("accountsChanged");
      }
    };
  }, []);

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

  const mintDAV = async (amount) => {
    try {
      const value = ethers.parseEther(amount.toString());
      const cost = ethers.parseEther((amount * 200000).toString()); //200000

      const transaction = await handleContractCall(davContract, "mintDAV", [
        value,
        { value: cost },
      ]);
      await transaction.wait();
      console.log("Minting successful!");
    } catch (error) {
      console.error("Error during minting:", error);
    }
  };

  const CalculationOfCost = async (amount) => {
    setTotalCost(ethers.parseEther((amount * 200000).toString()));
  };

  const DavHoldings = async () => {
    const holdings = await handleContractCall(
      davContract,
      "getDAVHoldings",
      [account],
      (h) => ethers.formatUnits(h, 18)
    );
    console.log("DavHoldings: ", holdings);
    setDavHoldings(holdings);
  };
  const fetchStateHoldingsAndCalculateUSD = async () => {
    try {
      const holdings = await handleContractCall(
        stateContract,
        "balanceOf",
        [account],
        (h) => ethers.formatUnits(h, 18) // This formats from Wei to Ether
      );

      if (holdings) {
        // First convert the formatted string to a number
        const rawHoldings = parseFloat(holdings); // Using parseFloat since formatUnits returns a string
        const priceNum = Number(stateUsdPrice);

        // Set the raw holdings and formatted holdings
        const formattedHoldings = new Intl.NumberFormat("en-US").format(
          rawHoldings
        );
        // setRawStateHolds(rawHoldings);
        setStateHoldings(formattedHoldings);

        console.log("Raw holdings (in Ether):", rawHoldings);
        console.log("Price of token:", priceNum);

        // Calculate USD value
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
    } catch (error) {
      setStateHoldings("0");
      setTotalStateHoldsInUS("0.0");
      console.error("Error fetching state holdings:", error);
    }
  };
  const DavHoldingsPercentage = async () => {
    try {
      const balance = await handleContractCall(
        davContract,
        "balanceOf",
        [account],
        (b) => ethers.formatUnits(b, 18)
      );
      setDavBalance(balance);

      const totalSupply = 5000000;

      if (balance) {
        const rank = balance / totalSupply;

        setDavPercentage(parseFloat(rank).toFixed(8));
      } else {
        console.error("Failed to fetch holding percentage.");
      }
    } catch (error) {
      console.error("Error fetching DAV holdings percentage:", error);
    }
  };

  const DavSupply = async () => {
    const supply = await handleContractCall(
      davContract,
      "totalSupply",
      [],
      (s) => ethers.formatUnits(s, 18)
    );
    setSupply(supply);
  };

  const StateTotalMintedSupply = async () => {
    const supply = await handleContractCall(
      stateContract,
      "totalSupply",
      [],
      (s) => ethers.formatUnits(s, 18)
    );
    setStateSupply(supply);
  };

  const FluxinTotalMintedSupply = async () => {
    const supply = await handleContractCall(
      FluxinContract,
      "totalSupply",
      [],
      (s) => ethers.formatUnits(s, 18)
    );
    setFluxinSupply(supply);
  };
  const XerionTotalMintedSupply = async () => {
    const supply = await handleContractCall(
      XerionContract,
      "totalSupply",
      [],
      (s) => ethers.formatUnits(s, 18)
    );
    setXerionSupply(supply);
  };

  useEffect(() => {
    let interval;

    const fetchLiveData = async () => {
      if (davContract && stateContract && RatioContract) {
        try {
          // Concurrent fetching with Promise.all
          await Promise.all([
            DavHoldings().catch((error) =>
              console.error("Error fetching DavHoldings:", error)
            ),
            DavHoldingsPercentage().catch((error) =>
              console.error("Error fetching DavHoldingsPercentage:", error)
            ),
            fetchStateHoldingsAndCalculateUSD().catch((error) =>
              console.error("Error fetching StateHoldings:", error)
            ),

            RatioTargetValues().catch((error) =>
              console.error("Error fetching DAVTokenfive_Amount:", error)
            ),
            DavSupply().catch((error) =>
              console.error("Error fetching DavSupply:", error)
            ),

            getDecayPercentage("state").catch((error) =>
              console.error("Error fetching getDecayPercentage (state):", error)
            ),
            getDecayPercentage("Xerion").catch((error) =>
              console.error("Error fetching getDecayPercentage (state):", error)
            ),
            checkOwnershipStatus("state").catch((error) =>
              console.error("Error fetching getDecayPercentage (state):", error)
            ),
            checkOwnershipStatus("dav").catch((error) =>
              console.error("Error fetching getDecayPercentage (state):", error)
            ),
            checkOwnershipStatus("Fluxin").catch((error) =>
              console.error("Error fetching getDecayPercentage (state):", error)
            ),
            checkOwnershipStatus("Xerion").catch((error) =>
              console.error("Error fetching getDecayPercentage (state):", error)
            ),
            getDecayPercentage("Fluxin").catch((error) =>
              console.error(
                "Error fetching getDecayPercentage (Fluxin):",
                error
              )
            ),
            ViewDistributedTokens().catch((error) =>
              console.error("Error fetching ViewDistributedTokens:", error)
            ),
            StateTotalMintedSupply().catch((error) =>
              console.error("Error fetching StateTotalMintedSupply:", error)
            ),
            reverseSwapEnabled().catch((error) =>
              console.error("Error fetching StateTotalMintedSupply:", error)
            ),
            FluxinTotalMintedSupply().catch((error) =>
              console.error("Error fetching FluxinTotalMintedSupply:", error)
            ),
            XerionTotalMintedSupply().catch((error) =>
              console.error("Error fetching XerionTotalMintedSupply:", error)
            ),

            isAuctionRunning().catch((error) =>
              console.error("Error fetching isAuctionRunning:", error)
            ),
            ContractStateBalance().catch((error) =>
              console.error("Error fetching ContractStateBalance:", error)
            ),
            ContractFluxinBalance().catch((error) =>
              console.error("Error fetching ContractFluxinBalance:", error)
            ),
            ContractXerionBalance().catch((error) =>
              console.error("Error fetching ContractXerionBalance:", error)
            ),
            DAVTokenAmount().catch((error) =>
              console.error("Error fetching DAVTokenAmount:", error)
            ),
            SetOnePercentageOfBalance().catch((error) =>
              console.error("Error fetching DAVTokenAmount:", error)
            ),
            AmountOutOfFluxin().catch((error) =>
              console.error("Error fetching DAVTokenAmount:", error)
            ),
            DAVTokenfive_Amount().catch((error) =>
              console.error("Error fetching DAVTokenfive_Amount:", error)
            ),
            AuctioTimeInterval().catch((error) =>
              console.error("Error fetching DAVTokenfive_Amount:", error)
            ),

            UserhasSwapped().catch((error) =>
              console.error("Error fetching DAVTokenfive_Amount:", error)
            ),
          ]);
        } catch (error) {
          console.error("Error fetching live data:", error);
        }
      }
    };
    // Clear the interval when the component unmounts
    fetchLiveData();

    interval = setInterval(fetchLiveData, 10000);

    return () => clearInterval(interval); // Clean up interval on component unmount
  }, [davContract, stateContract, RatioContract, account]);

  // Ratio Token Contracts
  // -- auction

  const isAuctionRunning = async () => {
    try {
      const isRunningFluxin = await handleContractCall(
        RatioContract,
        "isAuctionActive"
      );

      const runningFluxin = isRunningFluxin.toString();
      console.log("isAuctionRunning -> Fluxin:", runningFluxin);
      setIsAuctionRunning({
        Fluxin: isRunningFluxin,
        state: true,
      });
      setIsAuctionRunningLocalString({
        Fluxin: runningFluxin,
        state: true,
      });
    } catch (error) {
      console.error("Error fetching auction status:", error);
      setIsAuctionRunning({
        Fluxin: false,
        Xerion: false,
        state: true,
      });
      setIsAuctionRunningLocalString({
        Fluxin: false,
        Xerion: false,
        state: true,
      });
    }
  };
  //claiming functions
  const ClaimTokens = async (contract) => {
    try {
      setClaiming(true);
      const tx = await handleContractCall(contract, "mintReward", []);
      await tx.wait();
      setClaiming(false);
    } catch (e) {
      console.error("Error claiming tokens:", e);
      setClaiming(false);
    }
  };
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
    renounceOwnership(davContract, "DAV", setDavTransactionHash);
  const ReanounceFluxinContract = () =>
    renounceOwnership(FluxinContract, "Fluxin", setFluxinTransactionHash);
  const ReanounceXerionContract = () =>
    renounceOwnership(XerionContract, "Xerion", setXerionTransactionHash);
  const RenounceState = () =>
    renounceOwnership(stateContract, "State", setStateTransactionHash);

  const contracts = {
    state: stateContract,
    dav: davContract,
    Fluxin: FluxinContract,
    Xerion: XerionContract,
  };

  const CheckMintBalance = async (contract) => {
    try {
      const tx = await handleContractCall(contract, "distributeReward", [
        account,
      ]);
      await tx.wait();
    } catch (e) {
      console.error("Error claiming tokens:", e);
      throw e; // Rethrow the error for the caller to handle it.
    }
  };

  const handleWithdraw = async (methodName) => {
    try {
      setClaiming(true);
      await handleContractCall(davContract, methodName, []);
    } catch (e) {
      console.error(`Error withdrawing with method ${methodName}:`, e);
    } finally {
      setClaiming(false);
    }
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
  const WithdrawState = (amount) => handleTokenWithdraw(stateContract, amount);
  const WithdrawFluxin = (amount) =>
    handleTokenWithdraw(FluxinContract, amount);
  const WithdrawXerion = (amount) =>
    handleTokenWithdraw(XerionContract, amount);

  const withdraw_5 = () => handleWithdraw("withdrawDevelopmentFunds");
  const withdraw_95 = () => handleWithdraw("withdrawLiquidityFunds");

  const mintAdditionalTOkens = async (contractType, amount) => {
    try {
      setClaiming(true);

      const amountInWei = ethers.parseUnits(amount.toString(), 18);
      let contract;

      // Select the correct contract based on contractType
      if (contractType === "fluxin") {
        contract = FluxinContract;
      } else if (contractType === "state") {
        contract = stateContract;
      } else if (contractType === "Xerion") {
        contract = XerionContract;
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

  const DAVTokenAmount = async () => {
    try {
      const balance = await handleContractCall(
        davContract,
        "liquidityFunds",
        [],
        (s) => ethers.formatUnits(s, 18)
      );
      setDAvTokens(balance);
    } catch (e) {
      console.error("Error fetching LP tokens:", e);
    }
  };

  const AmountOutOfFluxin = async () => {
    try {
      const rawFluxinBalanceUser = await handleContractCall(
        RatioContract,
        "getOnepercentOfUserBalance",
        [],
        (s) => ethers.formatUnits(s, 18)
      );
      console.log("AmountOut -> Raw Fluxin Balance:", rawFluxinBalanceUser);

      const balanceOfFluxin = Math.floor(
        parseFloat(rawFluxinBalanceUser || "0")
      );

      console.log("AmountOut -> Raw Fluxin Balance:", balanceOfFluxin);

      const calculation = balanceOfFluxin * FluxinRatioPrice * 2;

      const balance = parseFloat(calculation || "0");
      console.log("out -> Raw Fluxin Balance:", balance);
      setOutBalance({
        Fluxin: balance,
        formattedFluxin: balance.toLocaleString(),
      });
    } catch (e) {
      console.error("Error fetching AmountOut balances:", e);
    }
  };

  const DAVTokenfive_Amount = async () => {
    try {
      const balance = await handleContractCall(
        davContract,
        "developmentFunds",
        [],
        (s) => ethers.formatUnits(s, 18)
      );
      setFiveAvTokens(balance);
    } catch (e) {
      console.error("Error fetching LP tokens:", e);
    }
  };

  const AuctioTimeInterval = async () => {
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
          timeZone: "Asia/Kolkata",
          timeZoneName: "short",
        });
      };

      const Time = await handleContractCall(
        RatioContract,
        "auctionInterval",
        []
      );
      const TimeOfDuration = await handleContractCall(
        RatioContract,
        "auctionDuration",
        []
      );

      const HasSwapped = await handleContractCall(
        RatioContract,
        "getUserHasSwapped",
        []
      );
      setUserHashSwapped(HasSwapped);
      console.log("hasSwapped", HasSwapped);
      const NextTime = await handleContractCall(
        RatioContract,
        "getNextAuctionStart",
        []
        // (s) => ethers.formatUnits(s, 18)
      );
      if (NextTime == 0 || NextTime == undefined) {
        SetAuctionNextTime("0");
      } else {
        const formattedNextTime = formatTimestamp(NextTime);

        console.log("Auction Time Left:", NextTime);
        SetAuctionNextTime(formattedNextTime);
      }

      SetAuctionDuration(TimeOfDuration);
      SetAuctionTime(Time);
      console.log("Auction Time Interval in Days:", Time);
    } catch (e) {
      console.error("Error fetching auction interval:", e);
    }
  };
  let timer; // Declare timer outside to persist across calls

  const AuctionTimeLeft = async () => {
    try {
      // Fetch remaining time from the contract
      const Time = await handleContractCall(
        RatioContract,
        "getTimeLeftInAuction"
      );

      const timeInSeconds = Number(Time);
      SetAuctionTimeRunning(timeInSeconds);

      // Clear any existing timer
      if (timer) clearInterval(timer);

      // If time is 0, stop further execution
      if (timeInSeconds <= 0) {
        clearInterval(timer);
      }
    } catch (e) {
      console.error("Error fetching auction time:", e);
      // Cleanup timer if an error occurs
      if (timer) clearInterval(timer);
    }
  };

  useEffect(() => {
    AuctionTimeLeft();
    // Start polling every 2 seconds
    const interval = setInterval(() => {
      AuctionTimeLeft();
    }, 2000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, [Xerion, STATE_TOKEN_ADDRESS, RatioContract]);

  const SetAUctionDuration = async (time) => {
    try {
      await handleContractCall(RatioContract, "setAuctionDuration", [time]);
    } catch (e) {
      console.error("Error fetching auction interval:", e);
    }
  };
  const SetAUctionInterval = async (time) => {
    try {
      await handleContractCall(RatioContract, "setAuctionInterval", [time]);
    } catch (e) {
      console.error("Error fetching auction interval:", e);
    }
  };
  const RatioTargetValues = async () => {
    try {
      const RatioTargetFluxin = await handleContractCall(
        RatioContract,
        "getRatioTarget",
        []
      );
      console.log("RatioTargetValues", Number(RatioTargetFluxin));
      SetRatioTarget(Number(RatioTargetFluxin));
      return RatioTargetFluxin;
    } catch (e) {
      console.error("Error fetching ratio targets:", e);
    }
  };
  let cachedRatioTarget = null; // Cache in memory

  const getCachedRatioTarget = async () => {
    if (cachedRatioTarget !== null) {
      console.log("Using cached Ratio Target:", cachedRatioTarget);
      return cachedRatioTarget;
    }

    const ratioTargetValue = await RatioTargetValues();
    cachedRatioTarget = ratioTargetValue; // Cache the value
    return ratioTargetValue;
  };

  const UserhasSwapped = async () => {
    try {
      const getCurrentCycle = await handleContractCall(
        RatioContract,
        "getCurrentAuctionCycle",
        []
      );
      const userhSwapped = await handleContractCall(
        RatioContract,
        "userSwapTotalInfo",
        [account, Fluxin, STATE_TOKEN_ADDRESS, getCurrentCycle]
      );
      console.log("RatioTargetValues", Number(userhSwapped));
      SetUserSwapped(userhSwapped);
    } catch (e) {
      console.error("Error fetching ratio targets:", e);
    }
  };

  const fetchContractBalance = async (contract, tokenAddress, setState) => {
    try {
      const transaction = await handleContractCall(
        contract,
        "balanceOf",
        [tokenAddress],
        (s) => ethers.formatUnits(s, 18)
      );

      console.log("balance", transaction);
      setState(transaction);
    } catch (e) {
      console.error("Error fetching token balance:", e);
    }
  };

  const ContractStateBalance = async () => {
    await fetchContractBalance(
      stateContract,
      STATE_TOKEN_ADDRESS,
      setStateBalance
    );
  };

  const ContractFluxinBalance = async () => {
    await fetchContractBalance(FluxinContract, Fluxin, setFluxinBalance);
  };
  const ContractXerionBalance = async () => {
    await fetchContractBalance(XerionContract, Xerion, setXerionBalance);
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
  console.log("Contract functions:", RatioContract);

  const SwapTokens = async (id) => {
    try {
      // Set initial swapping states
      setSwappingStates((prev) => ({ ...prev, [id]: true }));
      setButtonTextStates((prev) => ({
        ...prev,
        [id]: "Checking allowance...",
      }));

      let amountInWei;
      let approvalAmount;
      let contractToUse = FluxinContract;

      console.log("Ratio Values:", RatioValues);
      console.log("Fluxin Ratio Price:", FluxinRatioPrice);
      console.log("isReversed:", isReversed);

      if (FluxinRatioPrice > RatioValues && isReversed === "true") {
        amountInWei = ethers.parseUnits(OnePBalance.toString(), 18);
        contractToUse = stateContract;
        approvalAmount = ethers.parseUnits(OutBalance.Fluxin.toString(), 18);
        console.log(
          "Reversed swap, approving OutBalance:",
          approvalAmount.toString()
        );
      } else if (
        FluxinRatioPrice < RatioValues &&
        (isReversed === "true" || isReversed === "false")
      ) {
        amountInWei = ethers.parseUnits(OutBalance.Fluxin.toString(), 18);
        console.log(
          "passing amount into contract : outPut Amount",
          amountInWei
        );
        approvalAmount = ethers.parseUnits(OnePBalance.toString(), 18);
        console.log("approval amount: ", approvalAmount);

        console.log(
          "Normal swap, approving OnePBalance:",
          approvalAmount.toString()
        );
      } else {
        console.error(
          "Invalid swap conditions. Cannot determine token amount."
        );
        setButtonTextStates((prev) => ({ ...prev, [id]: "Swap failed" }));
        setSwappingStates((prev) => ({ ...prev, [id]: false }));
        return false;
      }
      approvalAmount = approvalAmount + ethers.parseUnits("100", 18);

      console.log("Amount in wei:", amountInWei.toString());
      console.log("Approval Amount:", approvalAmount.toString());

      // Check current allowance
      const allowance = await contractToUse.allowance(
        account,
        Ratio_TOKEN_ADDRESS
      );
      console.log("Current allowance:", ethers.formatUnits(allowance, 18));

      if (allowance < approvalAmount) {
        setButtonTextStates((prev) => ({
          ...prev,
          [id]: "Approving input token...",
        }));
        console.log("Insufficient allowance. Sending approval transaction...");

        try {
          const approveTx = await contractToUse.approve(
            Ratio_TOKEN_ADDRESS,
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

      // Update button state for swapping
      setButtonTextStates((prev) => ({ ...prev, [id]: "Swapping..." }));

      // Calculate gas price and extra fee
      const gasPriceData = await provider.getFeeData();
      if (!gasPriceData || !gasPriceData.gasPrice) {
        throw new Error("Failed to fetch gas price.");
      }
      const extraFee = gasPriceData.gasPrice / BigInt(100); // 1% of gas price
      console.log(`Extra Fee (in wei): ${extraFee.toString()}`);

      // Perform the token swap
      const swapTx = await RatioContract.swapTokens(
        account,
        amountInWei,
        extraFee,
        {
          value: extraFee, // Provide extra fee as value
        }
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

  const setRatioTarget = async (Target) => {
    try {
      // Call the contract to set both numerator and denominator
      await handleContractCall(RatioContract, "setRatioTarget", [Target]);
      console.log(`Ratio target set to `);
    } catch (error) {
      console.error("Error setting ratio target:", error);
    }
  };
  const setReverseTime = async (start, end) => {
    try {
      // Call the contract to set both numerator and denominator
      await RatioContract.setReverseSwapTimeRangeForPair(start, end);

      console.log(`seted reverse time`);
    } catch (error) {
      console.error("Error setting reverse target:", error);
    }
  };
  const SetOnePercentageOfBalance = async () => {
    try {
      // Fetch raw one percent balance
      const rawFluxinBalance = await handleContractCall(
        RatioContract,
        "getOnepercentOfUserBalance",
        [],
        (s) => ethers.formatUnits(s, 18)
      );

      const balance = Math.floor(parseFloat(rawFluxinBalance || "0"));
      console.log("SetOnePercentageOfBalance -> Fluxin:", balance);

      const rp = await getCachedRatioTarget();
      console.log("FluxinRatioPrice:", FluxinRatioPrice);
      console.log("Ratio Price (rp):", parseFloat(rp).toString());
      console.log("isReversed:", isReversed.toString());
      const rp1 = parseFloat(rp);
	  const isreverse = isReversed.toString();
      let adjustedBalance;

      // Determine balance adjustment based on conditions
      if ( FluxinRatioPrice > rp && isreverse) {
        console.log(
          "Condition: FluxinRatioPrice > rp && isReversed === 'true'"
        );
        adjustedBalance = balance + balance;
      } else if (FluxinRatioPrice < rp1) {
        console.log("Condition: FluxinRatioPrice < rp");
        adjustedBalance = balance ;
      } else {
        console.warn("No matching conditions. Defaulting to raw balance.");
        console.log("fluxinRatioPrice", FluxinRatioPrice);
		console.log("Ratio Price (rp):", parseFloat(rp).toString());

        adjustedBalance = balance;
      }

      console.log("Adjusted Balance:", adjustedBalance);

      // Update states
      setOnePBalance(adjustedBalance);
      setFormatedBalance(adjustedBalance);
    } catch (e) {
      console.error("Error fetching One Percentage balance of tokens:", e);
    }
  };
  const setReverseEnable = async (condition) => {
    try {
      // Call the contract to set both numerator and denominator
      await RatioContract.setReverseSwap(condition);

      console.log(`seted reverse time`);
    } catch (error) {
      console.error("Error setting reverse target:", error);
    }
  };
  const reverseSwapEnabled = async () => {
    try {
      // Call the contract to set both numerator and denominator
      const isrevers = await handleContractCall(
        RatioContract,
        "reverseSwapEnabled",
        []
      );

      setisReversed(isrevers.toString());
      console.log(`seted reverse`, isrevers.toString());
    } catch (error) {
      console.error("Error setting reverse target:", error);
    }
  };

  const DepositToken = async (name, TokenAddress, amount) => {
    try {
      const amountInWei = ethers.parseUnits(amount, 18); // Convert amount to Wei
      setButtonText("pending");
      // Check current allowance directly
      const allowance = await contracts[name].allowance(
        account,
        Ratio_TOKEN_ADDRESS
      );
      const formattedAllowance = ethers.formatUnits(allowance, 18);

      // Approve if insufficient allowance
      if (parseFloat(formattedAllowance) < parseFloat(amount)) {
        const approveTx = await contracts[name].approve(
          Ratio_TOKEN_ADDRESS,
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
      const depositTx = await RatioContract.depositTokens(
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

  const StartAuction = async () => {
    try {
      await handleContractCall(RatioContract, "startAuction", [], (s) =>
        ethers.formatUnits(s, 18)
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
        davContract,
        mintDAV,
        CalculationOfCost,
        TotalCost,
        DavHoldings,
        davHolds,
        DavHoldingsPercentage,
        davPercentage,
        DavSupply,
        DavBalance,
        DAVTokensWithdraw,
        handleAddTokenDAV,
        davTransactionHash,
        DAVTokensFiveWithdraw,

        //STATE Token
        StateHolds,
        StateSupply,
        StateBalance,
        RenounceState,
        stateTransactionHash,
        Supply,
        WithdrawState,
        handleAddTokenState,
        PercentageOfState,
        TotalStateHoldsInUS,

        ViewDistributedTokens,
        setClaiming,

        contracts,
        FluxinBalance,
        XerionBalance,
        ClaimTokens,
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
        FluxinSupply,
        XerionSupply,
        setReverseEnable,
        AuctionRunning,
        WithdrawFluxin,
        WithdrawXerion,
        CheckMintBalance,

        withdraw_95,
        handleAddTokenRatio,
        handleAddFluxin,
        handleAddXerion,
        FormattedInbalance,
        withdraw_5,
        userSwapped,
        // WithdrawLPTokens,
        mintAdditionalTOkens,
        isRenounced,
        checkOwnershipStatus,
        fluxinTransactionHash,
        XerionTransactionHash,
        SetAUctionDuration,
        SetAUctionInterval,
        AuctionTime,
        AuctionDuration,
        Approve,
        AuctionNextTime,
        DepositToken,
        RatioValues,
        OnePBalance,
        OutBalance,
        StartAuction,
        setReverseTime,
        userHashSwapped,
        AuctionTimeRunning,
        buttonTextStates,
        swappingStates,
        AuctionRunningLocalString,
        transactionStatus,
        isReversed,
      }}
    >
      {children}
    </DAVTokenContext.Provider>
  );
};
DAVTokenProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
