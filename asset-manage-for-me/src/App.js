// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Layout/Header'; // 예시
import MainPage from './components/MainPage/MainPage'; // 예시
import InitialAssetPage from './components/InitialAssetPage/InitialAssetPage'; // 예시
import MonthlyAssetPage from './components/MonthlyAssetPage/MonthlyAssetPage'; // <-- 새로 만든 컴포넌트 임포트
import TestStockPage from './components/test/testStock';

function App() {
  return (
    <Router>
      <Header />

      <Routes>
        {/* 메인 */}
        <Route path='/' element={<MainPage />} />

        {/* 초기 자산 입력 페이지 */}
        <Route path='/initial-asset' element={<InitialAssetPage />} />

        {/* 매월 현황 입력 페이지 */}
        <Route path='/monthly-asset' element={<MonthlyAssetPage />} />

        {/* 주식 확인 페이지  */}
        <Route path='/test-stock' element={<TestStockPage />} />
      </Routes>
    </Router>
  );
}

export default App;
