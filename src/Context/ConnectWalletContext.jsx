import { createContext, useState, useEffect } from "react";
import { ethers } from "ethers";

export const ConnectWalletContext = createContext();

const ConnectWalletProvider = ({ children }) => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [address, setAddress] = useState("");
  const [balance, setBalance] = useState("");

  const connectWallet = async () => {
    if (typeof window.ethereum === "undefined") {
        alert("MetaMask is not installed. Please install it to use this feature.");
        return;
    }

    try {
        // Initialize BrowserProvider
        const browserProvider = new ethers.BrowserProvider(window.ethereum, "any");

        // Request account access
        const accounts = await browserProvider.send("eth_requestAccounts", []);
        const address = accounts[0]; // Fetch the first account address

        // Get balance for the account
        const balance = await browserProvider.getBalance(address);

        // Update state
        setProvider(browserProvider);
        setAddress(address);
        setBalance(ethers.formatEther(balance)); // Use `ethers.formatEther` for formatting
    } catch (error) {
        console.error("Wallet connection failed:", error);
    }
};



  const disconnectWallet = () => {
    setProvider(null);
    setSigner(null);
    setAddress("");
    setBalance("");
  };

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", connectWallet);
      window.ethereum.on("chainChanged", () => window.location.reload());
    }
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("accountsChanged", connectWallet);
      }
    };
  }, []);

  return (
    <ConnectWalletContext.Provider
      value={{
        provider,
        signer,
        address,
        balance,
        connectWallet,
        disconnectWallet,
      }}
    >
      {children}
    </ConnectWalletContext.Provider>
  );
};

export default ConnectWalletProvider;
