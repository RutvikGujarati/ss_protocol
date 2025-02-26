import { createContext, useState, useEffect } from "react";
import axios from "axios";
import PropTypes from "prop-types";

const PriceContext = createContext();

const PriceProvider = ({ children }) => {
  const [stateUsdPrice, setStateUsdPrice] = useState(null);
  const [priceLoading, setPriceLoading] = useState(true);
  const [FluxinUsdPrice, setFluxinUsdPrice] = useState(null);
  const [XerionUsdPrice, setXerionUsdPrice] = useState(null);
  const [error, setError] = useState(null);

  const fetchPrice = async (url, tokenId, setPrice, tokenName) => {
    setPriceLoading(true);
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
    } finally {
      setPriceLoading(false);
    }
  };

  useEffect(() => {
    fetchPrice(
      "https://api.geckoterminal.com/api/v2/networks/pulsechain/pools/0xf15f1f64891a3e2797328445cb28ba11fe468505?include=dex",
      "base_token_price_usd",
      setStateUsdPrice,
      "state"
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

  return (
    <PriceContext.Provider
      value={{
        stateUsdPrice,
        FluxinUsdPrice,
        XerionUsdPrice,
        error,
        priceLoading,
      }}
    >
      {children}
    </PriceContext.Provider>
  );
};
PriceProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export { PriceContext, PriceProvider };
