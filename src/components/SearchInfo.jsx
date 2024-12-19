import React from 'react';
import "../Styles/SearchInfo.css";

const SearchComponent = () => {
  return (
    <div className="border rounded p-3">
      <div className="mb-3">
        <input type="text" className="form-control" placeholder="SEARCH" />
      </div>
      <table className="table">
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1</td>
            <td>Fluxin</td>
          </tr>
          <tr>
            <td>2</td>
            <td>Xerion</td>
          </tr>
          <tr>
            <td>3</td>
            <td>Rutvik</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default SearchComponent;
