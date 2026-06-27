import { Router } from 'express';
import { getDB } from '../db/database.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

// GET /api/habits
router.get('/', async (req, res) => {
  try {
    const db = getDB();
    const today = new Date().toISOString().split('T')[0];

    const { rows: habits } = await db.query(
      'SELECT * FROM habits WHERE user_id = $1 ORDER BY created_at ASC',
      [req.userId]
    );

    const result = await Promise.all(habits.map(async (habit) => {
      // Last 7 days checkins
      const { rows: checkins } = await db.query(
        `SELECT date FROM habit_checkins WHERE habit_id = $1 AND user_id = $2
         AND date >= (CURRENT_DATE - INTERVAL '6 days')::text
         ORDER BY date ASC`,
        [habit.id, req.userId]
      );

      // Streak
      const { rows: allDays } = await db.query(
        `SELECT date FROM habit_checkins WHERE habit_id = $1 AND user_id = $2
         ORDER BY date DESC LIMIT 365`,
        [habit.id, req.userId]
      );

      let streak = 0;
      let check = today;
      for (const row of allDays) {
        if (row.date === check) {
          streak++;
          const d = new Date(check);
          d.setDate(d.getDate() - 1);
          check = d.toISOString().split('T')[0];
        } else break;
      }

      const doneToday = checkins.some(c => c.date === today);

      // Build 7-day grid
      const week = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        week.push({ date: dateStr, done: checkins.some(c => c.date === dateStr) });
      }

      return { ...habit, doneToday, streak, week };
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/habits
router.post('/', async (req, res) => {
  const { name, emoji = '⭐', color = '#6366f1' } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'Nom kiritilishi shart' });
  try {
    const db = getDB();
    const { rows } = await db.query(
      'INSERT INTO habits (user_id, name, emoji, color) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.userId, name.trim(), emoji, color]
    );
    res.status(201).json({ ...rows[0], doneToday: false, streak: 0, week: [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/habits/:id
router.delete('/:id', async (req, res) => {
  try {
    const db = getDB();
    await db.query('DELETE FROM habits WHERE id = $1 AND user_id = $2', [req.params.id, req.userId]);
    res.json({ message: "O'chirildi" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/habits/:id/checkin — bugungi belgilash toggle
router.post('/:id/checkin', async (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  try {
    const db = getDB();
    const existing = await db.query(
      'SELECT id FROM habit_checkins WHERE habit_id = $1 AND user_id = $2 AND date = $3',
      [req.params.id, req.userId, today]
    );
    if (existing.rows.length > 0) {
      await db.query('DELETE FROM habit_checkins WHERE habit_id = $1 AND user_id = $2 AND date = $3',
        [req.params.id, req.userId, today]);
      return res.json({ doneToday: false });
    }
    await db.query(
      'INSERT INTO habit_checkins (habit_id, user_id, date) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
      [req.params.id, req.userId, today]
    );
    // XP
    await db.query('UPDATE users SET xp = xp + 5 WHERE id = $1', [req.userId]);
    res.json({ doneToday: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
