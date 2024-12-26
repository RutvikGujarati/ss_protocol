import "bootstrap/dist/css/bootstrap.min.css";
import "../Styles/InfoCards.css";
import { useDAVToken } from "../Context/DavTokenContext";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useLocation } from "react-router-dom";
import MetaMaskIcon from "../assets/metamask-icon.png";
import { formatWithCommas } from "./DetailsInfo";
const InfoCards = () => {
  const {
    mintDAV,
    // handleAddTokenRatio,
    handleAddTokenState,
    handleAddTokenDAV,
    CalculationOfCost,
    TotalCost,
    StateBurned,
    StateBurnedRatio,
    StateSupply,
    davHolds,
    davPercentage,
    StateHolds,
  } = useDAVToken();
  const [amount, setAmount] = useState("");
  const [load, setLoad] = useState(false);
  const [successMessage, setSuccessMessage] = useState(""); // Tracks success message

  const handleMint = async () => {
    setLoad(true);
    setSuccessMessage("");
    try {
      await mintDAV(amount); // Call the mint function with the entered amount
      setSuccessMessage("Successful Mint!");
      setAmount(""); // Reset the input box
      setTimeout(() => {
        setSuccessMessage("");
      }, 2000); // Clear success message after 2 seconds
    } catch (error) {
      console.error("Error minting:", error);
      alert("Minting failed! Please try again.");
    } finally {
      setLoad(false);
    }
  };

  const handleInputChange = (e) => {
    setAmount(e.target.value);
    CalculationOfCost(e.target.value);
  };

  function formatNumber(number) {
    if (!number) return "0";
    return new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 0,
    }).format(number);
  }

  useEffect(() => {
    CalculationOfCost(amount);
    // GetCurrentStateReward();
  }, [amount]);

  const location = useLocation();
  const isBurn = location.pathname === "/burn";
  const isAuction = location.pathname === "/auction";

  return (
    <>
      {isAuction ? (
        <>
          <div className="container mt-4">
            <div className="row g-4 d-flex align-items-stretch pb-1 border-bottom">
              <div className="col-md-4 p-0 m-2 cards">
                <div className="card bg-dark text-light border-light p-0 d-flex justify-content-center align-items-center text-center w-100">
                  <div>
                    <p className="mb-2 detailText">MINT DAV TOKENS</p>
                    <input
                      type="text"
                      placeholder="Enter Value"
                      className="form-control text-center fw-bold mb-3"
                      value={amount}
                      onChange={handleInputChange}
                    />
                    <h5 className="detailAmount mb-4">
                      {TotalCost
                        ? formatNumber(ethers.formatUnits(TotalCost, 18))
                        : "0"}{" "}
                      PLS
                    </h5>

                    <button
                      onClick={handleMint}
                      className="btn btn-primary btn-sm d-flex justify-content-center align-items-center w-100"
                      disabled={load}
                    >
                      {load ? "Minting..." : "Mint"}
                    </button>
                  </div>
                </div>
              </div>
              <div className="col-md-4 p-0 m-2 cards">
                <div className="card bg-dark text-light border-light p-3 d-flex w-100">
                  <div className="carddetaildiv uppercase">
                    <div className="carddetails2">
                      <p className="mb-1 detailText">Dav holdings</p>

                      <h5 className="">{davHolds}</h5>
                    </div>
                    <div className="carddetails2">
                      <p className="mb-1 detailText">Dav Rank</p>
                      <h5 className="">{davPercentage}%</h5>
                    </div>
                    <div className="carddetails2">
                      <img
                        src={MetaMaskIcon}
                        width={20}
                        height={20}
                        alt="Logo"
                        style={{ cursor: "pointer" }}
                        onClick={handleAddTokenDAV}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-4 p-0 m-2 cards">
                <div className="card bg-dark text-light border-light p-3 d-flex w-100">
                  <div className="carddetaildiv uppercase">
                    <div className="carddetails2">
                      <p className="mb-1 detailText">State token holdings</p>
                      <h5 className="">{StateHolds} / $0.00</h5>
                    </div>
                    <div className="carddetails2">
                      <p className="mb-1 detailText">State token price</p>
                      <h5 className="">$0</h5>
                    </div>
                    <div className="carddetails2">
                      <img
                        src={MetaMaskIcon}
                        width={20}
                        height={20}
                        alt="Logo"
                        style={{ cursor: "pointer" }}
                        onClick={handleAddTokenState}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : isBurn ? (
        <>
          <div className="container mt-4">
            <div className="row g-4 d-flex align-items-stretch pb-1 border-bottom">
              <div className="col-md-4 p-0 m-2 cards">
                <div className="card bg-dark text-light border-light p-3 d-flex w-100">
                  <div className="carddetaildiv uppercase">
                    <div className="carddetails2">
                      <p className="mb-1 detailText">State token supply</p>
                      <h5 className="mb-0"> {formatWithCommas(StateSupply)}</h5>
                      {/* <p className="detailAmount">
                        {formatWithCommas(StateSupply)}
                      </p> */}
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-4 p-0 m-2 cards">
                <div className="card bg-dark text-light border-light p-3 d-flex w-100">
                  <div className="carddetaildiv uppercase">
                    <div className="carddetails2">
                      <p className="mb-1 detailText">State tokens burn</p>
                      <h5 className="">{StateBurned}</h5>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-4 p-0 m-2 cards">
                <div className="card bg-dark text-light border-light p-3 d-flex w-100">
                  <div className="carddetaildiv uppercase">
                    <div className="carddetails2">
                      <p className="mb-1 detailText">
                        State tokens % burn & burn ratio
                      </p>
                      <h5 className="">{StateBurnedRatio}%</h5>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <></>
      )}
    </>
  );
};

export default InfoCards;
