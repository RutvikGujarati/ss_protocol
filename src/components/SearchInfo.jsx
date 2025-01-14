import { useEffect, useRef, useState } from "react";
import "../Styles/SearchInfo.css";
import XerionLogo from "../assets/XerionLogo.png";
import FluxinLogo from "../assets/FluxinLogo.png";
import DAVLogo from "../assets/d_logo.png";
import stateLogo from "../assets/state_logo.png";
import PropTypes from "prop-types";

const SearchInfo = ({ setSearchQuery, setSelectedToken }) => {
  const [filteredData, setFilteredData] = useState([
    { id: "∈", name: "DAV", logo: DAVLogo },
    { id: "±", name: "STATE", logo: stateLogo },
    // { id: 1, name: "AuctionRatioSwapping", logo: XerionLogo },
    // { id: 2, name: "Xerion", logo: XerionLogo },
    { id: 1, name: "Fluxin", logo: FluxinLogo },
    // { id: 4, name: "Polaris", logo: FluxinLogo },
  ]);
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
    // Add cursor pointer dynamically to specific td
    const nameCells = document.querySelectorAll(".name-cell");
    nameCells.forEach((cell) => {
      cell.style.cursor = "pointer";
    });
  }, [filteredData]);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    const originalData = [
      { id: "∈", name: "DAV", logo: DAVLogo },
      { id: "±", name: "STATE", logo: stateLogo },
      //   { id: 1, name: "AuctionRatioSwapping", logo: XerionLogo },
      //   { id: 2, name: "Xerion", logo: XerionLogo },
      { id: 1, name: "Fluxin", logo: FluxinLogo },
      //   { id: 4, name: "Polaris", logo: FluxinLogo },
    ];
    const filtered = originalData.filter((item) =>
      item.name.toLowerCase().includes(query)
    );
    setFilteredData(filtered);
  };

  const handleRowClick = (token) => {
    setSelectedToken(token);
  };

  return (
    <div className="card w-100">
      <div className="mb-3">
        <input
          type="text"
          className="form-control text-center"
          placeholder="SEARCH"
          onChange={handleSearch}
          ref={searchInputRef}
        />
      </div>
      <table className="table table-dark clickable-row-table">
        <thead>
          <tr className="align-item-center">
            <th>#</th>
            <th></th>
            <th>Name</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((item) => (
            <tr key={item.id} onClick={() => handleRowClick(item)}>
              <td>{item.id}</td>
              <td>
                <div className="nameImage">
                  <img src={item.logo} width={40} height={40} alt="Logo" />
                </div>
              </td>
              <td>{item.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

SearchInfo.propTypes = {
  setSearchQuery: PropTypes.func.isRequired,
  setSelectedToken: PropTypes.func.isRequired,
};

export default SearchInfo;
