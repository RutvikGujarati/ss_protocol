import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import youtube from "../assets/y.png";
import { FaXTwitter } from "react-icons/fa6";

const Footer = () => {
  return (
    <footer className="bg-dark py-1 mt-auto">
      {" "}
      {/* Changed py-3 to py-1 for smaller height */}
      <div className="container text-center">
        <div className="d-flex justify-content-center gap-3 gap-md-4">
          <a
            href="https://www.youtube.com/@Statedex"
            target="_blank"
            rel="noopener noreferrer"
            className="text-danger fs-4"
          >
            <img
              src={youtube}
              alt="YouTube"
              style={{ height: "24px", background: "transparent" }}
            />
          </a>
          <a
            href="https://twitter.com/thestate_x"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white fs-4"
          >
            <FaXTwitter style={{ height: "20px", width: "20px" }} />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
