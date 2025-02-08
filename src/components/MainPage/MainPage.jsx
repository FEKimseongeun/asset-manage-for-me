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
  // 1) 카테고리+하위항목 데이터
  const [categories, setCategories] = useState([]);
  // 2) 전체 자산 총합
  const [totalAsset, setTotalAsset] = useState(0);

  // 3) 지출 데이터 + 지출 총합
  const [expenses, setExpenses] = useState([]);
  const [totalExpenses, setTotalExpenses] = useState(0);

  // 페이지 로드 시 DB에서 카테고리+하위항목, 지출 목록 불러오기
  useEffect(() => {
    fetchCategories();
    fetchExpenses();
  }, []);

  // --- 자산 카테고리 불러오기 ---
  const fetchCategories = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/categories');
      const data = await res.json();
      // data = [{id, name, subItems: [{id, category_id, title, amount, market_price}, ...]}, ...]
      setCategories(data);
    } catch (error) {
      console.error('카테고리 조회 실패:', error);
    }
  };

  // --- 지출 목록 불러오기 ---
  const fetchExpenses = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/expenses');
      const data = await res.json();
      setExpenses(data); // [{id, category, description, amount, month, created_at}, ...]
    } catch (error) {
      console.error('지출 조회 실패:', error);
    }
  };

  // categories가 바뀔 때마다 전체 자산 합계를 계산
  useEffect(() => {
    let sumAll = 0;
    categories.forEach((cat) => {
      cat.subItems?.forEach((item) => {
        sumAll += item.amount || 0;
      });
    });
    setTotalAsset(sumAll);
  }, [categories]);

  // expenses가 바뀔 때마다 전체 지출 합계 계산
  useEffect(() => {
    let sumE = 0;
    expenses.forEach((exp) => {
      sumE += exp.amount || 0;
    });
    setTotalExpenses(sumE);
  }, [expenses]);

  return (
    <Container maxWidth='md' className='main-page-container'>
      {/* 상단: 총 자산 표시 */}
      <Paper className='total-asset-paper'>
        <Typography variant='h4' align='center' gutterBottom>
          총 자산: {totalAsset.toLocaleString()}원
        </Typography>
      </Paper>

      {/* 카테고리별 자산 현황 */}
      <Paper className='category-asset-paper'>
        <Typography variant='h6' gutterBottom>
          카테고리별 자산 현황
        </Typography>

        <Grid container spacing={2}>
          {categories.map((cat) => {
            // 이 카테고리의 합계
            const catSum =
              cat.subItems?.reduce((acc, cur) => acc + (cur.amount || 0), 0) ||
              0;

            return (
              <Grid item xs={12} sm={6} md={4} key={cat.id}>
                <Paper className='asset-category-box'>
                  {/* 카테고리명 + 합계 */}
                  <Typography variant='subtitle1' className='category-title'>
                    {cat.name}
                  </Typography>
                  <Typography variant='body1' className='category-amount'>
                    {catSum.toLocaleString()} 원
                  </Typography>

                  {/* 하위 항목 리스트 */}
                  <List dense className='sub-items-list'>
                    {cat.subItems?.map((item) => (
                      <ListItem
                        key={item.id}
                        style={{ paddingLeft: 0, paddingRight: 0 }}
                      >
                        <ListItemText
                          primary={item.title}
                          secondary={
                            `${(item.amount || 0).toLocaleString()} 원` +
                            (item.market_price
                              ? ` / 현재가: ${item.market_price.toLocaleString()}원`
                              : '')
                          }
                        />
                      </ListItem>
                    ))}
                    {(!cat.subItems || cat.subItems.length === 0) && (
                      <Box mt={1}>
                        <Typography variant='caption' color='textSecondary'>
                          (등록된 항목 없음)
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

      {/* 지출 내역 섹션 */}
      <Paper className='expense-paper'>
        <Typography variant='h6' gutterBottom>
          지출 내역 (총 {totalExpenses.toLocaleString()}원)
        </Typography>

        {/* 예: 월별 그룹핑해서 표시 (1~12월) */}
        {[...Array(12)].map((_, idx) => {
          const monthNum = idx + 1;
          // 해당 월의 지출만 필터
          const monthlyExpenses = expenses.filter(
            (exp) => exp.month === monthNum
          );
          if (!monthlyExpenses.length) return null;

          return (
            <Box key={monthNum} mb={2} className='monthly-expense-box'>
              <Typography variant='subtitle1' className='month-title'>
                {monthNum}월 지출
              </Typography>
              <List>
                {monthlyExpenses.map((exp) => (
                  <ListItem key={exp.id}>
                    <ListItemText
                      primary={`${exp.category} - ${exp.description}`}
                      secondary={`${(exp.amount || 0).toLocaleString()} 원`}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          );
        })}
      </Paper>
    </Container>
  );
}

export default MainPage;
