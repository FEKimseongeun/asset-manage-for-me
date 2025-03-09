# [나만의 가계부] Custom Asset Management Web - 오로지 김성은을 위한;;

안녕하세요! 이 저장소는 **나만의 가계부 웹**을 구현하기 위한 프로젝트입니다.  
React(프론트엔드)와 Node.js + Express(백엔드), 그리고 SQLite DB를 사용하여, **자산 현황 관리**와 **지출 입력**을 간편히 할 수 있도록 만들었습니다.

## ✨ 주요 기능 (Features)

- **초기 자산현황 입력**  
  \- 카테고리(월급, 국내주식, 예금, 적금 등)를 생성하고, 초기 금액 및 하위 항목을 등록  
- **매월 자산/지출 관리**  
  \- 월별로 자산/지출 내역을 추가, 삭제, 수정  
- **실시간 합산**  
  \- 메인페이지에서 전체 자산 합, 카테고리별 합계를 한눈에 확인  
- **주식 시세 연동**  
  \- 국내/해외 주식 카테고리에 종목을 추가하면, API를 통해 간단한 현재가(시장가) 확인 (예시)

## ⚙️ 기술 스택 (Tech Stack)

- **Frontend**: React (CRA or Vite), Material-UI  
- **Backend**: Node.js + Express  
- **Database**: SQLite  
- **Deployment**: GitHub Pages (프론트), Render / Heroku / AWS 등(백엔드)

## 📂 디렉토리 구조 (Directory Structure)

```
my-asset-management
├─ frontend
│   ├─ src
│   │   ├─ components
│   │   │   ├─ MainPage           # 메인페이지
│   │   │   │   ├─ MainPage.jsx
│   │   │   │   └─ MainPage.css
│   │   │   ├─ InitialAssetPage   # 초기 자산현황 입력
│   │   │   │   ├─ InitialAssetPage.jsx
│   │   │   │   └─ InitialAssetPage.css
│   │   │   └─ ...                # 기타 컴포넌트
│   │   ├─ App.js
│   │   ├─ index.js
│   │   └─ ...
│   ├─ package.json
│   └─ ...
├─ backend
│   ├─ index.js       # Express 서버 진입점
│   ├─ db.js          # SQLite DB 연결 설정
│   ├─ database.db    # SQLite DB 파일
│   ├─ routes         # 필요한 라우트 분리 가능 (예: categories.js, expenses.js)
│   └─ package.json
└─ README.md          # (현재 문서)
```

## 🚀 빠른 시작 (Getting Started)

1. 레포지토리 클론
```
git clone https://github.com/yourusername/my-asset-management.git
```

2. 백엔드 설치 & 실행
```
cd backend
npm install
npm start
```

3. 프론트엔드 설치 & 실행
```
cd ../asset-manage-for-me
npm install
npm start
```
* 브라우저에서 http://localhost:3000 접속

### 기본 사용 흐름
- 초기자산입력 페이지에서 카테고리, 항목, 금액 입력
- 메인페이지에서 전체 자산현황과 하위항목 목록, 지출 내역 확인
- 필요 시 매월자산입력, 지출입력 페이지로 월별 금액 관리
- 증권사API 연동으로 주식 관리
- AI 를 활용하여 수입 지출 데이터 관리 및 분석

## 📑 추가 참고
* 테이블 구조: categories, assets, expenses 등
* 주식 시세: Alpha Vantage, Finnhub 등 외부 API 연동 (추가 개발 필요)
* 배포: 프론트는 GitHub Pages, 백엔드는 Render/AWS 등 호스팅

