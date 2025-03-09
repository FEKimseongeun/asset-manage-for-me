const express = require('express');
const cors = require('cors');
const db = require('./db'); // db.js
const { spawn } = require('child_process');
const path = require('path');

const app = express();
const port = 4000;

// 미들웨어 설정
app.use(cors());
app.use(express.json());

// DB 테이블 생성
// db.serialize(() => {
//   db.run(`
//     // CREATE TABLE IF NOT EXISTS monthly_assets (
//     //   id INTEGER PRIMARY KEY AUTOINCREMENT,
//     //   month INTEGER NOT NULL,
//     //   category TEXT,
//     //   title TEXT,
//     //   amount INTEGER DEFAULT 0,
//     //   open_date TEXT,
//     //   end_date TEXT,
//     //   created_at DATETIME DEFAULT CURRENT_TIMESTAMP
//     // )
//   `);
// });

// --- (기존의 네 코드 유지) ---

// 간단한 테스트 라우터
app.get('/', (req, res) => {
  res.send('Hello from Express + SQLite');
});

// 주가 가져오는 함수 정의
function getRecentOpen(stockCode) {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn('python', [
      path.join(__dirname, 'stock_fetcher.py'),
      stockCode,
    ]);

    let result = '';
    pythonProcess.stdout.on('data', (data) => {
      result += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      console.error(`Python error: ${data}`);
      reject(data.toString());
    });

    pythonProcess.on('close', () => {
      try {
        const parsedData = JSON.parse(result);
        resolve(parsedData);
      } catch (error) {
        reject('JSON parsing error');
      }
    });
  });
}

// ** 추가된 주가정보 API (삼성전자 예시) **
app.get('/api/stock-price/:stockCode', async (req, res) => {
  const { stockCode } = req.params;
  try {
    const data = await getRecentOpen(stockCode);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stock price' });
  }
});

// 자산 조회 API
app.get('/api/assets', (req, res) => {
  const sql = 'SELECT * FROM assets';
  db.all(sql, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// 자산 추가 API
app.post('/api/assets', (req, res) => {
  const { category, name, amount, month } = req.body;
  const sql = `
    INSERT INTO assets (category, name, amount, month)
    VALUES (?, ?, ?, ?)
  `;
  db.run(sql, [category, name, amount, month], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, category, name, amount, month });
  });
});

// 자산 수정 API
app.put('/api/assets/:id', (req, res) => {
  const { id } = req.params;
  const { category, name, amount, month } = req.body;
  const sql = `
    UPDATE assets SET category = ?, name = ?, amount = ?, month = ? WHERE id = ?
  `;
  db.run(sql, [category, name, amount, month, id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0)
      return res.status(404).json({ error: '자산이 존재하지 않습니다.' });
    res.json({ success: true });
  });
});

// 자산 삭제 API
app.delete('/api/assets/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM assets WHERE id = ?';
  db.run(sql, id, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0)
      return res.status(404).json({ error: '자산이 존재하지 않습니다.' });
    res.json({ success: true });
  });
});

// 지출 조회 API
app.get('/api/expenses', (req, res) => {
  db.all('SELECT * FROM expenses', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// 지출 추가 API
app.post('/api/expenses', (req, res) => {
  const { category, description, amount, month } = req.body;
  const sql = `
    INSERT INTO expenses (category, description, amount, month)
    VALUES (?, ?, ?, ?)
  `;
  db.run(sql, [category, description, amount, month], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, category, description, amount, month });
  });
});

// 지출 수정 API
app.put('/api/expenses/:id', (req, res) => {
  const { id } = req.params;
  const { category, description, amount, month } = req.body;
  const sql = `
    UPDATE expenses SET category = ?, description = ?, amount = ?, month = ? WHERE id = ?
  `;
  db.run(sql, [category, description, amount, month, id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0)
      return res.status(404).json({ error: '지출 내역이 존재하지 않습니다.' });
    res.json({ success: true });
  });
});

// 지출 삭제 API
app.delete('/api/expenses/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM expenses WHERE id = ?';
  db.run(sql, id, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0)
      return res.status(404).json({ error: '지출 내역이 존재하지 않습니다.' });
    res.json({ success: true });
  });
});

// 카테고리 조회 API
app.get('/api/categories', (req, res) => {
  db.all('SELECT * FROM categories', (err, categories) => {
    if (err) return res.status(500).json({ error: err.message });
    db.all('SELECT * FROM assets', (err2, assets) => {
      if (err2) return res.status(500).json({ error: err2.message });
      const result = categories.map((cat) => ({
        ...cat,
        subItems: assets.filter((a) => a.category_id === cat.id),
      }));
      res.json(result);
    });
  });
});

// 카테고리 추가 API
app.post('/api/categories', (req, res) => {
  const { name } = req.body;
  db.run('INSERT INTO categories (name) VALUES (?)', [name], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, name });
  });
});

// 월별 자산 추가 API
app.post('/api/monthly-assets', (req, res) => {
  const { month, category, title, amount, open_date, end_date } = req.body;
  const sql = `
    INSERT INTO monthly_assets (month, category, title, amount, open_date, end_date)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  db.run(
    sql,
    [month, category, title, amount || 0, open_date, end_date],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({
        id: this.lastID,
        month,
        category,
        title,
        amount,
        open_date,
        end_date,
      });
    }
  );
});

// 월별 자산 삭제 API
app.delete('/api/monthly-assets/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM monthly_assets WHERE id = ?', [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0)
      return res.status(404).json({ error: '해당 항목 없음' });
    res.json({ success: true });
  });
});

// 서버 구동
app.listen(port, () => {
  console.log(`서버가 http://localhost:${port} 에서 실행 중입니다.`);
});
