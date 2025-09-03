import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";

import PropTypes from "prop-types";
import { ethers } from "ethers";
import { useAccount, useChainId } from "wagmi";
import { ContractContext } from "./ContractInitialize";
import {
  getDAVContractAddress,
  getSTATEContractAddress,
  getAUCTIONContractAddress,
} from "../Constants/ContractAddresses";
import toast from "react-hot-toast";
import { ERC20_ABI, notifyError, notifySuccess } from "../Constants/Constants";
import { truncateDecimals } from "../Constants/Utils";

export const DAVContext = createContext();

export const DavProvider = ({ children }) => {
  const { AllContracts, signer } = useContext(ContractContext);
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const [buttonTextStates, setButtonTextStates] = useState({});
  const toastId = useRef(null);

  // Get contract addresses for the connected chain
  const getDavAddress = () => getDAVContractAddress(chainId);
  const getStateAddress = () => getSTATEContractAddress(chainId);
  const getAuctionAddress = () => getAUCTIONContractAddress(chainId);

  const [isLoading, setLoading] = useState(true);
  const [BurnClicked, setClicked] = useState(false);
  const [Claiming, setClaiming] = useState(false);
  const [users, setUsers] = useState([]);
  const [names, setNames] = useState([]);
  const [Emojies, setEmojies] = useState([]);
  const [TokenStatus, setTokenStatus] = useState([]);
  const [isUsed, setisUsed] = useState([]);
  const [isProcessing, setIsProcessing] = useState(null);
  const [isClaiming, setisClaiming] = useState(null);
  const [isProcessingToken, setProcessToken] = useState(false);

  const [data, setData] = useState({
    Supply: "0.0",
    stateHolding: "0.0",
    ReferralCodeOfUser: "0.0",
    ReferralAMount: "0.0",
    totalStateBurned: "0.0",
    TokenProcessing: "0.0",
    TokenWithImageProcessing: "0.0",
    DavMintFee: "0.0",
    pendingToken: "0.0",
    claimableAmount: "0.0",
    currentBurnCycle: "0.0",
    userBurnedAmountInCycle: "0.0",
    usableTreasury: "0.0",
    tokenEntries: null,
    expectedClaim: "0.0",
    CanClaimNow: "false",
    claimableAmountForBurn: "0.0",
    UserPercentage: "0.0",
    TimeUntilNextClaim: "0.0",
    AllUserPercentage: "0.0",
    stateHoldingOfSwapContract: "0.0",
    ContractPls: "0.0",
    davHolds: "0.0",
    davExpireHolds: "0.0",
    totalInvestedPls: "0.0",
  });

  // Helper to truncate without rounding
  const fetchAndSet = async (
    label,
    fn,
    format = true,
    fixed = 2,
    type = "number"
  ) => {
    try {
      const res = await fn();
      let value;

      if (type === "boolean") {
        value = res ? "true" : "false";
      } else if (label === "UserPercentage") {
        const raw = Number(res) / 100;
        value = truncateDecimals(raw, fixed);
      } else if (label === "DavMintFee") {
        // Special handling for DavMintFee to preserve full decimal value
        const raw = parseFloat(ethers.formatUnits(res, 18));
        value = raw.toString(); // Keep full precision

      } else {
        const raw = format ? parseFloat(ethers.formatUnits(res, 18)) : res;
        value = format ? truncateDecimals(raw, fixed) : raw.toString();
      }

      setData((prev) => ({
        ...prev,
        [label]: value,
      }));
    } catch (err) {
      if (
        err?.reason?.includes("No previous cycle exists") ||
        err?.data?.message?.includes("No previous cycle exists")
      ) {
        console.log(`Suppressed error for ${label}: No previous cycle exists`);
        return; // Skip updating state for this error
      }
      console.error(`Error fetching ${label}:`, err);
    }
  };

  const fetchData = useCallback(async () => {
    if (!AllContracts?.davContract || !address) return;

    console.log("🔍 Fetching contract data for chain:", chainId);
    console.log("🏦 DAV Contract address:", getDavAddress());
    console.log("👤 User address:", address);

    setLoading(true);
    try {
      const currentCycleRaw =
        await AllContracts.davContract.getCurrentClaimCycle();
      const currentCycle = parseInt(currentCycleRaw.toString());

      setData((prev) => ({
        ...prev,
        currentBurnCycle: currentCycle.toString(),
      }));

      await Promise.allSettled([
        fetchAndSet("Supply", () => AllContracts.davContract.totalSupply()),
        fetchAndSet("claimableAmount", () =>
          AllContracts.davContract.earned(address)
        ),
        fetchAndSet("userBurnedAmount", () =>
          AllContracts.davContract.getUserBurnedAmount(address)
        ),
        fetchAndSet("userBurnedAmountInCycle", () =>
          AllContracts.davContract.cycleTotalBurned(currentCycle)
        ),
        fetchAndSet("UserPercentage", () =>
          AllContracts.davContract.getUserSharePercentage(address)
        ),
        fetchAndSet("totalStateBurned", () =>
          AllContracts.davContract.totalStateBurned()
        ),
        fetchAndSet("TokenProcessing", () =>
          AllContracts.davContract.TOKEN_PROCESSING_FEE()
        ),
        fetchAndSet("TokenWithImageProcessing", () =>
          AllContracts.davContract.TOKEN_WITHIMAGE_PROCESS()
        ),
        fetchAndSet("DavMintFee", () => {
          console.log("🎯 Fetching TOKEN_COST from contract...");
          return AllContracts.davContract.TOKEN_COST();
        }),
        fetchAndSet("davHolds", () =>
          AllContracts.davContract.getActiveBalance(address)
        ),
        fetchAndSet("davGovernanceHolds", () =>
          AllContracts.davContract.balanceOf(address)
        ),
        fetchAndSet(
          "pendingToken",
          () => AllContracts.davContract.getPendingTokenNames(address),
          false
        ),
        fetchAndSet("stateHolding", () =>
          AllContracts.stateContract.balanceOf(address)
        ),
        fetchAndSet("stateHoldingOfSwapContract", () =>
          AllContracts.stateContract.balanceOf(getAuctionAddress())
        ),
        fetchAndSet(
          "tokenEntries",
          () => AllContracts.davContract.getAllTokenEntries(),
          false
        ),
        fetchAndSet(
          "ReferralCodeOfUser",
          () => AllContracts.davContract.getUserReferralCode(address),
          false
        ),
        fetchAndSet("ReferralAMount", () =>
          AllContracts.davContract.referralRewards(address)
        ),
      ]);

      // Calculate total invested PLS
      await calculateTotalInvestedPls();
    } catch (error) {
      console.error("Error fetching contract data:", error);
    } finally {
      setLoading(false);
    }
  }, [AllContracts, address, chainId]);

  const fetchStateHolding = async () => {
    await fetchAndSet("stateHolding", () =>
      AllContracts.stateContract.balanceOf(address)
    );
  };
  //   console.log("dav entries", data.DavMintFee);
  const calculateTotalInvestedPls = async () => {
    try {
      const davBalanceRaw = await AllContracts.davContract.balanceOf(address);
      const davMintFeeRaw = await AllContracts.davContract.TOKEN_COST();

      // Convert BigInt → decimal values
      const davBalance = parseFloat(ethers.formatUnits(davBalanceRaw, 18));
      const davMintFee = parseFloat(ethers.formatUnits(davMintFeeRaw, 18));

      // Normal JS multiplication and division
      const totalInvestedPlsValue = (davBalance * davMintFee).toFixed(2);

      setData((prev) => ({
        ...prev,
        totalInvestedPls: parseFloat(totalInvestedPlsValue).toFixed(0),
      }));

      console.log("Total invested PLS:", totalInvestedPlsValue);
    } catch (error) {
      console.error("Error calculating total invested PLS:", error);
      setData((prev) => ({
        ...prev,
        totalInvestedPls: "0.0",
      }));
    }
  };

  const fetchAndStoreTokenEntries = async () => {
    try {
      // Fetch token entries from the contract
      const tokenEntries = await AllContracts.davContract.getAllTokenEntries();

      // Extract addresses and token names
      const addresses = tokenEntries.map((entry) => entry.user);
      const tokenNames = tokenEntries.map((entry) => entry.tokenName);
      const tokenEmojis = tokenEntries.map((entry) => entry.emojiOrImage);
      const tokenStatus = tokenEntries.map((entry) => entry.TokenStatus);
      // Update state
      setUsers(addresses);
      setNames(tokenNames);
      setEmojies(tokenEmojis);
      setTokenStatus(tokenStatus);
    } catch (error) {
      console.error("Error fetching token entries:", error);
    }
  };

  const isTokenDeployed = async () => {
    try {
      // Only proceed if we have names and contracts are available
      if (!names || names.length === 0 || !AllContracts?.AuctionContract) {
        console.log("Skipping isTokenDeployed - no names or contracts available");
        return;
      }

      const results = await Promise.all(
        names.map(async (name) => {
          try {
            const isUsed = await AllContracts.AuctionContract.isTokenNameUsed(name);
            return isUsed;
          } catch (error) {
            console.error(`Error checking deployment for ${name}:`, error);
            return false; // Default to false on error
          }
        })
      );

      // Store the results directly as an array of booleans in the state
      setisUsed(results);
      console.log("✅ Updated isUsed state:", results);
    } catch (error) {
      console.error("Error in isTokenDeployed:", error);
      // Don't update state on error to preserve previous values
    }
  };

  useEffect(() => {
    if (address && AllContracts?.davContract) fetchData();
  }, [address, AllContracts?.davContract, fetchData]);

  // Call isTokenDeployed when names array changes
  useEffect(() => {
    if (names && names.length > 0 && AllContracts?.AuctionContract) {
      isTokenDeployed();
    }
  }, [names, AllContracts?.AuctionContract]);

  const fetchTimeUntilNextClaim = useCallback(async () => {
    if (!AllContracts?.davContract || !address) return;
    try {
      await Promise.allSettled([
        fetchAndSet(
          "TimeUntilNextClaim",
          () => AllContracts.davContract.getTimeUntilNextClaim(),
          false,
          0
        ),
        fetchAndSet("claimableAmountForBurn", () =>
          AllContracts.davContract.getClaimablePLS(address)
        ),
        fetchAndSet("usableTreasury", () =>
          AllContracts.davContract.getAvailableCycleFunds()
        ),
        fetchAndSet("davExpireHolds", () =>
          AllContracts.davContract.getExpiredTokenCount(address)
        ),
        fetchAndSet("davHolds", () =>
          AllContracts.davContract.getActiveBalance(address)
        ),
        fetchAndSet("ContractPls", () =>
          AllContracts.davContract.getContractPLSBalance()
        ),
        fetchAndSet(
          "CanClaimNow",
          () => AllContracts.davContract.canClaim(address),
          false
        ),
        fetchAndSet(
          "hasClaimingStarted",
          () => AllContracts.davContract.hasClaimingStarted(),
          false
        ),
      ]);
    } catch (error) {
      console.error("Error fetching time until next claim:", error);
    }
  }, [AllContracts, address]);

  useEffect(() => {
    if (!AllContracts?.davContract || !address) return;

    const interval = setInterval(() => {
      fetchTimeUntilNextClaim();
      fetchAndStoreTokenEntries();
      // Removed isTokenDeployed from frequent interval to prevent flickering
    }, 1000); // run every second

    return () => clearInterval(interval); // clean up on unmount
  }, [fetchTimeUntilNextClaim, AllContracts?.davContract, address]);

  // Separate interval for deployment status with longer frequency to prevent flickering
  useEffect(() => {
    if (!AllContracts?.AuctionContract || !names || names.length === 0) return;

    const deploymentInterval = setInterval(() => {
      isTokenDeployed();
    }, 10000); // Check deployment status every 10 seconds instead of every second

    return () => clearInterval(deploymentInterval);
  }, [names, AllContracts?.AuctionContract]);

  useEffect(() => {
    if (data.TimeUntilNextClaim === 0) {
      fetchData();
    }
  }, [data.TimeUntilNextClaim, fetchData]);

  useEffect(() => {
    if (isConnected && AllContracts?.davContract) {
      fetchData();
    }
  }, [isConnected, AllContracts, fetchData]);

  const [txStatus, setTxStatus] = useState("");

  const mintDAV = async (amount, ref = "") => {
    if (!AllContracts?.davContract) return;
    const ethAmount = ethers.parseEther(amount.toString());

    // Convert DavMintFee from string to number and calculate cost
    const davMintFeeNumber = parseFloat(data.DavMintFee);
    const cost = ethers.parseEther(
      (amount * davMintFeeNumber).toString()
    );

    console.log("🔍 Minting Debug:", {
      amount,
      davMintFee: data.DavMintFee,
      davMintFeeNumber,
      calculatedCost: (amount * davMintFeeNumber).toString(),
      chainId
    });

    const referral = ref.trim() || "0x0000000000000000000000000000000000000000";

    try {
      setTxStatus("initiated");
      const tx = await AllContracts.davContract.mintDAV(ethAmount, referral, {
        value: cost,
      });

      setTxStatus("pending");
      await tx.wait();

      setTxStatus("confirmed");
      notifySuccess(`${amount} token minted successfully!`);
      await fetchData();
      return tx;
    } catch (error) {
      setTxStatus("error");
      console.error("Minting error:", error);
      throw error;
    } finally {
      setTxStatus("")
    }
  };

  const AddYourToken = async (amount, Emoji, isImage = false) => {
    if (!AllContracts?.davContract) return;

    const cost = ethers.parseEther(
      (chainId === 146
        ? 100
        : isImage
          ? data.TokenWithImageProcessing
          : data.TokenProcessing
      ).toString()
    );
    let toastId = null;

    try {
      setProcessToken(true);

      // Wait for user confirmation
      const tx =
        address == import.meta.env.VITE_AUTH_ADDRESS
          ? await AllContracts.davContract.processYourToken(amount, Emoji)
          : await AllContracts.davContract.processYourToken(amount, Emoji, {
            value: cost,
          });

      toastId = toast.loading(
        isImage ? (
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <img
              src={Emoji}
              alt="token"
              style={{ width: 24, height: 24, borderRadius: 4 }}
            />
            <span>Processing token: {amount}</span>
          </div>
        ) : (
          `Processing token: ${amount} ${Emoji}`
        ),
        {
          position: "top-center",
        }
      );

      await tx.wait();
      toast.dismiss(toastId);
      toast.success(
        isImage ? (
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <img
              src={Emoji}
              alt="token"
              style={{ width: 24, height: 24, borderRadius: 4 }}
            />
            <span>Token listed: {amount}</span>
          </div>
        ) : (
          `Token listed: ${amount} ${Emoji}`
        ),
        {
          position: "top-center",
          autoClose: 5000,
        }
      );

      await fetchData();

      return tx;
    } catch (error) {
      console.error("Token listing error:", error, {
        reason: error.reason,
        data: error.data,
        message: error.message,
      });

      // Extract the contract error reason
      let errorMessage = "Transaction failed";
      if (error.reason) {
        errorMessage = error.reason; // Contract revert reason
      } else if (error.data?.message) {
        errorMessage = error.data.message; // Fallback to data.message
      } else if (error.message.includes("user rejected")) {
        errorMessage = "Transaction rejected by user";
      }

      // Show error in alert
      alert(`Error: ${errorMessage}`);

      // Update toast notification
      toast.dismiss(toastId);
      if (!toastId) {
        notifyError("❌ Transaction rejected by user")
      } else {
        notifyError(`❌ Error: ${errorMessage}`)
      }
      throw error;
    } finally {
      setProcessToken(false);
    }
  };
  const claimAmount = async () => {
    if (!AllContracts?.davContract) return;
    try {
      setisClaiming(true);
      const tx = await AllContracts.davContract.claimReward();
      await tx.wait();
      await fetchAndSet("claimableAmount", () =>
        AllContracts.davContract.earned(address)
      ); setisClaiming(false)
    } catch (err) {
      console.error("Claim error:", err);
      let errorMessage = "An unknown error occurred while claiming reward.";
      setisClaiming(false);
      if (err?.error?.message) {
        errorMessage = err.error.message;
      } else if (err?.reason) {
        errorMessage = err.reason;
      } else if (err?.message) {
        errorMessage = err.message;
      }

      alert(`Claim failed: ${errorMessage}`);
    } finally {
      setisClaiming(false)
    }
  };

  const deployWithMetaMask = async (name, symbol, emoji, five, swap, gov) => {
    if (!AllContracts?.AuctionContract) return;
    try {
      setIsProcessing(name); // Start processing
      const tx = await AllContracts.AuctionContract.deployUserToken(
        name,
        symbol,
        emoji,
        five,
        swap,
        gov
      );
      await tx.wait();
      await fetchData();
      await isTokenDeployed();
    } catch (err) {
      console.error("Claim error:", err);
    } finally {
      setIsProcessing(null);
    }
  };

  const claimBurnAmount = async () => {
    if (!AllContracts?.davContract) return;
    try {
      setClaiming(true);
      const tx = await AllContracts.davContract.claimPLS();
      await tx.wait();
      await fetchData();
      notifySuccess("Claimed PLS!")
    } catch (err) {
      console.error("Burn claim error:", err);
      // Try to extract a readable reason
      let message = "Transaction failed";
      if (err.reason) {
        message = err.reason; // ethers revert reason
      } else if (err.error?.message) {
        message = err.error.message; // MetaMask style
      } else if (err.data?.message) {
        message = err.data.message; // RPC provider style
      } else if (err.message) {
        message = err.message; // fallback
      }
      notifyError(message)
    } finally {
      setClaiming(false);
    }
  };

  const DepositStateBack = async (TokenAddress) => {
    try {
      const tokenContract = new ethers.Contract(
        getStateAddress(),
        ERC20_ABI,
        signer
      );
      const weiAmount = ethers.parseUnits("500000000".toString(), 18);

      await (await tokenContract.approve(getAuctionAddress(), weiAmount)).wait();

      const tx = await AllContracts.AuctionContract.depositStateForTokenOwner(
        TokenAddress
      );
      await tx.wait();
      await fetchData();
      notifySuccess("Deposited State tokens")
    } catch (err) {
      console.error("Deposit  error:", err);
    }
  };

  const BurnStateTokens = async (amount) => {
    if (!AllContracts?.davContract) return;
    try {
      setButtonTextStates("initiated");
      setClicked(true);
      const weiAmount = ethers.parseUnits(amount.toString(), 18);
      const maxUint256 = BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");
      const tokenContract = new ethers.Contract(
        getStateAddress(),
        ERC20_ABI,
        signer
      );
      const allowance = await tokenContract.allowance(address, getDavAddress());
      // 2. If allowance is not enough, approve
      if (BigInt(allowance) < BigInt(weiAmount)) {
        setButtonTextStates("Approving");
        await (await tokenContract.approve(getDavAddress(), maxUint256)).wait();
      }

      setButtonTextStates("Pending");
      await (await AllContracts.davContract.burnState(weiAmount)).wait();
      setButtonTextStates("confirmed");
      setClicked(false);
      notifySuccess(`${amount} of tokens Burned Successfully`)
      await fetchData();
      await fetchTimeUntilNextClaim();
    } catch (err) {
      console.error("Burn error:", err);
      setButtonTextStates("error");

      // Default error message
      let errorMessage = "An error occurred during burn.";

      // Extract message from different possible sources
      if (err?.reason) {
        errorMessage = err.reason;
      } else if (err?.data?.message) {
        errorMessage = err.data.message;
      } else if (err?.message) {
        errorMessage = err.message;
      }

      // Custom handling for specific known case
      if (errorMessage.includes("execution reverted (unknown custom error)")) {
        errorMessage = "Check state token balance";
      }
      notifyError(errorMessage)
      setClicked(false);
    } finally {
      setButtonTextStates("");
    }
  };
  useEffect(() => {
    if (isProcessing || isProcessingToken) {
      toastId.current = toast.loading(`Processing`, {
        position: "top-center",
        autoClose: false,
      });
    } else if (toastId.current !== null) {
      toast.dismiss(toastId.current);
      toastId.current = null;
    }
  }, [isProcessing,isProcessingToken]);


  DavProvider.propTypes = {
    children: PropTypes.node.isRequired,
  };

  return (
    <DAVContext.Provider
      value={{
        ...data,
        isLoading,
        BurnClicked,
        Claiming,
        mintDAV,
        BurnStateTokens,
        claimAmount,
        isClaiming,
        claimBurnAmount,
        AddYourToken,
        buttonTextStates,
        fetchData,
        fetchStateHolding,
        deployWithMetaMask,
        DepositStateBack,
        users,
        isProcessingToken,
        setProcessToken,
        names,
        Emojies,
        TokenStatus,
        isProcessing,
        txStatus,
        setTxStatus,
        isUsed,
      }}
    >
      {children}
    </DAVContext.Provider>
  );
};

export const useDAvContract = () => useContext(DAVContext);
