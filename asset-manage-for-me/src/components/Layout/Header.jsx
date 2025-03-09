import React from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import './Header.css'; // 추가적인 CSS를 커스터마이징한다면

function Header() {
  return (
    <AppBar position='static' className='header-appbar'>
      <Toolbar className='header-toolbar'>
        <Typography variant='h6' component='div' sx={{ flexGrow: 1 }}>
          나만의 가계부
        </Typography>

        {/* 예: 라우팅이 연결되어 있다면 Link로 네비게이션 구현 */}
        <Button color='inherit' component={Link} to='/'>
          메인페이지
        </Button>
        <Button color='inherit' component={Link} to='/initial-asset'>
          초기자산입력
        </Button>
        <Button color='inherit' component={Link} to='/monthly-asset'>
          매월현황입력
        </Button>
        <Button color='inherit' component={Link} to='/expenses'>
          지출입력
        </Button>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
