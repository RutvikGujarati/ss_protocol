import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { ContractContext } from "./ContractInitialize";
import PropTypes from "prop-types";
import { ethers } from "ethers";

export const GeneralAuctionFunctions = createContext();

export const GeneralAuctionProvider = ({ children }) => {
  const { AllContracts } = useContext(ContractContext);

  const [AuctionRunningLocalString, setIsAuctionRunningLocalString] = useState(
    {}
  );
  const [AuctionRunning, setIsAuctionRunning] = useState({});
  const [auctionTimeLeft, setAuctionTimeLeft] = useState({});
  const [auctionDetails, setAuctionDetails] = useState({});
  const [TotalTokensBurned, setTotalTokenBurned] = useState({});

  const contracts = [
    { name: "Fluxin", contract: AllContracts?.RatioContract },
    { name: "Xerion", contract: AllContracts?.XerionRatioContract },
    { name: "Rieva", contract: AllContracts?.RievaRatioContract },
    { name: "Domus", contract: AllContracts?.DomusRatioContract },
    { name: "Currus", contract: AllContracts?.CurrusRatioContract },
    { name: "Valir", contract: AllContracts?.ValirRatioContract },
    { name: "Sanitas", contract: AllContracts?.SanitasRatioContract },
    { name: "Teeah", contract: AllContracts?.TeeahRatioContract },
    { name: "TenDollar", contract: AllContracts?.TenDollarRatioContract },
    { name: "OneDollar", contract: AllContracts?.OneDollarRatioContract },
  ].filter(({ contract }) => contract); // Remove undefined contracts

  /* ----------------------------------- Auction Functions ----------------------------------- */

  const isAuctionRunning = useCallback(async () => {
    try {
      const auctionStatus = await Promise.all(
        contracts.map(async ({ name, contract }) => {
          const isRunning = await contract.isAuctionActive();
          return { [name]: isRunning.toString() };
        })
      );

      const updatedStatus = auctionStatus.reduce(
        (acc, curr) => ({ ...acc, ...curr }),
        {}
      );
      setIsAuctionRunning({ ...updatedStatus, state: true });
      setIsAuctionRunningLocalString({ ...updatedStatus, state: true });

      console.log("Auction Running Status:", updatedStatus);
    } catch (error) {
      console.error("Error fetching auction status:", error);
    }
  }, [contracts]);

  const AuctionTimeInterval = useCallback(async () => {
    try {
      const formatTimestamp = (timestamp) => {
        return new Date(parseFloat(timestamp) * 1000).toLocaleString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        });
      };

      const auctionData = await Promise.all(
        contracts.map(async ({ name, contract }) => {
          const [auctionInterval, auctionDuration, nextAuctionStart] =
            await Promise.all([
              contract.auctionInterval(),
              contract.auctionDuration(),
              contract.getNextAuctionStart(),
            ]);

          return {
            [name]: {
              auctionInterval,
              auctionDuration,
              nextAuctionStart:
                nextAuctionStart !== 0
                  ? formatTimestamp(nextAuctionStart)
                  : "0",
            },
          };
        })
      );

      const formattedData = auctionData.reduce(
        (acc, curr) => ({ ...acc, ...curr }),
        {}
      );
      setAuctionDetails(formattedData);
      console.log("Auction Details:", formattedData);
    } catch (e) {
      console.error("Error fetching auction interval:", e);
    }
  }, [contracts]);

  const AuctionTimeLeft = useCallback(async () => {
    try {
      const auctionTimes = await Promise.all(
        contracts.map(async ({ name, contract }) => {
          return { [name]: Number(await contract.getTimeLeftInAuction()) };
        })
      );

      const formattedTimes = auctionTimes.reduce(
        (acc, curr) => ({ ...acc, ...curr }),
        {}
      );
      setAuctionTimeLeft(formattedTimes);
      console.log("Auction Times Left:", formattedTimes);
    } catch (e) {
      console.error("Error fetching auction time:", e);
    }
  }, [contracts]);

  /* ----------------------------------- Burn Functions ----------------------------------- */

  const TotalTokensBurn = useCallback(async () => {
    try {
      const results = await Promise.all(
        contracts.map(async ({ name, contract }) => {
          const totalBurned = await contract.getTotalTokensBurned();
          const formattedBurned = ethers.formatUnits(totalBurned, 18);
          return {
            [name]:
              name === "OneDollar" || name === "TenDollar"
                ? Number(formattedBurned)
                : Math.floor(formattedBurned),
          };
        })
      );

      const newState = results.reduce((acc, curr) => ({ ...acc, ...curr }), {});
      setTotalTokenBurned(newState);
      console.log("Updated Burned Tokens:", newState);
    } catch (e) {
      console.error("Error fetching burn status:", e);
    }
  }, [contracts]);

  /* ----------------------------------- Auto Updates ----------------------------------- */

  const fetchData = useCallback(async () => {
    try {
      await Promise.all([
        isAuctionRunning(),
        AuctionTimeInterval(),
        AuctionTimeLeft(),
        TotalTokensBurn(),
      ]);
    } catch (error) {
      console.error("Error fetching auction and burn data:", error);
    }
  }, [isAuctionRunning, AuctionTimeInterval, AuctionTimeLeft, TotalTokensBurn]);

  useEffect(() => {
    if (contracts.length > 0) {
      fetchData();
      const interval = setInterval(fetchData, 5000);
      return () => clearInterval(interval);
    }
  }, [fetchData]);

  /* ----------------------------------- Provider Return ----------------------------------- */

  GeneralAuctionProvider.propTypes = {
    children: PropTypes.node.isRequired,
  };

  return (
    <GeneralAuctionFunctions.Provider
      value={{
        AuctionRunningLocalString,
        AuctionRunning,
        auctionDetails,
        TotalTokensBurned,
        auctionTimeLeft,
        isAuctionRunning,
      }}
    >
      {children}
    </GeneralAuctionFunctions.Provider>
  );
};

export const useGeneralAuctionFunctions = () =>
  useContext(GeneralAuctionFunctions);
