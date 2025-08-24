import { ethers } from "ethers";
import { createContext, useEffect, useState } from "react";
import PropTypes from "prop-types";
import {
  getContractConfigs,
  setChainId,
  isChainSupported,
} from "../Constants/ContractConfig";
import { CHAIN_IDS } from "../Constants/ContractAddresses";
import { useAccount, useChainId, useWalletClient } from "wagmi";

const ContractContext = createContext(null);

export const ContractProvider = ({ children }) => {
  ContractProvider.propTypes = {
    children: PropTypes.node.isRequired,
  };

  const { isConnected, address } = useAccount();
  const chainId = useChainId();
  const { data: walletClient } = useWalletClient();

  const [loading, setLoading] = useState(true);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);
  const [AllContracts, setContracts] = useState({});

  useEffect(() => {
    if (!isConnected || !address || !chainId || !walletClient) return;

    // check supported chain
    if (!isChainSupported(chainId)) {
      console.warn(
        `Connected chain ${chainId} is not supported. Using default chain.`
      );
      setChainId(CHAIN_IDS.PULSECHAIN);
    } else {
      setChainId(chainId);
    }

    initializeContracts();
  }, [isConnected, address, chainId, walletClient]);
  const initializeContracts = async () => {
    try {
      setLoading(true);

      if (!walletClient) {
        throw new Error("Wallet client not available");
      }

      // ✅ Correct: wrap wagmi's walletClient transport
      const browserProvider = new ethers.BrowserProvider(walletClient.transport);

      const signer = await browserProvider.getSigner();
      const userAddress = await signer.getAddress();

      const contractInstances = Object.fromEntries(
        Object.entries(getContractConfigs()).map(([key, { address, abi }]) => [
          key,
          new ethers.Contract(address, abi, signer),
        ])
      );

      console.log("Detected providers:", window.ethereum?.providers);

      setProvider(browserProvider);
      setSigner(signer);
      setAccount(userAddress);
      setContracts(contractInstances);
    } catch (err) {
      console.error("Failed to initialize contracts:", err);
    } finally {
      setLoading(false);
    }
  };


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

export { ContractContext };
