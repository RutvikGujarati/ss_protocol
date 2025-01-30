import { ethers } from "ethers";
import { createContext, useEffect, useState } from "react";
import {
  DAV_TOKEN_ADDRESS,
  Fluxin,
  Ratio_TOKEN_ADDRESS,
  STATE_TOKEN_ADDRESS,
  Xerion,
  XerionRatioAddress,
} from "../Context/DavTokenContext";
import DAVTokenABI from "../ABI/DavTokenABI.json";
import StateABI from "../ABI/StateTokenABI.json";
import RatioABI from "../ABI/RatioABI.json";
import PropTypes from "prop-types";

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

  const initializeContracts = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const newProvider = new ethers.BrowserProvider(window.ethereum, "any");
        const accounts = await newProvider.send("eth_requestAccounts", []);
        const newSigner = await newProvider.getSigner();

        setProvider(newProvider);
        setSigner(newSigner);
        setAccount(accounts[0]);

        setContracts({
          davContract: new ethers.Contract(
            DAV_TOKEN_ADDRESS,
            DAVTokenABI,
            newSigner
          ),
          stateContract: new ethers.Contract(
            STATE_TOKEN_ADDRESS,
            StateABI,
            newSigner
          ),
          FluxinContract: new ethers.Contract(Fluxin, StateABI, newSigner),
          XerionContract: new ethers.Contract(Xerion, StateABI, newSigner),
          RatioContract: new ethers.Contract(
            Ratio_TOKEN_ADDRESS,
            RatioABI,
            newSigner
          ),
          XerionRatioContract: new ethers.Contract(
            XerionRatioAddress,
            RatioABI,
            newSigner
          ),
        });
		console.log("all contracts",AllContracts)
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

  return (
    <ContractContext.Provider
      value={{ loading, provider, signer, account, AllContracts }}
    >
      {children}
    </ContractContext.Provider>
  );
};
