import { useLocation } from "react-router-dom";
import AuctionSection from "./Cards/AuctionSection";
import BurnSection from "./Cards/BurnSection";
import AddTokenSection from "./Cards/AddTokenSection";


const InfoCards = () => {
  const location = useLocation();
  const isBurn = location.pathname === "/Deflation";
  const isAuction = location.pathname === "/auction";
  const isAddToken = location.pathname === "/AddToken";

  return (
    <>
      {isAuction ? (
        <AuctionSection />
      ) : isBurn ? (
        <BurnSection />
      ) : isAddToken ? (
        <AddTokenSection />
      ) : (
        <></>
      )}
    </>
  );
};

export default InfoCards;