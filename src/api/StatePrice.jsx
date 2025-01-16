import { createContext, useState, useEffect } from "react";
import axios from "axios";

const PriceContext = createContext();

const PriceProvider = ({ children }) => {
  const [price, setPrice] = useState(null);
  const [error, setError] = useState(null);
  const pairId = "0x894Fd7d05FE360a1D713c10b0E356af223fDE88c";
  const chainId = "pulsechain";

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const response = await axios.get(
          `https://api.dexscreener.com/latest/dex/pairs/${chainId}/${pairId}`
        );

        // Find the pair data for pulsechain
        const pairData = response.data.pairs.find(
          (pair) => pair.chainId === "pulsechain"
        );

        if (pairData) {
          // Check if priceUsd exists, if not, use priceNative
          if (pairData.priceUsd) {
            setPrice(pairData.priceUsd);
          } else if (pairData.priceNative) {
            setPrice(pairData.priceNative); // Fallback to priceNative
          } else {
            setError("No price data available for this pair.");
          }
        } else {
          setError("Pair data not found for the specified contract.");
        }
      } catch (err) {
        setError("Failed to fetch token price. Please try again later.");
        console.error(err);
      }
    };

    fetchPrice();
  }, [pairId]);

  return (
    <PriceContext.Provider value={{ price, error }}>
      {children}
    </PriceContext.Provider>
  );
};

export { PriceContext, PriceProvider };
