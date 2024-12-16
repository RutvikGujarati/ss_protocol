import "bootstrap/dist/css/bootstrap.min.css";
import "../Styles/DataTable.css";
import BlueCircle from "../assets/BlueCircle.png"
import PinkCircle from "../assets/PinkCircle.png"
import MetaMaskIcon from "../assets/metamask-icon.png"
const DataTable = () => {

  return (
    <div className="container mt-4">
        <div className="table-responsive">
          <table className="table table-dark">
            <thead>
              <tr className="align-item-center">
                <th>#</th>
                <th className="">Name</th>
                <th>Version</th>
                <th></th>
                <th>Price</th>
                <th>Liquidity</th>
                <th>Current Ratio</th>
                <th>Ratio Target</th>
                <th>Ratio Swap</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {/* Example Rows */}
              <tr>
                <td>1</td>
                <td>
                  {/* <div className="d-flex justify-content-between align-items-center"> */}
                    <div className="tableName d-flex gap-2 align-items-center">
                      <div className="nameImage">
                        <img src={PinkCircle} alt="Logo" />
                      </div>
                      <div className="nameDetails">
                        <h5 className="nameBig">Fluxin</h5>
                        <p className="nameSmall mb-1 uppercase">Fluxin</p>
                      </div>
                    </div>
                    {/* <div className="tableClaim">789 Claim</div> */}
                  {/* </div> */}
                </td>
                <td>V1</td>
                <td><div className="tableClaim">789 Claim</div></td>
                <td>$0.00000089</td>
                <td className="text-success">1.25 M</td>
                <td>1 : 250 M</td>
                <td>1 : 1 T</td>
                <td className="tagTd">
                  <div className="d-flex justify-content-center gap-3 w-100">
                    <div className="tableClaim">50 000 Flixin</div>
                    <div className="tableClaim">25 000 000 State</div>
                  </div>
                </td>
                <td>
                  <div className="d-flex align-items-center gap-2 logoTD">
                    <img src={BlueCircle} alt="Logo" />
                    <img src={MetaMaskIcon} alt="Logo" />
                  </div>
                </td>
                {/* <td>410d</td>
                <td>
                  <a href="#" className="text-light mx-1">
                    🌐
                  </a>
                  <a href="#" className="text-light mx-1">
                    📄
                  </a>
                  <a href="#" className="text-light mx-1">
                    🐦
                  </a>
                </td> */}
              </tr>
              <tr>
              <td>2</td>
                <td>
                  {/* <div className="d-flex justify-content-between align-items-center"> */}
                  <div className="tableName d-flex gap-2 align-items-center">
                      <div className="nameImage">
                        <img src={PinkCircle} alt="Logo" />
                      </div>
                      <div className="nameDetails">
                        <h5 className="nameBig">Xerion</h5>
                        <p className="nameSmall mb-1 uppercase">Xerion</p>
                      </div>
                    </div>
                    {/* <div className="tableClaim">619 Claim</div> */}
                  {/* </div> */}
                </td>
                <td>V2</td>
                <td><div className="tableClaim">789 Claim</div></td>
                <td>$0.0000067</td>
                <td className="text-success">2.67 M</td>
                <td>1 : 250 K</td>
                <td>1 : 1 T</td>
                <td>
                  <div className="d-flex justify-content-center gap-3 w-100">
                    <div className="tableClaim">50 000 Flixin</div>
                    <div className="tableClaim">25 000 000 State</div>
                  </div>
                </td>
                <td>
                  <div className="d-flex align-items-center gap-2 logoTD">
                    <img src={BlueCircle} alt="Logo" />
                    <img src={MetaMaskIcon} alt="Logo" />
                  </div>
                </td>
                {/* <td>328d</td>
                <td>
                  <a href="#" className="text-light mx-1">
                    🌐
                  </a>
                  <a href="#" className="text-light mx-1">
                    📄
                  </a>
                  <a href="#" className="text-light mx-1">
                    🐦
                  </a>
                </td> */}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
  );
};

export default DataTable;
