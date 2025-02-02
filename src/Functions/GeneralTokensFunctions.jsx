import { createContext, useContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import { ContractContext } from "./ContractInitialize";
import PropTypes from "prop-types";

export const GeneralTokens = createContext();
export const SimpleTokens = createContext();

export const GeneralTokenProvider = ({ children }) => {
  const { AllContracts } = useContext(ContractContext);
  const [supplies, setSupplies] = useState({});
  const [simpleSupplies, setSimpleSupplies] = useState({});
  const [initialized, setInitialized] = useState(false);
  const [AuctionRunningLocalString, setIsAuctionRunningLocalString] = useState({
    Fluxin: false,
    Xerion: false,
    state: true,
  });
  const [AuctionRunning, setIsAuctionRunning] = useState({
    Fluxin: false,
    Xerion: false,
    state: true,
  });

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
  const isAuctionRunning = async () => {
    try {
      const contracts = [
        { contract: AllContracts.RatioContract, name: "Fluxin" },
        { contract: AllContracts.XerionRatioContract, name: "Xerion" },
      ];

      const auctionStatus = {};

      for (const { contract, name } of contracts) {
        const isRunning = await contract.isAuctionActive();
        auctionStatus[name] = isRunning.toString();
        console.log(
          `isAuctionRunning from g context-> ${name}:`,
          isRunning.toString()
        );
      }

      setIsAuctionRunning({
        ...auctionStatus,
        state: true,
      });

      setIsAuctionRunningLocalString({
        ...auctionStatus,
        state: true,
      });
    } catch (error) {
      console.error("Error fetching auction status:", error);

      setIsAuctionRunning({
        Fluxin: false,
        Xerion: false,
        state: true,
      });

      setIsAuctionRunningLocalString({
        Fluxin: false,
        Xerion: false,
        state: true,
      });
    }
  };
  useEffect(() => {
    if (AllContracts && Object.keys(AllContracts).length > 0 && !initialized) {
      fetchTotalSupplies();
    }
	isAuctionRunning();
  }, [AllContracts, initialized]);

  console.log("fluxin supply", simpleSupplies.stateSupply); // Now using FluxinSupply
  return (
    <GeneralTokens.Provider
      value={{ supplies, AuctionRunningLocalString, AuctionRunning }}
    >
      <SimpleTokens.Provider value={simpleSupplies}>
        {children}
      </SimpleTokens.Provider>
    </GeneralTokens.Provider>
  );
};

GeneralTokenProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useGeneralTokens = () => useContext(GeneralTokens);
export const useSimpleTokens = () => useContext(SimpleTokens);
