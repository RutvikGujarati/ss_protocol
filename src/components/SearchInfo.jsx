import { useEffect, useRef, useState } from "react";
import "../Styles/SearchInfo.css";
import XerionLogo from "../assets/layti.png";
import FluxinLogo from "../assets/FluxinLogo.png";
import Rieva from "../assets/rieva.png";
import DAVLogo from "../assets/d_logo.png";
import sDAV from "../assets/sDAV.png";
import TenDollar from "../assets/TenDollar.png";
import Currus from "../assets/Currus.png";
import ValirLogo from "../assets/Valir.png";
import SanitasLogo from "../assets/Sanitas.png";
import oned from "../assets/oned.png";
import Domus from "../assets/domus.png";
import Teeah from "../assets/teech.png";
import stateLogo from "../assets/state_logo.png";
import sState from "../assets/sonicstate.png";
import PropTypes from "prop-types";
import MetaMaskIcon from "../assets/metamask-icon.png";
import { useSwapContract } from "../Functions/SwapContractFunctions";
import { useChainId } from "wagmi";

const SearchInfo = ({ setSearchQuery, setSelectedToken }) => {
  const {
    handleAddTokenDAV,
    handleAddTokensDAV,
    handleAddTokenState,
    handleAddTokensState,
    handleAddOneD,
    handleAddFluxin,
    handleAddXerion,
    handleAddRieva,
    handleAddDomus,
    handleAddTenDollar,
    handleAddCurrus,
    handleAddValir,
	handleAddTeeah,
    handleAddSanitas,
  } = useSwapContract();
  const chainId = useChainId();
  const [filteredData, setFilteredData] = useState([]);

  const originalData = [
    { id: "∈", name: "DAV", logo: DAVLogo, AddToken: handleAddTokenDAV },
    { id: "±", name: "STATE", logo: stateLogo, AddToken: handleAddTokenState },
    { id: "1", name: "Orxa", logo: FluxinLogo, AddToken: handleAddFluxin },
    { id: "2", name: "Layti", logo: XerionLogo, AddToken: handleAddXerion },
    { id: "∞", name: "1$", logo: oned, AddToken: handleAddOneD },
    { id: "3", name: "Rieva", logo: Rieva, AddToken: handleAddRieva },
    { id: "~", name: "Domus", logo: Domus, AddToken: handleAddDomus },
    { id: "∞", name: "10$", logo: TenDollar, AddToken: handleAddTenDollar },
    { id: "~", name: "Currus", logo: Currus, AddToken: handleAddCurrus },
    { id: "4", name: "Valir", logo: ValirLogo, AddToken: handleAddValir },
    { id: "~", name: "Sanitas", logo: SanitasLogo, AddToken: handleAddSanitas },
    { id: "±", name: "Teeah", logo: Teeah, AddToken: handleAddTeeah },
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

  const handleRowClick = (token) => {
    setSelectedToken(token);
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
      <table className="table table-dark clickable-row-table">
        <thead>
          <tr className="align-item-center">
            <th>#</th>
            <th></th>
            <th className="">Name</th>
            <th>Add</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((item, index) => (
            <tr
              key={`${item.name}-${index}`}
              onClick={() => handleRowClick(item)}
            >
              <td>{item.id}</td>
              <td>
                <div className="nameImage">
                  <img src={item.logo} width={40} height={40} alt="Logo" />
                </div>
              </td>
              <td className="justify-content-center">{item.name}</td>
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
