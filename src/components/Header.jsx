import React from 'react';
import './Header.css';
import "bootstrap/dist/css/bootstrap.min.css";
import Auction from "../Auction"

const Header = () => {
  return (
    <nav className="navbar navbar-expand-lg mb-4 bg-dark">
      <div className="container d-flex">
        <div className="d-flex align-items-center justify-content-between w-100">
          {/* Navbar Brand */}
          <a className="navbar-brand text-light me-4" href="/">SYSTEM STATE DEX</a>

          {/* Navbar Links */}
          <ul className="navbar-nav d-flex flex-row align-items-center">
            <li className="nav-item">
              <a className="nav-link text-light mx-2" href="../Auction.jsx">Auction</a>
            </li>
            <li className="nav-item">
              <a className="nav-link text-light mx-2" href="../Burn.jsx">Burn</a>
            </li>
            <li className="nav-item">
              <a className="nav-link text-light mx-2" href="../Info.jsx">Info</a>
            </li>
            <li className="nav-item">
              <a className="nav-link text-light mx-2" href="../Docs.jsx">Docs</a>
            </li>
            {/* Connect Button */}
            <li className="nav-item">
              <button className="btn btn-primary ms-4">Connect</button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Header;
