import React from "react";
import "../Styles/SearchInfo.css";
import XerionLogo from "../assets/XerionLogo.png";
import FluxinLogo from "../assets/FluxinLogo.png";

const SearchInfo = ({ setSearchQuery }) => {
  const handleSearch = (e) => {
    setSearchQuery(e.target.value); // Update search query on input change
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
      <table className="table table-dark">
        <thead>
          <tr className="align-item-center">
            <th>#</th>
            <th></th>
            <th>Name</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1</td>
            <td>
              <div className="nameImage">
                <img src={FluxinLogo} width={40} height={40} alt="Logo" />
              </div>
            </td>
            <td>Fluxin</td>
          </tr>
          <tr>
            <td>2</td>
            <td>
              <div className="nameImage">
                <img src={XerionLogo} width={40} height={40} alt="Logo" />
              </div>
            </td>
            <td>Xerion</td>
          </tr>
          <tr>
            <td>3</td>
            <td>
              <div className="nameImage">
                <img src={FluxinLogo} width={40} height={40} alt="Logo" />
              </div>
            </td>
            <td>Rutvik</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default SearchInfo;
