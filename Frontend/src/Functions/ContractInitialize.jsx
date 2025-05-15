import { ethers } from "ethers";
import { createContext, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { getContractConfigs, setChainId } from "../Constants/ContractConfig";
import { useAccount, useChainId } from "wagmi";

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
  const { isConnected, address } = useAccount(); // ✅ this is the key

  console.log("Current Chain ID:", chainId);

  useEffect(() => {
    if (!isConnected || !address || !chainId) return;

    setChainId(chainId);
    initializeContracts();
  }, [isConnected, address, chainId]);

  const initializeContracts = async () => {
    if (!window.ethereum) {
      console.error("Ethereum wallet not found");
      return;
    }

    try {
      setLoading(true);

      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });

      if (accounts.length === 0) {
        // No connected accounts, do not proceed
        setLoading(false);
        return;
      }

      const signer = await browserProvider.getSigner();
      const userAddress = await signer.getAddress();

      const contractInstances = Object.fromEntries(
        Object.entries(getContractConfigs()).map(([key, { address, abi }]) => [
          key,
          new ethers.Contract(address, abi, signer),
        ])
      );

      setProvider(browserProvider);
      setSigner(signer);
      setAccount(userAddress);
      setContracts(contractInstances);
      console.log("Contracts Initialized with signer:", contractInstances);
    } catch (err) {
      console.error("Failed to initialize contracts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts) => {
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        initializeContracts();
      } else {
        setAccount(null);
        setSigner(null);
        setProvider(null);
        setContracts({});
      }
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);

    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
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
