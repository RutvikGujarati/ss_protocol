import "../Styles/Header.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import WalletConnector from "../WalletComps/WalletConnect";
import { NavLink } from "react-router-dom";
import pulsex from "../assets/pulsex.png";
import shadow from "../assets/shadow.jpeg";
import { FaTelegramPlane } from "react-icons/fa";
import { FaXTwitter, FaYoutube } from "react-icons/fa6";
import { useChainId } from "wagmi";
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
  const chainId = useChainId();

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
              <div className="px-2 mx-1">
                <a
                  href="https://t.me/pSystemstate"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: "1.5rem", color: "#0088cc" }}
                >
                  <FaTelegramPlane className="text-[#0088cc] text-3xl" />
                </a>
              </div>
              <div className="px-2 ">
                <a
                  href="https://www.youtube.com/@Statedex"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: "1.5rem", color: "red" }}
                >
                  <FaYoutube className="text-[#0088cc] text-3xl" />
                </a>
              </div>
              <div className="px-3">
                <a
                  href="https://twitter.com/thestate_x"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: "1.2rem", color: "white" }}
                >
                  <FaXTwitter className="text-white text-3xl" />
                </a>
              </div>
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
                  to="/StateLp"
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
              <li className="nav-item mx-2 ">
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
            <div className="">
              <WalletConnector />
            </div>
            <div className="ms-4">
              <NavLink
                className={({ isActive }) =>
                  isActive
                    ? "nav-link active-link text-light"
                    : "nav-link text-light"
                }
                to={
                  chainId === 146
                    ? "https://www.shadow.so/trade"
                    : "https://pulsex.mypinata.cloud/ipfs/bafybeibzu7nje2o2tufb3ifitjrto3n3xcwon7fghq2igtcupulfubnrim/"
                }
                target="_blank"
              >
                <img
                  src={chainId === 146 ? shadow : pulsex}
                  alt={chainId === 146 ? "Sonic" : "PulseX"}
                  width="30"
                  height="30"
                  style={{ borderRadius: "50%", background: "transparent" }}
                />
              </NavLink>
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
          to="/StateLp"
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
