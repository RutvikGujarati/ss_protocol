// DAVTokenContext.js
import { createContext, useContext, useState, useEffect } from "react";
import { ethers } from "ethers";
import DAVTokenABI from "../ABI/DavTokenABI.json";
import StateABI from "../ABI/StateTokenABI.json";
import RatioABI from "../ABI/RatioABI.json";
import PropTypes from "prop-types";
import { PriceContext } from "../api/StatePrice";

const DAVTokenContext = createContext();

// export const DAV_TOKEN_ADDRESS = "0xB044420Bd99b7dbcc412c1E0D998963C1162Cb15";
// export const STATE_TOKEN_ADDRESS = "0xcE8Ca38744B9a5598E990704e5Ba3756A54C7CEf";
// export const Ratio_TOKEN_ADDRESS = "0x5DbC0c8019B8701Df1b7923BB1074D16131834C0";
// export const XerionRatioAddress = "0xD7721C8420008CED169694612F823d028CA9f3d4";
// export const Fluxin = "0x60fe86aF11F760A0a87fDD2325F94D73594023B1";
// export const Xerion = "0xaE4733A33Dd8382B43466D572F0a94eF9579Ee45";

export const DAV_TOKEN_ADDRESS = "0xDBfb087D16eF29Fd6c0872C4C0525B38fBAEB319";
export const STATE_TOKEN_ADDRESS = "0x5Fe613215C6B6EFB846B92B24409E11450398aC5";
export const Ratio_TOKEN_ADDRESS = "0x3d8c16a21e110958fF0E5FA7E76a7EC41fe61EAe";
export const XerionRatioAddress = "0x08cbAE49E15d0C63d2c2A33BE641f9C6d0DF56cA";
export const Fluxin = "0xdE45C7EEED1E776dC266B58Cf863b9B9518cb7aa";
export const Xerion = "0xda5eF27FE698970526dFA7E47E824A843907AC71";

export const useDAVToken = () => useContext(DAVTokenContext);

