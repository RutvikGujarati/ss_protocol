import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css"; // Add custom styles here

import Header from "./components/Header";
import InfoCards from "./components/InfoCards";
import DataTable from "./components/DataTable";
import "./Styles/styles.css";

const App = () => {
  return (
    <>
      <Header />
      <InfoCards />
      <DataTable />
    </>
  );
};

export default App;
