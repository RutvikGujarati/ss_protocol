import { ethers } from "ethers";
import { createContext, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { getContractConfigs } from "../Constants/ContractConfig";
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
  const chainId = useChainId();

  console.log("current chain id", chainId);
  const initializeContracts = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const newProvider = new ethers.BrowserProvider(window.ethereum, "any");
        const accounts = await newProvider.send("eth_requestAccounts", []);
        const newSigner = await newProvider.getSigner();

        setProvider(newProvider);
        setSigner(newSigner);
        setAccount(accounts[0]);

        // Dynamically create contract instances
        const contractInstances = Object.fromEntries(
          Object.entries(getContractConfigs(chainId)).map(
            ([key, { address, abi }]) => [
              key,
              new ethers.Contract(address, abi, newSigner),
            ]
          )
        );

        setContracts(contractInstances);

        console.log("All contracts initialized:", contractInstances);
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
  //   console.log("checksummed address",ethers.getAddress("0xc7d4d22af7a4ef1ffe25235c4d4cce9b7ab77edf"));

  useEffect(() => {
    initializeContracts();
    if (window.ethereum) {
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
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners("accountsChanged");
      }
    };
  }, []);
  const contracts = {
    state: AllContracts.stateContract,
    dav: AllContracts.davContract,
    Fluxin: AllContracts.FluxinContract,
    Xerion: AllContracts.XerionContract,
  };
  console.log("obj of contracts", contracts);
  return (
    <ContractContext.Provider
      value={{ loading, provider, signer, account, AllContracts, contracts }}
    >
      {children}
    </ContractContext.Provider>
  );
};
