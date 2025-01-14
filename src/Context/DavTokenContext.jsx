// DAVTokenContext.js
import { createContext, useContext, useState, useEffect } from "react";
import { ethers } from "ethers";
import DAVTokenABI from "../ABI/DavTokenABI.json";
import StateABI from "../ABI/StateTokenABI.json";
import RatioABI from "../ABI/RatioABI.json";
import PropTypes from "prop-types";

const DAVTokenContext = createContext();
//0xd75fA7c2380f539320F9ABD29D09f48DbEB0E13E
export const DAV_TOKEN_ADDRESS = "0x03b7Ce78A68E2f98C072C736b451D51F00C833c6";
export const STATE_TOKEN_ADDRESS = "0x63CC0B2CA22b260c7FD68EBBaDEc2275689A3969";
export const Ratio_TOKEN_ADDRESS = "0xb8810E0715B60687b0391379e15ce1EAdcE08aaB";

export const Fluxin = "0x6F01eEc1111748B66f735944b18b0EB2835aE201";

export const Xerion2 = "0x3391c40E62499Aa498503902b8712195db2624DD";
export const Xerion3 = "0x4a169d0e0dEF9C1a6a6ab3BBf6870371C830626D";

export const useDAVToken = () => useContext(DAVTokenContext);

export const DAVTokenProvider = ({ children }) => {
  //contract initialization states
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);
  const [DavBalance, setDavBalance] = useState(null);

  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [LpTokens, setLpTokens] = useState(false);

  //contract state
  const [davContract, setDavContract] = useState(null);
  const [stateContract, setStateContract] = useState(null);
  const [FluxinContract, setFluxinContract] = useState(null);
  const [Xerion2Contract, setXerion2Contract] = useState(null);
  const [Xerion3Contract, setXerion3Contract] = useState(null);
  const [RatioContract, setRatioContract] = useState(null);

  const [TotalCost, setTotalCost] = useState(null);
  const [CurrentSReward, setCurrentSReward] = useState(null);
  const [AuctionRunning, setIsAuctionRunning] = useState(false);
  const [ButtonText, setButtonText] = useState("");
  const [davHolds, setDavHoldings] = useState("0.0");
  const [StateHolds, setStateHoldings] = useState("0.0");
  const [davPercentage, setDavPercentage] = useState("0.0");
  const [Supply, setSupply] = useState("0.0");
  const [StateSupply, setStateSupply] = useState("0.0");
  const [FluxinSupply, setFluxinSupply] = useState("0.0");
  const [DAVTokensWithdraw, setDAvTokens] = useState("0.0");
  const [DAVTokensFiveWithdraw, setFiveAvTokens] = useState("0.0");
  const [LastLiquidity, setLastLiquidityTransaction] = useState("0.0");
  const [LastDevShare, setLastDevShare] = useState("0.0");
  const [Batch, setBatch] = useState("0.0");
  const [BatchAmount, setBatchAmount] = useState("0.0");
  const [StateBalance, setStateBalance] = useState("0.0");
  const [FluxinBalance, setFluxinBalance] = useState("0.0");
  const [PercentageOfState, setPercentage] = useState("0.0");
  const [PercentageFluxin, setFluxinPercentage] = useState("0.0");
  const [StateReward, setStateReward] = useState("0");
  const [Distributed, setViewDistributed] = useState({
    state: "0.0",
    Fluxin: "0.0",
    xerion2: "0.0",
    xerion3: "0.0",
  });
  const [tokenNames, setTokenNames] = useState({});
  const [StateBurned, setStateBurnAMount] = useState("0.0");

  const [ListedTokenBurned, setListedTokenBurnAMount] = useState("0.0");
  const [OneListedTokenBurned, setOneListedTokenBurnAMount] = useState("0.0");
  const [BurnTokenRatio, setBurnAMountRatio] = useState("0.0");
  const [LPStateTransferred, setLPStateTransferred] = useState("0.0");

  const [StateBurnedRatio, setStateBurnRatio] = useState("0.0");
  const [RatioTargetAmount, setRatioTargetAmount] = useState("0.0");

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
          setXerion2Contract(new ethers.Contract(Xerion2, StateABI, newSigner));
          setXerion3Contract(new ethers.Contract(Xerion3, StateABI, newSigner));
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

  const MoveTokens = async (amount) => {
    try {
      if (!amount || isNaN(amount)) {
        throw new Error("Invalid amount");
      }

      const value = ethers.parseEther(amount.toString());

      await handleContractCall(stateContract, "moveTokens", [
        DAV_TOKEN_ADDRESS,
        value,
      ]);
    } catch (error) {
      console.error("Error in MoveTokens:", error);
    }
  };
  const AddTokens = async (address) => {
    try {
      if (!address || isNaN(address)) {
        throw new Error("Invalid amount");
      }

      await handleContractCall(stateContract, "addSupportedToken", [
        DAV_TOKEN_ADDRESS,
        address,
      ]);
    } catch (error) {
      console.error("Error in addSupportedToken:", error);
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
    setDavHoldings(holdings);
  };
  const StateHoldings = async () => {
    try {
      const holdings = await handleContractCall(
        stateContract,
        "balanceOf",
        [account],
        (h) => ethers.formatUnits(h, 18)
      );

      if (holdings) {
        const formattedHoldings = new Intl.NumberFormat("en-US").format(
          holdings
        );
        setStateHoldings(formattedHoldings);
      } else {
        console.error("Failed to fetch state holdings.");
      }
    } catch (error) {
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

  const releases = [
    { dav: 1000000, releaseState: 50000000000000 },
    { dav: 1000000, releaseState: 40000000000000 },
    { dav: 1000000, releaseState: 30000000000000 },
    { dav: 1000000, releaseState: 20000000000000 },
    { dav: 1000000, releaseState: 10000000000000 },
  ];

  const releaseNextBatch = async (batchIndex) => {
    try {
      console.log("Batch Index:", batchIndex);

      // Validate batchIndex and releases array
      if (batchIndex < 0 || batchIndex >= releases.length) {
        throw new Error("Invalid batch index");
      }

      const releaseData = releases[batchIndex];

      // Ensure releaseData is not undefined
      if (!releaseData) {
        throw new Error(`No release data found for batch index ${batchIndex}`);
      }

      const { releaseState } = releaseData;

      console.log(
        `Releasing batch ${
          batchIndex + 1
        } with releaseState: ${releaseState}...`
      );

      // Call `releaseNextBatch` on DAV contract
      await handleContractCall(davContract, "releaseNextBatch");

      // Move tokens on the state contract
      await handleContractCall(stateContract, "moveTokens", [
        DAV_TOKEN_ADDRESS,
        releaseState,
      ]);

      console.log(`Batch ${batchIndex + 1} released successfully.`);
    } catch (error) {
      console.error("Error releasing next batch:", error);
    }
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
            StateHoldings().catch((error) =>
              console.error("Error fetching StateHoldings:", error)
            ),

            DavSupply().catch((error) =>
              console.error("Error fetching DavSupply:", error)
            ),
            getDecayPercentage("state").catch((error) =>
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
            FluxinTotalMintedSupply().catch((error) =>
              console.error("Error fetching FluxinTotalMintedSupply:", error)
            ),
            getBurnedSTATE().catch((error) =>
              console.error("Error fetching getBurnedSTATE:", error)
            ),
            // StateTokenBurnRatio().catch((error) =>
            //   console.error("Error fetching StateTokenBurnRatio:", error)
            // ),
            // getRatioTarget().catch((error) =>
            //   console.error("Error fetching getRatioTarget:", error)
            // ),
            isAuctionRunning().catch((error) =>
              console.error("Error fetching isAuctionRunning:", error)
            ),
            LpTokenAmount().catch((error) =>
              console.error("Error fetching LpTokenAmount:", error)
            ),
            ContractStateBalance().catch((error) =>
              console.error("Error fetching ContractStateBalance:", error)
            ),
            ContractFluxinBalance().catch((error) =>
              console.error("Error fetching ContractFluxinBalance:", error)
            ),
            DAVTokenAmount().catch((error) =>
              console.error("Error fetching DAVTokenAmount:", error)
            ),
            DAVTokenfive_Amount().catch((error) =>
              console.error("Error fetching DAVTokenfive_Amount:", error)
            ),
          ]);
        } catch (error) {
          console.error("Error fetching live data:", error);
        }
      }
    };

    fetchLiveData();

    interval = setInterval(fetchLiveData, 10000);

    return () => clearInterval(interval); // Clean up interval on component unmount
  }, [davContract, stateContract, RatioContract, account]);

  // Ratio Token Contracts
  // -- auction
  const StartMarketPlaceListing = async () => {
    await handleContractCall(RatioContract, "startAuction", [], (s) =>
      ethers.formatUnits(s, 18)
    );
  };
  const isAuctionRunning = async () => {
    try {
      const isRunning = await handleContractCall(
        RatioContract,
        "isAuctionRunning",
        [],
        (response) => response // Assuming the contract returns a boolean value
      );
      console.log(isRunning);
      setIsAuctionRunning(isRunning); // Update the state with the boolean value
    } catch (error) {
      console.error("Error fetching auction status:", error);
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
  const [stateTransactionHash, setStateTransactionHash] = useState(null);

  const ReanounceContract = async () => {
    try {
      const tx = await handleContractCall(davContract, "renounceOwnership", []);
      console.log("DAV Transaction:", tx);

      if (tx && tx.hash) {
        console.log("DAV Transaction Hash:", tx.hash);
        setDavTransactionHash(tx.hash); // Set DAV transaction hash
      } else {
        console.error(
          "Transaction object doesn't contain transactionHash:",
          tx
        );
      }
    } catch (e) {
      console.error("Error renouncing ownership for DAV:", e);
    }
  };
  const ReanounceFluxinContract = async () => {
    try {
      const tx = await handleContractCall(
        FluxinContract,
        "renounceOwnership",
        []
      );
      console.log("Fluxin Transaction:", tx);

      if (tx && tx.hash) {
        console.log("Fluxin Transaction Hash:", tx.hash);
        setFluxinTransactionHash(tx.hash); // Set Fluxin transaction hash
      } else {
        console.error(
          "Transaction object doesn't contain transactionHash:",
          tx
        );
      }
    } catch (e) {
      console.error("Error renouncing ownership for Fluxin:", e);
    }
  };
  const AddTokensToContract = async (TokenAddress) => {
    try {
      await handleContractCall(RatioContract, "addSupportedToken", [
        TokenAddress,
      ]);
    } catch (e) {
      console.error("Error claiming tokens:", e);
    }
  };

  //   console.log(account)
  const RenounceState = async () => {
    try {
      const tx = await handleContractCall(
        stateContract,
        "renounceOwnership",
        []
      );
      console.log("State Transaction:", tx);

      if (tx && tx.hash) {
        console.log("State Transaction Hash:", tx.hash);
        setStateTransactionHash(tx.hash); // Set State transaction hash
      } else {
        console.error(
          "Transaction object doesn't contain transactionHash:",
          tx
        );
      }
    } catch (e) {
      console.error("Error renouncing ownership for State:", e);
    }
  };

  const contracts = {
    state: stateContract,
    dav: davContract,
    Fluxin: FluxinContract,
    xerion2: Xerion2Contract,
    xerion3: Xerion3Contract,
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

  const LpTokenAmount = async () => {
    try {
      const balance = await handleContractCall(
        RatioContract,
        "balanceOf",
        ["0x3Bdbb84B90aBAf52814aAB54B9622408F2dCA483"],
        (s) => ethers.formatUnits(s, 18)
      );

      // Calculate 60% of the balance
      const sixtyPercent = (parseFloat(balance) * 25) / 100;
      setLpTokens(sixtyPercent);
    } catch (e) {
      console.error("Error fetching LP tokens:", e);
      setLpTokens(null); // Handle error state
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
  const WithdrawState = async (amount) => {
    try {
      setClaiming(true);
      const amountInWei = ethers.parseUnits(amount, 18);

      await handleContractCall(stateContract, "transferToken", [amountInWei]);
    } catch (e) {
      console.error(`Error withdrawing with method transferToken:`, e);
    } finally {
      setClaiming(false);
    }
  };
  const WithdrawFluxin = async (amount) => {
    try {
      setClaiming(true);
      const amountInWei = ethers.parseUnits(amount, 18);

      await handleContractCall(FluxinContract, "transferToken", [amountInWei]);
    } catch (e) {
      console.error(`Error withdrawing with method transferToken:`, e);
    } finally {
      setClaiming(false);
    }
  };
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

  const withdraw_5 = () => handleWithdraw("withdrawDevelopmentFunds");
  const withdraw_95 = () => handleWithdraw("withdrawLiquidityFunds");

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
      }
    } catch (e) {
      console.error(
        `Error fetching decay percentage for "${contractName}":`,
        e
      );
    }
  };
  const ERC20_ABI = [
    "function allowance(address owner, address spender) view returns (uint256)",
    "function approve(address spender, uint256 amount) returns (bool)",
  ];

  const SwapTokens = async (amount, InContract) => {
    try {
      // Step 0: Initial button state
      setButtonText("Checking allowance...");

      // Convert amount to wei
      const amountInWei = ethers.parseUnits(amount.toString(), 18);

      // Get contract instance for `InContract`
      const tokenInContract = new ethers.Contract(
        InContract,
        ERC20_ABI,
        signer
      );

      // Step 1: Check Allowance for `InContract`
      const allowanceIn = await tokenInContract.allowance(
        account,
        RatioContract
      );

      if (allowanceIn < amountInWei) {
        // Step 2: Approve Tokens for `InContract`
        setButtonText("Approving input token...");
        const approveTx = await tokenInContract.approve(
          RatioContract,
          amountInWei
        );
        await approveTx.wait();
        console.log("Approval for input token successful!");
      } else {
        console.log("Sufficient allowance already granted for input token.");
      }

      // Step 1: Check Allowance for `OutContract` (if necessary)
      const allowanceOut = await stateContract.allowance(
        account,
        RatioContract
      );

      if (allowanceOut < amountInWei) {
        // Step 2: Approve Tokens for `OutContract`
        setButtonText("Approving output token...");
        const approveTx = await stateContract.approve(
          RatioContract,
          amountInWei
        );
        await approveTx.wait();
        console.log("Approval for output token successful!");
      } else {
        console.log("Sufficient allowance already granted for output token.");
      }

      // Step 3: Call Swap Function
      setButtonText("Swapping...");
      const ratioContract = new ethers.Contract(
        RatioContract,
        RatioABI,
        signer
      );
      const tx = await ratioContract.swapTokens(
        InContract,
        STATE_TOKEN_ADDRESS,
        amountInWei
      );
      await tx.wait();

      // Step 4: Swap Success
      setButtonText("Swap successful!");
      console.log("Swap successful!");
    } catch (e) {
      console.error("Error during token swap:", e);
      setButtonText("Error occurred. Try again.");
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

  const getBurnedSTATE = async () => {
    const amount = await handleContractCall(
      RatioContract,
      "getBurnedSTATE",
      [],
      (s) => ethers.formatUnits(s, 18)
    );
    setStateBurnAMount(amount);
  };
  const calculateBurnAmount = async () => {
    try {
      const amount = await handleContractCall(
        RatioContract,
        "totalListedTokensDeposited",
        [],
        (s) => parseFloat(ethers.formatUnits(s, 18))
      );
      console.log("totalListedTokensDeposited:", amount);

      const burnRatio = await StateBurnedRatio();
      console.log(`Burned Ratio: ${burnRatio}`);

      if (isNaN(burnRatio) || burnRatio <= 0) {
        throw new Error("Burn ratio is invalid or not set.");
      }

      const totalAmount = amount * burnRatio;
      setListedTokenBurnAMount(totalAmount.toFixed(7));
      console.log("Calculated Burn Amount:", totalAmount);
      return totalAmount.toFixed(18);
    } catch (error) {
      console.error("Error calculating burn amount:", error);
    }
  };

  const calculateOnePercentBurnAmount = async () => {
    try {
      const totalBurnAmount = await calculateBurnAmount(); // Ensure calculateBurnAmount returns the total value
      if (!totalBurnAmount || isNaN(totalBurnAmount)) {
        throw new Error("Total burn amount is invalid or not calculated.");
      }

      const onePercentBurnAmount = totalBurnAmount * 0.01; // Calculate 1% of the total burn amount
      console.log("1% of Burn Amount:", onePercentBurnAmount);
      setOneListedTokenBurnAMount(onePercentBurnAmount.toFixed(6));
      return onePercentBurnAmount.toFixed(18);
    } catch (error) {
      console.error("Error calculating 1% burn amount:", error);
      return "0.0";
    }
  };

  //   const ratioOfBurn = async () => {
  //     try {
  //       const totalBurnAmount = await calculateBurnAmount(); // Await the value
  //       const OnePercent = await calculateOnePercentBurnAmount(); // Await the async function

  //       // Debugging logs for clarity
  //       console.log("Total Burn Amount:", totalBurnAmount);
  //       console.log("1% Burn Amount:", OnePercent);

  //       // Validate totalBurnAmount and OnePercent
  //       if (!totalBurnAmount || isNaN(totalBurnAmount) || totalBurnAmount <= 0) {
  //         console.warn(
  //           "Invalid or zero total burn amount. Returning ratio as 1:0."
  //         );
  //         setBurnAMountRatio("1:0");
  //         return "1:0";
  //       }

  //       if (!OnePercent || isNaN(Number(OnePercent))) {
  //         console.warn("Invalid 1% burn amount. Returning ratio as 1:0.");
  //         setBurnAMountRatio("1:0");
  //         return "1:0";
  //       }

  //       const onePercentValue = Number(OnePercent);

  //       const ratio = onePercentValue / totalBurnAmount;

  //       if (isNaN(ratio)) {
  //         console.warn("Calculated ratio is NaN. Returning 1:0.");
  //         setBurnAMountRatio("1:0");
  //         return "1:0";
  //       }

  //       const ratioInFormat = `1:${(1 / ratio).toFixed(0)}`;
  //       console.log("Formatted Ratio:", ratioInFormat);

  //       setBurnAMountRatio(ratioInFormat);
  //       return ratioInFormat;
  //     } catch (error) {
  //       console.error("Error in ratioOfBurn calculation:", error);
  //       setBurnAMountRatio("1:0");
  //       return "1:0";
  //     }
  //   };

  const HandleBurn = async () => {
    setButtonText("Burning...");
    try {
      await handleContractCall(
        RatioContract,
        "burnAndDistributeListedTokens",
        []
      );
      setButtonText("Burn Complete");
    } catch (error) {
      console.error("Error :", error);
      setButtonText("Burn Failed");
    } finally {
      setTimeout(() => {
        setButtonText("Burn");
      }, 3000);
    }
  };

  const setRatioTarget = async (numerator, denominator) => {
    try {
      // Call the contract to set both numerator and denominator
      await handleContractCall(stateContract, "setRatioTarget", [
        numerator,
        denominator,
      ]);
      console.log(`Ratio target set to ${numerator}:${denominator}`);
    } catch (error) {
      console.error("Error setting ratio target:", error);
    }
  };
  //   const getRatioTarget = async () => {
  //     try {
  //       // Fetch both numerator and denominator from the contract
  //       const [numerator, denominator] = await handleContractCall(
  //         RatioContract,
  //         "getRatioTarget",
  //         [],
  //         (result) => result.map((s) => parseFloat(ethers.formatUnits(s, 18))) // Format each value separately
  //       );

  //       // Check if denominator is valid (non-zero)
  //       if (denominator > 0) {
  //         const ratio = `${numerator}:${denominator.toFixed(0)}`;
  //         setRatioTargetAmount(ratio); // Update the state with the ratio
  //       } else {
  //         console.warn("Invalid denominator.");
  //         setRatioTargetAmount(`${numerator}:0`); // Default to "numerator:0" in case of error
  //       }
  //     } catch (error) {
  //       console.error("Error fetching ratio target:", error);
  //       setRatioTargetAmount(null); // Handle error state properly
  //     }
  //   };

  //   const StateTokenBurnRatio = async () => {
  //     try {
  //       const burnAmount = await handleContractCall(
  //         RatioContract,
  //         "getBurnedSTATE",
  //         [],
  //         (s) => parseFloat(ethers.formatUnits(s, 18))
  //       );
  //       console.log("Burn Amount:", burnAmount);

  //       const totalSupply = await handleContractCall(
  //         RatioContract,
  //         "totalSupply",
  //         [],
  //         (s) => parseFloat(ethers.formatUnits(s, 18))
  //       );
  //       console.log("Total Supply:", totalSupply);

  //       if (totalSupply > 0) {
  //         const ratio = burnAmount / totalSupply;
  //         setStateBurnRatio(ratio.toFixed(10)); // Store ratio as a string for precision
  //         console.log("State Burn Ratio:", ratio);
  //         return ratio;
  //       } else {
  //         console.error("Total supply is zero. Cannot calculate ratio.");
  //       }
  //     } catch (error) {
  //       console.error("Error calculating state burn ratio:", error);
  //     }
  //   };

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
  const handleAddXerion2 = () => handleAddToken(Xerion2, "Xerion2");
  const handleAddXerion3 = () => handleAddToken(Xerion3, "Xerion3");

  return (
    <DAVTokenContext.Provider
      value={{
        provider,
        signer,
        davContract,
        loading,
        account,
        mintDAV,
        releaseNextBatch,
        CalculationOfCost,
        TotalCost,
        // GetStateRewards,
        StateReward,
        // GetCurrentStateReward,
        CurrentSReward,
        setClaiming,
        DavHoldings,
        davHolds,
        DavHoldingsPercentage,
        davPercentage,
        FluxinBalance,
        StateHoldings,
        StateHolds,
        DavSupply,
        StateSupply,
        contracts,
        Supply,
        LPStateTransferred,
        getBurnedSTATE,
        StartMarketPlaceListing,
        ClaimTokens,
        ViewDistributedTokens,
        Distributed,
        claiming,
        HandleBurn,
        StateBurned,
        DavBalance,
        StateBurnedRatio,
        ListedTokenBurned,
        OneListedTokenBurned,
        SwapTokens,
        ButtonText,
        ReanounceContract,
        ReanounceFluxinContract,
        RenounceState,
        MoveTokens,
        LastLiquidity,
        LastDevShare,
        Batch,
        BatchAmount,
        StateBalance,
        BurnTokenRatio,
        handleAddToken,
        setRatioTarget,
        PercentageFluxin,
        FluxinSupply,
        RatioTargetAmount,
        AuctionRunning,
        WithdrawState,
        WithdrawFluxin,
        CheckMintBalance,
        LpTokenAmount,
        LpTokens,
        DAVTokensWithdraw,
        withdraw_95,
        handleAddTokenRatio,
        handleAddTokenState,
        handleAddTokenDAV,
        handleAddFluxin,
        handleAddXerion2,
        handleAddXerion3,
        PercentageOfState,
        withdraw_5,
        // WithdrawLPTokens,
        AddTokens,
        AddTokensToContract,
        mintAdditionalTOkens,
        isRenounced,
        checkOwnershipStatus,
        davTransactionHash,
        stateTransactionHash,
        fluxinTransactionHash,

        DAVTokensFiveWithdraw,
      }}
    >
      {children}
    </DAVTokenContext.Provider>
  );
};
DAVTokenProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
