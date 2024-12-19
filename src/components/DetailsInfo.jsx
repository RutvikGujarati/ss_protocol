import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../Styles/DetailsInfo.css";
import PinkCircle from "../assets/PinkCircle.png";

const VerticalTableComponent = () => {
  return (
    <div className="container mt-4">
      <table className="table table-dark infoTable">
        <thead>
            <th className="fw-bold d-flex align-items-center uppercase">Information</th>
        </thead>
        <tbody>
          <tr>
            <td className="d-flex align-items-center">Token Name</td>
            <td></td>
            <td></td>
          </tr>
          <tr>
            <td className="d-flex align-items-center">#</td>
            <td></td>
            <td></td>
          </tr>
          <tr>
            <td className="d-flex align-items-center">Supply</td>
            <td></td>
            <td></td>
          </tr>
          <tr>
            <td className="d-flex align-items-center">Ratio Target</td>
            <td></td>
            <td></td>
          </tr>
          <tr>
            <td className="d-flex align-items-center">Auction Allocation</td>
            <td></td>
            <td></td>
          </tr>
          <tr>
            <td className="d-flex align-items-center">DAV Treasury Supply</td>
            <td></td>
            <td></td>
          </tr>
          <tr>
            <td className="d-flex align-items-center">Ratio Target - Amend</td>
            <td>
            <div className="tableClaim w-100">1 : 1 Trillion</div>
            </td>
            <td className="d-flex justify-content-end">
              <div className="nameImage info-icon">
                                        <img
                                          src={PinkCircle}
                                          width={36}
                                          height={36}
                                          alt="Logo"
                                        />
                                      </div>
            </td>
          </tr>
          <tr>
          <td className="d-flex align-items-center">Claim LP Token</td>
            <td>
            <div className="tableClaim w-100">1 : 1 Trillion</div>
            </td>
            <td className="d-flex justify-content-end">
              <div className="nameImage info-icon">
                          <img
                            src={PinkCircle}
                            width={36}
                            height={36}
                            alt="Logo"
                          />
                        </div>
            </td>
          </tr>
          <tr>
          <td className="d-flex align-items-center">Claim DAV Token</td>
            <td>
            <div className="tableClaim w-100">1 : 1 Trillion</div>
            </td>
            <td className="d-flex justify-content-end">
              <div className="nameImage info-icon">
                          <img
                            src={PinkCircle}
                            width={36}
                            height={36}
                            alt="Logo"
                          />
                        </div>
            </td>
          </tr>
          <tr>
            <td className="d-flex align-items-center">Renounce Smart Contract</td>
            <td></td>
            <td className="d-flex justify-content-end">
              <div className="nameImage info-icon">
                          <img
                            src={PinkCircle}
                            width={36}
                            height={36}
                            alt="Logo"
                          />
                        </div>
            </td>
          </tr>

          
        </tbody>
      </table>
    </div>
  );
};

export default VerticalTableComponent;
