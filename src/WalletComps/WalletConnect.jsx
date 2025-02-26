// import { useContext } from "react";
// import { ConnectWalletContext } from "../Context/ConnectWalletContext";
import "../Styles/WalletConnector.css"; // Importing custom styles
import { ConnectButton } from "@rainbow-me/rainbowkit";
import '@rainbow-me/rainbowkit/styles.css'; 


const WalletConnector = () => {


  return (
    <div className="wallet-connector">
      <ConnectButton />
	  
    </div>
  );
};

export default WalletConnector;
