import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { FaTelegramPlane } from "react-icons/fa";
import { FaXTwitter, FaYoutube } from "react-icons/fa6";

const Footer = () => {
  return (
    <footer className="bg-dark py-1 mt-auto">
      {" "}
      {/* Changed py-3 to py-1 for smaller height */}
      <div className="container text-center">
        <div className="d-flex justify-content-center gap-3 gap-md-4">
          <a
            href="https://t.me/pSystemstate"
            target="_blank"
            rel="noopener noreferrer"
            className="text-decoration-none text-primary fs-4"
          >
            <FaTelegramPlane />
          </a>
          <a
            href="https://www.youtube.com/@Statedex"
            target="_blank"
            rel="noopener noreferrer"
            className="text-danger fs-4"
          >
            <FaYoutube />
          </a>
          <a
            href="https://twitter.com/thestate_x"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white fs-4"
          >
            <FaXTwitter />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
