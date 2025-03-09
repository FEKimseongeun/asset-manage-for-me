/** frontend/src/components/MonthlyAssetPage/MonthlyAssetPage.jsx **/
import React, { useEffect, useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import './MonthlyAssetPage.css';

const DEFAULT_CATEGORIES = [
  '월급',
  '국내주식',
  '해외주식',
  '코인',
  'ETF',
  '채권',
  '예금',
  '적금',
  '파킹통장',
];

function MonthlyAssetPage() {
  const [selectedMonth, setSelectedMonth] = useState(1); // 기본 1월
  const [monthlyAssets, setMonthlyAssets] = useState([]); // [{id, month, category, title, amount, open_date, end_date}, ...]

  // 새 항목 추가 폼
  const [newCategory, setNewCategory] = useState('월급');
  const [newTitle, setNewTitle] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [openDate, setOpenDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // 선택 월 바뀔 때마다 fetch
  useEffect(() => {
    fetchMonthData(selectedMonth);
  }, [selectedMonth]);

  const fetchMonthData = async (month) => {
    try {
      const res = await fetch(
        `http://localhost:4000/api/monthly-assets?month=${month}`
      );
      const data = await res.json();
      setMonthlyAssets(data);
    } catch (err) {
      console.error('월별 자산 조회 에러:', err);
    }
  };

  // 새 항목 추가
  const handleAddAsset = async () => {
    if (!newTitle.trim()) {
      alert('항목명을 입력하세요.');
      return;
    }
    try {
      const res = await fetch('http://localhost:4000/api/monthly-assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          month: selectedMonth,
          category: newCategory,
          title: newTitle.trim(),
          amount: Number(newAmount) || 0,
          open_date: openDate || null,
          end_date: endDate || null,
        }),
      });
      const created = await res.json();
      if (created.error) {
        alert(created.error);
        return;
      }
      // 성공 -> 폼 초기화 & 목록 갱신
      setNewTitle('');
      setNewAmount('');
      setOpenDate('');
      setEndDate('');
      fetchMonthData(selectedMonth);
    } catch (err) {
      console.error(err);
    }
  };

  // 항목 삭제
  const handleDelete = async (id) => {
    const yes = window.confirm('정말 이 항목을 삭제하시겠습니까?');
    if (!yes) return;
    try {
      const res = await fetch(
        `http://localhost:4000/api/monthly-assets/${id}`,
        {
          method: 'DELETE',
        }
      );
      const result = await res.json();
      if (result.error) {
        alert(result.error);
        return;
      }
      // 갱신
      fetchMonthData(selectedMonth);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Container maxWidth='md' className='monthly-asset-page-container'>
      <Paper className='monthly-asset-paper'>
        <Typography variant='h5' gutterBottom>
          매월 현황 입력
        </Typography>

        {/* (A) 월 선택 */}
        <Box display='flex' alignItems='center' mb={2}>
          <Typography variant='body1' sx={{ mr: 2 }}>
            월 선택:
          </Typography>
          {[...Array(12)].map((_, i) => {
            const m = i + 1;
            return (
              <Button
                key={m}
                variant={selectedMonth === m ? 'contained' : 'outlined'}
                color={selectedMonth === m ? 'primary' : 'inherit'}
                onClick={() => setSelectedMonth(m)}
                sx={{ mr: 1 }}
              >
                {m}월
              </Button>
            );
          })}
        </Box>

        {/* (B) 추가 폼 */}
        <Box className='add-asset-form'>
          <FormControl size='small' sx={{ minWidth: 120 }}>
            <InputLabel id='category-label'>카테고리</InputLabel>
            <Select
              labelId='category-label'
              label='카테고리'
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            >
              {DEFAULT_CATEGORIES.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label='항목명'
            variant='outlined'
            size='small'
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            sx={{ width: 180 }}
          />

          <TextField
            label='금액'
            variant='outlined'
            size='small'
            type='number'
            value={newAmount}
            onChange={(e) => setNewAmount(e.target.value)}
            sx={{ width: 100 }}
          />

          {/* 예금/적금 개설일 & 만기일 */}
          <TextField
            label='개설일'
            type='date'
            size='small'
            value={openDate}
            onChange={(e) => setOpenDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label='만기일'
            type='date'
            size='small'
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />

          <Button variant='contained' onClick={handleAddAsset}>
            추가
          </Button>
        </Box>

        {/* (C) 현재 달의 항목 목록 */}
        <Box mt={3}>
          <Typography variant='h6'>{selectedMonth}월 자산 목록</Typography>
          {monthlyAssets.length === 0 ? (
            <Typography variant='body2' color='textSecondary'>
              등록된 항목이 없습니다.
            </Typography>
          ) : (
            monthlyAssets.map((item) => (
              <Box
                key={item.id}
                display='flex'
                justifyContent='space-between'
                className='asset-item-box'
              >
                <Box>
                  <strong>{item.category}</strong> | {item.title} :{' '}
                  {item.amount?.toLocaleString()}원
                  {item.open_date && ` / 개설일: ${item.open_date}`}
                  {item.end_date && ` / 만기일: ${item.end_date}`}
                </Box>
                <IconButton onClick={() => handleDelete(item.id)}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))
          )}
        </Box>
      </Paper>
    </Container>
  );
}

export default MonthlyAssetPage;
