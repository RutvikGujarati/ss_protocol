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
  Ratio_TOKEN_ADDRESS,
  STATE_TESTNET,
  STATE_TOKEN_SONIC_ADDRESS,
  Yees_testnet,
} from "../ContractAddresses";
import { useAccount, useChainId } from "wagmi";
import { Addresses, AllAddresses } from "../data/AddressMapping";

const SwapContractContext = createContext();

export const useSwapContract = () => useContext(SwapContractContext);

export const SwapContractProvider = ({ children }) => {
  const chainId = useChainId();
  const { loading, provider, signer, AllContracts } =
    useContext(ContractContext);
  const { address } = useAccount();

  const [claiming, setClaiming] = useState(false);

  const [TotalCost, setTotalCost] = useState(null);

  const [InputAmount, setInputAmount] = useState({});
  const [AirDropAmount, setAirdropAmount] = useState("0.0");
  const [AuctionTime, setAuctionTime] = useState({});
  const [CurrentCycleCount, setCurrentCycleCount] = useState({});
  const [OutPutAmount, setOutputAmount] = useState({});
  const [burnedAmount, setBurnedAmount] = useState({});
  const [TokenBalance, setTokenbalance] = useState({});
  const [isReversed, setIsReverse] = useState({});
  const [IsAuctionActive, setisAuctionActive] = useState({});

  const [buttonTextStates, setButtonTextStates] = useState({});
  const [swappingStates, setSwappingStates] = useState({});

  const [userHashSwapped, setUserHashSwapped] = useState({});
  const [DavAddress, setDavAddress] = useState("");
  const [supportedToken, setIsSupported] = useState(false);
  const [StateAddress, setStateAddress] = useState("");
  const [AirdropClaimed, setAirdropClaimed] = useState({});
  const [userHasReverseSwapped, setUserHasReverseSwapped] = useState({});

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

      console.log("Starting loop over Addresses:", Addresses);

      for (const [tokenName, TokenAddress] of Object.entries(Addresses)) {
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
      const inputAmountWei =
        await AllContracts.AuctionContract.getClaimableReward(address);

      const inputAmount = ethers.formatEther(inputAmountWei); // 👈 convert to ether
      const inputAmountNoDecimals = Math.floor(Number(inputAmount));

      console.log("Final Airdrop amounts:", inputAmountNoDecimals);
      setAirdropAmount(inputAmountNoDecimals);
    } catch (e) {
      console.error("Error fetching input amounts:", e);
    }
  };
  useEffect(() => {
    let interval;

    const getAuctionTimeLeft = async () => {
      try {
        const results = {};

        for (const [tokenName, TokenAddress] of Object.entries(Addresses)) {
          const AuctionTimeInWei =
            await AllContracts.AuctionContract.getAuctionTimeLeft(TokenAddress);

          const totalSeconds = Math.floor(Number(AuctionTimeInWei));
          const minutes = Math.floor(totalSeconds / 60);
          const seconds = totalSeconds % 60;

          results[tokenName] = `${minutes}m ${seconds}s`;
        }

        setAuctionTime(results);
      } catch (e) {
        console.error("Error fetching AuctionTimes:", e);
      }
    };

    // Initial call
    getAuctionTimeLeft();

    // Set interval to update every second
    interval = setInterval(getAuctionTimeLeft, 1000);

    // Cleanup on unmount
    return () => clearInterval(interval);
  }, [Addresses, AllContracts]);

  const getCurrentAuctionCycle = async () => {
    try {
      const results = {};

      console.log("Starting loop over Addresses:", Addresses);

      for (const [tokenName, TokenAddress] of Object.entries(Addresses)) {
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

      console.log("Starting loop over Addresses:", Addresses);

      for (const [tokenName, TokenAddress] of Object.entries(Addresses)) {
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
  const getTokensBurned = async () => {
    try {
      const results = {};

      console.log("Starting loop over Addresses:", AllAddresses);

      for (const [tokenName, TokenAddress] of Object.entries(AllAddresses)) {
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

      console.log("Starting loop over Addresses:", AllAddresses);

      for (const [tokenName, TokenAddress] of Object.entries(AllAddresses)) {
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

      console.log("Starting loop over Addresses:", Addresses);

      for (const [tokenName, TokenAddress] of Object.entries(Addresses)) {
        console.log(`Fetching IsReverse for ${tokenName} at ${TokenAddress}`);

        const IsReverse =
          await AllContracts.AuctionContract.isReverseAuctionActive(
            TokenAddress
          );

        console.log(`isReverse for ${tokenName}:`, IsReverse);

        results[tokenName] = String(IsReverse); // 👈 if you want "true"/"false" strings
      }

      console.log("Final IsReverse:", JSON.stringify(results));
      setIsReverse(results); // ✅ keep it as an object

      return results;
    } catch (e) {
      console.error("Error fetching reverse:", e);
      return {};
    }
  };

  const CheckIsAuctionActive = async () => {
    try {
      const results = {};

      console.log("Starting loop over Addresses:", Addresses);

      for (const [tokenName, TokenAddress] of Object.entries(Addresses)) {
        console.log(
          `Fetching AuctionActive for ${tokenName} at ${TokenAddress}`
        );

        const AuctionActive =
          await AllContracts.AuctionContract.isAuctionActive(TokenAddress);

        const AuctionActiveString = AuctionActive.toString(); // 👈 convert to string

        console.log(`Auction Active for ${tokenName}:`, AuctionActiveString);

        results[tokenName] = AuctionActiveString;
      }

      console.log("Final AuctionActive:", results);
      setisAuctionActive(results);
    } catch (e) {
      console.error("Error fetching reverse:", e);
    }
  };
  const HasReverseSwappedAucton = async () => {
    try {
      const results = {};

      console.log("Starting loop over Addresses:", Addresses);

      for (const [tokenName, TokenAddress] of Object.entries(Addresses)) {
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

      console.log("Starting loop over Addresses:", Addresses);

      for (const [tokenName, TokenAddress] of Object.entries(Addresses)) {
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

      console.log("Starting loop over Addresses:", Addresses);

      for (const [tokenName, TokenAddress] of Object.entries(Addresses)) {
        console.log(
          `Fetching AirdropClaimed for ${tokenName} at ${TokenAddress}`
        );

        const AirdropClaimed =
          await AllContracts.AuctionContract.hasAirdroppedClaim(address);

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
  const isTokenSupporteed = async () => {
    if (!AllContracts?.AuctionContract) {
      console.warn("AuctionContract not found");
      return;
    }
    const results = {};

    try {
      for (const [tokenName, TokenAddress] of Object.entries(Addresses)) {
        console.log(
          `Fetching AirdropClaimed for ${tokenName} at ${TokenAddress}`
        );
        const InputTokenAddress =
          await AllContracts.AuctionContract.isTokenSupported(TokenAddress);
        const inputaddressString = InputTokenAddress.toString();
        results[tokenName] = inputaddressString;
      }

      setIsSupported(results);
    } catch (error) {
      console.error("Error fetching addresses:", error);
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
  const AddTokenIntoSwapContract = async () => {
    if (!AllContracts?.AuctionContract || !address) return;

    try {
      // Replace these params if needed based on your contract's addToken function
      const tx = await AllContracts.AuctionContract.addToken(
        Yees_testnet,
        Yees_testnet
      );
      await tx.wait();
      console.log("Token added successfully!");
    } catch (error) {
      console.error("AddTokenIntoSwapContract failed:", error?.reason || error);
    }
  };

  useEffect(() => {
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
    isTokenSupporteed();
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
      const tokenAddress = Addresses[ContractName];
      console.log("rps", isReversed[ContractName]);

      let selectedContract;
      if (ContractName == "Yees" && isReversed[ContractName] == "true") {
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
        selectedContract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
        approvalAmount = ethers.parseUnits(InAmountMapping.toString(), 18);
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
        setButtonTextStates((prev) => ({ ...prev, [id]: "Swap Complete!" }));
      } else {
        console.error("Swap transaction failed.");
        setButtonTextStates((prev) => ({ ...prev, [id]: "Swap failed" }));
      }
      await CheckIsAuctionActive();
      await userHashSwapped();
      await userHasReverseSwapped();
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

  const CheckMintBalance = async (TokenAddress) => {
    try {
      const tx = await AllContracts.AuctionContract.distributeReward(
        address,
        TokenAddress
      );
      await tx.wait();
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

  // Example usage for different tokens
  const handleAddTokenRatio = () =>
    handleAddToken(Ratio_TOKEN_ADDRESS, "Fluxin");
  const handleAddDAV = () => handleAddToken(DAV_TESTNET, "pDAV");
  const handleAddTokensDAV = () =>
    handleAddToken(DAV_TOKEN_SONIC_ADDRESS, "sDAV");
  const handleAddstate = () => handleAddToken(STATE_TESTNET, "State");
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
        handleAddTokensDAV,
        handleAddstate,
        handleAddTokensState,
        TotalCost,

        setClaiming,
        TokenBalance,
        claiming,
        SwapTokens,
        setDavAndStateIntoSwap,
        handleAddToken,
        // setReverseEnable,
        handleAddTokenRatio,
        handleAddYees,
        userHashSwapped,
        userHasReverseSwapped,
        // WithdrawLPTokens,
        AddTokenIntoSwapContract,
        burnedAmount,
        buttonTextStates,
        DavAddress,
        StateAddress,
        swappingStates,
        AuctionTime,
        AirdropClaimed,
        isReversed,
        InputAmount,
        AirDropAmount,
        supportedToken,
        OutPutAmount,
        CurrentCycleCount,
        CheckMintBalance,

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
