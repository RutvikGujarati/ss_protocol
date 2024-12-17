import { useContext } from "react";
import { ConnectWalletContext } from "../Context/ConnectWalletContext";
import "../Styles/WalletConnector.css"; // Importing custom styles
import { ConnectButton } from "@rainbow-me/rainbowkit";
import '@rainbow-me/rainbowkit/styles.css'; 


const WalletConnector = () => {
  const { connectWallet, disconnectWallet, address } =
    useContext(ConnectWalletContext);

  // Helper to format address
  const formatAddress = (addr) => `${addr.slice(0, 4)}...${addr.slice(-4)}`;

  // Helper to format balance
  //   const formatBalance = (bal) => Number(bal).toFixed(3); // Shows only 3 decimal places

  return (
    <div className="wallet-connector">
      <ConnectButton />
    </div>
  );
};

export default WalletConnector;
