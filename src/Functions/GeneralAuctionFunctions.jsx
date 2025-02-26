import { createContext, useContext, useEffect, useState } from "react";
import { ContractContext } from "./ContractInitialize";
import PropTypes from "prop-types";
import { ethers } from "ethers";

export const GeneralAuctionFunctions = createContext();

export const GeneralAuctionProvider = ({ children }) => {
  const { AllContracts } = useContext(ContractContext);
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
  const [auctionTimeLeft, setAuctionTimeLeft] = useState({});

  const [auctionDetails, setAuctionDetails] = useState({});
  const [TotalTokensBurned, setTotalTokenBurned] = useState({});
  const [TotalBounty, setTotalTokenBounty] = useState({});

  const contracts = [
    { name: "Fluxin", contract: AllContracts.RatioContract },
    { name: "Xerion", contract: AllContracts.XerionRatioContract },
  ];

  useEffect(() => {
    AuctionTimeLeft();
    const interval = setInterval(() => {
      AuctionTimeLeft();
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const safeExecution = async () => {
      try {
        // Run auction-related calls in parallel
        const auctionPromises = [
          isAuctionRunning(),
          AuctionTimeInterval(),
          AuctionTimeLeft(),
        ];
        await Promise.all(auctionPromises);
      } catch (error) {
        console.error("Error in auction functions:", error);
      }

      try {
        // Run token-related calls in parallel
        const tokenPromises = [TotalTokensBurn(), TotalBountyAmount()];
        await Promise.all(tokenPromises);
      } catch (error) {
        console.error("Error in total burn/bounty fetching:", error);
      }

      //   try {
      //     // Run burn cycle-related calls in parallel
      //     const burnPromises = [
      //       BurningOccurred(),
      //       BurnCycleActive(),
      //       BurnTimingLeft(),
      //     ];
      //     await Promise.all(burnPromises);
      //   } catch (error) {
      //     console.error("Error in burn cycle fetching:", error);
      //   }
    };

    if (AllContracts) {
      // Prevent execution on initial render if `AllContracts` is undefined
      safeExecution();
    }
  }, [AllContracts]); // Only run when `AllContracts` changes

  /*----------------------------------- Auction Functions------------------------------------- */

  const isAuctionRunning = async () => {
    try {
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
  const AuctionTimeInterval = async () => {
    try {
      const formatTimestamp = (timestamp) => {
        const timestampSeconds = parseFloat(timestamp);
        const date = new Date(timestampSeconds * 1000);

        return date.toLocaleString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false, // Use 24-hour format
        });
      };

      const auctionData = {};

      for (const { contract, name } of contracts) {
        const auctionInterval = await contract.auctionInterval();
        const auctionDuration = await contract.auctionDuration();
        const nextAuctionStart = await contract.getNextAuctionStart();

        let formattedNextTime = "0";
        if (nextAuctionStart !== 0 && nextAuctionStart !== undefined) {
          formattedNextTime = formatTimestamp(nextAuctionStart);
        }

        auctionData[name] = {
          auctionInterval,
          auctionDuration,
          nextAuctionStart: formattedNextTime,
        };
      }

      setAuctionDetails(auctionData);

      console.log("Auction Data:", auctionData);
    } catch (e) {
      console.error("Error fetching auction interval:", e);
    }
  };

  console.log("Auction Data in c156", auctionDetails);

  const AuctionTimeLeft = async () => {
    try {
      const contracts = [
        { name: "Fluxin", contract: AllContracts.RatioContract },
        // { name: "Xerion", contract: AllContracts.XerionRatioContract },
      ];

      const auctionTimes = {};

      for (const { name, contract } of contracts) {
        auctionTimes[name] = Number(await contract.getTimeLeftInAuction());
      }

      setAuctionTimeLeft(auctionTimes);
      console.log("Auction Times Left:", auctionTimes);
    } catch (e) {
      console.error("Error fetching auction time:", e);
    }
  };
 

  /*----------------------------------- Burn Functions------------------------------------- */

  const TotalTokensBurn = async () => {
    try {
      const results = await Promise.all(
        contracts.map(async ({ name, contract }) => {
          const TotalTokensBurnedd = await contract.getTotalTokensBurned();
          const totalTokensBurned = ethers.formatUnits(TotalTokensBurnedd, 18);

          return {
            name,
            TotalTokensBurned: Math.floor(totalTokensBurned),
          };
        })
      );

      const newStates = results.reduce((acc, { name, TotalTokensBurned }) => {
        acc[name] = TotalTokensBurned;
        return acc;
      }, {});
      console.log("state of burn", newStates);
      setTotalTokenBurned(newStates); // Update state with the combined object
      console.log("Updated burn occurrences:", newStates);
    } catch (e) {
      console.error("Error fetching burn status:", e);
    }
  };
  const TotalBountyAmount = async () => {
    try {
      const results = await Promise.all(
        contracts.map(async ({ name, contract }) => {
          const TotalBounty = await contract.getTotalBountyCollected();
          const totalBounty = ethers.formatUnits(TotalBounty, 18);

          return { name, TotalBounty: Math.floor(totalBounty) };
        })
      );

      const newStates = results.reduce((acc, { name, TotalBounty }) => {
        acc[name] = TotalBounty;
        return acc;
      }, {});
      console.log("state of burn", newStates);
      setTotalTokenBounty(newStates); // Update state with the combined object
      console.log("Updated burn occurrences:", newStates);
    } catch (e) {
      console.error("Error fetching burn status:", e);
    }
  };

  GeneralAuctionProvider.propTypes = {
    children: PropTypes.node.isRequired,
  };
  return (
    <GeneralAuctionFunctions.Provider
      value={{
        AuctionRunningLocalString,
        AuctionRunning,
        auctionDetails,
        TotalBounty,
        TotalTokensBurned,
        auctionTimeLeft,
      }}
    >
      {children}
    </GeneralAuctionFunctions.Provider>
  );
};
export const useGeneralAuctionFunctions = () =>
  useContext(GeneralAuctionFunctions);
