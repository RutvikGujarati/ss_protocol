import { createContext, useContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import { ContractContext } from "./ContractInitialize";
import PropTypes from "prop-types";

export const GeneralTokens = createContext();

export const GeneralTokenProvider = ({ children }) => {
  const { AllContracts, account } = useContext(ContractContext);
  const [supplies, setSupplies] = useState({});
  const [simpleSupplies, setSimpleSupplies] = useState({});
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
        simplified[simplifiedKey] = Math.floor(value.supply);
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
      //   setClaiming(true);
      const tx = await contract.mintReward();
      await tx.wait();
      //   setClaiming(false);
    } catch (e) {
      console.error("Error claiming tokens:", e);
      //   setClaiming(false);
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

  const mintAdditionalTOkens = async (contractType, amount) => {
    try {
      const amountInWei = ethers.parseUnits(amount.toString(), 18);
      let contract;

      // Select the correct contract based on contractType
      if (contractType === "fluxin") {
        contract = AllContracts.FluxinContract;
      } else if (contractType === "state") {
        contract = AllContracts.stateContract;
      } else if (contractType === "Xerion") {
        contract = AllContracts.XerionContract;
      }

      if (!contract) {
        throw new Error("Invalid contract type");
      }

      await contract.mintAdditionalTOkens(amountInWei);
    } catch (e) {
      console.error(`Error minting with method mintAdditionalTOkens:`, e);
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
        CheckMintBalance,
        mintAdditionalTOkens,
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
