// DAVTokenContext.js
import { createContext, useContext, useState, useEffect } from "react";
import { ethers } from "ethers";
import DAVTokenABI from "../ABI/DavTokenABI.json"; // Add ABI file path for the DAVToken contract

// Define context for DAVToken contract
const DAVTokenContext = createContext();

// Replace this with your contract's deployed address
const DAV_TOKEN_ADDRESS = "0x0f25532F2A2CEAB7427cF28CfEa116D467426f42";

export const useDAVToken = () => {
  return useContext(DAVTokenContext);
};

export const DAVTokenProvider = ({ children }) => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [TotalCost, setTotalCost] = useState(null);

  const [StateReward, setStateReward] = useState(null);

  useEffect(() => {
    const initialize = async () => {
      if (typeof window.ethereum !== "undefined") {
        try {
          await window.ethereum.request({ method: "eth_requestAccounts" });

          const newProvider = new ethers.BrowserProvider(
            window.ethereum,
            "any"
          );
          const accounts = await newProvider.send("eth_requestAccounts", []);
          const newSigner = await newProvider.getSigner();

          const newContract = new ethers.Contract(
            DAV_TOKEN_ADDRESS,
            DAVTokenABI,
            newSigner 
          );

          setProvider(newProvider);
          setSigner(newSigner);
          setAccount(accounts[0]);
          setContract(newContract);
          setLoading(false); 
        } catch (error) {
          console.error("Error initializing contract:", error);
          setLoading(false);
        }
      } else {
        console.error("Ethereum wallet is not installed");
        setLoading(false); 
      }
    };

    initialize();

    return () => {
      setProvider(null);
      setSigner(null);
      setContract(null);
      setAccount(null);
      setLoading(true);
    };
  }, []);

  const mintDAV = async (amount) => {
    try {
      if (loading) {
        console.log("Waiting for contract initialization...");
        return;
      }
      if (!contract) throw new Error("Contract is not loaded");

      // Convert amount to wei
      const value = ethers.parseEther(amount.toString());

      const cost = ethers.parseEther((amount * 100000).toString());

      console.log("cost", cost);

	  const tx = await contract.mintDAV(value, { value: cost });
      await tx.wait();
      console.log("Minting successful", tx);
    } catch (error) {
      console.error("Error minting DAV:", error);
    }
  };
  const GetStateRewards = async (amount) => {
	try {
	  if (loading) {
		console.log("Waiting for contract initialization...");
		return;
	  }
	  if (!contract) throw new Error("Contract is not loaded");
  
	  const value = ethers.parseEther(amount.toString()); 
  
	  const TotalStateReward = await contract.getStateReward(value);
	  console.log("Total State Reward", TotalStateReward);
  
	  const formattedReward = ethers.formatUnits(TotalStateReward, 18);
  
	  setStateReward(formattedReward);
	} catch (error) {
	  console.error("Error fetching state reward:", error);
	}
  };
  

  const CalculationOfCost = async (amount) => {
    try {
      if (loading) {
        console.log("Waiting for contract initialization...");
        return;
      }
      if (!contract) throw new Error("Contract is not loaded");

      const cost = ethers.parseEther((amount * 100000).toString());

      setTotalCost(cost);
    } catch (error) {
      console.error("Error calculating cost:", error);
    }
  };

  const releaseNextBatch = async () => {
    try {
      if (!contract) throw new Error("Contract is not loaded");
      const tx = await contract.releaseNextBatch();
      await tx.wait();
      console.log("Next batch released", tx);
    } catch (error) {
      console.error("Error releasing next batch:", error);
    }
  };

  return (
    <DAVTokenContext.Provider
      value={{
        provider,
        signer,
        contract,
        loading,
        account,
        mintDAV,
        releaseNextBatch,
        CalculationOfCost,
        TotalCost,
		GetStateRewards,
		StateReward
      }}
    >
      {children}
    </DAVTokenContext.Provider>
  );
};
