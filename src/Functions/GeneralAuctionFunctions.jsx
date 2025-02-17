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
  const [BurnOccuredForToken, setBurnOccuredForToken] = useState({});
  const [BurnCycleACtive, setBurnCycleActive] = useState({});
  const [BurnTimeLeft, setBurnTimeLeft] = useState({});
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
        await isAuctionRunning();
      } catch (error) {
        console.error("Error in isAuctionRunning:", error);
      }

      try {
        await AuctionTimeInterval();
        await AuctionTimeLeft();
      } catch (error) {
        console.error("Error in AuctionTimeInterval:", error);
      }

      try {
        await BurningOccurred();
        await BurnCycleActive();
        await BurnTimingLeft();
        await TotalTokensBurn();
        await TotalBountyAmount();
      } catch (error) {
        console.error("Error in burn occured fetching:", error);
      }
    };

    safeExecution();
  }, [AllContracts]);

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

  console.log("Auction Data in c156", auctionDetails)

  const AuctionTimeLeft = async () => {
    try {
      const contracts = [
        { name: "Fluxin", contract: AllContracts.RatioContract },
        { name: "Xerion", contract: AllContracts.XerionRatioContract },
        // Future contracts can be added here
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
  const BurningOccurred = async () => {
    try {
      const results = await Promise.all(
        contracts.map(async ({ name, contract }) => {
          const BurnOccurred = await contract.getBurnOccured();

          return { name, BurnOccurred: BurnOccurred.toString() };
        })
      );

      const newStates = results.reduce((acc, { name, BurnOccurred }) => {
        acc[name] = BurnOccurred;
        return acc;
      }, {});
      console.log("state of burn from ga", newStates);
      setBurnOccuredForToken(newStates); // Update state with the combined object
      console.log("Updated burn occurrences:", newStates);
    } catch (e) {
      console.error("Error fetching burn status:", e);
    }
  };

  const BurnCycleActive = async () => {
    try {
      const results = await Promise.all(
        contracts.map(async ({ name, contract }) => {
          const BurnOccurred = await contract.isBurnCycleActive();

          return { name, BurnOccurred: BurnOccurred.toString() };
        })
      );

      const newStates = results.reduce((acc, { name, BurnOccurred }) => {
        acc[name] = BurnOccurred;
        return acc;
      }, {});
      console.log("state of burn", newStates);
      setBurnCycleActive(newStates); // Update state with the combined object
      console.log("Updated burn occurrences:", newStates);
    } catch (e) {
      console.error("Error fetching burn status:", e);
    }
  };

  const BurnTimingLeft = async () => {
    try {
      const results = await Promise.all(
        contracts.map(async ({ name, contract }) => {
          const BurnOccurred = await contract.getTimeLeftInBurnCycle();

          return { name, BurnOccurred: parseFloat(BurnOccurred) };
        })
      );

      const newStates = results.reduce((acc, { name, BurnOccurred }) => {
        acc[name] = BurnOccurred;
        return acc;
      }, {});
      console.log("state of burn", newStates);
      setBurnTimeLeft(newStates); // Update state with the combined object
      console.log("Updated burn occurrences:", newStates);
    } catch (e) {
      console.error("Error fetching burn status:", e);
    }
  };

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
        BurnOccuredForToken,
        BurnCycleACtive,
        BurnTimeLeft,
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
