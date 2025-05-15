import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../Styles/Header.css";
import { FaXTwitter } from "react-icons/fa6";

const Footer = () => {
  return (
    <footer className="bg-dark py-1 mt-auto d-none d-md-block">
      <div className="container">
        <div className="d-flex justify-content-between align-items-center">
          {/* Left side - social icons */}
          <div className="d-flex align-items-center gap-3 gap-md-4">
            <a
              href="https://twitter.com/thestate_x"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white fs-4"
            >
              <FaXTwitter style={{ height: "20px", width: "20px" }} />
            </a>
          </div>
          <div
            className="flex-grow-1 text-center text-white"
            style={{ fontSize: "14px", marginLeft: "200px" }}
          >
            The blockchain job where your swaps shape the market.
          </div>
          {/* Right side - links */}
          <div className="d-flex align-items-center gap-3 gap-md-4">
            <a
              href="https://system-state-documentation.gitbook.io/system-state"
              className="text-white"
              style={{ fontSize: "14px" }}
              target="_blank"
              rel="noopener noreferrer"
            >
              Docs
            </a>
            <a
              href="https://system-state-documentation.gitbook.io/system-state/career"
              className="text-white"
              style={{ fontSize: "14px" }}
              target="_blank"
              rel="noopener noreferrer"
            >
              Career
            </a>
            <a
              href="https://system-state-documentation.gitbook.io/system-state/disclaimer"
              className="text-white"
              style={{ fontSize: "14px" }}
              target="_blank"
              rel="noopener noreferrer"
            >
              Disclaimer
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
