import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css"; // Add custom styles here

function App() {
  return (
    <div className="bg-dark text-light">
      {/* Header */}
      <header
        className="p-4"
        style={{ background: "linear-gradient(90deg, #006400, transparent)" }}
      >
        <div className="d-flex justify-content-between align-items-center">
          <h1 className="text-light">TitanX Hub</h1>
          <button className="btn btn-outline-light">Contact</button>
        </div>
      </header>

      {/* Overview Section */}
      <div className="container mt-4">
        <div className="row g-4">
          <div className="col-md-3">
            <div className="card bg-dark text-light border-light p-3">
              <h5 className="mb-1">Eco System MCAP</h5>
              <h3>$151.48M</h3>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card bg-dark text-light border-light p-3">
              <h5 className="mb-1">Total TitanX Burned</h5>
              <h3>113.01T</h3>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card bg-dark text-light border-light p-3">
              <h5 className="mb-1">TitanX Users</h5>
              <h3>
                19.52K <span className="text-success">+0.15%</span>
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Projects Table */}
      <div className="container mt-4">
        <div className="table-responsive">
          <table className="table table-dark table-striped table-hover">
            <thead>
              <tr>
                <th>#</th>
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
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default App;
