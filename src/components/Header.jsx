import "../Styles/Header.css";
import "bootstrap/dist/css/bootstrap.min.css";
import WalletConnector from "../WalletComps/WalletConnect";
import "bootstrap-icons/font/bootstrap-icons.css";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <>
      {/* Top Navbar for Desktop */}
      <nav className="navbar navbar-expand-lg bg-dark py-2 d-none d-lg-flex">
        <div className="container d-flex justify-content-between align-items-center w-100">
          {/* Navbar Brand */}
          <Link className="navbar-brand text-light text-center pb-0" to="/">
            <h5 className="uppercase fs-2 fw-bolder">THE STATE</h5>
            <p className="small-text fs-5 fw-normal mb-0">
              by System State Protocol
            </p>
          </Link>

          {/* Right-Side Container */}
          <div className="d-flex align-items-center">
            {/* Navigation Links */}
            <ul className="navbar-nav d-flex flex-row align-items-center me-4">
              <li className="nav-item mx-2">
                <Link className="nav-link text-light" to="/auction">
                  Auction
                </Link>
              </li>
              <li className="nav-item mx-2">
                <Link className="nav-link text-light" to="/burn">
                  Burn
                </Link>
              </li>
              <li className="nav-item mx-2">
                <Link className="nav-link text-light" to="/info">
                  Info
                </Link>
              </li>
              <li className="nav-item mx-2">
                <Link className="nav-link text-light" to="/docs">
                  Docs
                </Link>
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
        <Link className="navbar-brand text-light small-text" to="/">
          SYSTEM STATE DEX
        </Link>
        {/* Wallet Connector */}
        <div className="me-3 small-text">
          <WalletConnector />
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <div className="mobile-nav d-flex d-lg-none justify-content-around fixed-bottom bg-dark py-2">
        <Link to="/auction" className="text-light text-center">
          <i className="bi bi-hammer"></i>
          <div>Auction</div>
        </Link>
        <Link to="/burn" className="text-light text-center">
          <i className="bi bi-fire"></i>
          <div>Burn</div>
        </Link>
        <Link to="/info" className="text-light text-center">
          <i className="bi bi-info-circle"></i>
          <div>Info</div>
        </Link>
        <Link to="/docs" className="text-light text-center">
          <i className="bi bi-file-earmark-text"></i>
          <div>Docs</div>
        </Link>
      </div>
    </>
  );
};

export default Header;
