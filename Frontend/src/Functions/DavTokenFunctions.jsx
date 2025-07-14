import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

import PropTypes from "prop-types";
import { ethers } from "ethers";
import { useAccount, useChainId } from "wagmi";
import { ContractContext } from "./ContractInitialize";
import {
  Auction_TESTNET,
  DAV_TESTNET,
  STATE_TESTNET,
} from "../Constants/ContractAddresses";
import toast from "react-hot-toast";

export const DAVContext = createContext();

const ERC20_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
];

export const DavProvider = ({ children }) => {
  const { AllContracts, signer } = useContext(ContractContext);
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const [buttonTextStates, setButtonTextStates] = useState({});

  const [isLoading, setLoading] = useState(true);
  const [BurnClicked, setClicked] = useState(false);
  const [Claiming, setClaiming] = useState(false);
  const [users, setUsers] = useState([]);
  const [names, setNames] = useState([]);
  const [Emojies, setEmojies] = useState([]);
  const [TokenStatus, setTokenStatus] = useState([]);
  const [isUsed, setisUsed] = useState([]);
  const [isProcessing, setIsProcessing] = useState(null);
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
  });

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
        value = res ? "true" : "false"; // Convert to string explicitly
      } else if (label === "UserPercentage") {
        value = (Number(res) / 100).toFixed(fixed);
      } else {
        value = format
          ? parseFloat(ethers.formatUnits(res, 18)).toFixed(fixed)
          : res.toString();
      }

      setData((prev) => ({
        ...prev,
        [label]: value,
      }));
    } catch (err) {
      console.error(`Error fetching ${label}:`, err);
    }
  };

  const fetchData = useCallback(async () => {
    if (!AllContracts?.davContract || !address) return;

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
        fetchAndSet("DavMintFee", () => AllContracts.davContract.TOKEN_COST()),
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
          AllContracts.stateContract.balanceOf(Auction_TESTNET)
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
    } catch (error) {
      console.error("Error fetching contract data:", error);
    } finally {
      setLoading(false);
    }
  }, [AllContracts, address]);

  console.log("dav entries", data.DavMintFee);

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
      const results = await Promise.all(
        names.map((name) => AllContracts.AuctionContract.isTokenNameUsed(name))
      );

      // Store the results directly as an array of booleans in the state
      setisUsed(results); // Assuming setisUsed accepts an array of booleans
    } catch (error) {
      console.log("Error getting deployed details", error);
    }
  };

  useEffect(() => {
    if (address && AllContracts?.davContract) fetchData();
  }, [address, AllContracts?.davContract]);

  isTokenDeployed();

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
    }, 1000); // run every second

    return () => clearInterval(interval); // clean up on unmount
  }, [fetchTimeUntilNextClaim, AllContracts?.davContract, address]);

  useEffect(() => {
    if (data.TimeUntilNextClaim === 0) {
      fetchData();
    }
  }, [data.TimeUntilNextClaim]);

  useEffect(() => {
    if (isConnected && AllContracts?.davContract) {
      fetchData();
    }
  }, [isConnected, AllContracts]);

  const [txStatus, setTxStatus] = useState(""); // e.g. "initiated", "pending", "confirmed", "error"

  const mintDAV = async (amount, ref = "") => {
    if (!AllContracts?.davContract) return;
    const ethAmount = ethers.parseEther(amount.toString());
    const cost = ethers.parseEther(
      (amount * (chainId === 146 ? 100 : 500)).toString()
    );
    const referral = ref.trim() || "0x0000000000000000000000000000000000000000";

    try {
      setTxStatus("initiated");
      const tx = await AllContracts.davContract.mintDAV(ethAmount, referral, {
        value: cost,
      });

      setTxStatus("pending");
      await tx.wait();

      setTxStatus("confirmed");
      toast.success(`${amount} token minted successfully!`, {
        position: "top-center",
        autoClose: 12000,
      });
      await fetchData();
      return tx;
    } catch (error) {
      setTxStatus("error");
      console.error("Minting error:", error);
      throw error;
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
        toast.info("❌ Transaction rejected by user", {
          position: "top-center",
          autoClose: 3000,
        });
      } else {
        toast.update(toastId, {
          render: `❌ Error: ${errorMessage}`,
          type: "error",
          isLoading: false,
          autoClose: 5000,
          position: "top-center",
        });
      }

      throw error;
    } finally {
      setProcessToken(false);
    }
  };
  const claimAmount = async () => {
    if (!AllContracts?.davContract) return;
    try {
      const tx = await AllContracts.davContract.claimReward();
      await tx.wait();
      await fetchData();
    } catch (err) {
      console.error("Claim error:", err);
      let errorMessage = "An unknown error occurred while claiming reward.";

      if (err?.error?.message) {
        errorMessage = err.error.message;
      } else if (err?.reason) {
        errorMessage = err.reason;
      } else if (err?.message) {
        errorMessage = err.message;
      }

      alert(`Claim failed: ${errorMessage}`);
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
      toast.success("Claimed PLS!", {
        position: "top-center", // Centered
        autoClose: 12000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } catch (err) {
      console.error("Burn claim error:", err);
    } finally {
      setClaiming(false);
    }
  };

  const DepositStateBack = async (TokenAddress) => {
    try {
      const tokenContract = new ethers.Contract(
        STATE_TESTNET,
        ERC20_ABI,
        signer
      );
      const weiAmount = ethers.parseUnits("500000000".toString(), 18);

      await (await tokenContract.approve(Auction_TESTNET, weiAmount)).wait();

      const tx = await AllContracts.AuctionContract.depositStateForTokenOwner(
        TokenAddress
      );
      await tx.wait();
      await fetchData();
      toast.success("Deposited State tokens", {
        position: "top-center", // Centered
        autoClose: 12000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
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
      const tokenContract = new ethers.Contract(
        STATE_TESTNET,
        ERC20_ABI,
        signer
      );
      setButtonTextStates("Approving");
      await (await tokenContract.approve(DAV_TESTNET, weiAmount)).wait();
      setButtonTextStates("Pending");
      await (await AllContracts.davContract.burnState(weiAmount)).wait();
      setButtonTextStates("confirmed");
      setClicked(false);
      toast.success(`${amount} of tokens Burned Successfully`, {
        position: "top-center", // Centered
        autoClose: 12000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
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

      // Show toast with extracted message
      toast.error(errorMessage, {
        position: "top-center",
        autoClose: 5000, // 5 seconds
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });

      setClicked(false);
    } finally {
      setButtonTextStates("");
    }
  };

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
        claimBurnAmount,
        AddYourToken,
        buttonTextStates,
        fetchData,
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
        isUsed,
      }}
    >
      {children}
    </DAVContext.Provider>
  );
};

export const useDAvContract = () => useContext(DAVContext);
