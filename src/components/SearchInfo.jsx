import { useEffect, useRef, useState } from "react";
import "../Styles/SearchInfo.css";
import FluxinLogo from "../assets/FluxinLogo.png";

import DAVLogo from "../assets/d_logo.png";
import sDAV from "../assets/sDAV.png";

import stateLogo from "../assets/state_logo.png";
import sState from "../assets/sonicstate.png";
import PropTypes from "prop-types";
// import MetaMaskIcon from "../assets/metamask-icon.png";
import { useSwapContract } from "../Functions/SwapContractFunctions";
import { useChainId } from "wagmi";

const SearchInfo = ({ setSearchQuery }) => {
  const {
    handleAddTokenDAV,
    handleAddTokensDAV,
    handleAddTokenState,
    handleAddTokensState,
    handleAddFluxin,
  } = useSwapContract();
  const chainId = useChainId();
  const [filteredData, setFilteredData] = useState([]);

  const originalData = [
    { id: "∈", name: "DAV", logo: DAVLogo, AddToken: handleAddTokenDAV },
    { id: "±", name: "STATE", logo: stateLogo, AddToken: handleAddTokenState },
    { id: "1", name: "Orxa", logo: FluxinLogo, AddToken: handleAddFluxin },
  ];

  const SonicData = [
    { id: "∈", name: "DAV", logo: sDAV, AddToken: handleAddTokensDAV },
    { id: "±", name: "STATE", logo: sState, AddToken: handleAddTokensState },
  ];

  useEffect(() => {
    const data = chainId === 146 ? SonicData : originalData;
    setFilteredData(data);
  }, [chainId]);
  const data = chainId === 146 ? SonicData : originalData;

  const searchInputRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey && e.key.toLowerCase() === "v") || e.key === "/") {
        e.preventDefault();
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    const nameCells = document.querySelectorAll(".name-cell");
    nameCells.forEach((cell) => {
      cell.style.cursor = "pointer";
    });
  }, [filteredData]);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    if (query === "") {
      // Deduplicate by name when resetting to data
      const uniqueData = Array.from(
        new Map(data.map((item) => [item.name, item])).values()
      );
      setFilteredData(uniqueData);
      console.log("After clear search, filteredData:", uniqueData); // Debug log
    } else {
      const filtered = data.filter((item) =>
        item.name.toLowerCase().includes(query)
      );
      setFilteredData(filtered);
      console.log("After search, filteredData:", filtered); // Debug log
    }
  };

  const AuthAddress = import.meta.env.VITE_AUTH_ADDRESS.toLowerCase();

  return (
    <div
      className="card w-100"
      style={{ maxHeight: AuthAddress ? "550px" : "550px" }}
    >
      <div className="mb-3">
        <input
          type="text"
          className="form-control text-center"
          placeholder="SEARCH"
          onChange={handleSearch}
          ref={searchInputRef}
        />
      </div>
    </div>
  );
};

SearchInfo.propTypes = {
  setSearchQuery: PropTypes.func.isRequired,
  setSelectedToken: PropTypes.func.isRequired,
};

export default SearchInfo;
