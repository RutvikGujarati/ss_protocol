import "bootstrap/dist/css/bootstrap.min.css";
import "../Styles/DataTable.css";
import { useDAVToken } from "../Context/DavTokenContext";
import { getTokens } from "../data/BurntokenData"; // Import token data function

const BurnDataTable = () => {
  const {
    balances,
    bountyBalances,
    ClickBurn,
    BurnCycleACtive,
    BurnOccuredForToken,
  } = useDAVToken();

  // Log for debugging
  console.log("BurnOccuredForToken:", BurnCycleACtive);

  // Get token data
  const tokens = getTokens(
    balances,
    bountyBalances,
    BurnCycleACtive,
    BurnOccuredForToken,
    ClickBurn
  );

  return (
    <div className="container mt-4 datatablemarginbottom">
      <div className="table-responsive">
        <div className="announcement text-center">
          <div className=""></div>
        </div>
        <table className="table table-dark mt-3">
          <thead>
            <tr className="align-item-center">
              <th>#</th>
              <th></th>
              <th>Name</th>
              <th>Burn Ratio</th>
              <th>Bounty</th>
              <th>Burn Amount</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {tokens
              .filter(({ BurnOccured, burnCycle }) => !BurnOccured && burnCycle)
              .map(
                ({
                  id,
                  name,
                  logo,
                  burnRatio,
                  bounty,
                  burnAmount,
                  clickBurn,
                }) => (
                  <tr key={id}>
                    <td>{id}</td>
                    <td>
                      <div className="nameImage">
                        <img
                          src={logo}
                          width={40}
                          height={40}
                          alt={`${name} Logo`}
                        />
                      </div>
                    </td>
                    <td>
                      <div className="nameDetails">
                        <h5 className="nameBig">{name}</h5>
                        <p className="nameSmall mb-1 uppercase">{name}</p>
                      </div>
                    </td>
                    <td>{burnRatio}</td>
                    <td>
                      {bounty} {name}
                    </td>
                    <td>
                      {burnAmount} {name}
                    </td>
                    <td>
                      <div className="d-flex align-items-center justify-content-center">
                        <button
                          className="btn btn-primary btn-sm swap-btn"
                          onClick={clickBurn}
                        >
                          Burn
                        </button>
                      </div>
                    </td>
                  </tr>	
                )
              )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BurnDataTable;
