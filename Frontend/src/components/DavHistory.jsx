import { useEffect, useState, useContext } from "react";
import { ethers } from "ethers";
import { useAccount } from "wagmi";
import { ContractContext } from "../Functions/ContractInitialize";
import toast from "react-hot-toast";

const formatTimestamp = (timestamp) => {
  try {
    const ts =
      typeof timestamp === "object" && "toNumber" in timestamp
        ? timestamp.toNumber()
        : Number(timestamp);
    const date = new Date(ts * 1000);
    return date.toLocaleString(); // Fallback to browser format
  } catch (error) {
    console.error("Error formatting timestamp:", error);
    return "Invalid Date";
  }
};

const DavHistory = () => {
  const { AllContracts } = useContext(ContractContext);
  const { address } = useAccount();
  const [mintBatches, setMintBatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMintHistory = async () => {
      if (!AllContracts?.davContract || !address) {
        setMintBatches([]);
        setIsLoading(false);
        toast.error("Connect wallet to view minting history");
        return;
      }

      setIsLoading(true);
      try {
        const [mintTimes, expireTimes, amounts] =
          await AllContracts.davContract.getMintTimestamps(address);

        const formatted = mintTimes.map((mint, i) => ({
          mintedAt: formatTimestamp(mint),
          expiresAt: formatTimestamp(expireTimes[i]),
          amount: ethers.formatEther(amounts[i]),
        }));

        setMintBatches(formatted);
      } catch (error) {
        console.error("Error fetching mint timestamps:", error);
        setMintBatches([]);
        toast.error(
          `Failed to fetch mint history: ${error.reason || error.message}`
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchMintHistory();
  }, [AllContracts, address]);

  return (
    <div className="container mt-4">
      <div className="table-responsive">
        <table className="table table-dark table-hover">
          <thead>
            <tr>
              <th scope="col">Mint Amount (DAV)</th>
              <th scope="col">Minted At</th>
              <th scope="col">Expires At</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="3" className="text-center">
                  Loading...
                </td>
              </tr>
            ) : mintBatches && mintBatches.length > 0 ? (
              mintBatches.map((entry, idx) => (
                <tr key={idx}>
                  <td>{entry.amount}</td>
                  <td>{entry.mintedAt}</td>
                  <td>{entry.expiresAt}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="text-center">
                  No minting history available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DavHistory;
