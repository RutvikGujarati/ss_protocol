import { useContext } from "react";
import {ConnectWalletContext} from "../Context/ConnectWalletContext";
const WalletConnector = () => {
    const { connectWallet, disconnectWallet, address, balance } = useContext(ConnectWalletContext);

    return (
        <div>
            {address ? (
                <div>
                    <p>Connected Address: {address}</p>
                    <p>Balance: {balance} ETH</p>
                    <button className="btn btn-outline-light" onClick={disconnectWallet}>Disconnect Wallet</button>
                </div>
            ) : (
                <button className="btn btn-outline-light" onClick={connectWallet}>Connect Wallet</button>
            )}
        </div>
    );
};

export default WalletConnector;
