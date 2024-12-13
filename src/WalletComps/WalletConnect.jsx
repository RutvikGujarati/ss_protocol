import { useContext } from "react";
import { ConnectWalletContext } from "../Context/ConnectWalletContext";
import "../Styles/WalletConnector.css"; // Importing custom styles

const WalletConnector = () => {
  const { connectWallet, disconnectWallet, address, balance } =
    useContext(ConnectWalletContext);

  // Helper to format address
  const formatAddress = (addr) => `${addr.slice(0, 4)}...${addr.slice(-4)}`;

  // Helper to format balance
  const formatBalance = (bal) => Number(bal).toFixed(3); // Shows only 3 decimal places

  return (
    <div className="wallet-connector">
      {address ? (
        <div className="d-flex align-items-center">
          <span className="wallet-info me-3">{formatAddress(address)}</span>
          {/* <span className="wallet-info me-3">{formatBalance(balance)} ETH</span> */}
          <button className="btn btn-primary btn-sm" onClick={disconnectWallet}>
            Disconnect
          </button>
        </div>
      ) : (
        <button className="btn btn-primary btn-sm" onClick={connectWallet}>
          Connect
        </button>
      )}
    </div>
  );
};

export default WalletConnector;
