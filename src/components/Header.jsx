import "../Styles/Header.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import WalletConnector from "../WalletComps/WalletConnect";
import { NavLink } from "react-router-dom";
// import { Tooltip } from "bootstrap";
// import { useDAVToken } from "../Context/DavTokenContext";

const Header = () => {
  //   const { AuctionRunning } = useDAVToken();
  //   useEffect(() => {
  //     const tooltipTriggerList = document.querySelectorAll(
  //       '[data-bs-toggle="tooltip"]'
  //     );
  //     tooltipTriggerList.forEach((tooltipTriggerEl) => {
  //       new bootstrap.Tooltip(tooltipTriggerEl, {
  //         trigger: "hover",
  //       });
  //     });
  //   }, []);

  return (
    <>
      {/* Top Navbar for Desktop */}
      <nav className="navbar navbar-expand-lg bg-dark py-2 d-none d-lg-flex">
        <div className="container d-flex justify-content-between align-items-center w-100">
          {/* Navbar Brand */}
          <NavLink className="navbar-brand text-light pb-0 mb-0" to="/">
            <h5 className="uppercase fs-2 fw-bolder">THE STATE</h5>
            <p className="detailAmount mb-0" style={{ fontSize: "0.8rem" }}>
              Tokenized Micro-Economy
              <br /> by System State Protocol
            </p>
          </NavLink>

          {/* Right-Side Container */}
          <div className="d-flex align-items-center">
            {/* Navigation Links */}
            <ul className="navbar-nav d-flex flex-row align-items-center me-4">
              <li
                className="nav-item mx-2"
                // data-bs-toggle="tooltip"
                // data-bs-placement="left"
                // title="Auction is running"
              >
                <NavLink
                  className={({ isActive }) =>
                    isActive
                      ? "nav-link active-link text-light"
                      : "nav-link text-light"
                  }
                  to="/auction"
                >
                  Auction
                  {/* <span className="active-dot"></span> */}
                </NavLink>
              </li>

              <li className="nav-item mx-2">
                <NavLink
                  className={({ isActive }) =>
                    isActive
                      ? "nav-link active-link text-light"
                      : "nav-link text-light"
                  }
                  to="/burn"
                >
                  State LP
                </NavLink>
              </li>
              <li className="nav-item mx-2">
                <NavLink
                  className={({ isActive }) =>
                    isActive
                      ? "nav-link active-link text-light"
                      : "nav-link text-light"
                  }
                  to="/info"
                >
                  Info
                </NavLink>
              </li>
              <li className="nav-item mx-2">
                <NavLink
                  className={({ isActive }) =>
                    isActive
                      ? "nav-link active-link text-light"
                      : "nav-link text-light"
                  }
                  to="https://system-state-documentation.gitbook.io/system-state"
                  target="_blank"
                >
                  Docs
                </NavLink>
              </li>
            </ul>
            {/* Wallet Connector Button */}
            <div>
              <WalletConnector />
            </div>
          </div>
        </div>
      </nav>

      {/* Top Navbar for Mobile */}
      <nav className="navbar bg-dark d-lg-none justify-content-between align-items-center py-2">
        {/* Navbar Brand */}
        <NavLink className="navbar-brand text-light small-text" to="/">
          <h5 className="uppercase fs-2 fw-bolder">THE STATE</h5>
        </NavLink>
        {/* Wallet Connector */}
        <div className="me-3 small-text">
          <WalletConnector />
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <div className="mobile-nav d-flex d-lg-none justify-content-around fixed-bottom bg-dark py-2">
        <NavLink
          to="/auction"
          className={({ isActive }) =>
            isActive
              ? "text-light active-link text-center"
              : "text-light text-center"
          }
        >
          <i className="bi bi-hammer"></i>
          <div>Auction</div>
        </NavLink>
        <NavLink
          to="/burn"
          className={({ isActive }) =>
            isActive
              ? "text-light active-link text-center"
              : "text-light text-center"
          }
        >
          <i className="bi bi-graph-up"></i>
          <div> State LP</div>
        </NavLink>

        <NavLink
          to="/info"
          className={({ isActive }) =>
            isActive
              ? "text-light active-link text-center"
              : "text-light text-center"
          }
        >
          <i className="bi bi-info-circle"></i>
          <div>Info</div>
        </NavLink>
        <NavLink
          target="_blank"
          to="https://system-state-documentation.gitbook.io/system-state"
          className={({ isActive }) =>
            isActive
              ? "text-light active-link text-center"
              : "text-light text-center"
          }
        >
          <i className="bi bi-file-earmark-text"></i>
          <div>Docs</div>
        </NavLink>
      </div>
    </>
  );
};

export default Header;
