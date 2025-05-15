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
    id: "0xf15f1f64891a3e2797328445cb28ba11fe468505",
    key: "stateWplsRatio",
    isRatio: true,
  },
  {
    id: "0xe4a02db896cee9dbf32d730dc9874eb058f0ca3f",
    key: "CurrusUsdPrice",
    isPool: true,
  },
  { id: "0xfe4ec02e6fe069d90d4a721313f22d6461ec5a06", key: "FluxinUsdPrice" },
  { id: "0xede25454e7f50a925ba00174164e0c6d818e4b25", key: "XerionUsdPrice" },
  {
    id: "0x6916be7b7a36d8bc1c09eae5487e92ff837626bb",
    key: "OneDollarUsdPrice",
    isPool: true,
  },
  {
    id: "0x3c504c7d2a99e212c186aa0bc47a9e94dd7ac827",
    key: "RievaUsdPrice",
    isPool: true,
  },
  {
    id: "0x7019ee4173420ee652edc9a26bffc91469c753db",
    key: "DomusUsdPrice",
    isPool: true,
  },
  {
    id: "0xebee32fae4fcb913fa25ae16d741ba197510a575",
    key: "TeeahUsdPrice",
    isPool: true,
  },
  {
    id: "0x86e8330efe0dfc20ab8f63dcf95a6a8d66f60c1d",
    key: "TenDollarUsdPrice",
    isPool: true,
  },
  { id: "0x61fb10ac14b5fe7499a6858a9cf0d80cc1d2fd75", key: "ValirUsdPrice" },
  {
    id: "0x1a60e1ca8732634392eb89e68a6c50ea457872c6",
    key: "SanitasUsdPrice",
    isPool: true,
  },
];

const PriceProvider = ({ children }) => {
  const [prices, setPrices] = useState({});
  const [priceLoading, setPriceLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPrice = async ({ id, key, isPool = false, isRatio = false }) => {
    try {
      const url = `https://api.geckoterminal.com/api/v2/${
        isPool || isRatio
          ? "networks/pulsechain/pools"
          : "simple/networks/pulsechain/token_price"
      }/${id}${isPool ? "?include=dex" : ""}`;
      const response = await axios.get(url);

      const price = isPool
        ? response.data?.data?.attributes?.base_token_price_usd
        : isRatio
        ? response.data?.data?.attributes?.base_token_price_native_currency
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
