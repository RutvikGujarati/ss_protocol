import { createContext, useState, useEffect } from "react";
import axios from "axios";
import PropTypes from "prop-types";

const PriceContext = createContext();

const PriceProvider = ({ children }) => {
  const [stateUsdPrice, setStateUsdPrice] = useState(null);
  const [priceLoading, setPriceLoading] = useState(true);
  const [FluxinUsdPrice, setFluxinUsdPrice] = useState(null);
  const [XerionUsdPrice, setXerionUsdPrice] = useState(null);
  const [OneDollarUsdPrice, setOneDollarUsdPrice] = useState(null);
  const [RievaUsdPrice, setRievaUsdPrice] = useState(null);
  const [DomusUsdPrice, setDomusUsdPrice] = useState(null);
  const [TenDollarUsdPrice, setTenDollarUsdPrice] = useState(null);
  const [error, setError] = useState(null);

  const fetchPrice = async (url, tokenId, setPrice, tokenName) => {
    setPriceLoading(true);
    try {
      const response = await axios.get(url);
      let tokenPrice;
      if (tokenName === "state") {
        tokenPrice = response.data?.data?.attributes[tokenId];
      } else {
        tokenPrice = response.data?.data?.attributes.token_prices[tokenId];
      }

      if (tokenPrice) {
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
      "https://api.geckoterminal.com/api/v2/simple/networks/pulsechain/token_price/0xfe4ec02e6fe069d90d4a721313f22d6461ec5a06",
      "0xfe4ec02e6fe069d90d4a721313f22d6461ec5a06",
      setFluxinUsdPrice
    );
  }, []);

  useEffect(() => {
    fetchPrice(
      "https://api.geckoterminal.com/api/v2/simple/networks/pulsechain/token_price/0xede25454e7f50a925ba00174164e0c6d818e4b25",
      "0xede25454e7f50a925ba00174164e0c6d818e4b25",
      setXerionUsdPrice
    );
  }, []);
  useEffect(() => {
    fetchPrice(
      "https://api.geckoterminal.com/api/v2/simple/networks/pulsechain/token_price/0x4f665ef2ef5336d26a6c06525dd812786e5614c6",
      "0x4f665ef2ef5336d26a6c06525dd812786e5614c6",
      setOneDollarUsdPrice
    );
  }, []);
  useEffect(() => {
    fetchPrice(
      "https://api.geckoterminal.com/api/v2/simple/networks/pulsechain/token_price/0xc6d64985e00bb43d93582866bb7eafc75692f0d8",
      "0xc6d64985e00bb43d93582866bb7eafc75692f0d8",
      setRievaUsdPrice
    );
  }, []);
  useEffect(() => {
    fetchPrice(
      "https://api.geckoterminal.com/api/v2/simple/networks/pulsechain/token_price/0x82627374e1fe45a6918f21e52b4776e3b8c6420b",
      "0x82627374e1fe45a6918f21e52b4776e3b8c6420b",
      setDomusUsdPrice
    );
  }, []);
  useEffect(() => {
    fetchPrice(
      "https://api.geckoterminal.com/api/v2/simple/networks/pulsechain/token_price/0x916ed6d34d2d26b2173237bb44e0c91bdbbd7222",
      "0x916ed6d34d2d26b2173237bb44e0c91bdbbd7222",
      setTenDollarUsdPrice
    );
  }, []);

  return (
    <PriceContext.Provider
      value={{
        stateUsdPrice,
        FluxinUsdPrice,
        XerionUsdPrice,
        OneDollarUsdPrice,
		TenDollarUsdPrice,
        error,
        priceLoading,
        DomusUsdPrice,
        RievaUsdPrice,
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
