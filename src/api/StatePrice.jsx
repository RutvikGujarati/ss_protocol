import { createContext, useState, useEffect } from "react";
import axios from "axios";

const PriceContext = createContext();

const PriceProvider = ({ children }) => {
  const [stateUsdPrice, setStateUsdPrice] = useState(null); // State price in USD
  const [FluxinStatePrice, setFluxinStatePrice] = useState(null); // Fluxin/STATE ratio
  const [FluxinUsdPrice, setFluxinUsdPrice] = useState(null); // Fluxin price in USD
  const [XerionUsdPrice, setXerionUsdPrice] = useState(null); // Fluxin price in USD
  const [error, setError] = useState(null);

  const pairId = "0x894Fd7d05FE360a1D713c10b0E356af223fDE88c"; // State price pair ID
  const FluxinPairId = "0xAD309A9F1C16D34B7293ea44b9b43D3e29DE3775"; // Fluxin pair ID
  const chainId = "pulsechain";

  // Fetch state price in USD
  useEffect(() => {
    const fetchStatePrice = async () => {
      try {
        const response = await axios.get(
          "https://api.geckoterminal.com/api/v2/simple/networks/pulsechain/token_price/0x63cc0b2ca22b260c7fd68ebbadec2275689a3969"
        );

        const tokenPrice =
          response.data?.data?.attributes?.token_prices[
            "0x63cc0b2ca22b260c7fd68ebbadec2275689a3969"
          ];

        if (tokenPrice) {
          const formattedPrice = parseFloat(tokenPrice).toFixed(9);
          setStateUsdPrice(formattedPrice);
        } else {
          setError("Token price not found.");
        }
      } catch (err) {
        setError("Failed to fetch STATE price. Please try again later.");
        console.error(err);
      }
    };

    fetchStatePrice();
  }, [pairId]);

  // Fetch Fluxin/STATE price
  useEffect(() => {
    const fetchFluxinPrice = async () => {
      try {
        const response = await axios.get(
          "https://api.geckoterminal.com/api/v2/simple/networks/pulsechain/token_price/0x6f01eec1111748b66f735944b18b0eb2835ae201"
        );

        const tokenPrice =
          response.data?.data?.attributes?.token_prices[
            "0x6f01eec1111748b66f735944b18b0eb2835ae201"
          ];

        if (tokenPrice) {
          const formattedPrice = parseFloat(tokenPrice).toFixed(9);
          setFluxinUsdPrice(formattedPrice);
        } else {
          setError("Token price not found.");
        }
      } catch (err) {
        setError("Failed to fetch Fluxin price. Please try again later.");
        console.error(err);
      }
    };

    fetchFluxinPrice();
  }, [FluxinPairId, stateUsdPrice]);
  useEffect(() => {
    const fetchXerionPrice = async () => {
      try {
        const response = await axios.get(
          "https://api.geckoterminal.com/api/v2/simple/networks/pulsechain/token_price/0xb9664de2e15b24f5e934e66c72ad9329469e3642"
        );

        const tokenPrice =
          response.data?.data?.attributes?.token_prices[
            "0xb9664de2e15b24f5e934e66c72ad9329469e3642"
          ];

        if (tokenPrice) {
          const formattedPrice = parseFloat(tokenPrice).toFixed(9);
          setXerionUsdPrice(formattedPrice);
        } else {
          setError("Token price not found.");
        }
      } catch (err) {
        setError("Failed to fetch Fluxin price. Please try again later.");
        console.error(err);
      }
    };

    fetchXerionPrice();
  }, [FluxinPairId, stateUsdPrice]);

  return (
    <PriceContext.Provider
      value={{
        stateUsdPrice, // STATE price in USD
        FluxinUsdPrice, // Fluxin price in USD
		XerionUsdPrice,
        error,
      }}
    >
      {children}
    </PriceContext.Provider>
  );
};

export { PriceContext, PriceProvider };
