import { createContext, useState, useEffect } from "react";
import axios from "axios";

const PriceContext = createContext();

const PriceProvider = ({ children }) => {
  const [stateUsdPrice, setStateUsdPrice] = useState(null);
  const [FluxinUsdPrice, setFluxinUsdPrice] = useState(null);
  const [FluxinRatioPrice, setFluxinRatioPrice] = useState(null);
  const [XerionUsdPrice, setXerionUsdPrice] = useState(null);
  const [XerionRatioPrice, setXerionRatioPrice] = useState(null);
  const [error, setError] = useState(null);

  const fetchPrice = async (url, tokenId, setPrice, tokenName) => {
    try {
      const response = await axios.get(url);
      let tokenPrice;
      if (tokenName === "state") {
        tokenPrice = response.data?.data?.attributes[tokenId];
      } else if (tokenName === "Fluxin" || tokenName === "Xerion") {
        tokenPrice = response.data?.data?.attributes[tokenId];
      } else {
        tokenPrice = response.data?.data?.attributes.token_prices[tokenId];
      }

      if (
        (tokenPrice && tokenName === "Fluxin") ||
        (tokenPrice && tokenName === "Xerion")
      ) {
        setPrice(parseFloat(tokenPrice).toFixed(0));
      } else if (tokenPrice) {
        setPrice(parseFloat(tokenPrice).toFixed(9));
      } else setError("Token price not found.");
    } catch (err) {
      setError("Failed to fetch token price. Please try again later.");
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPrice(
      "https://api.geckoterminal.com/api/v2/networks/pulsechain/pools/0x894fd7d05fe360a1d713c10b0e356af223fde88c?include=dex",
      "base_token_price_usd",
      setStateUsdPrice,
      "state"
    );
  }, []);
  useEffect(() => {
    fetchPrice(
      "https://api.geckoterminal.com/api/v2/networks/pulsechain/pools/0x361afa3f5ef839bed6071c9f0c225b078eb8089a?include=dex",
      "base_token_price_quote_token",
      setFluxinRatioPrice,
      "Fluxin"
    );
  }, []);

  useEffect(() => {
    fetchPrice(
      "https://api.geckoterminal.com/api/v2/simple/networks/pulsechain/token_price/0x6f01eec1111748b66f735944b18b0eb2835ae201",
      "0x6f01eec1111748b66f735944b18b0eb2835ae201",
      setFluxinUsdPrice
    );
  }, []);

  useEffect(() => {
    fetchPrice(
      "https://api.geckoterminal.com/api/v2/simple/networks/pulsechain/token_price/0xb9664de2e15b24f5e934e66c72ad9329469e3642",
      "0xb9664de2e15b24f5e934e66c72ad9329469e3642",
      setXerionUsdPrice
    );
  }, []);
  useEffect(() => {
    fetchPrice(
      "https://api.geckoterminal.com/api/v2/networks/pulsechain/pools/0xc6359cd2c70f643888d556d377a4e8e25caadf77?include=dex",
      "base_token_price_quote_token",
      setXerionRatioPrice,
      "Xerion"
    );
  }, []);

  return (
    <PriceContext.Provider
      value={{
        stateUsdPrice,
        FluxinUsdPrice,
        XerionUsdPrice,
        error,
        FluxinRatioPrice,
        XerionRatioPrice,
      }}
    >
      {children}
    </PriceContext.Provider>
  );
};

export { PriceContext, PriceProvider };
