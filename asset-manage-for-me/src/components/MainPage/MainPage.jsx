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
import CategoryModal from '../CategoryModal/CategoryModal.jsx'; // 추가된 모달 컴포넌트

function MainPage() {
  const [categories, setCategories] = useState([]);
  const [monthlyAssets, setMonthlyAssets] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [totalAsset, setTotalAsset] = useState(0);

  // 모달 관련 상태
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchMonthlyAssetsAll();
    fetchExpenses();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/categories');
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      console.error('카테고리 조회 실패:', error);
    }
  };

  const fetchMonthlyAssetsAll = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/monthly-assets-all');
      const data = await res.json();
      setMonthlyAssets(data);
    } catch (error) {
      console.error('월별 자산 조회 실패:', error);
    }
  };

  const fetchExpenses = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/expenses');
      const data = await res.json();
      setExpenses(data);
    } catch (error) {
      console.error('지출 조회 실패:', error);
    }
  };

  useEffect(() => {
    recalcTotal();
  }, [categories, monthlyAssets, expenses]);

  const recalcTotal = () => {
    let sumAll = 0;
    categories.forEach((cat) => {
      cat.subItems?.forEach((item) => {
        sumAll += item.amount || 0;
      });
    });
    monthlyAssets.forEach((ma) => {
      sumAll += ma.amount || 0;
    });
    setTotalAsset(sumAll);
  };

  const combineByCategory = () => {
    const mapObj = {};
    categories.forEach((cat) => {
      const catName = cat.name;
      if (!mapObj[catName]) {
        mapObj[catName] = [];
      }
      cat.subItems?.forEach((sub) => {
        mapObj[catName].push({ ...sub, source: 'initial' });
      });
    });
    monthlyAssets.forEach((ma) => {
      const catName = ma.category;
      if (!catName) return;
      if (!mapObj[catName]) {
        mapObj[catName] = [];
      }
      mapObj[catName].push({ ...ma, source: 'monthly' });
    });
    return mapObj;
  };

  const mergedData = combineByCategory();

  // 모달 열기
  const handleCategoryClick = (categoryName) => {
    setSelectedCategory(categoryName);
    setSelectedItems(mergedData[categoryName] || []);
    setModalOpen(true);
  };

  // 삭제 기능
  const handleDeleteItem = async (id, source) => {
    try {
      if (source === 'initial') {
        await fetch(`http://localhost:4000/api/assets/${id}`, {
          method: 'DELETE',
        });
      } else if (source === 'monthly') {
        await fetch(`http://localhost:4000/api/monthly-assets/${id}`, {
          method: 'DELETE',
        });
      }
      fetchCategories();
      fetchMonthlyAssetsAll();
      setModalOpen(false);
    } catch (error) {
      console.error('삭제 실패:', error);
    }
  };

  return (
    <Container maxWidth='md' className='main-page-container'>
      <Paper className='total-asset-paper'>
        <Typography variant='h4' align='center' gutterBottom>
          총 자산: {totalAsset.toLocaleString()} 원
        </Typography>
      </Paper>

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
                <Paper
                  className='asset-category-box'
                  onClick={() => handleCategoryClick(catName)}
                  style={{ cursor: 'pointer' }}
                >
                  <Typography variant='subtitle1' className='category-title'>
                    {catName}
                  </Typography>
                  <Typography variant='body1' className='category-amount'>
                    {catSum.toLocaleString()} 원
                  </Typography>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      </Paper>

      <CategoryModal
        open={modalOpen}
        handleClose={() => setModalOpen(false)}
        categoryName={selectedCategory}
        items={selectedItems}
        handleDelete={handleDeleteItem}
      />
    </Container>
  );
}

export default MainPage;
