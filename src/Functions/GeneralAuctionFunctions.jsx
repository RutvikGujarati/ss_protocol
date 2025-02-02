import { createContext, useContext, useEffect, useState } from "react";
import { ContractContext } from "./ContractInitialize";
import PropTypes from "prop-types";

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
    isAuctionRunning();
  }, [AllContracts]);
  GeneralAuctionProvider.propTypes = {
    children: PropTypes.node.isRequired,
  };
  return (
    <GeneralAuctionFunctions.Provider
      value={{ AuctionRunningLocalString, AuctionRunning }}
    >
      {children}
    </GeneralAuctionFunctions.Provider>
  );
};
export const useGeneralAuctionFunctions = () =>
  useContext(GeneralAuctionFunctions);
