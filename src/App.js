// src/App.js (예시)
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Layout/Header';
import MainPage from './components/MainPage/MainPage';
import InitialAssetPage from './components/InitialAssetPage/InitialAssetPage';

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path='/' element={<MainPage />} />
        <Route path='/initial-asset' element={<InitialAssetPage />} />
      </Routes>
    </Router>
  );
}

export default App;
