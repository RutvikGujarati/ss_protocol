import "bootstrap/dist/css/bootstrap.min.css";
import "../Styles/DataTable.css";

const DataTable = () => {

  return (
    <div className="container mt-4">
        <div className="table-responsive">
          <table className="table table-dark">
            <thead>
              <tr className="align-item-center">
                <th>#</th>
                <th className="">Name</th>
                <th>Price</th>
                <th>Liquidity</th>
                <th>Burn Ratio</th>
                <th>Current Ratio</th>
                <th>Ratio Target</th>
                <th>Ratio Swap</th>
              </tr>
            </thead>
            <tbody>
              {/* Example Rows */}
              <tr>
                <td>1</td>
                <td>
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="tableName">
                      <p className="nameSmall mb-1 uppercase">Fluxin</p>
                      <h5 className="nameBig">Fluxin</h5>
                    </div>
                    <div className="tableClaim">789 Claim</div>
                  </div>
                </td>
                <td>$0.00000089</td>
                <td className="text-success">1.25 M</td>
                <td>250 M : 1</td>
                <td>1 : 250 M</td>
                <td>1 : 1 T</td>
                <td>50 000 Flixin - 25 000 000 State</td>
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
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="tableName">
                      <p className="nameSmall mb-1 uppercase">Xerion</p>
                      <h5 className="nameBig">Xerion</h5>
                    </div>
                    <div className="tableClaim">619 Claim</div>
                  </div>
                </td>
                <td>$0.0000067</td>
                <td className="text-success">2.67 M</td>
                <td>500 K : 1</td>
                <td>1 : 250 K</td>
                <td>1 : 1 T</td>
                <td>20 000 Xerion - 12 500 000 State</td>
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
