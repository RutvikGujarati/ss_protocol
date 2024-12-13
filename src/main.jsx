import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import ConnectWalletProvider from "./Context/ConnectWalletContext.jsx";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ConnectWalletProvider>
      <App />
    </ConnectWalletProvider>
  </StrictMode>
);
