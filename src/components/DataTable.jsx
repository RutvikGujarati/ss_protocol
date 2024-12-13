import "bootstrap/dist/css/bootstrap.min.css";


const DataTable = () => {
  

  return (
    <div className="container mt-4">
        <div className="table-responsive">
          <table className="table table-dark">
            <thead>
              <tr className="align-item-center">
                <th>Id</th>
                <th>Name</th>
                <th>Price</th>
                <th>24h</th>
                <th>MCAP</th>
                <th>Volume</th>
                <th>Liquidity</th>
                <th>Burned/Staked</th>
                <th>Age</th>
                <th>Project Links</th>
              </tr>
            </thead>
            <tbody>
              {/* Example Rows */}
              <tr>
                <td>1</td>
                <td>TITANX</td>
                <td>$0.06027</td>
                <td className="text-success">2.10%</td>
                <td>$68.03M</td>
                <td>$791.97K</td>
                <td>$5.11M</td>
                <td>68.35T</td>
                <td>410d</td>
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
                </td>
              </tr>
              <tr>
                <td>2</td>
                <td>DRAGONX</td>
                <td>$0.056812</td>
                <td className="text-success">3.28%</td>
                <td>$34.28M</td>
                <td>$338.18K</td>
                <td>$4.25M</td>
                <td>15.99T</td>
                <td>328d</td>
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
                </td>
              </tr>
              <tr>
                <td>3</td>
                <td>DRAGONX</td>
                <td>$0.056812</td>
                <td className="text-success">3.28%</td>
                <td>$34.28M</td>
                <td>$338.18K</td>
                <td>$4.25M</td>
                <td>15.99T</td>
                <td>328d</td>
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
                </td>
              </tr>
              <tr>
                <td>4</td>
                <td>DRAGONX</td>
                <td>$0.056812</td>
                <td className="text-success">3.28%</td>
                <td>$34.28M</td>
                <td>$338.18K</td>
                <td>$4.25M</td>
                <td>15.99T</td>
                <td>328d</td>
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
                </td>
              </tr>
              <tr>
                <td>5</td>
                <td>DRAGONX</td>
                <td>$0.056812</td>
                <td className="text-success">3.28%</td>
                <td>$34.28M</td>
                <td>$338.18K</td>
                <td>$4.25M</td>
                <td>15.99T</td>
                <td>328d</td>
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
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
  );
};

export default DataTable;
