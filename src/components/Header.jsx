import "../Styles/Header.css";
import "bootstrap/dist/css/bootstrap.min.css";
import WalletConnector from "../WalletComps/WalletConnect";
import "bootstrap-icons/font/bootstrap-icons.css";

const Header = () => {
  return (
    <>
      {/* Top Navbar for Desktop */}
      <nav className="navbar navbar-expand-lg bg-dark py-2 d-none d-lg-flex">
        <div className="container d-flex justify-content-between align-items-center w-100">
          {/* Navbar Brand */}
          <a className="navbar-brand text-light" href="/">
            SYSTEM STATE DEX
          </a>

          {/* Right-Side Container */}
          <div className="d-flex align-items-center">
            {/* Navigation Links */}
            <ul className="navbar-nav d-flex flex-row align-items-center me-4">
              <li className="nav-item mx-2">
                <a className="nav-link text-light" href="../Auction.jsx">
                  Auction
                </a>
              </li>
              <li className="nav-item mx-2">
                <a className="nav-link text-light" href="../Burn.jsx">
                  Burn
                </a>
              </li>
              <li className="nav-item mx-2">
                <a className="nav-link text-light" href="../Info.jsx">
                  Info
                </a>
              </li>
              <li className="nav-item mx-2">
                <a className="nav-link text-light" href="../Docs.jsx">
                  Docs
                </a>
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
      <nav className="navbar bg-dark  d-lg-none justify-content-between align-items-center py-2">
        {/* Navbar Brand */}
        <a className="navbar-brand text-light small-text" href="/">
          SYSTEM STATE DEX
        </a>
        {/* Wallet Connector */}
        <div className="me-3 small-text">
          <WalletConnector />
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <div className="mobile-nav d-flex d-lg-none justify-content-around fixed-bottom bg-dark py-2">
        <a href="../Auction.jsx" className="text-light text-center">
          <i className="bi bi-hammer"></i>
          <div>Auction</div>
        </a>
        <a href="../Burn.jsx" className="text-light text-center">
          <i className="bi bi-fire"></i>
          <div>Burn</div>
        </a>
        <a href="../Info.jsx" className="text-light text-center">
          <i className="bi bi-info-circle"></i>
          <div>Info</div>
        </a>
        <a href="../Docs.jsx" className="text-light text-center">
          <i className="bi bi-file-earmark-text"></i>
          <div>Docs</div>
        </a>
      </div>
    </>
  );
};

export default Header;
