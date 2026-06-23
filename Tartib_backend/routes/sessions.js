import { Router } from 'express';
import { getDB } from '../db/database.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

// GET /api/sessions — bugungi va umumiy statistika
router.get('/', (req, res) => {
  const db = getDB();
  const today = new Date().toISOString().split('T')[0];

  const todaySessions = db.prepare(`
    SELECT COUNT(*) AS count, COALESCE(SUM(duration_min), 0) AS total_min
    FROM pomodoro_sessions
    WHERE user_id = ? AND mode = 'focus' AND date(completed_at) = ?
  `).get(req.userId, today);

  const allTime = db.prepare(`
    SELECT COUNT(*) AS count, COALESCE(SUM(duration_min), 0) AS total_min
    FROM pomodoro_sessions
    WHERE user_id = ? AND mode = 'focus'
  `).get(req.userId);

  const recent = db.prepare(`
    SELECT * FROM pomodoro_sessions
    WHERE user_id = ?
    ORDER BY completed_at DESC
    LIMIT 10
  `).all(req.userId);

  res.json({
    today: { sessions: todaySessions.count, minutes: todaySessions.total_min },
    allTime: { sessions: allTime.count, minutes: allTime.total_min },
    recent,
  });
});

// POST /api/sessions — seans yakunlanganda saqlash
router.post('/', (req, res) => {
  const { mode, duration_min } = req.body;

  if (!mode || !duration_min) {
    return res.status(400).json({ error: 'Mode va davomiyligi majburiy.' });
  }
  const validModes = ['focus', 'shortBreak', 'longBreak'];
  if (!validModes.includes(mode)) {
    return res.status(400).json({ error: 'Mode noto\'g\'ri. focus | shortBreak | longBreak.' });
  }

  const db = getDB();
  const result = db.prepare(
    'INSERT INTO pomodoro_sessions (user_id, mode, duration_min) VALUES (?, ?, ?)'
  ).run(req.userId, mode, parseInt(duration_min));

  // Focus seanslarida XP qo'shamiz (har 25 daqiqa = 10 XP)
  if (mode === 'focus') {
    db.prepare('UPDATE users SET xp = xp + 10 WHERE id = ?').run(req.userId);
    const user = db.prepare('SELECT xp, level FROM users WHERE id = ?').get(req.userId);
    const newLevel = Math.floor(user.xp / 1500) + 1;
    if (newLevel !== user.level) {
      db.prepare('UPDATE users SET level = ? WHERE id = ?').run(newLevel, req.userId);
    }
  }

  const session = db.prepare('SELECT * FROM pomodoro_sessions WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(session);
});

// DELETE /api/sessions — bugungi seanslarni tozalash
router.delete('/', (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const db = getDB();
  const result = db.prepare(
    "DELETE FROM pomodoro_sessions WHERE user_id = ? AND date(completed_at) = ?"
  ).run(req.userId, today);
  res.json({ message: `${result.changes} ta seans o'chirildi.` });
});

export default router;
