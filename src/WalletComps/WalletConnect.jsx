import { useEffect } from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import "../Styles/WalletConnector.css";
import "@rainbow-me/rainbowkit/styles.css";

const WalletConnector = () => {
  const { isConnected, address } = useAccount();

  useEffect(() => {
    console.log("Wallet connected:", isConnected, "Address:", address);
  }, [isConnected, address]); // ✅ Runs immediately after a refresh

  return (
    <div className="wallet-connector">
      <ConnectButton />
    </div>
  );
};

export default WalletConnector;
