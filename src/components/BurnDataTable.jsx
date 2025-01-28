import "bootstrap/dist/css/bootstrap.min.css";
import "../Styles/DataTable.css";
import XerionLogo from "../assets/XerionLogo.png";
import FluxinLogo from "../assets/FluxinLogo.png";
import { useDAVToken } from "../Context/DavTokenContext";

const BurnDataTable = () => {
  const {
    balances,
    bountyBalances,
    ClickBurn,
    BurnCycleACtive,
    BurnOccuredForToken,
  } = useDAVToken();

  // Log BurnOccuredForToken for debugging
  console.log("BurnOccuredForToken:", BurnCycleACtive);

  // Example token data
  const tokens = [
    {
      id: 1,
      name: "Fluxin",
      logo: FluxinLogo,
      burnCycle: BurnCycleACtive.Fluxin === "true",
      BurnOccured: BurnOccuredForToken.Fluxin === "true", // Convert string 'true' to boolean true
      burnRatio: 0.00001,
      bounty: bountyBalances.fluxinBounty,
      burnAmount: (balances.ratioFluxinBalance * 0.00001).toFixed(7),
      clickBurn: ClickBurn,
    },
    {
      id: 2,
      name: "Xerion",
      burnCycle: BurnCycleACtive.Xerion === "true",
      BurnOccured: BurnOccuredForToken.Xerion === "true", // Convert string 'true' to boolean true
      logo: XerionLogo,
      burnRatio: 0.00001, // Example data
      bounty: bountyBalances.xerionBounty,
      burnAmount: (balances.ratioXerionBalance * 0.00001).toFixed(7),
    },
  ];

  return (
    <div className="container mt-4 datatablemarginbottom">
      <div className="table-responsive">
        <table className="table table-dark">
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
              .filter(
                ({ BurnOccured, burnCycle }) =>
                  BurnOccured === false && burnCycle === true
              )
              .map(({ id, name, logo, burnRatio, bounty, burnAmount }) => (
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
                        onClick={() => {
                          if (id === 1) {
                            ClickBurn("fluxinRatio");
                          } else if (id === 2) {
                            ClickBurn("XerionRatio");
                          }
                        }}
                      >
                        Burn
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BurnDataTable;
