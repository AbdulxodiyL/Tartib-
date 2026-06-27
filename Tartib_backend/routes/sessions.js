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

    const [todayRes, allTimeRes, recentRes, weeklyRes] = await Promise.all([
      db.query(`
        SELECT COUNT(*) AS count, COALESCE(SUM(duration_min), 0) AS total_min
        FROM pomodoro_sessions
        WHERE user_id = $1 AND mode = 'focus' AND completed_at::date = $2::date
      `, [req.userId, today]),

      db.query(`
        SELECT COUNT(*) AS count, COALESCE(SUM(duration_min), 0) AS total_min
        FROM pomodoro_sessions
        WHERE user_id = $1 AND mode = 'focus'
      `, [req.userId]),

      db.query(`
        SELECT * FROM pomodoro_sessions
        WHERE user_id = $1
        ORDER BY completed_at DESC LIMIT 10
      `, [req.userId]),

      db.query(`
        SELECT completed_at::date AS day, COALESCE(SUM(duration_min), 0) AS minutes
        FROM pomodoro_sessions
        WHERE user_id = $1 AND mode = 'focus'
          AND completed_at >= NOW() - INTERVAL '7 days'
        GROUP BY day ORDER BY day ASC
      `, [req.userId]),
    ]);

    // Streak: ketma-ket kunlar (bugundan orqaga)
    const streakRes = await db.query(`
      SELECT DISTINCT completed_at::date AS day
      FROM pomodoro_sessions
      WHERE user_id = $1 AND mode = 'focus'
      ORDER BY day DESC
      LIMIT 365
    `, [req.userId]);

    let streak = 0;
    const days = streakRes.rows.map(r => r.day.toISOString().split('T')[0]);
    let check = today;
    for (let i = 0; i < days.length; i++) {
      if (days[i] === check) {
        streak++;
        const d = new Date(check);
        d.setDate(d.getDate() - 1);
        check = d.toISOString().split('T')[0];
      } else break;
    }

    // Haftalik 7 kun — bo'sh kunlarni ham to'ldirish
    const weekly = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const found = weeklyRes.rows.find(r => r.day.toISOString().split('T')[0] === dateStr);
      weekly.push({ date: dateStr, minutes: found ? parseInt(found.minutes) : 0 });
    }

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
      weekly,
      streak,
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
