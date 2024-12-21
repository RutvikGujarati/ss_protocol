import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import "./Styles/styles.css"; 
import  { useState } from "react";
import Header from "./components/Header";
import InfoCards from "./components/InfoCards";
import DataTable from "./components/DataTable";
import SearchInfo from './components/SearchInfo';
import DetailsInfo from './components/DetailsInfo';

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

const App = () => {
  const [searchQuery, setSearchQuery] = useState("");
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Navigate to="/auction" />} />
        {/* Auction Page (Default page when accessed directly) */}
        <Route
          path="/auction"
          element={
            <>
              <InfoCards />
              <DataTable />
            </>
          }
        />
        <Route
          path="/burn"
          element={
            <>
              <InfoCards />
              <DataTable />
            </>
          }
        />
      <Route
        path="/info"
        element={
          <>
            <div className="container mt-3">
              <div className="row g-4">
                <div className="col-md-4 d-flex align-items-stretch">
                  {/* Pass setSearchQuery to update the search input */}
                  <SearchInfo setSearchQuery={setSearchQuery} />
                </div>
                <div className="col-md-8 d-flex align-items-stretch">
                  {/* Pass searchQuery to filter the details */}
                  <DetailsInfo searchQuery={searchQuery} />
                </div>
              </div>
            </div>
          </>
        }
      />
      </Routes>
    </Router>
  );
};

export default App;
