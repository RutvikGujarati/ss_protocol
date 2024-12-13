import "bootstrap/dist/css/bootstrap.min.css";
import "../Styles/InfoCards.css";
import { useDAVToken } from "../Context/DavTokenContext";
import { useEffect, useState } from "react";
import { ethers } from "ethers";

const InfoCards = () => {
  const {
    mintDAV,
    loading,
    CalculationOfCost,
    TotalCost,
    StateReward,
    GetStateRewards,
  } = useDAVToken();
  const [amount, setAmount] = useState("");
  const [load, setLoad] = useState(false);

  const handleMint = () => {
    setLoad(true);
    try {
      mintDAV(amount);
    } catch (e) {
      console.error("Error", e);
      setLoad(false);
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
  }, [amount]);

  return (
    <div className="container mt-4">
      <div className="row g-4">
        <div className="col-md-4 cards">
          <div className="card bg-dark text-light border-light p-3 d-flex">
            <div className="carddetaildiv d-flex">
              <div className="carddetails">
                <p className="mb-1 detailText">DAV MINT COST</p>
                <h5 className="detailAmount">1 DAV MINT COST = 100 000 PLS</h5>
              </div>
              <div className="carddetails">
                <input
                  type="text"
                  className="form-control"
                  value={amount} // Controlled input, using state value
                  onChange={handleInputChange} // Update state on change
                  style={{ textAlign: "center", height: "20px" }}
                />

                <div className="mx-4">
                  <h5 className="detailAmount">
                    {TotalCost
                      ? formatNumber(ethers.formatUnits(TotalCost, 18))
                      : "0"}{" "}
                    PLS
                  </h5>
                  <h5 className="detailAmount">
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
                <h5 className="detailAmount">50 000 000</h5>
              </div>
              <div className="carddetails">
                <button
                  onClick={handleMint}
                  className="btn btn-dark border border-light"
                >
                  {load ? "Minting..." : "Mint"}
                </button>

                <h5 className="detailAmount">1% SLIPPAGE</h5>
              </div>
            </div>
            <p className="detailfooter m-0">500 000 DAV TOKEN RELEASED</p>
          </div>
        </div>
        <div className="col-md-4 cards">
          <div className="card bg-dark text-light border-light p-3 d-flex">
            <div className="carddetaildiv d-flex">
              <div className="carddetails">
                <p className="mb-1 detailText">Eco System MCAP</p>
                <h5 className="detailAmount">$151.48M</h5>
              </div>
              <div className="carddetails">
                <p className="mb-1 detailText">ECO SYSTEM VOLUME</p>
                <h5 className="detailAmount">$2.88M</h5>
              </div>
            </div>
            <div className="carddetaildiv d-flex">
              <div className="carddetails">
                <p className="mb-1 detailText">TOTAL TITANX BURNED</p>
                <h5 className="detailAmount">113.80T</h5>
              </div>
              <div className="carddetails">
                <p className="mb-1 detailText">TITANX USERS</p>
                <h5 className="detailAmount">
                  19.53K <small className="detailSmall">+0.04%</small>
                </h5>
              </div>
            </div>
            <p className="detailfooter m-0">
              ETH Price: $3939.03 • <span className="greenText">+3.38%</span>{" "}
              26.80 Gwei
            </p>
          </div>
        </div>
        <div className="col-md-4 cards">
          <div className="card bg-dark text-light border-light p-3 d-flex">
            <div className="carddetaildiv d-flex">
              <div className="carddetails">
                <p className="mb-1 detailText">Eco System MCAP</p>
                <h5 className="detailAmount">$151.48M</h5>
              </div>
              <div className="carddetails">
                <p className="mb-1 detailText">ECO SYSTEM VOLUME</p>
                <h5 className="detailAmount">$2.88M</h5>
              </div>
            </div>
            <div className="carddetaildiv d-flex">
              <div className="carddetails">
                <p className="mb-1 detailText">TOTAL TITANX BURNED</p>
                <h5 className="detailAmount">113.80T</h5>
              </div>
              <div className="carddetails">
                <p className="mb-1 detailText">TITANX USERS</p>
                <h5 className="detailAmount">
                  19.53K <small className="detailSmall">+0.04%</small>
                </h5>
              </div>
            </div>
            <p className="detailfooter m-0">
              ETH Price: $3939.03 • <span className="greenText">+3.38%</span>{" "}
              26.80 Gwei
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoCards;
