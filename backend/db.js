// backend/db.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// database.db 파일의 절대 경로 가져오기
const dbPath = path.resolve(__dirname, 'database.db');

// SQLite DB 연결
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('데이터베이스 연결 실패:', err);
  } else {
    console.log('SQLite 데이터베이스에 연결되었습니다.');
  }
});

module.exports = db;
