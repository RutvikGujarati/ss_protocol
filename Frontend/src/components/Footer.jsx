import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../Styles/Header.css";
import { FaXTwitter } from "react-icons/fa6";
import { useEffect, useState } from "react";

const Footer = () => {
  const messages = [
    "V.3 = 30% more yield on ratio swaps",
    "Refresh when minting more DAV tokens.",
    "Transferring DAV tokens is not allowed after minting",
    "Referrers receive their commission directly in their wallet",
  ];
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  useEffect(() => {
    // Set up interval to change message every 2 minutes (120,000 ms)
    const interval = setInterval(() => {
      setCurrentMessageIndex((prevIndex) => (prevIndex + 1) % messages.length);
    }, 60000); // 1 minutes

    // Clean up interval on component unmount
    return () => clearInterval(interval);
  }, [messages.length]);
  return (
    <footer
      className="bg-dark py-1 d-none d-md-block"
      style={{
        position: "fixed",
        bottom: 0,
        width: "100%",
        zIndex: 1000,
      }}
    >
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
            style={{ fontSize: "14px", marginLeft: "100px" }}
          >
            {messages[currentMessageIndex]}
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
