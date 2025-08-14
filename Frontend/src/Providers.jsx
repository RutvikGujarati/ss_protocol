import { StrictMode, Suspense } from "react";
import PropTypes from "prop-types";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { darkTheme, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { config } from "../WalletConfig.js";
import { ContractProvider } from "./Functions/ContractInitialize.jsx";
import { DavProvider } from "./Functions/DavTokenFunctions.jsx";
import { SwapContractProvider } from "./Functions/SwapContractFunctions.jsx";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
      cacheTime: 1000 * 60 * 60 * 24, // 24 hours
      refetchOnWindowFocus: false,
    },
  },
});

export default function Providers({ children }) {
  Providers.propTypes = {
    children: PropTypes.node.isRequired,
  };

  return (
    <StrictMode>
      <WagmiProvider config={config} reconnectOnMount={true}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider
            theme={darkTheme({
              accentColor: "#7b3fe4",
              accentColorForeground: "white",
              fontStack: "Satoshi",
              overlayBlur: "small",
            })}
          >
            <Suspense fallback={<div>Loading wallet and contracts...</div>}>
              <ContractProvider>
                <DavProvider>
                  <SwapContractProvider>
                    {children}
                  </SwapContractProvider>
                </DavProvider>
              </ContractProvider>
            </Suspense>
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </StrictMode>
  );
}