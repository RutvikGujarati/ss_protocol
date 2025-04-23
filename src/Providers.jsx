// Providers.jsx
import { StrictMode, Suspense } from "react";
import PropTypes from "prop-types";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { darkTheme, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { config } from "../WalletConfig.js";
import { PriceProvider } from "./api/StatePrice.jsx";
import { SwapContractProvider } from "./Functions/SwapContractFunctions.jsx";
import { ContractProvider } from "./Functions/ContractInitialize.jsx";
import { DavProvider } from "./Functions/DavTokenFunctions.jsx";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity, // ✅ Prevents frequent refetches
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
            // coolMode

            theme={darkTheme({
              accentColor: "#7b3fe4",
              accentColorForeground: "white",
              fontStack: "Satoshi",
              overlayBlur: "small",
            })}
          >
            <PriceProvider>
              <ContractProvider>
                <DavProvider>
                    <SwapContractProvider>
                      <Suspense fallback={<div>Loading...</div>}>
                        {children}
                      </Suspense>
                    </SwapContractProvider>
                  
                </DavProvider>
              </ContractProvider>
            </PriceProvider>
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </StrictMode>
  );
}
