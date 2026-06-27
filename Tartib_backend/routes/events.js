import { Router } from 'express';
import { getDB } from '../db/database.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

// GET /api/events?month=2026-06
router.get('/', async (req, res) => {
  try {
    const db = getDB();
    const { month } = req.query;

    let result;
    if (month) {
      result = await db.query(
        "SELECT * FROM calendar_events WHERE user_id = $1 AND TO_CHAR(date::date, 'YYYY-MM') = $2 ORDER BY date, time",
        [req.userId, month]
      );
    } else {
      result = await db.query(
        'SELECT * FROM calendar_events WHERE user_id = $1 ORDER BY date DESC, time',
        [req.userId]
      );
    }

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/events/:date
router.get('/:date', async (req, res) => {
  try {
    const db = getDB();
    const { rows } = await db.query(
      'SELECT * FROM calendar_events WHERE user_id = $1 AND date = $2 ORDER BY time',
      [req.userId, req.params.date]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/events
router.post('/', async (req, res) => {
  const { date, time = '', title } = req.body;

  if (!date || !title?.trim())
    return res.status(400).json({ error: 'Sana va sarlavha majburiy.' });

  try {
    const db = getDB();
    const { rows } = await db.query(
      'INSERT INTO calendar_events (user_id, date, time, title) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.userId, date, time, title.trim()]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/events/:id
router.put('/:id', async (req, res) => {
  try {
    const db = getDB();
    const check = await db.query('SELECT id FROM calendar_events WHERE id = $1 AND user_id = $2', [req.params.id, req.userId]);
    if (check.rows.length === 0) return res.status(404).json({ error: 'Event topilmadi.' });

    const { date, time, title } = req.body;
    const { rows } = await db.query(`
      UPDATE calendar_events
      SET date  = COALESCE($1, date),
          time  = COALESCE($2, time),
          title = COALESCE($3, title)
      WHERE id = $4 AND user_id = $5
      RETURNING *
    `, [date ?? null, time ?? null, title ?? null, req.params.id, req.userId]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/events/:id
router.delete('/:id', async (req, res) => {
  try {
    const db = getDB();
    const result = await db.query('DELETE FROM calendar_events WHERE id = $1 AND user_id = $2', [req.params.id, req.userId]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Event topilmadi.' });
    res.json({ message: "Event o'chirildi." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
