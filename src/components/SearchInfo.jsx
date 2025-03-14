import { useEffect, useRef, useState } from "react";
import "../Styles/SearchInfo.css";
import XerionLogo from "../assets/layti.png";
import FluxinLogo from "../assets/FluxinLogo.png";
import Rieva from "../assets/rieva.png";
import DAVLogo from "../assets/d_logo.png";
import TenDollar from "../assets/TenDollar.png";
import oned from "../assets/oned.png";
import Domus from "../assets/domus.png";
import stateLogo from "../assets/state_logo.png";
import PropTypes from "prop-types";
import MetaMaskIcon from "../assets/metamask-icon.png";
import { useSwapContract } from "../Functions/SwapContractFunctions";

const SearchInfo = ({ setSearchQuery, setSelectedToken }) => {
  const {
    handleAddTokenDAV,
    handleAddTokenState,
    handleAddOneD,
    handleAddFluxin,
    handleAddXerion,
    handleAddRieva,
    handleAddDomus,
    handleAddTenDollar,
  } = useSwapContract();
  const [filteredData, setFilteredData] = useState([
    { id: "∈", name: "DAV", logo: DAVLogo, AddToken: handleAddTokenDAV },
    { id: "±", name: "STATE", logo: stateLogo, AddToken: handleAddTokenState },
    { id: 1, name: "Orxa", logo: FluxinLogo, AddToken: handleAddFluxin },
    { id: 2, name: "Layti", logo: XerionLogo, AddToken: handleAddXerion },
    { id: "∞", name: "1$", logo: oned, AddToken: handleAddOneD },
    { id: 3, name: "Rieva", logo: Rieva, AddToken: handleAddRieva },
    { id: "~", name: "Domus", logo: Domus, AddToken: handleAddDomus },
    {
      id: "∞",
      name: "10$",
      logo: TenDollar,
      AddToken: handleAddTenDollar,
    },
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
      { id: 1, name: "Orxa", logo: FluxinLogo },
      { id: 2, name: "Layti", logo: XerionLogo },
      { id: "∞", name: "1$", logo: oned, AddToken: handleAddOneD },
      { id: 3, name: "Rieva", logo: Rieva, AddToken: handleAddRieva },
      { id: "~", name: "Domus", logo: Domus, AddToken: handleAddDomus },
      {
        id: "∞",
        name: "10$",
        logo: TenDollar,
        AddToken: handleAddTenDollar,
      },

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
            <th className="">Name</th>
            {/* <th></th> */}
            <th>Add</th>
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
              <td className=" justify-content-center  ">{item.name}</td>
              {/* <td></td> */}
              <td>
                <div className="mb-0 mx-1">
                  <img
                    src={MetaMaskIcon}
                    width={20}
                    height={20}
                    alt="Logo"
                    title="Add Token"
                    style={{ cursor: "pointer", marginLeft: "5px" }}
                    onClick={item.AddToken}
                  />
                </div>
              </td>
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
