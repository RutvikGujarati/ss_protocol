import "bootstrap/dist/css/bootstrap.min.css";
import "../Styles/InfoCards.css";
import { useDAVToken } from "../Context/DavTokenContext";
import { useContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import { useLocation } from "react-router-dom";
import MetaMaskIcon from "../assets/metamask-icon.png";
import { formatWithCommas } from "./DetailsInfo";
import { PriceContext } from "../api/StatePrice";

const InfoCards = () => {
  const { stateUsdPrice } = useContext(PriceContext);
  const [BurnRatio, setBurnRatio] = useState("0.0");
  const {
    mintDAV,
    // handleAddTokenRatio,
    handleAddTokenState,
    handleAddTokenDAV,
    CalculationOfCost,
    TotalCost,
    StateSupply,
    TotalStateHoldsInUS,
    davHolds,
    davPercentage,
    StateBurnBalance,
    StateHolds,
  } = useDAVToken();
  const [amount, setAmount] = useState("");
  const [load, setLoad] = useState(false);

  const handleMint = async () => {
    setLoad(true);
    try {
      await mintDAV(amount);
      setAmount("");
    } catch (error) {
      console.error("Error minting:", error);
      alert("Minting failed! Please try again.");
    } finally {
      setLoad(false);
    }
  };
  const calculateBurnRatio = async () => {
    try {
      const maxSupply = 999000000000000;
      const calculate = ((StateBurnBalance).toString() / maxSupply) || 0;
		console.log("burn ratio calculation",calculate)
      setBurnRatio(calculate.toFixed(17));
    } catch (error) {
      console.error("Error calculating burn ratio:", error);
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
    calculateBurnRatio();
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
            <div className="row g-4 d-flex align-items-stretch pb-1 border-bottom-">
              <div className="col-md-4 p-0 m-2 cards">
                <div className="card bg-dark text-light border-light p-0 d-flex justify-content-center align-items-center text-center w-100">
                  <div className="p-2">
                    <p className="mb-2 detailText">MINT DAV TOKENS</p>
                    <input
                      type="text"
                      placeholder="Enter Value"
                      className="form-control text-center fw-bold mb-3"
                      value={amount}
                      onChange={handleInputChange}
                    />
                    <h5 className="detailAmount">1 DAV TOKEN = 200,000 PLS</h5>
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
                      <h5 className="">{davPercentage}</h5>
                    </div>
                    <div className="carddetails2 d-flex align-items-center">
                      <img
                        src={MetaMaskIcon}
                        width={20}
                        height={20}
                        alt="Logo"
                        style={{ cursor: "pointer", marginRight: "5px" }}
                        onClick={handleAddTokenDAV}
                      />
                      <h6
                        className="detailText mx-3 mt-2 "
                        style={{
                          fontSize: "14px",
                          textTransform: "capitalize",
                        }}
                      >
                        Transferring DAV tokens are not allowed
                      </h6>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-4 p-0 m-2 cards">
                <div className="card bg-dark text-light border-light p-3 d-flex w-100">
                  <div className="carddetaildiv uppercase">
                    <div className="carddetails2">
                      <p className="mb-1 detailText">State token holdings</p>
                      <h5 className="">
                        {StateHolds} / $ {TotalStateHoldsInUS}
                      </h5>
                    </div>
                    <div className="carddetails2">
                      <p className="mb-1 detailText">State token price</p>
                      <h5 className="">$ {stateUsdPrice}</h5>
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
            <div className="announcement text-center">
              <div className="">
                Ratio Swapping auctions will start on <span>01/02/2025.</span>
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
                      <h5 className="">{formatWithCommas(StateBurnBalance)}</h5>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-4 p-0 m-2 cards">
                <div className="card bg-dark text-light border-light p-3 d-flex w-100">
                  <div className="carddetaildiv uppercase">
                    <div className="carddetails2">
                      <p className="mb-1 detailText">State tokens % burn</p>
                      <h5 className="">{BurnRatio} %</h5>
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
