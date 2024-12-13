import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import ConnectWalletProvider from "./Context/ConnectWalletContext.jsx";
import App from "./App.jsx";
import { DAVTokenProvider } from "./Context/DavTokenContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ConnectWalletProvider>
      <DAVTokenProvider>
        <App />
      </DAVTokenProvider>
    </ConnectWalletProvider>
  </StrictMode>
);
