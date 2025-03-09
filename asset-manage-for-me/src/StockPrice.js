// frontend/src/StockPrice.js
import React, { useState } from 'react';

function StockPrice() {
  const [symbol, setSymbol] = useState('005930.KS');
  const [price, setPrice] = useState(null);

  const handleFetchPrice = async () => {
    try {
      const res = await fetch(
        `http://localhost:4000/api/stock/price/${symbol}`
      );
      const data = await res.json();
      if (data.price) {
        setPrice(data.price);
      } else {
        alert(data.error || 'Symbol not found');
      }
    } catch (error) {
      console.error(error);
      alert('API error');
    }
  };

  return (
    <div>
      <h2>주가 조회</h2>
      <input
        type='text'
        value={symbol}
        onChange={(e) => setSymbol(e.target.value)}
      />
      <button onClick={handleFetchPrice}>주가 가져오기</button>
      {price && (
        <p>
          현재 {symbol} 가격: {parseFloat(price).toLocaleString()}원
        </p>
      )}
    </div>
  );
}

export default StockPrice;
