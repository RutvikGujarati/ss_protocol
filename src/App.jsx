import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css"; // Custom global styles
import "./Styles/styles.css"; // Additional component-specific styles

import Header from "./components/Header";
import InfoCards from "./components/InfoCards";
import DataTable from "./components/DataTable";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

const App = () => {
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
              <InfoCards />
              <DataTable />
            </>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
