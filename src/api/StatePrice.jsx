import { createContext, useState, useEffect } from "react";
import axios from "axios";

const PriceContext = createContext();

const PriceProvider = ({ children }) => {
  const [price, setPrice] = useState(null);
  const [error, setError] = useState(null);
  const contractAddress = "0x63CC0B2CA22b260c7FD68EBBaDEc2275689A3969";

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const response = await axios.get(
          `https://api.dexscreener.io/latest/dex/tokens/${contractAddress}`
        );

        const pairData = response.data.pairs.find(
          (pair) => pair.chainId === "pulsechain"
        );

        if (pairData && pairData.priceUsd) {
          setPrice(pairData.priceUsd);
        } else {
          setError("Price data not found for the specified token.");
        }
      } catch (err) {
        setError("Failed to fetch token price. Please try again later.");
        console.error(err);
      }
    };

    fetchPrice();
  }, [contractAddress]);

  return (
    <PriceContext.Provider value={{ price, error }}>
      {children}
    </PriceContext.Provider>
  );
};

export { PriceContext, PriceProvider };
