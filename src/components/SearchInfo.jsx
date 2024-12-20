import { useState } from "react";
import "../Styles/SearchInfo.css";
import XerionLogo from "../assets/XerionLogo.png";
import FluxinLogo from "../assets/FluxinLogo.png";
import DAVLogo from "../assets/d_logo.png";
import stateLogo from "../assets/state_logo.png";
import PropTypes from "prop-types";

const SearchInfo = ({ setSearchQuery, onTokenSelect }) => {
  const [filteredData, setFilteredData] = useState([
    { id: 0, name: "DAV", logo: DAVLogo },
    { id: 0.1, name: "State", logo: stateLogo },
    { id: 1, name: "Fluxin", logo: FluxinLogo },
    { id: 2, name: "Xerion", logo: XerionLogo },
    { id: 3, name: "Rutvik", logo: FluxinLogo },
    { id: 4, name: "Polaris", logo: FluxinLogo },
  ]);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query); // Update the parent state
    const originalData = [
      { id: 0, name: "DAV", logo: DAVLogo },
      { id: 0.1, name: "State", logo: stateLogo },
      { id: 1, name: "Fluxin", logo: FluxinLogo },
      { id: 2, name: "Xerion", logo: XerionLogo },
      { id: 3, name: "Rutvik", logo: FluxinLogo },
      { id: 4, name: "Polaris", logo: FluxinLogo },
    ];
    const filtered = originalData.filter((item) =>
      item.name.toLowerCase().includes(query)
    );
    setFilteredData(filtered);
  };
  const handleRowClick = (token) => {
    onTokenSelect(token); // Pass selected token data to the parent
  };
  return (
    <div className="card w-100">
      <div className="mb-3">
        <input
          type="text"
          className="form-control text-center"
          placeholder="SEARCH"
          onChange={handleSearch}
        />
      </div>
      <table className="table table-dark cursor">
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
  onTokenSelect: PropTypes.func.isRequired,
};

export default SearchInfo;
