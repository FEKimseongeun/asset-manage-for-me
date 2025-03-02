/** frontend/src/components/MainPage/MainPage.jsx **/
import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Paper,
  Grid,
  List,
  ListItem,
  ListItemText,
  Box,
} from '@mui/material';
import './MainPage.css';

function MainPage() {
  // 1) 초기자산(categories + subItems)
  const [categories, setCategories] = useState([]);
  // 2) 매월자산(monthly_assets)
  const [monthlyAssets, setMonthlyAssets] = useState([]);
  // 3) 지출(expenses)
  const [expenses, setExpenses] = useState([]);
  // 4) 총 자산
  const [totalAsset, setTotalAsset] = useState(0);

  useEffect(() => {
    fetchCategories();
    fetchMonthlyAssetsAll();
    fetchExpenses();
  }, []);

  // --- 초기 자산 불러오기 ---
  const fetchCategories = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/categories');
      const data = await res.json();
      // data = [ { id, name, subItems:[{...}, {...}] }, ... ]
      setCategories(data);
    } catch (error) {
      console.error('카테고리 조회 실패:', error);
    }
  };

  // --- 매월 자산(전체) 불러오기 ---
  const fetchMonthlyAssetsAll = async () => {
    try {
      // /api/monthly-assets-all (위 index.js 참고)
      const res = await fetch('http://localhost:4000/api/monthly-assets-all');
      const data = await res.json();
      // data = [{id, month, category, title, amount, ...}, ...]
      setMonthlyAssets(data);
    } catch (error) {
      console.error('월별 자산 조회 실패:', error);
    }
  };

  // --- 지출 불러오기 ---
  const fetchExpenses = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/expenses');
      const data = await res.json();
      // data = [{id, category, description, amount, month, ...}, ...]
      setExpenses(data);
    } catch (error) {
      console.error('지출 조회 실패:', error);
    }
  };

  // 데이터 변동 시 총 자산 재계산
  useEffect(() => {
    recalcTotal();
  }, [categories, monthlyAssets, expenses]);

  const recalcTotal = () => {
    let sumAll = 0;
    // (A) 초기 자산
    categories.forEach((cat) => {
      cat.subItems?.forEach((item) => {
        sumAll += item.amount || 0;
      });
    });
    // (B) 매월 자산(monthlyAssets)
    monthlyAssets.forEach((ma) => {
      sumAll += ma.amount || 0;
    });
    // (C) 지출 빼기 (만약 요구사항에서 지출은 자산에서 차감해야 한다면)
    // expenses.forEach(exp => {
    //   sumAll -= (exp.amount || 0);
    // });
    setTotalAsset(sumAll);
  };

  // 카테고리+하위항목 + monthly_assets를 합쳐 표시하기 위해
  // 각 카테고리별로 묶는 로직(예시)
  const combineByCategory = () => {
    const mapObj = {};

    // 1) 초기자산 -> mapObj[카테고리명] = [{title, amount, ...}]
    categories.forEach((cat) => {
      const catName = cat.name;
      if (!mapObj[catName]) {
        mapObj[catName] = [];
      }
      cat.subItems?.forEach((sub) => {
        mapObj[catName].push({
          title: sub.title,
          amount: sub.amount,
          market_price: sub.market_price,
          source: 'initial',
        });
      });
    });

    // 2) monthly_assets -> category 필드 사용
    monthlyAssets.forEach((ma) => {
      const catName = ma.category;
      if (!catName) return;
      if (!mapObj[catName]) {
        mapObj[catName] = [];
      }
      mapObj[catName].push({
        title: ma.title,
        amount: ma.amount,
        open_date: ma.open_date,
        end_date: ma.end_date,
        month: ma.month,
        source: 'monthly',
      });
    });

    return mapObj;
  };

  const mergedData = combineByCategory();
  // 예: { "국내주식": [ {...}, {...} ], "월급": [...], ... }

  return (
    <Container maxWidth='md' className='main-page-container'>
      {/* 총 자산 */}
      <Paper className='total-asset-paper'>
        <Typography variant='h4' align='center' gutterBottom>
          총 자산: {totalAsset.toLocaleString()} 원
        </Typography>
      </Paper>

      {/* 카테고리별 자산 표시 */}
      <Paper className='category-asset-paper'>
        <Typography variant='h6' gutterBottom>
          카테고리별 자산 (초기 + 매월)
        </Typography>

        <Grid container spacing={2}>
          {Object.keys(mergedData).map((catName) => {
            const items = mergedData[catName];
            const catSum = items.reduce(
              (acc, cur) => acc + (cur.amount || 0),
              0
            );

            return (
              <Grid item xs={12} sm={6} md={4} key={catName}>
                <Paper className='asset-category-box'>
                  <Typography variant='subtitle1' className='category-title'>
                    {catName}
                  </Typography>
                  <Typography variant='body1' className='category-amount'>
                    {catSum.toLocaleString()} 원
                  </Typography>

                  <List dense className='sub-items-list'>
                    {items.map((item, idx) => (
                      <ListItem
                        key={idx}
                        style={{ paddingLeft: 0, paddingRight: 0 }}
                      >
                        <ListItemText
                          primary={
                            (item.month ? `${item.month}월 ` : '') + item.title
                          }
                          secondary={
                            `${(item.amount || 0).toLocaleString()} 원` +
                            (item.market_price
                              ? ` / 현재가: ${item.market_price.toLocaleString()}원`
                              : '') +
                            (item.open_date
                              ? ` / 개설일: ${item.open_date}`
                              : '') +
                            (item.end_date ? ` / 만기일: ${item.end_date}` : '')
                          }
                        />
                      </ListItem>
                    ))}
                    {items.length === 0 && (
                      <Box mt={1}>
                        <Typography variant='caption' color='textSecondary'>
                          (등록 항목 없음)
                        </Typography>
                      </Box>
                    )}
                  </List>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      </Paper>

      {/* 지출 섹션 (선택사항) */}
      <Paper className='expense-paper'>
        <Typography variant='h6' gutterBottom>
          지출 내역
        </Typography>
        {/* 여기서 expenses.map(...) 등으로 표시 */}
        {/* 예: 
        {expenses.map(exp => (
          <p key={exp.id}>{exp.category} / {exp.amount}원 / {exp.description}</p>
        ))} 
        */}
      </Paper>
    </Container>
  );
}

export default MainPage;
