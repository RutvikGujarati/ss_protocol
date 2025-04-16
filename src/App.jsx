import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import "./Styles/styles.css";
import { useEffect, useState } from "react";
import Header from "./components/Header";
import InfoCards from "./components/InfoCards";
import DataTable from "./components/DataTable";
import SearchInfo from "./components/SearchInfo";
import DetailsInfo from "./components/DetailsInfo";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useDAvContract } from "./Functions/DavTokenFunctions";
import DotAnimation from "./Animations/Animation";
import { Toaster } from "react-hot-toast";
const App = () => {
  const { loadingRatioPrice } = useDAvContract();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedToken, setSelectedToken] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Function to check actual network status
  const checkOnlineStatus = async () => {
    try {
      // Try fetching a known online resource (Google's favicon)
      const response = await fetch("https://www.google.com/favicon.ico", {
        mode: "no-cors",
      });
      setIsOnline(true);
    } catch (error) {
      setIsOnline(false);
    }
  };

  useEffect(() => {
    // Initial check
    checkOnlineStatus();

    // Listen for browser's built-in events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Periodically check connection (every 5 seconds)
    const interval = setInterval(checkOnlineStatus, 10000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(interval);
    };
  }, []);

  return (
    <Router>
      <Header />
      <Toaster position="bottom-left" reverseOrder={false} />
      <div>
        {!isOnline && (
          <div
            className="alert alert-danger text-center w-100 position-fixed top-0 start-0"
            style={{ zIndex: 1050, padding: "15px", fontSize: "18px" }}
            role="alert"
          >
            ⚠️ You are offline. Some features may not work properly.
          </div>
        )}
        {/* Rest of your App */}
      </div>
      <Routes>
        <Route path="/" element={<Navigate to="/auction" />} />
        {/* Auction Page (Default page when accessed directly) */}
        <Route
          path="/auction"
          element={
            loadingRatioPrice ? (
              <DotAnimation />
            ) : (
              <>
                <InfoCards />
                <DataTable />
              </>
            )
          }
        />
        <Route
          path="/StateLp"
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
              {/* <div className="container mt-3">
                <div className="row g-4"> */}
                  {/* <div className="col-md-4 d-flex align-items-stretch"> */}
                    {/* Pass setSearchQuery to update the search input */}
                    {/* <SearchInfo
                      setSearchQuery={setSearchQuery}
                      setSelectedToken={setSelectedToken}
                    /> */}
                  {/* </div> */}
                  {/* <div className="col-md-8"> */}
                    {/* Pass searchQuery to filter the details */}
                    <DetailsInfo
                      searchQuery={searchQuery}
                      selectedToken={selectedToken}
                    />
                  {/* </div> */}
                {/* </div> */}
              {/* </div> */}
            </>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
