import { ethers } from "ethers";
import { createContext, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { getContractConfigs, setChainId } from "../Constants/ContractConfig";
import { useChainId } from "wagmi";

export const ContractContext = createContext(null);

export const ContractProvider = ({ children }) => {
  ContractProvider.propTypes = {
    children: PropTypes.node.isRequired,
  };

  const [loading, setLoading] = useState(true);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);
  const [AllContracts, setContracts] = useState({});
  const chainId = useChainId(); // Get chainId from Wagmi

  console.log("Current Chain ID:", chainId);

  useEffect(() => {
    if (!chainId) return; // Don't initialize contracts until chainId is available

    setChainId(chainId); // Update the global chainId in ContractConfig.js

    initializeContracts();
  }, [chainId]);

  const initializeContracts = async () => {
    if (typeof window.ethereum === "undefined") {
      console.error("Ethereum wallet is not installed");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const newProvider = new ethers.BrowserProvider(window.ethereum, "any");

      // Check if the user is already connected
      const accounts = await newProvider.send("eth_accounts", []);
      if (accounts.length === 0) {
        console.log("No connected accounts found.");
        setLoading(false);
        return;
      }

      const newSigner = await newProvider.getSigner();
      setProvider(newProvider);
      setSigner(newSigner);
      setAccount(accounts[0]);

      const contractInstances = Object.fromEntries(
        Object.entries(getContractConfigs()).map(([key, { address, abi }]) => [
          key,
          new ethers.Contract(address, abi, newSigner),
        ])
      );

      setContracts(contractInstances);
      console.log("Contracts Initialized:", contractInstances);
    } catch (error) {
      console.error("Error initializing contracts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!window.ethereum) return;

    window.ethereum.on("accountsChanged", (accounts) => {
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        initializeContracts();
      } else {
        setAccount(null);
        setSigner(null);
        setProvider(null);
      }
    });

    return () => {
      window.ethereum.removeAllListeners("accountsChanged");
    };
  }, []);

  const contracts = {
    state: AllContracts.stateContract,
    dav: AllContracts.davContract,
    Fluxin: AllContracts.FluxinContract,
    Xerion: AllContracts.XerionContract,
  };

  return (
    <ContractContext.Provider
      value={{ loading, provider, signer, account, AllContracts, contracts }}
    >
      {children}
    </ContractContext.Provider>
  );
};
