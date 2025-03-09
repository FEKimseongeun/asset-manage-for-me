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
  IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import './InitialAssetPage.css';

// [가짜 함수] 주식 시세 가져오기 - 예시
async function fetchStockPrice(ticker) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const randomPrice = Math.floor(Math.random() * 100000) + 1000;
      resolve(randomPrice);
    }, 500);
  });
}

function InitialAssetPage() {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);

  // 하위 항목 입력 폼
  const [subItemTitle, setSubItemTitle] = useState('');
  const [subItemAmount, setSubItemAmount] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  // 카테고리 목록 불러오기
  const fetchCategories = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/categories');
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error('카테고리 목록 불러오기 에러:', err);
    }
  };

  // 새 카테고리 추가
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
      setNewCategory('');
      await fetchCategories();
    } catch (err) {
      console.error(err);
    }
  };

  // 카테고리 클릭 시 선택
  const handleSelectCategory = (categoryId) => {
    setSelectedCategory(categoryId);
    setSubItemTitle('');
    setSubItemAmount('');
  };

  // 카테고리 삭제
  const handleDeleteCategory = async (categoryId) => {
    // 정말 삭제해도 괜찮은지 사용자 확인
    const yes = window.confirm(
      '해당 카테고리를 삭제하면 하위 항목도 전부 삭제됩니다. 정말 삭제하시겠습니까?'
    );
    if (!yes) return;

    try {
      const res = await fetch(
        `http://localhost:4000/api/categories/${categoryId}`,
        {
          method: 'DELETE',
        }
      );
      const result = await res.json();
      if (result.error) {
        alert(result.error);
        return;
      }
      // 삭제 성공 시 목록 갱신
      if (selectedCategory === categoryId) {
        setSelectedCategory(null);
      }
      await fetchCategories();
    } catch (error) {
      console.error(error);
    }
  };

  // 하위 항목(subItem) 추가
  const handleAddSubItem = async () => {
    if (!selectedCategory) {
      alert('카테고리를 먼저 선택하세요.');
      return;
    }
    if (!subItemTitle.trim()) {
      alert('항목명을 입력하세요.');
      return;
    }

    // 주식 시세 가져오기 예시
    let currentMarketPrice = null;
    const catObj = categories.find((cat) => cat.id === selectedCategory);
    if (catObj && catObj.name.includes('주식')) {
      currentMarketPrice = await fetchStockPrice(subItemTitle.trim());
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
      setSubItemTitle('');
      setSubItemAmount('');
      await fetchCategories();
    } catch (err) {
      console.error(err);
    }
  };

  // 하위 항목 삭제
  const handleDeleteSubItem = async (assetId) => {
    const yes = window.confirm('이 자산 항목을 삭제하시겠습니까?');
    if (!yes) return;

    try {
      const res = await fetch(`http://localhost:4000/api/assets/${assetId}`, {
        method: 'DELETE',
      });
      const result = await res.json();
      if (result.error) {
        alert(result.error);
        return;
      }
      await fetchCategories();
    } catch (err) {
      console.error(err);
    }
  };

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
                secondaryAction={
                  <IconButton
                    edge='end'
                    aria-label='delete'
                    onClick={(e) => {
                      e.stopPropagation(); // 카테고리 선택 이벤트가 동작하지 않도록
                      handleDeleteCategory(cat.id);
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                }
              >
                <ListItemText
                  primary={cat.name}
                  secondary={
                    cat.subItems && cat.subItems.length
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

          {/* 현재 카테고리에 포함된 하위 항목 목록 */}
          <Box mt={3}>
            <Typography variant='subtitle1'>하위 항목 목록</Typography>
            {currentCategoryObj && currentCategoryObj.subItems.length > 0 ? (
              <List>
                {currentCategoryObj.subItems.map((item) => (
                  <ListItem
                    key={item.id}
                    secondaryAction={
                      <IconButton
                        edge='end'
                        aria-label='delete-subitem'
                        onClick={() => handleDeleteSubItem(item.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    }
                  >
                    <ListItemText
                      primary={`${item.title} - ${(
                        item.amount || 0
                      ).toLocaleString()}원`}
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
