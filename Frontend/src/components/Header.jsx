import "../Styles/Header.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import WalletConnector from "../WalletComps/WalletConnect";
import { NavLink } from "react-router-dom";
import pulsex from "../assets/ninemm.png";

// import { Tooltip } from "bootstrap";
// import { useDAVToken } from "../Context/DavTokenContext";

const Header = () => {

  return (
    <>
      {/* Top Navbar for Desktop */}
      <nav className="navbar navbar-expand-lg bg-dark py-2 d-none d-lg-flex">
        <div className="container d-flex justify-content-between align-items-center w-100">
          {/* Navbar Brand */}
          <NavLink className="navbar-brand text-light pb-0 mb-0" to="/">
            <label
              className="uppercase fs-2 fw-bolder"
              style={{ fontFamily: "Satoshi, sans-serif" }}
            >
              STATE DEX
            </label>
            <p className="detailAmount mb-0" style={{ fontSize: "0.8rem" }}>
              Not just a swap — it’s VOLUME
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
              <li className="nav-item mx-2 position-relative custom-dropdown">
                <NavLink
                  className={({ isActive }) =>
                    isActive
                      ? "nav-link active-link text-light"
                      : "nav-link text-light"
                  }
                  to="/AddToken"
                >
                  Add Token
                </NavLink>
              </li>

              <li className="nav-item mx-2">
                <NavLink
                  className={({ isActive }) =>
                    isActive
                      ? "nav-link active-link text-light"
                      : "nav-link text-light"
                  }
                  to="/MarketMaker"
                >
                  Market Makers
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
                  DAV Vault
                </NavLink>
              </li>

              <li className="nav-item mx-2 "></li>
            </ul>
            {/* Wallet Connector Button */}
            <div className="">
              <WalletConnector />
            </div>
           
          </div>
        </div>
      </nav>

      {/* Top Navbar for Mobile */}
      <nav className="navbar bg-dark d-lg-none justify-content-between align-items-center py-2">
        {/* Navbar Brand */}
        <NavLink className="navbar-brand text-light small-text" to="/">
          <h5 className="uppercase fs-2 fw-bolder">STATE DEX</h5>
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
          to="/AddToken"
          className={({ isActive }) =>
            isActive
              ? "text-light active-link text-center"
              : "text-light text-center"
          }
        >
          <i className="bi bi-plus-circle"></i> <div>Add Token</div>
        </NavLink>
        <NavLink
          to="/MarketMaker"
          className={({ isActive }) =>
            isActive
              ? "text-light active-link text-center"
              : "text-light text-center"
          }
        >
          <i className="bi bi-graph-up"></i>
          <div> Market Makers</div>
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
          <div>DAV Vault</div>
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
        <div className="mt-2 ">
          <NavLink
            className={({ isActive }) =>
              isActive
                ? "nav-link active-link text-light"
                : "nav-link text-light"
            }
            to="https://pulsex.mypinata.cloud/ipfs/bafybeibzu7nje2o2tufb3ifitjrto3n3xcwon7fghq2igtcupulfubnrim/"
            target="_blank"
          >
            <img
              src={pulsex}
              alt="PulseX"
              width="30"
              height="30"
              style={{ borderRadius: "50%", background: "transparent" }}
            />
          </NavLink>
        </div>
      </div>
    </>
  );
};

export default Header;