export const DAVTokenProvider = ({ children }) => {
  const { stateUsdPrice, FluxinRatioPrice, XerionRatioPrice } =
    useContext(PriceContext);

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
  const [XerionRatioContract, setXerionRatioContract] = useState(null);

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
  const [isReversed, setisReversed] = useState({
    Fluxin: false,
    Xerion: false,
  });
  const [StateHolds, setStateHoldings] = useState("0.0");

  const [TotalStateHoldsInUS, setTotalStateHoldsInUS] = useState("0.00");

  const [davPercentage, setDavPercentage] = useState("0.0");
  const [Supply, setSupply] = useState("0.0");
  const [StateSupply, setStateSupply] = useState("0.0");
  const [FluxinSupply, setFluxinSupply] = useState("0.0");
  const [XerionSupply, setXerionSupply] = useState("0.0");
  const [DAVTokensWithdraw, setDAvTokens] = useState("0.0");
  const [OnePBalance, setOnePBalance] = useState({});
  const [FluxinOnepBalance, setFluxinOnepBalnce] = useState("0");
  const [XerionOnepBalance, setXerionOnepBalnce] = useState("0");

  const [buttonTextStates, setButtonTextStates] = useState({});
  const [swappingStates, setSwappingStates] = useState({});
  const [DAVTokensFiveWithdraw, setFiveAvTokens] = useState("0.0");

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
  const [BurnOccuredForToken, setBurnOccuredForToken] = useState({});
  const [BurnCycleACtive, setBurnCycleActive] = useState({});
  const [BurnTimeLeft, setBurnTimeLeft] = useState({});
  const [TotalTokensBurned, setTotalTokenBurned] = useState({});
  const [TotalBounty, setTotalTokenBounty] = useState({});
  const [AuctionTimeRunning, SetAuctionTimeRunning] = useState("0");
  const [AuctionTimeRunningXerion, SetAuctionTimeRunningXerion] = useState("0");
  const [RatioValues, SetRatioTargets] = useState("0");

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
          setXerionRatioContract(
            new ethers.Contract(XerionRatioAddress, RatioABI, newSigner)
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
      if (
        davContract &&
        stateContract &&
        RatioContract &&
        XerionRatioContract
      ) {
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
            getCachedRatioTarget().catch((error) =>
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
            StateBurnAmount().catch((error) =>
              console.error("Error fetching ContractStateBalance:", error)
            ),
            calculateBounty().catch((error) =>
              console.error("Error fetching ContractStateBalance:", error)
            ),
            ContractFluxinBalance().catch((error) =>
              console.error("Error fetching ContractFluxinBalance:", error)
            ),
            ContractFluxinStateBalance().catch((error) =>
              console.error("Error fetching ContractFluxinBalance:", error)
            ),
            ContractXerionStateBalance().catch((error) =>
              console.error("Error fetching ContractFluxinBalance:", error)
            ),
            ContractRatioFluxinBalance().catch((error) =>
              console.error("Error fetching ContractFluxinBalance:", error)
            ),
            ContractRatioXerionBalance().catch((error) =>
              console.error("Error fetching ContractFluxinBalance:", error)
            ),
            ContractXerionBalance().catch((error) =>
              console.error("Error fetching ContractXerionBalance:", error)
            ),
            DAVTokenAmount().catch((error) =>
              console.error("Error fetching DAVTokenAmount:", error)
            ),
            SetOnePercentageOfBalance(RatioContract, "Fluxin").catch((error) =>
              console.error("Error fetching DAVTokenAmount:", error)
            ),
            SetOnePercentageOfBalance(XerionRatioContract, "Xerion").catch(
              (error) => console.error("Error fetching DAVTokenAmount:", error)
            ),
            calculateBalancesForAllContracts().catch((error) =>
              console.error("Error fetching DAVTokenAmount:", error)
            ),
            AmountOutTokens().catch((error) =>
              console.error("Error fetching DAVTokenAmount:", error)
            ),
            AmountOut().catch((error) =>
              console.error("Error fetching DAVTokenAmount:", error)
            ),
            displayBalances().catch((error) =>
              console.error("Error fetching DAVTokenAmount:", error)
            ),
            DAVTokenfive_Amount().catch((error) =>
              console.error("Error fetching DAVTokenfive_Amount:", error)
            ),
            AuctionTimeInterval().catch((error) =>
              console.error("Error fetching DAVTokenfive_Amount:", error)
            ),

            HasSwappedAucton().catch((error) =>
              console.error("Error fetching DAVTokenfive_Amount:", error)
            ),
            BurningOccurred().catch((error) =>
              console.error("Error fetching DAVTokenfive_Amount:", error)
            ),
            BurnCycleActive().catch((error) =>
              console.error("Error fetching DAVTokenfive_Amount:", error)
            ),
            BurnTimingLeft().catch((error) =>
              console.error("Error fetching DAVTokenfive_Amount:", error)
            ),
            TotalTokensBurn().catch((error) =>
              console.error("Error fetching DAVTokenfive_Amount:", error)
            ),
            TotalBountyAmount().catch((error) =>
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
  }, [davContract, stateContract, RatioContract, XerionRatioContract, account]);

  // Ratio Token Contracts
  // -- auction

  const isAuctionRunning = async () => {
    try {
      const contracts = [
        { contract: RatioContract, name: "Fluxin" },
        { contract: XerionRatioContract, name: "Xerion" },
        // Add more contracts here as needed
      ];

      const auctionStatus = {};

      // Loop through all contracts
      for (const { contract, name } of contracts) {
        const isRunning = await handleContractCall(contract, "isAuctionActive");
        auctionStatus[name] = isRunning.toString();
        console.log(`isAuctionRunning -> ${name}:`, isRunning.toString());
      }

      setIsAuctionRunning({
        ...auctionStatus,
        state: true,
      });

      setIsAuctionRunningLocalString({
        ...auctionStatus,
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

  const AmountOutTokens = async () => {
    try {
      const contracts = [
        {
          contract: RatioContract,
          name: "Fluxin",
          ratioPrice: FluxinRatioPrice,
        },
        {
          contract: XerionRatioContract,
          name: "Xerion",
          ratioPrice: XerionRatioPrice,
        },
      ];

      const amounts = {};

      // Loop through all contracts
      for (const { contract, name, ratioPrice } of contracts) {
        const rawTokenBalanceUser = await handleContractCall(
          contract,
          "getOnepercentOfUserBalance",
          [],
          (s) => ethers.formatUnits(s, 18)
        );
        console.log(`${name} -> Raw Token Balance:`, rawTokenBalanceUser);

        const tokenBalance = Math.floor(parseFloat(rawTokenBalanceUser || "0"));
        console.log(`${name} -> Parsed Token Balance:`, tokenBalance);

        const calculation = tokenBalance * ratioPrice * 2;
        const adjustedBalance = parseFloat(calculation || "0");
        console.log(`${name} -> Calculated Balance:`, adjustedBalance);

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

  const displayBalances = async () => {
    const values = await AmountOutTokens();
    console.log("Fluxin Raw Balance:", values.Fluxin.adjustedBalance || 0);
    console.log(
      "Fluxin Adjusted Balance:",
      OnePBalance?.Fluxin?.adjustedBalance || 0
    );
    console.log(
      "Fluxin Formatted Balance:",
      OnePBalance?.Fluxin?.formattedBalance || "0.00"
    );

    console.log("Xerion Raw Balance:", OnePBalance?.Xerion?.rawBalance || 0);
    console.log(
      "Xerion Adjusted Balance:",
      OnePBalance?.Xerion?.adjustedBalance || 0
    );
    console.log(
      "Xerion Formatted Balance:",
      OnePBalance?.Xerion?.formattedBalance || "0.00"
    );
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
          timeZone: "Asia/Kolkata",
          timeZoneName: "short",
        });
      };

      // List of token contracts to handle
      const contracts = [
        { contract: RatioContract, name: "Fluxin" },
        { contract: XerionRatioContract, name: "Xerion" }, // Example for another token
      ];

      const auctionData = {};

      for (const { contract, name } of contracts) {
        // Fetch the auction details for each token contract
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
        { name: "Fluxin", contract: RatioContract },
        { name: "Xerion", contract: XerionRatioContract },
      ];

      // Fetch data for all contracts
      const results = await Promise.all(
        contracts.map(async ({ name, contract }) => {
          const hasSwapped = await handleContractCall(
            contract,
            "getUserHasSwapped",
            []
          );
          return { name, hasSwapped };
        })
      );

      // Update state as an object with contract names as keys
      const newStates = results.reduce((acc, { name, hasSwapped }) => {
        acc[name] = hasSwapped;
        return acc;
      }, {});

      setUserHashSwapped(newStates); // Update state with the combined object
      console.log("Updated swap states:", newStates);
    } catch (e) {
      console.error("Error fetching swap status:", e);
    }
  };
  const BurningOccurred = async () => {
    try {
      const contracts = [
        { name: "Fluxin", contract: RatioContract },
        { name: "Xerion", contract: XerionRatioContract },
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
        { name: "Fluxin", contract: RatioContract },
        { name: "Xerion", contract: XerionRatioContract },
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
        { name: "Fluxin", contract: RatioContract },
        { name: "Xerion", contract: XerionRatioContract },
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
        { name: "Fluxin", contract: RatioContract },
        { name: "Xerion", contract: XerionRatioContract },
      ];

      const results = await Promise.all(
        contracts.map(async ({ name, contract }) => {
          const TotalTokensBurned = await handleContractCall(
            contract,
            "getTotalTokensBurned",
            [],
            (s) => ethers.formatUnits(s, 18)
          );

          return { name, TotalTokensBurned: parseFloat(TotalTokensBurned) };
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
        { name: "Fluxin", contract: RatioContract },
        { name: "Xerion", contract: XerionRatioContract },
      ];

      const results = await Promise.all(
        contracts.map(async ({ name, contract }) => {
          const TotalBounty = await handleContractCall(
            contract,
            "getTotalBountyCollected",
            [],
            (s) => ethers.formatUnits(s, 18)
          );

          return { name, TotalBounty: parseFloat(TotalBounty) };
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
        { contract: RatioContract, name: "Fluxin" },
        { contract: XerionRatioContract, name: "Xerion" },
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
  }, [Xerion, STATE_TOKEN_ADDRESS, RatioContract]);

  const contractMapping = {
    fluxinRatio: RatioContract,
    XerionRatio: XerionRatioContract,
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
      // List of token contracts to handle
      const contracts = [
        { contract: RatioContract, name: "Fluxin" },
        { contract: XerionRatioContract, name: "Xerion" }, // Example for another token
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
  let cachedRatioTargets = {}; // Store cached ratio targets for multiple tokens

  const getCachedRatioTarget = async () => {
    try {
      // If cached value exists for each token, return it
      if (Object.keys(cachedRatioTargets).length > 0) {
        console.log("Using cached Ratio Targets:", cachedRatioTargets);
        return cachedRatioTargets;
      }

      // Fetch the ratio target values from the contracts
      const ratioTargetValues = await RatioTargetValues();

      // Cache the fetched values
      cachedRatioTargets = ratioTargetValues;
      console.log("Fetched and cached Ratio Targets:", cachedRatioTargets);
      setRatioTargetsOfTokens(cachedRatioTargets);
      return ratioTargetValues;
    } catch (e) {
      console.error("Error fetching ratio targets:", e);
    }
  };

  const StateBurnAmount = async () => {
    try {
      const contractDetails = [
        { name: "Fluxin", contract: RatioContract },
        { name: "Xerion", contract: XerionRatioContract },
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
        FluxinContract,
        "balanceOf",
        [Ratio_TOKEN_ADDRESS],
        (s) => ethers.formatUnits(s, 18)
      );
      const fluxinUseableAmount = fluxinTransaction * 0.00001;
      const fluxinBounty = (fluxinUseableAmount * 1) / 100;

      // Fetch Xerion balance and calculate bounty
      const xerionTransaction = await handleContractCall(
        XerionContract,
        "balanceOf",
        [XerionRatioAddress],
        (s) => ethers.formatUnits(s, 18)
      );
      const xerionUseableAmount = xerionTransaction * 0.00001;
      const xerionBounty = (xerionUseableAmount * 1) / 100;

      // Update the state with both bounty values
      setBountyBalances({
        fluxinBounty: fluxinBounty.toFixed(6),
        xerionBounty: xerionBounty.toFixed(6),
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
      stateContract,
      STATE_TOKEN_ADDRESS,
      "stateBalance"
    );
  };

  const ContractFluxinBalance = async () => {
    await fetchContractBalance(FluxinContract, Fluxin, "fluxinBalance");
  };
  const ContractFluxinStateBalance = async () => {
    await fetchContractBalance(
      stateContract,
      Ratio_TOKEN_ADDRESS,
      "StateFluxin"
    );
  };
  const ContractXerionStateBalance = async () => {
    await fetchContractBalance(
      stateContract,
      XerionRatioAddress,
      "StateXerion"
    );
  };

  const ContractRatioFluxinBalance = async () => {
    await fetchContractBalance(
      FluxinContract,
      Ratio_TOKEN_ADDRESS,
      "ratioFluxinBalance"
    );
  };
  const ContractRatioXerionBalance = async () => {
    await fetchContractBalance(
      XerionContract,
      XerionRatioAddress,
      "ratioXerionBalance"
    );
  };

  const ContractXerionBalance = async () => {
    await fetchContractBalance(XerionContract, Xerion, "xerionBalance");
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
  console.log("Contract functions:", RatioContract);

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
        Fluxin: FluxinContract,
        Xerion: XerionContract,
        state: stateContract,
      };
      const ReverseMapping = {
        Fluxin: isReversed.Fluxin,
        Xerion: isReversed.Xerion,
      };

      console.log("contract to use:", contractToUse[ContractName]);

      const rp = await getCachedRatioTarget();
      const forContract = rp[ContractName];
      const rp1 = parseFloat(forContract);
      console.log("rps", rp1);
      const isreverse = ReverseMapping[ContractName];
      console.log("reversing yes", isreverse);
      let selectedContract;
      if (
        (ContractName == "Fluxin" && FluxinRatioPrice > rp1) ||
        (ContractName == "Xerion" && XerionRatioPrice > rp1)
      ) {
        if (isreverse) {
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
	
      const extraFee = gasPriceData.gasPrice / BigInt(100); // 1% of gas price
      console.log(`Extra Fee (in wei): ${extraFee.toString()}`);
      const contracts = {
        Fluxin: RatioContract,
        Xerion: XerionRatioContract,
      };
      // Perform the token swap
      const swapTx = await contracts[ContractName].swapTokens(
        account,
        amountInWei,
        extraFee,
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
  const ClickBurn = async (ContractName) => {
    try {
      await contractMapping[ContractName].burnTokens();
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
  const SetOnePercentageOfBalance = async (contract, tokenName) => {
    try {
      // Fetch raw one percent balance for the given contract
      const rawBalance = await handleContractCall(
        contract,
        "getOnepercentOfUserBalance",
        [],
        (s) => ethers.formatUnits(s, 18)
      );

      const balance = Math.floor(parseFloat(rawBalance || "0"));
      console.log(`SetOnePercentageOfBalance -> ${tokenName}:`, balance);

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
      const value = await SetOnePercentageOfBalance(RatioContract, "Fluxin");
      const valueXerion = await SetOnePercentageOfBalance(
        XerionRatioContract,
        "Xerion"
      );
      setFluxinOnepBalnce(value.balance);
      setXerionOnepBalnce(valueXerion.balance);
      console.log("Final Balances in State:", value.balance);
    } catch (e) {
      console.error("Error calculating balances for all contracts:", e);
    }
  };

  const setReverseEnable = async (condition, contractName) => {
    try {
      // Call the contract to set both numerator and denominator
      await contractMapping[contractName].setReverseSwap(condition);

      console.log(`seted reverse time`);
    } catch (error) {
      console.error("Error setting reverse target:", error);
    }
  };
  const reverseSwapEnabled = async () => {
    try {
      const isrevers = await handleContractCall(
        RatioContract,
        "reverseSwapEnabled",
        []
      );
      const isreverseXerion = await handleContractCall(
        XerionRatioContract,
        "reverseSwapEnabled",
        []
      );

      setisReversed({
        Fluxin: isrevers.toString(),
        Xerion: isreverseXerion.toString(),
      });
      console.log(`seted reverse`, isrevers.toString());
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
        balances,
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
        withdraw_5,
        userHashSwapped,
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
        setReverseTime,
        getCachedRatioTarget,
        AuctionTimeRunning,
        buttonTextStates,
        swappingStates,
        AuctionRunningLocalString,
        transactionStatus,
        AuctionTimeRunningXerion,
        isReversed,
        StateBurnBalance,
        RatioTargetsofTokens,
        FluxinOnepBalance,
        XerionOnepBalance,
        BurnOccuredForToken,
        BurnCycleACtive,
        bountyBalances,
        TotalBounty,
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
