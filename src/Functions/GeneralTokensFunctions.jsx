import { createContext, useContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import { ContractContext } from "./ContractInitialize";
import PropTypes from "prop-types";
import { useAccount } from "wagmi";
import { Yees_testnet } from "../ContractAddresses";

export const GeneralTokens = createContext();

export const GeneralTokenProvider = ({ children }) => {
  const { AllContracts } = useContext(ContractContext);
  const { address } = useAccount();
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
    OneDollar: "0.0",
  });
  const contracts = {
    state: AllContracts.stateContract,
    dav: AllContracts.davContract,
    Fluxin: AllContracts.FluxinContract,
    Rieva: AllContracts.RievaContract,
    Currus: AllContracts.CurrusContract,
    Valir: AllContracts.ValirContract,
    Sanitas: AllContracts.SanitasContract,
    Teeah: AllContracts.TeeahContract,
    TenDollar: AllContracts.TenDollarContract,
    Domus: AllContracts.DomusContract,
    oneD: AllContracts.oneDollar,
    FluxinRatio: AllContracts.RatioContract,
    TenDollarRatio: AllContracts.TenDollarRatioContract,
    Xerion: AllContracts.XerionContract,
  };
  const fetchTotalSupplies = async () => {
    try {
      const results = await Promise.all(
        Object.entries(AllContracts).map(async ([key, contract]) => {
          if (!contract || !contract.totalSupply)
            return { key, name: key, supply: "N/A" };

          try {
            // Fetch totalSupply and name in parallel
            const [supplyRaw, nameRaw] = await Promise.all([
              contract.totalSupply(),
              contract.name ? contract.name().catch(() => key) : key,
            ]);

            const supply = ethers.formatUnits(supplyRaw, 18);
            const formattedSupply =
              supply === "0" ? "0.0" : parseFloat(supply).toFixed(1);

            return { key, name: nameRaw, supply: formattedSupply };
          } catch (err) {
            console.error(`Error fetching ${key} total supply:`, err);
            return { key, name: key, supply: "Error" };
          }
        })
      );

      const suppliesData = results.reduce((acc, { key, name, supply }) => {
        acc[key] = { name, supply };
        return acc;
      }, {});

      // Simplify keys by removing "Contract" and appending "Supply"
      const simplified = Object.fromEntries(
        Object.entries(suppliesData).map(([key, value]) => [
          key.replace(/Contract$/, "") + "Supply",
          Math.floor(value.supply),
        ])
      );

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
  const CheckMintBalance = async (TokenAddress) => {
    try {
      const tx = await AllContracts.AuctionContract.distributeReward(address,TokenAddress);
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
          const rawAmount = await contract.userRewardAmount(address);
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
 

  const CurrentRatioPriceGetting = async () => {
    try {
      const contracts = [
        { name: "Fluxin", contract: AllContracts.RatioContract },
        { name: "Xerion", contract: AllContracts.XerionRatioContract },
        { name: "Rieva", contract: AllContracts.RievaRatioContract },
        { name: "TenDollar", contract: AllContracts.TenDollarRatioContract },
        { name: "Domus", contract: AllContracts.DomusRatioContract },
        { name: "Currus", contract: AllContracts.CurrusRatioContract },
        { name: "Valir", contract: AllContracts.ValirRatioContract },
        { name: "Teeah", contract: AllContracts.TeeahRatioContract },
        { name: "Sanitas", contract: AllContracts.SanitasRatioContract },
        { name: "OneDollar", contract: AllContracts.OneDollarRatioContract },
      ].filter(({ contract }) => contract); // Remove undefined contracts early

      if (contracts.length === 0) {
        console.error("No valid contracts found");
        return;
      }

      const results = await Promise.all(
        contracts.map(async ({ name, contract }) => {
          try {
            const rawValue = await contract.getRatioPrice();
            return { name, value: (Number(rawValue) / 1e18).toFixed(0) };
          } catch (error) {
            console.error(`Error fetching ratio for ${name}:`, error);
            return null;
          }
        })
      );

      const currentRP = results.reduce((acc, entry) => {
        if (entry) acc[entry.name] = entry.value;
        return acc;
      }, {});

      setCurrentRatio(currentRP);
      console.log("Ratio of token in ETH:", currentRP.OneDollar);
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
        Distributed,
        CurrentRatioPrice,
        contracts,
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
