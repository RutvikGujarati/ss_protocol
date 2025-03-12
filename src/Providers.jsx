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
import { GeneralTokenProvider } from "./Functions/GeneralTokensFunctions.jsx";
import { GeneralAuctionProvider } from "./Functions/GeneralAuctionFunctions.jsx";
// import { DeepStateProvider } from "./Functions/DeepStateContract.jsx";

const queryClient = new QueryClient();
export default function Providers({ children }) {
  Providers.propTypes = {
    children: PropTypes.node.isRequired,
  };
  return (
    <StrictMode>
      <WagmiProvider config={config}>
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
                {/* <DeepStateProvider> */}
                  <DavProvider>
                    <GeneralTokenProvider>
                      <GeneralAuctionProvider>
                        <SwapContractProvider>
                          <Suspense fallback={<div>Loading...</div>}>
                            {children}
                          </Suspense>
                        </SwapContractProvider>
                      </GeneralAuctionProvider>
                    </GeneralTokenProvider>
                  </DavProvider>
                {/* </DeepStateProvider> */}
              </ContractProvider>
            </PriceProvider>
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </StrictMode>
  );
}
