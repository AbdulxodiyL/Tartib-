import { Router } from 'express';
import { getDB } from '../db/database.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

// GET /api/transactions
router.get('/', async (req, res) => {
  try {
    const db = getDB();
    const { rows } = await db.query(
      'SELECT * FROM transactions WHERE user_id = $1 ORDER BY date DESC, created_at DESC',
      [req.userId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/transactions/summary
router.get('/summary', async (req, res) => {
  try {
    const db = getDB();
    const earned = await db.query(
      "SELECT COALESCE(SUM(amount), 0) AS total FROM transactions WHERE user_id = $1 AND status = 'bajarildi'",
      [req.userId]
    );
    const pending = await db.query(
      "SELECT COALESCE(SUM(amount), 0) AS total FROM transactions WHERE user_id = $1 AND status = 'kutilmoqda'",
      [req.userId]
    );
    res.json({ earned: parseFloat(earned.rows[0].total), pending: parseFloat(pending.rows[0].total) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/transactions
router.post('/', async (req, res) => {
  const { source, amount, status = 'kutilmoqda', date } = req.body;

  if (!source?.trim() || !amount)
    return res.status(400).json({ error: 'Manba va miqdor majburiy.' });
  if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0)
    return res.status(400).json({ error: "Miqdor musbat son bo'lishi kerak." });

  try {
    const txDate = date || new Date().toISOString().split('T')[0];
    const db = getDB();
    const { rows } = await db.query(
      'INSERT INTO transactions (user_id, source, amount, date, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [req.userId, source.trim(), parseFloat(amount), txDate, status]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/transactions/:id
router.put('/:id', async (req, res) => {
  try {
    const db = getDB();
    const check = await db.query('SELECT id FROM transactions WHERE id = $1 AND user_id = $2', [req.params.id, req.userId]);
    if (check.rows.length === 0) return res.status(404).json({ error: 'Tranzaksiya topilmadi.' });

    const { source, amount, status, date } = req.body;
    const { rows } = await db.query(`
      UPDATE transactions
      SET source = COALESCE($1, source),
          amount = COALESCE($2, amount),
          status = COALESCE($3, status),
          date   = COALESCE($4, date)
      WHERE id = $5 AND user_id = $6
      RETURNING *
    `, [source ?? null, amount ? parseFloat(amount) : null, status ?? null, date ?? null, req.params.id, req.userId]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/transactions/:id
router.delete('/:id', async (req, res) => {
  try {
    const db = getDB();
    const result = await db.query('DELETE FROM transactions WHERE id = $1 AND user_id = $2', [req.params.id, req.userId]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Tranzaksiya topilmadi.' });
    res.json({ message: "Tranzaksiya o'chirildi." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
