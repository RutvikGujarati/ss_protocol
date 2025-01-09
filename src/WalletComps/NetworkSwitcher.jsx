import { ethers } from "ethers";

const tokenAddresses = {
  pulsechain: {
    DAV: "0x8037E06539b2Dc1b87BD56BE622663022f4b5aC1",
    STATE: "0x9Cd5fe7149CA9220844dB106cEffEa3Ef4e2B6f9",
    RATIO: "0x0Bd9BA2FF4F82011eeC33dd84fc09DC89ac5B5EA",
  },
  pulsechainV4: {
    DAV: "0x9Cd5fe7149CA9220844dB106cEffEa3Ef4e2B6f9",
    STATE: "0x9Cd5fe7149CA9220844dB106cEffEa3Ef4e2B6f9",
    RATIO: "0x9Cd5fe7149CA9220844dB106cEffEa3Ef4e2B6f9",
  },
};

const NetworkSwitcher = () => {
  const getNetworkDetails = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();

      console.log("Connected network:", network);

      // Convert comparison value to BigInt
      const chainName =
        network.chainId === BigInt(943) ? "pulsechainV4" : "pulsechain";

      return {
        chainId: network.chainId,
        chainName,
        tokens: tokenAddresses[chainName],
      };
    } catch (error) {
      console.error("Error fetching network details:", error);
      return null;
    }
  };

  return (
    <div>
      <button onClick={async () => console.log(await getNetworkDetails())}>
        Get Network Details
      </button>
    </div>
  );
};

export default NetworkSwitcher;
