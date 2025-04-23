import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import "./Styles/styles.css";
import { useEffect, useState } from "react";
import Header from "./components/Header";
import InfoCards from "./components/InfoCards";
import DataTable from "./components/DataTable";
import DetailsInfo from "./components/DetailsInfo";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Footer from "./components/Footer";

const App = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <Router>
      <div className="d-flex flex-column min-vh-100">
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
          {/* Main content area */}
          <main className="flex-grow-1">
            <Routes>
              <Route path="/" element={<Navigate to="/auction" />} />
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
                    <DetailsInfo />
                  </>
                }
              />
            </Routes>
          </main>
        </div>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
