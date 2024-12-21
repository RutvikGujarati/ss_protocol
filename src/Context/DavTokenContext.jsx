// DAVTokenContext.js
import { createContext, useContext, useState, useEffect } from "react";
import { ethers } from "ethers";
import DAVTokenABI from "../ABI/DavTokenABI.json";
import StateABI from "../ABI/StateTokenABI.json";
import RatioABI from "../ABI/RatioABI.json";
import PropTypes from "prop-types";

const DAVTokenContext = createContext();

export const DAV_TOKEN_ADDRESS = "0x40Ae7404e9E915552414C4F9Fa521214f8E5CBc3";
export const STATE_TOKEN_ADDRESS = "0xFed740728a32d4f0519732095B4f6c5B752EAaF7";
export const Ratio_TOKEN_ADDRESS = "0xAE79930e57BB2EA8dde7381AC6d338A706386bAe";

export const useDAVToken = () => useContext(DAVTokenContext);

export const DAVTokenProvider = ({ children }) => {
  //contract initialization states
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);

  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [LpTokens, setLpTokens] = useState(false);

  //contract state
  const [davContract, setDavContract] = useState(null);
  const [stateContract, setStateContract] = useState(null);
  const [RatioContract, setRatioContract] = useState(null);

  const [TotalCost, setTotalCost] = useState(null);
  const [CurrentSReward, setCurrentSReward] = useState(null);
  const [AuctionRunning, setIsAuctionRunning] = useState(false);
  const [ButtonText, setButtonText] = useState("");
  const [davHolds, setDavHoldings] = useState("0.0");
  const [StateHolds, setStateHoldings] = useState("0.0");
  const [davPercentage, setDavPercentage] = useState("0.0");
  const [Supply, setSupply] = useState("0.0");
  const [DAVTokensWithdraw, setDAvTokens] = useState("0.0");
  const [DAVTokensFiveWithdraw, setFiveAvTokens] = useState("0.0");
  const [StateReward, setStateReward] = useState("0");
  const [Distributed, setViewDistributed] = useState("0.0");
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
      console.error(`Error calling ${method}:", error`, error);
    }
  };

  const mintDAV = async (amount) => {
    const value = ethers.parseEther(amount.toString());
    const cost = ethers.parseEther((amount * 10).toString()); // org - 100000
    await handleContractCall(davContract, "mintDAV", [value, { value: cost }]);
  };

  const GetStateRewards = async (amount) => {
    if (!amount || isNaN(amount) || amount <= 0) return setStateReward(0);
    const reward = await handleContractCall(
      davContract,
      "getAdjustedReward",
      [ethers.parseEther(amount.toString())],
      (r) => ethers.formatUnits(r, 18)
    );
    setStateReward(reward);
  };

  const CalculationOfCost = async (amount) => {
    setTotalCost(ethers.parseEther((amount * 100000).toString()));
  };
  //DAV and STate token functions
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
        "getDAVHoldings",
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
      const percentage = await handleContractCall(
        davContract,
        "getUserHoldingPercentage",
        [account],
        (p) => ethers.formatUnits(p, 18)
      );

      if (percentage) {
        setDavPercentage(parseFloat(percentage).toFixed(4));
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

  //   const GetCurrentStateReward = async () => {
  //     const reward = await handleContractCall(
  //       davContract,
  //       "getAdjustedReward",
  //       [],
  //       (r) => ethers.formatUnits(r, 18)
  //     );
  //     setCurrentSReward(reward);
  //   };
    const LiquidityTransferred = async () => {
      const reward = await handleContractCall(
        davContract,
        "totalLiquidityTransferred",
        [],
        (r) => ethers.formatUnits(r, 18)
      );
      setLPStateTransferred(reward);
    };

  const releaseNextBatch = async () => {
    await handleContractCall(davContract, "releaseNextBatch");
  };
  useEffect(() => {
    let interval;

    const fetchLiveData = async () => {
      if (davContract && stateContract && RatioContract) {
        try {
          // Individual function calls with error handling
          try {
            await DavHoldings();
          } catch (error) {
            console.error("Error fetching DavHoldings:", error);
          }

          try {
            await DavHoldingsPercentage();
          } catch (error) {
            console.error("Error fetching DavHoldingsPercentage:", error);
          }

          try {
            await StateHoldings();
          } catch (error) {
            console.error("Error fetching StateHoldings:", error);
          }

          try {
            await DavSupply();
          } catch (error) {
            console.error("Error fetching DavSupply:", error);
          }
          try {
            await LiquidityTransferred();
          } catch (error) {
            console.error("Error fetching DavSupply:", error);
          }

          try {
            await ViewDistributedTokens();
          } catch (error) {
            console.error("Error fetching ViewDistributedTokens:", error);
          }

          try {
            await getBurnedSTATE();
          } catch (error) {
            console.error("Error fetching getBurnedSTATE:", error);
          }

          try {
            await calculateBurnAmount();
          } catch (error) {
            console.error("Error fetching calculateBurnAmount:", error);
          }

          try {
            await ratioOfBurn();
          } catch (error) {
            console.error("Error fetching ratioOfBurn:", error);
          }

          try {
            await calculateOnePercentBurnAmount();
          } catch (error) {
            console.error(
              "Error fetching calculateOnePercentBurnAmount:",
              error
            );
          }

          // Uncomment if needed
          // try {
          //   await GetCurrentStateReward();
          // } catch (error) {
          //   console.error("Error fetching GetCurrentStateReward:", error);
          // }

          try {
            await StateTokenBurnRatio();
          } catch (error) {
            console.error("Error fetching StateTokenBurnRatio:", error);
          }

          try {
            await getRatioTarget();
          } catch (error) {
            console.error("Error fetching getRatioTarget:", error);
          }

          try {
            await isAuctionRunning();
          } catch (error) {
            console.error("Error fetching isAuctionRunning:", error);
          }

          try {
            await LpTokenAmount();
          } catch (error) {
            console.error("Error fetching LpTokenAmount:", error);
          }

          try {
            await DAVTokenAmount();
          } catch (error) {
            console.error("Error fetching DAVTokenAmount:", error);
          }

          try {
            await DAVTokenfive_Amount();
          } catch (error) {
            console.error("Error fetching DAVTokenfive_Amount:", error);
          }
        } catch (error) {
          console.error("Error fetching live data:", error);
        }
      }
    };

    fetchLiveData();

    interval = setInterval(() => {
      fetchLiveData();
    }, 10000);

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
  const ClaimTokens = async () => {
    try {
      setClaiming(true);
      await handleContractCall(RatioContract, "claimTokens", [], (s) =>
        ethers.formatUnits(s, 18)
      );
      setClaiming(false);
    } catch (e) {
      console.error("Error claiming tokens:", e);
      setClaiming(false);
    }
  };
  const ClaimLPTokens = async () => {
    try {
      setClaiming(true);
      await handleContractCall(RatioContract, "WithdrawLPTokens", [], (s) =>
        ethers.formatUnits(s, 18)
      );
      setClaiming(false);
    } catch (e) {
      console.error("Error claiming tokens:", e);
      setClaiming(false);
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

  const calculateShare = async (percentage, setAmount) => {
    try {
      const balance = await handleContractCall(
        davContract,
        "balacneETH",
        [],
        (s) => ethers.formatUnits(s, 18)
      );
      const share = (parseFloat(balance) * percentage) / 100;
      setAmount(share);
    } catch (e) {
      console.error(`Error fetching ${percentage}% share:`, e);
      setAmount(null); // Handle error state
    }
  };

  const withdraw_5 = () => handleWithdraw("withdrawDevelopmentShare");
  const withdraw_95 = () => handleWithdraw("withdrawLiquidityShare");

  const DAVTokenAmount = () => calculateShare(95, setDAvTokens);
  const DAVTokenfive_Amount = () => calculateShare(5, setFiveAvTokens);

  const SwapTokens = async (amount) => {
    try {
      // Step 0: Initial button state
      setButtonText("Check allowance...");

      // Convert amount to wei
      const amountInWei = ethers.parseUnits(amount.toString(), 18);

      // Step 1: Check Allowance
      const allowance = await stateContract.allowance(account, RatioContract);

      if (allowance < amountInWei) {
        // Step 2: Approve Tokens
        setButtonText("Approving...");
        const approveTx = await stateContract.approve(
          RatioContract,
          amountInWei
        );
        await approveTx.wait();
        const approveTx2 = await stateContract.approve(account, amountInWei);
        await approveTx2.wait();
        console.log("Approval successful!");
      } else {
        console.log("Sufficient allowance already granted.");
      }

      // Step 3: Call Swap Function
      setButtonText("swapping...");
      await handleContractCall(RatioContract, "swapSTATEForListedTokens", [
        amountInWei,
      ]);

      // Step 4: Swap Success
      setButtonText("Swap successful!");
      console.log("Swap successful!");
    } catch (e) {
      console.error("Error during token swap:", e);
      setButtonText("Error occurred. Try again.");
    }
  };

  const ViewDistributedTokens = async () => {
    const amount = await handleContractCall(
      RatioContract,
      "viewClaimableTokens",
      [account],
      (s) => ethers.formatUnits(s, 18)
    );
    setViewDistributed(amount);
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

      const burnRatio = await StateTokenBurnRatio();
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

  const ratioOfBurn = async () => {
    try {
      const totalBurnAmount = await calculateBurnAmount(); // Await the value
      const OnePercent = await calculateOnePercentBurnAmount(); // Await the async function

      // Debugging logs for clarity
      console.log("Total Burn Amount:", totalBurnAmount);
      console.log("1% Burn Amount:", OnePercent);

      // Validate totalBurnAmount and OnePercent
      if (!totalBurnAmount || isNaN(totalBurnAmount) || totalBurnAmount <= 0) {
        console.warn(
          "Invalid or zero total burn amount. Returning ratio as 1:0."
        );
        setBurnAMountRatio("1:0");
        return "1:0";
      }

      if (!OnePercent || isNaN(Number(OnePercent))) {
        console.warn("Invalid 1% burn amount. Returning ratio as 1:0.");
        setBurnAMountRatio("1:0");
        return "1:0";
      }

      const onePercentValue = Number(OnePercent);

      const ratio = onePercentValue / totalBurnAmount;

      if (isNaN(ratio)) {
        console.warn("Calculated ratio is NaN. Returning 1:0.");
        setBurnAMountRatio("1:0");
        return "1:0";
      }

      const ratioInFormat = `1:${(1 / ratio).toFixed(0)}`;
      console.log("Formatted Ratio:", ratioInFormat);

      setBurnAMountRatio(ratioInFormat);
      return ratioInFormat;
    } catch (error) {
      console.error("Error in ratioOfBurn calculation:", error);
      setBurnAMountRatio("1:0");
      return "1:0";
    }
  };

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
      await handleContractCall(RatioContract, "setRatioTarget", [
        numerator,
        denominator,
      ]);
      console.log(`Ratio target set to ${numerator}:${denominator}`);
    } catch (error) {
      console.error("Error setting ratio target:", error);
    }
  };
  const getRatioTarget = async () => {
    try {
      // Fetch both numerator and denominator from the contract
      const [numerator, denominator] = await handleContractCall(
        RatioContract,
        "getRatioTarget",
        [],
        (result) => result.map((s) => parseFloat(ethers.formatUnits(s, 18))) // Format each value separately
      );

      // Check if denominator is valid (non-zero)
      if (denominator > 0) {
        const ratio = `${numerator}:${denominator.toFixed(0)}`;
        setRatioTargetAmount(ratio); // Update the state with the ratio
      } else {
        console.warn("Invalid denominator.");
        setRatioTargetAmount(`${numerator}:0`); // Default to "numerator:0" in case of error
      }
    } catch (error) {
      console.error("Error fetching ratio target:", error);
      setRatioTargetAmount(null); // Handle error state properly
    }
  };

  const StateTokenBurnRatio = async () => {
    try {
      const burnAmount = await handleContractCall(
        RatioContract,
        "getBurnedSTATE",
        [],
        (s) => parseFloat(ethers.formatUnits(s, 18))
      );
      console.log("Burn Amount:", burnAmount);

      const totalSupply = await handleContractCall(
        RatioContract,
        "totalSupply",
        [],
        (s) => parseFloat(ethers.formatUnits(s, 18))
      );
      console.log("Total Supply:", totalSupply);

      if (totalSupply > 0) {
        const ratio = burnAmount / totalSupply;
        setStateBurnRatio(ratio.toFixed(10)); // Store ratio as a string for precision
        console.log("State Burn Ratio:", ratio);
        return ratio;
      } else {
        console.error("Total supply is zero. Cannot calculate ratio.");
      }
    } catch (error) {
      console.error("Error calculating state burn ratio:", error);
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

      if (wasAdded) {
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
        GetStateRewards,
        StateReward,
        // GetCurrentStateReward,
        CurrentSReward,
        DavHoldings,
        davHolds,
        DavHoldingsPercentage,
        davPercentage,
        StateHoldings,
        StateHolds,
        DavSupply,
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
        StateBurnedRatio,
        ListedTokenBurned,
        OneListedTokenBurned,
        SwapTokens,
        ButtonText,
        BurnTokenRatio,
        handleAddToken,
        setRatioTarget,
        RatioTargetAmount,
        AuctionRunning,
        ClaimLPTokens,
        LpTokenAmount,
        LpTokens,
        DAVTokensWithdraw,
        withdraw_95,
        handleAddTokenRatio,
        handleAddTokenState,
        handleAddTokenDAV,
        withdraw_5,
        // WithdrawLPTokens,
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
