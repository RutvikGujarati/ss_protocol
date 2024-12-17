// DAVTokenContext.js
import { createContext, useContext, useState, useEffect } from "react";
import { ethers } from "ethers";
import DAVTokenABI from "../ABI/DavTokenABI.json";
import StateABI from "../ABI/StateTokenABI.json";
import RatioABI from "../ABI/RatioABI.json";

const DAVTokenContext = createContext();

const DAV_TOKEN_ADDRESS = "0x7c0461f4B63f1C9746D767cF22EA4BD8B702Bb5c";
const STATE_TOKEN_ADDRESS = "0x5fD237F8a7c1E959401f8619D1F39CB9CfAB4380";
const Ratio_TOKEN_ADDRESS = "0x181a3a085740582e8009d4a0839323B9154ecE48";

export const useDAVToken = () => useContext(DAVTokenContext);

export const DAVTokenProvider = ({ children }) => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);

  const [davContract, setDavContract] = useState(null);
  const [stateContract, setStateContract] = useState(null);
  const [RatioContract, setRatioContract] = useState(null);

  const [TotalCost, setTotalCost] = useState(null);
  const [CurrentSReward, setCurrentSReward] = useState(null);
  const [davHolds, setDavHoldings] = useState("0.0");
  const [StateHolds, setStateHoldings] = useState("0.0");
  const [davPercentage, setDavPercentage] = useState("0.0");
  const [Supply, setSupply] = useState("0.0");
  const [StateReward, setStateReward] = useState("0");
  const [Distributed, setViewDistributed] = useState("0.0");

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
	initialize()
    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          initialize(); // Re-initialize contracts with the new account
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
    const cost = ethers.parseEther((amount * 1).toString()); // org - 100000
    await handleContractCall(davContract, "mintDAV", [value, { value: cost }]);
  };

  const GetStateRewards = async (amount) => {
    if (!amount || isNaN(amount) || amount <= 0) return setStateReward(0);
    const reward = await handleContractCall(
      davContract,
      "getStateReward",
      [ethers.parseEther(amount.toString())],
      (r) => ethers.formatUnits(r, 18)
    );
    setStateReward(reward);
  };

  const CalculationOfCost = async (amount) => {
    setTotalCost(ethers.parseEther((amount * 100000).toString()));
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
    const holdings = await handleContractCall(
      stateContract,
      "getDAVHoldings",
      [account],
      (h) => ethers.formatUnits(h, 18)
    );
    setStateHoldings(holdings);
  };

  const DavHoldingsPercentage = async () => {
    const percentage = await handleContractCall(
      davContract,
      "getUserHoldingPercentage",
      [account],
      (p) => ethers.formatUnits(p, 18)
    );
    setDavPercentage(percentage);
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

  const GetCurrentStateReward = async () => {
    const reward = await handleContractCall(
      davContract,
      "getCurrentStateReward",
      [],
      (r) => ethers.formatUnits(r, 18)
    );
    setCurrentSReward(reward);
  };

  const releaseNextBatch = async () => {
    await handleContractCall(davContract, "releaseNextBatch");
  };

  useEffect(() => {
    if (davContract) {
      DavHoldings();
      DavHoldingsPercentage();
      StateHoldings();
      DavSupply();
      ViewDistributedTokens();
    }
    GetCurrentStateReward();
  }, [account, davContract]);

  // Ratio Token Contracts

  const StartMarketPlaceListing = async () => {
    await handleContractCall(
      RatioContract,
      "notifyMarketplaceListing",
      [],
      (s) => ethers.formatUnits(s, 18)
    );
  };
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
  const ViewDistributedTokens = async () => {
    const amount = await handleContractCall(
      RatioContract,
      "viewClaimableTokens",
      [account],
      (s) => ethers.formatUnits(s, 18)
    );
    setViewDistributed(amount);
  };

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
        GetCurrentStateReward,
        CurrentSReward,
        DavHoldings,
        davHolds,
        DavHoldingsPercentage,
        davPercentage,
        StateHoldings,
        StateHolds,
        DavSupply,
        Supply,

        StartMarketPlaceListing,
        ClaimTokens,
        ViewDistributedTokens,
        Distributed,
        claiming,
      }}
    >
      {children}
    </DAVTokenContext.Provider>
  );
};
