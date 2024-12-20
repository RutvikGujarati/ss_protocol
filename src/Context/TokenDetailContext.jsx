import { createContext, useState, useContext } from "react";
import PropTypes from "prop-types";

// Create Context
const TokenDetailsContext = createContext();

// Provider Component
export const TokenDetailsProvider = ({ children }) => {
  // Simple token selection list
  const [selectedToken, setSelectedToken] = useState(null);

  // Token list (simplified)
  const tokenList = [
    {
      id: 1,
      tokenName: "Fluxin",
      key: "0xAE79930e57BB2EA8dde7381AC6d338A706386bAe",
      supply: "1M",
      auctionAllocation: "50%",
      davTreasurySupply: "500K",
    },
    {
      id: 2,
      tokenName: "Xerion",
      key: "0x12345...abcd",
      supply: "2M",
      auctionAllocation: "60%",
      davTreasurySupply: "1M",
    },
  ];

  const selectToken = (tokenId) => {
    const token = tokenList.find((t) => t.id === tokenId);
    setSelectedToken(token);
  };

  return (
    <TokenDetailsContext.Provider value={{ tokenList, selectedToken, selectToken }}>
      {children}
    </TokenDetailsContext.Provider>
  );
};

// Hook to use context
export const useTokenDetails = () => {
  return useContext(TokenDetailsContext);
};

TokenDetailsProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
