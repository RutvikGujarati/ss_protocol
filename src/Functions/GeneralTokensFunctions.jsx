import { createContext, useContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import { ContractContext } from "./ContractInitialize";
import PropTypes from "prop-types";

export const GeneralTokens = createContext();

export const GeneralTokenProvider = ({ children }) => {
  const { AllContracts, account, contracts } = useContext(ContractContext);
  const [supplies, setSupplies] = useState({});
  const [simpleSupplies, setSimpleSupplies] = useState({});
  const [claiming, setClaiming] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const fetchTotalSupplies = async () => {
    try {
      const contractEntries = Object.entries(AllContracts);

      const results = await Promise.all(
        contractEntries.map(async ([key, contract]) => {
          if (!contract || !contract.totalSupply)
            return { [key]: { name: key, supply: "N/A" } };
          try {
            const supply = await contract.totalSupply();
            const supplyValue = ethers.formatUnits(supply, 18);

            let name = key;
            try {
              if (contract.name) {
                name = await contract.name();
              }
            } catch (err) {
              console.warn(`Could not fetch name for ${key}:`, err);
            }

            return {
              [key]: {
                name: name,
                supply:
                  supplyValue === "0"
                    ? "0.0"
                    : parseFloat(supplyValue).toFixed(1),
              },
            };
          } catch (err) {
            console.error(`Error fetching ${key} total supply:`, err);
            return { [key]: { name: key, supply: "Error" } };
          }
        })
      );

      const suppliesData = results.reduce(
        (acc, obj) => ({ ...acc, ...obj }),
        {}
      );

      // Create simplified version with Supply suffix
      const simplified = {};
      Object.entries(suppliesData).forEach(([key, value]) => {
        // Remove 'Contract' and add 'Supply' to the key name
        const simplifiedKey = key.replace("Contract", "") + "Supply";
        simplified[simplifiedKey] = value.supply;
      });

      setSupplies(suppliesData);
      setSimpleSupplies(simplified);
      console.log("Full supplies:", suppliesData);
      console.log("Simple supplies:", simplified);
      setInitialized(true);
    } catch (error) {
      console.error("Error fetching total supplies:", error);
      setSupplies({});
      setSimpleSupplies({});
      setInitialized(false);
    }
  };
  const ClaimTokens = async (contract) => {
    try {
      setClaiming(true);
      const tx = await contract.mintReward();
      await tx.wait();
      setClaiming(false);
    } catch (e) {
      console.error("Error claiming tokens:", e);
      setClaiming(false);
    }
  };
  const CheckMintBalance = async (contract) => {
    try {
      const tx = await contract.distributeReward(account);
      await tx.wait();
    } catch (e) {
      console.error("Error claiming tokens:", e);
      throw e;
    }
  };
  const [isRenounced, setIsRenounced] = useState({
    state: null,
    dav: null,
    Fluxin: null,
    Xerion: null,
  });

  const setRenounceStatus = (name, status) => {
    setIsRenounced((prevState) => ({
      ...prevState,
      [name]: status,
    }));
  };

  const checkOwnershipStatus = async () => {
    try {
      if (!contracts || Object.keys(contracts).length === 0) {
        console.error("No contracts available to check.");
        return;
      }

      const contractNames = Object.keys(contracts);

      await Promise.all(
        contractNames.map(async (name) => {
          try {
            const contract = contracts[name];
            if (!contract || !contract.owner) {
              console.warn(
                `Contract ${name} does not exist or lacks an owner function.`
              );
              setRenounceStatus(name, null);
              return;
            }

            const owner = await contract.owner();
            console.log(`Checking ownership for ${name}:`, owner);
            setRenounceStatus(
              name,
              owner === "0x0000000000000000000000000000000000000000"
            );
          } catch (error) {
            console.error(`Error checking ownership for ${name}:`, error);
            setRenounceStatus(name, null);
          }
        })
      );
    } catch (error) {
      console.error("Error in checkOwnershipStatus:", error);
    }
  };

//   useEffect(() => {
//     checkOwnershipStatus();
//   }, [contracts]); // Re-run when contracts change

  const renounceOwnership = async (
    contract,
    contractName,
    setTransactionHashes
  ) => {
    try {
      if (!contract) {
        console.error(`Contract ${contractName} not found.`);
        return;
      }

      const tx = await contract.renounceOwnership();
      console.log(`${contractName} Transaction:`, tx);

      if (tx?.hash) {
        console.log(`${contractName} Transaction Hash:`, tx.hash);
        setTransactionHashes((prev) => ({ ...prev, [contractName]: tx.hash }));
      } else {
        console.error(
          "Transaction object doesn't contain transactionHash:",
          tx
        );
      }
    } catch (e) {
      console.error(`Error renouncing ownership for ${contractName}:`, e);
    }
  };

  useEffect(() => {
    if (AllContracts && Object.keys(AllContracts).length > 0 && !initialized) {
      fetchTotalSupplies();
    }
  }, [AllContracts, initialized]);

  console.log("fluxin supply", simpleSupplies.stateSupply); // Now using FluxinSupply
  return (
    <GeneralTokens.Provider
      value={{
        supplies,
        simpleSupplies,
        ClaimTokens,
        claiming,
        CheckMintBalance,
      }}
    >
      {children}
    </GeneralTokens.Provider>
  );
};

GeneralTokenProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useGeneralTokens = () => useContext(GeneralTokens);
