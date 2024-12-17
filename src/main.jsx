import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import ConnectWalletProvider from "./Context/ConnectWalletContext.jsx";
import App from "./App.jsx";
import { DAVTokenProvider } from "./Context/DavTokenContext.jsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { darkTheme, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { config } from "../WalletConfig.js";
const queryClient = new QueryClient();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: "#7b3fe4",
            accentColorForeground: "white",
            fontStack: "system",
            overlayBlur: "small",
          })}
        >
          <ConnectWalletProvider>
            <DAVTokenProvider>
              <App />
            </DAVTokenProvider>
          </ConnectWalletProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </StrictMode>
);
