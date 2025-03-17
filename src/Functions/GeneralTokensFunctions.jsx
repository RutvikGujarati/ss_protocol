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
  const [CurrentRatioPrice, setCurrentRatio] = useState({});
  const [Distributed, setViewDistributed] = useState({
    state: "0.0",
    Fluxin: "0.0",
    Xerion: "0.0",
    Rieva: "0.0",
    TenDollar: "0.0",
    oneD: "0.0",
  });
  const contracts = {
    state: AllContracts.stateContract,
    dav: AllContracts.davContract,
    Fluxin: AllContracts.FluxinContract,
    Rieva: AllContracts.RievaContract,
    TenDollar: AllContracts.TenDollarContract,
    Domus: AllContracts.DomusContract,
    oneD: AllContracts.oneDollar,
    FluxinRatio: AllContracts.RatioContract,
    TenDollarRatio: AllContracts.TenDollarRatioContract,
    Xerion: AllContracts.XerionContract,
  };
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
            console.log("supplyValue", supplyValue);
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
      ViewDistributedTokens();
    } catch (e) {
      console.error("Error claiming tokens:", e);
      //   setClaiming(false);
    }
  };
  const CheckMintBalance = async (contract) => {
    try {
      const tx = await contract.distributeReward(account);
      await tx.wait();
      ViewDistributedTokens();
    } catch (e) {
      console.error("Error claiming tokens:", e);
      throw e;
    }
  };
  const ViewDistributedTokens = async () => {
    try {
      const amounts = {};

      // Loop through each contract and fetch the userRewardAmount
      for (const [key, contract] of Object.entries(contracts)) {
        try {
          // Check if the contract object is valid
          if (!contract) {
            console.warn(`Contract for key "${key}" is undefined or null.`);
            continue;
          }

          // Log the contract details for debugging
          console.log(`Fetching userRewardAmount for contract key: ${key}`);
          console.log("Contract instance:", contract);

          // Make the contract call
          const rawAmount = await contract.userRewardAmount(account);
          const formattedAmount = ethers.formatUnits(rawAmount, 18);

          // Log the raw and formatted amounts
          console.log(`Raw amount for key "${key}":`, formattedAmount);
          amounts[key] = formattedAmount;
        } catch (contractError) {
          console.error(
            `Error fetching userRewardAmount for key "${key}":`,
            contractError
          );
          amounts[key] = "0.0"; // Default to 0.0 if an error occurs
        }
      }

      // Update the state with the fetched amounts
      setViewDistributed(amounts);

      // Debugging output
      console.log("Final Distributed amounts object:", amounts);
    } catch (e) {
      console.error("Error viewing distributed tokens:", e);
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
      } else if (contractType === "oneD") {
        contract = AllContracts.oneDollar;
      } else if (contractType === "Rieva") {
        contract = AllContracts.RievaContract;
      } else if (contractType === "Domus") {
        contract = AllContracts.DomusContract;
      } else if (contractType === "TenDollar") {
        contract = AllContracts.TenDollarContract;
      }

      if (!contract) {
        throw new Error("Invalid contract type");
      }

      const tx = await contract.mintAdditionalTOkens(amountInWei);
      await tx.wait();
      await fetchTotalSupplies();
    } catch (e) {
      console.error(`Error minting with method mintAdditionalTOkens:`, e);
    }
  };

  const CurrentRatioPriceGetting = async () => {
    try {
      const contracts = [
        { name: "Fluxin", contract: AllContracts.RatioContract },
        { name: "Xerion", contract: AllContracts.XerionRatioContract },
        { name: "Rieva", contract: AllContracts.RievaRatioContract },
        { name: "TenDollar", contract: AllContracts.TenDollarRatioContract },
        { name: "Domus", contract: AllContracts.DomusRatioContract },
        { name: "OneDollar", contract: AllContracts.OneDollarRatioContract },
      ];

      const currentRP = {};

      for (const { name, contract } of contracts) {
        if (!contract) {
          console.error(`Contract for ${name} is undefined`);
          continue;
        }

        const rawValue = await contract.getRatioPrice();
        const ethValue = Number(rawValue) / 1e18; // Convert wei to ETH
        currentRP[name] = ethValue.toFixed(0); // Apply toFixed(0) correctly
      }

      setCurrentRatio(currentRP);
      console.log("Ratio of token in ETH:", currentRP.Fluxin);
    } catch (e) {
      console.error("Error fetching ratio:", e);
    }
  };

  useEffect(() => {
    if (AllContracts && Object.keys(AllContracts).length > 0 && !initialized) {
      fetchTotalSupplies();
      ViewDistributedTokens();
      CurrentRatioPriceGetting();
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
        Distributed,
        CurrentRatioPrice,
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
