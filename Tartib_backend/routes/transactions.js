import { Router } from 'express';
import { getDB } from '../db/database.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

// GET /api/transactions
router.get('/', (req, res) => {
  const db = getDB();
  const txs = db.prepare(
    'SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC, created_at DESC'
  ).all(req.userId);
  res.json(txs);
});

// GET /api/transactions/summary — jami va kutilayotgan daromad
router.get('/summary', (req, res) => {
  const db = getDB();
  const earned = db.prepare(
    `SELECT COALESCE(SUM(amount), 0) AS total
     FROM transactions WHERE user_id = ? AND status = 'bajarildi'`
  ).get(req.userId);

  const pending = db.prepare(
    `SELECT COALESCE(SUM(amount), 0) AS total
     FROM transactions WHERE user_id = ? AND status = 'kutilmoqda'`
  ).get(req.userId);

  res.json({ earned: earned.total, pending: pending.total });
});

// POST /api/transactions
router.post('/', (req, res) => {
  const { source, amount, status = 'kutilmoqda', date } = req.body;

  if (!source?.trim() || !amount) {
    return res.status(400).json({ error: 'Manba va miqdor majburiy.' });
  }
  if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
    return res.status(400).json({ error: 'Miqdor musbat son bo\'lishi kerak.' });
  }

  const txDate = date || new Date().toISOString().split('T')[0];
  const db = getDB();
  const result = db.prepare(
    'INSERT INTO transactions (user_id, source, amount, date, status) VALUES (?, ?, ?, ?, ?)'
  ).run(req.userId, source.trim(), parseFloat(amount), txDate, status);

  const tx = db.prepare('SELECT * FROM transactions WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(tx);
});

// PUT /api/transactions/:id
router.put('/:id', (req, res) => {
  const db = getDB();
  const tx = db.prepare('SELECT * FROM transactions WHERE id = ? AND user_id = ?')
    .get(req.params.id, req.userId);

  if (!tx) return res.status(404).json({ error: 'Tranzaksiya topilmadi.' });

  const { source, amount, status, date } = req.body;
  db.prepare(`
    UPDATE transactions
    SET source = COALESCE(?, source),
        amount = COALESCE(?, amount),
        status = COALESCE(?, status),
        date   = COALESCE(?, date)
    WHERE id = ? AND user_id = ?
  `).run(
    source ?? null,
    amount ? parseFloat(amount) : null,
    status ?? null,
    date ?? null,
    req.params.id,
    req.userId
  );

  const fresh = db.prepare('SELECT * FROM transactions WHERE id = ?').get(req.params.id);
  res.json(fresh);
});

// DELETE /api/transactions/:id
router.delete('/:id', (req, res) => {
  const db = getDB();
  const result = db.prepare('DELETE FROM transactions WHERE id = ? AND user_id = ?')
    .run(req.params.id, req.userId);

  if (result.changes === 0) return res.status(404).json({ error: 'Tranzaksiya topilmadi.' });
  res.json({ message: 'Tranzaksiya o\'chirildi.' });
});

export default router;
