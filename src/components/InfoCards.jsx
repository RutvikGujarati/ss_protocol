import "bootstrap/dist/css/bootstrap.min.css";
import "./InfoCards.css";

const InfoCards = () => {
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
                  defaultValue="5"
                  style={{ textAlign: "center", height: "20px" }}
                />
                <div className="mx-4">
                  <h5 className="detailAmount">500 000 PLS</h5>
                  <h5 className="detailAmount">250 000 000 PLS</h5>
                </div>
              </div>
            </div>
            <div className="carddetaildiv d-flex">
              <div className="carddetails">
                <p className="mb-1 detailText">STATE TOKEN REWARD</p>
                <h5 className="detailAmount">50 000 000</h5>
              </div>
              <div className="carddetails">
                <button className="btn btn-dark border border-light">
                  Click
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
