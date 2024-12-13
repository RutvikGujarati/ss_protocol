import "bootstrap/dist/css/bootstrap.min.css";
import "../Styles/InfoCards.css";
import { useDAVToken } from "../Context/DavTokenContext";
import { useEffect, useState } from "react";
import { ethers } from "ethers";

const InfoCards = () => {
  const {
    mintDAV,
    CalculationOfCost,
    TotalCost,
    StateReward,
    GetStateRewards,
    GetCurrentStateReward,
    CurrentSReward,
    Supply,
    davHolds,
    davPercentage,
    StateHolds,
  } = useDAVToken();
  const [amount, setAmount] = useState("");
  const [load, setLoad] = useState(false);
  const handleMint = async () => {
    setLoad(true); // Start loading
    try {
      await mintDAV(amount); // Wait for minting to complete
    } catch (e) {
      console.error("Error during minting:", e);
    } finally {
      setLoad(false); // Stop loading, regardless of success or failure
    }
  };

  const handleInputChange = (e) => {
    setAmount(e.target.value);
    GetStateRewards(e.target.value);
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
    GetStateRewards(amount);
    GetCurrentStateReward();
  }, [amount]);

  return (
    <div className="container mt-4">
      <div className="row g-4 d-flex align-items-stretch">
        <div className="col-md-4 cards">
          <div className="card bg-dark text-light border-light p-3 d-flex w-100 mh200">
            <div className="carddetaildiv d-flex uppercase">
              <div className="carddetails">
                <p className="mb-1 detailText">DAV MINT COST</p>
                <h5 className="detailAmount">1 DAV MINT COST = 100 000 PLS</h5>
              </div>
              <div className="carddetails">
                <input
                  type="text"
                  placeholder="Enter Value"
                  className="form-control text-center fw-bold"
                  value={amount} // Controlled input, using state value
                  onChange={handleInputChange} // Update state on change
                />

                <div className="mx-4 text-center">
                  <h5 className="detailAmount mt-3">
                    {TotalCost
                      ? formatNumber(ethers.formatUnits(TotalCost, 18))
                      : "0"}{" "}
                    PLS
                  </h5>
                  <h5 className="detailAmount mt-3">
                    {StateReward
                      ? formatNumber(StateReward) // format STATE
                      : "0"}{" "}
                    STATE
                  </h5>
                </div>
              </div>
            </div>
            <div className="carddetaildiv d-flex">
              <div className="carddetails">
                <p className="mb-1 detailText">STATE TOKEN REWARD</p>
                <h5 className="detailAmount">{formatNumber(CurrentSReward)}</h5>
              </div>
              <div className="carddetails text-center">
                <button
                  onClick={handleMint}
                  className="btn btn-primary btn-sm w-100"
                  disabled={load}
                >
                  {load ? "Minting..." : "Mint"}
                </button>

                <h5 className="detailAmount pt-3">1% SLIPPAGE</h5>
              </div>
            </div>
            <p className="detailfooter m-0">{Supply} DAV TOKEN RELEASED</p>
          </div>
        </div>
        <div className="col-md-4 cards">
          <div className="card bg-dark text-light border-light p-3 d-flex w-100 mh200">
            <div className="carddetaildiv uppercase">
              <div className="carddetails2">
                <p className="mb-1 detailText">Dav holdings</p>
                <h5 className="">{davHolds}</h5>
              </div>
              <div className="carddetails2">
                <p className="mb-1 detailText">Dav Rank</p>
                <h5 className="">{davPercentage}%</h5>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4 cards">
          <div className="card bg-dark text-light border-light p-3 d-flex w-100 mh200">
            <div className="carddetaildiv uppercase">
              <div className="carddetails2">
                <p className="mb-1 detailText">State token holdings</p>
                <h5 className="">{StateHolds} / $56.90</h5>
              </div>
              <div className="carddetails2">
                <p className="mb-1 detailText">State token price</p>
                <h5 className="">$0.000000356</h5>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoCards;
