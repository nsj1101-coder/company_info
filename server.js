const express = require('express');
const path = require('path');
const Database = require('better-sqlite3');

const PORT = process.env.PORT || 3001;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'wlq3593545@';
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'submissions.db');

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.exec(`
  CREATE TABLE IF NOT EXISTS submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    project_type TEXT NOT NULL,
    description TEXT NOT NULL,
    ip TEXT,
    user_agent TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now', '+9 hours'))
  )
`);

const insertStmt = db.prepare(`
  INSERT INTO submissions (name, phone, email, project_type, description, ip, user_agent)
  VALUES (@name, @phone, @email, @project_type, @description, @ip, @user_agent)
`);
const listStmt = db.prepare(`SELECT * FROM submissions ORDER BY id DESC LIMIT 500`);
const deleteStmt = db.prepare(`DELETE FROM submissions WHERE id = ?`);

const app = express();
app.set('trust proxy', true);
app.use(express.json({ limit: '64kb' }));
app.use(express.urlencoded({ extended: true, limit: '64kb' }));

const sanitize = (s, max = 2000) => String(s ?? '').trim().slice(0, max);

app.post('/api/submit', (req, res) => {
  const name = sanitize(req.body.name, 100);
  const phone = sanitize(req.body.phone, 50);
  const email = sanitize(req.body.email, 200);
  const project_type = sanitize(req.body.project_type, 100);
  const description = sanitize(req.body.description, 5000);

  if (!name || !phone || !email || !project_type || !description) {
    return res.status(400).json({ ok: false, error: '필수 항목이 누락되었습니다.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ ok: false, error: '이메일 형식이 올바르지 않습니다.' });
  }

  try {
    const result = insertStmt.run({
      name, phone, email, project_type, description,
      ip: req.ip || '',
      user_agent: sanitize(req.get('user-agent') || '', 500),
    });
    return res.json({ ok: true, id: result.lastInsertRowid });
  } catch (err) {
    console.error('insert error', err);
    return res.status(500).json({ ok: false, error: '저장 중 오류가 발생했습니다.' });
  }
});

const requireAuth = (req, res, next) => {
  const pwd = req.get('x-admin-password') || req.query.password;
  if (pwd !== ADMIN_PASSWORD) {
    return res.status(401).json({ ok: false, error: '인증 실패' });
  }
  next();
};

app.get('/api/submissions', requireAuth, (req, res) => {
  const rows = listStmt.all();
  res.json({ ok: true, submissions: rows });
});

app.delete('/api/submissions/:id', requireAuth, (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ ok: false });
  deleteStmt.run(id);
  res.json({ ok: true });
});

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use((req, res) => res.status(404).json({ ok: false, error: 'NOT_FOUND' }));

app.listen(PORT, () => {
  console.log(`MaxImpact API listening on http://localhost:${PORT}`);
});
