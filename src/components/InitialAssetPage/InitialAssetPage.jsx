import React, { useEffect, useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import './InitialAssetPage.css';

// [가짜 함수] 국내/해외 주식 종목명 입력 시 현재 시세를 불러오는 예시
async function fetchStockPrice(tickerOrName) {
  // 실제로는 증권사 API or 금융 데이터 API를 호출해야 함
  // 여기서는 예시로 랜덤 값 반환
  return new Promise((resolve) => {
    setTimeout(() => {
      const randomPrice = Math.floor(Math.random() * 100000) + 1000; // 1,000 ~ 100,000 사이
      resolve(randomPrice);
    }, 500);
  });
}

function InitialAssetPage() {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');

  // 선택된 카테고리 id & 하위 항목 입력 상태
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [subItemTitle, setSubItemTitle] = useState('');
  const [subItemAmount, setSubItemAmount] = useState('');
  const [subItemMarketPrice, setSubItemMarketPrice] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  // --- API 불러오기 ---
  const fetchCategories = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/categories');
      const data = await res.json();
      setCategories(data); // [{id, name, subItems:[{id, category_id, title, amount, market_price},... ]}, ...]
    } catch (err) {
      console.error('카테고리 목록 불러오기 에러:', err);
    }
  };

  // --- (1) 새 카테고리 추가 ---
  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    try {
      const res = await fetch('http://localhost:4000/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategory.trim() }),
      });
      const created = await res.json();
      if (created.error) {
        alert(created.error);
        return;
      }
      // 성공 시 목록 갱신
      setNewCategory('');
      await fetchCategories();
    } catch (err) {
      console.error(err);
    }
  };

  // --- (2) 하위 항목(subItem) 추가 ---
  const handleAddSubItem = async () => {
    if (!selectedCategory) {
      alert('카테고리를 먼저 선택하세요.');
      return;
    }
    if (!subItemTitle.trim()) {
      alert('항목명을 입력하세요.');
      return;
    }

    // 국내주식 or 해외주식 경우 현재 시세를 가져올 수 있음
    // 우선 카테고리 이름을 찾아보고, 만약 그 이름이 '국내주식'/'해외주식'이면 fetchStockPrice 실행
    const catObj = categories.find((cat) => cat.id === selectedCategory);
    let currentMarketPrice = null;
    if (catObj) {
      const catName = catObj.name;
      if (catName.includes('주식')) {
        // 실제로는 ticker나 종목명 등을 subItemTitle로 받아야 함
        currentMarketPrice = await fetchStockPrice(subItemTitle.trim());
      }
    }

    try {
      const res = await fetch(
        `http://localhost:4000/api/categories/${selectedCategory}/assets`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: subItemTitle.trim(),
            amount: Number(subItemAmount) || 0,
            market_price: currentMarketPrice || null,
          }),
        }
      );
      const created = await res.json();
      if (created.error) {
        alert(created.error);
        return;
      }
      // 성공 시 목록 갱신
      setSubItemTitle('');
      setSubItemAmount('');
      setSubItemMarketPrice(null);
      await fetchCategories();
    } catch (err) {
      console.error(err);
    }
  };

  // 카테고리 클릭 시
  const handleSelectCategory = (categoryId) => {
    setSelectedCategory(categoryId);
    setSubItemTitle('');
    setSubItemAmount('');
    setSubItemMarketPrice(null);
  };

  // 현재 선택된 카테고리 객체
  const currentCategoryObj = categories.find(
    (cat) => cat.id === selectedCategory
  );

  return (
    <Container maxWidth='md' className='initial-asset-page-container'>
      <Paper className='initial-asset-paper'>
        <Typography variant='h5' gutterBottom>
          초기 자산현황 입력
        </Typography>

        {/* 새 카테고리 추가 구역 */}
        <Box display='flex' alignItems='center' gap={1} mb={3}>
          <TextField
            label='새 카테고리명'
            variant='outlined'
            size='small'
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
          />
          <Button variant='contained' onClick={handleAddCategory}>
            카테고리 추가
          </Button>
        </Box>

        {/* 현재 카테고리 목록 */}
        <Typography variant='h6'>카테고리 목록</Typography>
        <List className='category-list'>
          {categories.map((cat) => (
            <React.Fragment key={cat.id}>
              <ListItem
                button
                selected={cat.id === selectedCategory}
                onClick={() => handleSelectCategory(cat.id)}
              >
                <ListItemText
                  primary={cat.name}
                  secondary={
                    cat.subItems && cat.subItems.length > 0
                      ? `${cat.subItems.length}개 항목`
                      : '하위 항목 없음'
                  }
                />
              </ListItem>
              <Divider component='li' />
            </React.Fragment>
          ))}
        </List>
      </Paper>

      {/* 하위 항목 입력 섹션 */}
      {selectedCategory && (
        <Paper className='selected-category-paper'>
          <Typography variant='h6' gutterBottom>
            선택된 카테고리: {currentCategoryObj ? currentCategoryObj.name : ''}
          </Typography>

          <Box display='flex' flexDirection='column' gap={2}>
            <TextField
              label='항목명(예: 우리은행 적금, 삼성전자 등)'
              variant='outlined'
              size='small'
              value={subItemTitle}
              onChange={(e) => setSubItemTitle(e.target.value)}
            />
            <TextField
              label='금액'
              variant='outlined'
              size='small'
              value={subItemAmount}
              onChange={(e) => setSubItemAmount(e.target.value)}
            />

            <Button
              variant='contained'
              color='primary'
              onClick={handleAddSubItem}
            >
              하위 항목 추가
            </Button>
          </Box>

          {/* 현재 카테고리에 포함된 하위 항목 리스트 */}
          <Box mt={3}>
            <Typography variant='subtitle1'>하위 항목 목록</Typography>
            {currentCategoryObj && currentCategoryObj.subItems.length > 0 ? (
              <List>
                {currentCategoryObj.subItems.map((item) => (
                  <ListItem key={item.id}>
                    <ListItemText
                      primary={`${
                        item.title
                      } - ${item.amount.toLocaleString()}원`}
                      secondary={
                        item.market_price
                          ? `현재가: ${item.market_price.toLocaleString()}원`
                          : null
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant='body2'>등록된 항목이 없습니다.</Typography>
            )}
          </Box>
        </Paper>
      )}
    </Container>
  );
}

export default InitialAssetPage;
