import React, { useState, useEffect } from 'react';
import { Container, Typography, Paper, Button } from '@mui/material';

function TestStock() {
  const [stockData, setStockData] = useState(null);
  const [error, setError] = useState(null);

  const fetchStockData = async () => {
    try {
      setError(null);
      const response = await fetch(
        'http://localhost:4000/api/stock-price/005930'
      ); // 삼성전자 종목코드 예시
      const data = await response.json();
      setStockData(data);
    } catch (err) {
      setError('주가 데이터를 가져오는데 실패했습니다.');
    }
  };

  useEffect(() => {
    fetchStockData();
  }, []);

  return (
    <Container maxWidth='sm'>
      <Paper style={{ padding: 20, marginTop: 50, textAlign: 'center' }}>
        <Typography variant='h5' gutterBottom>
          삼성전자(005930) 최근 시가
        </Typography>

        {error && (
          <Typography variant='body1' color='error'>
            {error}
          </Typography>
        )}

        {stockData ? (
          <>
            <Typography variant='h4' style={{ marginTop: 20 }}>
              {stockData.toLocaleString()} 원
            </Typography>
            <Typography variant='caption'>종목 코드: 005930</Typography>
          </>
        ) : (
          <Typography>데이터 로딩중...</Typography>
        )}

        <Button
          variant='contained'
          style={{ marginTop: 20 }}
          onClick={fetchStockData}
        >
          새로고침
        </Button>
      </Paper>
    </Container>
  );
}

export default TestStock;
