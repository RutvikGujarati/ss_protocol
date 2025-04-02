import { createContext, useState, useEffect } from "react";
import axios from "axios";
import PropTypes from "prop-types";

const PriceContext = createContext();

const tokens = [
  {
    id: "0xf15f1f64891a3e2797328445cb28ba11fe468505",
    key: "stateUsdPrice",
    isPool: true,
  },
  {
    id: "0xe4a02db896cee9dbf32d730dc9874eb058f0ca3f",
    key: "CurrusUsdPrice",
    isPool: true,
  },
  { id: "0xfe4ec02e6fe069d90d4a721313f22d6461ec5a06", key: "FluxinUsdPrice" },
  { id: "0xede25454e7f50a925ba00174164e0c6d818e4b25", key: "XerionUsdPrice" },
  {
    id: "0x4f665ef2ef5336d26a6c06525dd812786e5614c6",
    key: "OneDollarUsdPrice",
  },
  { id: "0xc6d64985e00bb43d93582866bb7eafc75692f0d8", key: "RievaUsdPrice" },
  { id: "0x82627374e1fe45a6918f21e52b4776e3b8c6420b", key: "DomusUsdPrice" },
  {
    id: "0x916ed6d34d2d26b2173237bb44e0c91bdbbd7222",
    key: "TenDollarUsdPrice",
  },
  { id: "0x61fb10ac14b5fe7499a6858a9cf0d80cc1d2fd75", key: "ValirUsdPrice" },
  { id: "0xbab8540dee05ba25cec588ce5124aa50b1d7d425", key: "SanitasUsdPrice" },
];

const PriceProvider = ({ children }) => {
  const [prices, setPrices] = useState({});
  const [priceLoading, setPriceLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPrice = async ({ id, key, isPool = false }) => {
    try {
      const url = `https://api.geckoterminal.com/api/v2/${
        isPool
          ? "networks/pulsechain/pools"
          : "simple/networks/pulsechain/token_price"
      }/${id}${isPool ? "?include=dex" : ""}`;
      const response = await axios.get(url);

      const price = isPool
        ? response.data?.data?.attributes?.base_token_price_usd
        : response.data?.data?.attributes?.token_prices?.[id];

      setPrices((prev) => ({
        ...prev,
        [key]: price ? parseFloat(price).toFixed(9) : null,
      }));
      console.log(`Price fetched for ${key}: ${price}`);
    } catch (err) {
      setError(`Failed to fetch ${key}`);
      console.error(err);
    } finally {
      setPriceLoading(false);
    }
  };

  useEffect(() => {
    tokens.forEach(fetchPrice);
  }, []);

  return (
    <PriceContext.Provider value={{ ...prices, priceLoading, error }}>
      {children}
    </PriceContext.Provider>
  );
};

PriceProvider.propTypes = { children: PropTypes.node.isRequired };
export { PriceContext, PriceProvider };
