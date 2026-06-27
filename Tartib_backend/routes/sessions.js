import { Router } from 'express';
import { getDB } from '../db/database.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

// GET /api/sessions
router.get('/', async (req, res) => {
  try {
    const db = getDB();
    const today = new Date().toISOString().split('T')[0];

    const todayRes = await db.query(`
      SELECT COUNT(*) AS count, COALESCE(SUM(duration_min), 0) AS total_min
      FROM pomodoro_sessions
      WHERE user_id = $1 AND mode = 'focus' AND completed_at::date = $2::date
    `, [req.userId, today]);

    const allTimeRes = await db.query(`
      SELECT COUNT(*) AS count, COALESCE(SUM(duration_min), 0) AS total_min
      FROM pomodoro_sessions
      WHERE user_id = $1 AND mode = 'focus'
    `, [req.userId]);

    const recentRes = await db.query(`
      SELECT * FROM pomodoro_sessions
      WHERE user_id = $1
      ORDER BY completed_at DESC
      LIMIT 10
    `, [req.userId]);

    res.json({
      today: {
        sessions: parseInt(todayRes.rows[0].count),
        minutes: parseInt(todayRes.rows[0].total_min),
      },
      allTime: {
        sessions: parseInt(allTimeRes.rows[0].count),
        minutes: parseInt(allTimeRes.rows[0].total_min),
      },
      recent: recentRes.rows,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/sessions
router.post('/', async (req, res) => {
  const { mode, duration_min } = req.body;

  if (!mode || !duration_min)
    return res.status(400).json({ error: 'Mode va davomiyligi majburiy.' });

  const validModes = ['focus', 'shortBreak', 'longBreak'];
  if (!validModes.includes(mode))
    return res.status(400).json({ error: "Mode noto'g'ri. focus | shortBreak | longBreak." });

  try {
    const db = getDB();
    const { rows } = await db.query(
      'INSERT INTO pomodoro_sessions (user_id, mode, duration_min) VALUES ($1, $2, $3) RETURNING *',
      [req.userId, mode, parseInt(duration_min)]
    );

    if (mode === 'focus') {
      const userRes = await db.query(
        'UPDATE users SET xp = xp + 10 WHERE id = $1 RETURNING xp, level',
        [req.userId]
      );
      const { xp, level } = userRes.rows[0];
      const newLevel = Math.floor(xp / 1500) + 1;
      if (newLevel !== level) {
        await db.query('UPDATE users SET level = $1 WHERE id = $2', [newLevel, req.userId]);
      }
    }

    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/sessions
router.delete('/', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const db = getDB();
    const result = await db.query(
      'DELETE FROM pomodoro_sessions WHERE user_id = $1 AND completed_at::date = $2::date',
      [req.userId, today]
    );
    res.json({ message: `${result.rowCount} ta seans o'chirildi.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
