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

// GET /api/transactions/summary  — kirim, chiqim, qolgan
router.get('/summary', async (req, res) => {
  try {
    const db = getDB();
    const { rows } = await db.query(`
      SELECT
        COALESCE(SUM(CASE WHEN type = 'kirim'  THEN amount ELSE 0 END), 0) AS kirim,
        COALESCE(SUM(CASE WHEN type = 'chiqim' THEN amount ELSE 0 END), 0) AS chiqim
      FROM transactions
      WHERE user_id = $1 AND status = 'bajarildi'
    `, [req.userId]);

    const pending = await db.query(`
      SELECT COALESCE(SUM(amount), 0) AS total
      FROM transactions
      WHERE user_id = $1 AND status = 'kutilmoqda'
    `, [req.userId]);

    const kirim  = parseFloat(rows[0].kirim);
    const chiqim = parseFloat(rows[0].chiqim);

    res.json({
      kirim,
      chiqim,
      qolgan:  kirim - chiqim,
      pending: parseFloat(pending.rows[0].total),
      // eski nom — backward compat
      earned:  kirim,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/transactions
router.post('/', async (req, res) => {
  const { source, amount, status = 'bajarildi', date, type = 'kirim' } = req.body;

  if (!source?.trim() || !amount)
    return res.status(400).json({ error: 'Manba va miqdor majburiy.' });
  if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0)
    return res.status(400).json({ error: "Miqdor musbat son bo'lishi kerak." });

  try {
    const txDate = date || new Date().toISOString().split('T')[0];
    const db = getDB();
    const { rows } = await db.query(
      'INSERT INTO transactions (user_id, source, amount, date, type, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [req.userId, source.trim(), parseFloat(amount), txDate, type, status]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/transactions/:id
router.delete('/:id', async (req, res) => {
  try {
    const db = getDB();
    const result = await db.query(
      'DELETE FROM transactions WHERE id = $1 AND user_id = $2',
      [req.params.id, req.userId]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Tranzaksiya topilmadi.' });
    res.json({ message: "O'chirildi." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
