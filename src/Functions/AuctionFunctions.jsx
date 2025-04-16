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
import { Addresses } from "../data/AddressMapping";

export const GeneralAuctionFunctions = createContext();

export const GeneralAuctionProvider = ({ children }) => {
  const { AllContracts } = useContext(ContractContext);

  // State to store values mapped by token address
  const [AuctionRunningLocalString, setIsAuctionRunningLocalString] = useState(
    {}
  );
  const [AuctionRunning, setIsAuctionRunning] = useState({});
  const [auctionTimeLeft, setAuctionTimeLeft] = useState({});
  const [auctionDetails, setAuctionDetails] = useState({});
  const [TotalTokensBurned, setTotalTokenBurned] = useState({});

  // List of token addresses (replace with your actual token addresses)
  Addresses.filter((address) => ethers.isAddress(address));

  const contract = AllContracts.AuctionContract;

  console.log("auction contract", contract);

  /* ----------------------------------- Auction Functions ----------------------------------- */

  const isAuctionRunning = useCallback(async () => {
    if (!contract) return;

    try {
      const auctionStatus = await Promise.all(
        Addresses.map(async ({ name, address }) => {
          const isRunning = await contract.isAuctionActive(address);
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
  }, [contract, Addresses]);

  const AuctionTimeInterval = useCallback(async () => {
    if (!contract) return;

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
        Addresses.map(async ({ name, address }) => {
          const [auctionInterval, auctionDuration, nextAuctionStart] =
            await Promise.all([
              contract.auctionInterval(address),
              contract.auctionDuration(address),
              contract.getNextAuctionStart(address),
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
  }, [contract, Addresses]);

  const AuctionTimeLeft = useCallback(async () => {
    if (!contract) return;

    try {
      const auctionTimes = await Promise.all(
        Addresses.map(async ({ name, address }) => {
          return {
            [name]: Number(await contract.getTimeLeftInAuction(address)),
          };
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
  }, [contract, Addresses]);

  /* ----------------------------------- Burn Functions ----------------------------------- */

  const TotalTokensBurn = useCallback(async () => {
    if (!contract) return;

    try {
      const results = await Promise.all(
        Addresses.map(async ({ name, address }) => {
          const totalBurned = await contract.getTotalTokensBurned(address);
          const formattedBurned = ethers.formatUnits(totalBurned, 18);
          return {
            [name]: Number(formattedBurned),
          };
        })
      );

      const newState = results.reduce((acc, curr) => ({ ...acc, ...curr }), {});
      setTotalTokenBurned(newState);
      console.log("Updated Burned Tokens:", newState);
    } catch (e) {
      console.error("Error fetching burn status:", e);
    }
  }, [contract, Addresses]);

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
    if (contract && Addresses.length > 0) {
      fetchData();
      const interval = setInterval(fetchData, 5000);
      return () => clearInterval(interval);
    }
  }, [fetchData, contract]);

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
        AuctionTimeInterval,
        AuctionTimeLeft,
        TotalTokensBurn,
        fetchData,
      }}
    >
      {children}
    </GeneralAuctionFunctions.Provider>
  );
};

export const useGeneralAuctionFunctions = () =>
  useContext(GeneralAuctionFunctions);
