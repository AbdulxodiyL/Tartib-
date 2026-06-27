import { Router } from 'express';
import { getDB } from '../db/database.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

// GET /api/settings
router.get('/', async (req, res) => {
  try {
    const db = getDB();
    let result = await db.query('SELECT * FROM user_settings WHERE user_id = $1', [req.userId]);

    if (result.rows.length === 0) {
      await db.query('INSERT INTO user_settings (user_id) VALUES ($1)', [req.userId]);
      result = await db.query('SELECT * FROM user_settings WHERE user_id = $1', [req.userId]);
    }

    const s = result.rows[0];
    res.json({
      notifications: s.notifications,
      soundAlerts: s.sound_alerts,
      autoBreak: s.auto_break,
      focusMode: s.focus_mode,
      focusLength: s.focus_length,
      shortBreakLength: s.short_break_length,
      longBreakLength: s.long_break_length,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/settings
router.put('/', async (req, res) => {
  const { notifications, soundAlerts, autoBreak, focusMode, focusLength, shortBreakLength, longBreakLength } = req.body;

  try {
    const db = getDB();
    const { rows } = await db.query(`
      UPDATE user_settings
      SET notifications      = COALESCE($1, notifications),
          sound_alerts       = COALESCE($2, sound_alerts),
          auto_break         = COALESCE($3, auto_break),
          focus_mode         = COALESCE($4, focus_mode),
          focus_length       = COALESCE($5, focus_length),
          short_break_length = COALESCE($6, short_break_length),
          long_break_length  = COALESCE($7, long_break_length)
      WHERE user_id = $8
      RETURNING *
    `, [
      notifications !== undefined ? notifications : null,
      soundAlerts !== undefined ? soundAlerts : null,
      autoBreak !== undefined ? autoBreak : null,
      focusMode !== undefined ? focusMode : null,
      focusLength ?? null,
      shortBreakLength ?? null,
      longBreakLength ?? null,
      req.userId,
    ]);

    const s = rows[0];
    res.json({
      notifications: s.notifications,
      soundAlerts: s.sound_alerts,
      autoBreak: s.auto_break,
      focusMode: s.focus_mode,
      focusLength: s.focus_length,
      shortBreakLength: s.short_break_length,
      longBreakLength: s.long_break_length,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
