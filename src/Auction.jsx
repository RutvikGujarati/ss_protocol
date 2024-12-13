import React from 'react';
import Header from './components/Header';
import InfoCards from './components/InfoCards';
import DataTable from './components/DataTable';
import './components/styles.css';

const App = () => {
  return (
    <div className="">
      <Header />
      <InfoCards />
      <DataTable />
    </div>
  );
};

export default App;