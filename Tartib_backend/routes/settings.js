import { Router } from 'express';
import { getDB } from '../db/database.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

// GET /api/settings
router.get('/', (req, res) => {
  const db = getDB();
  let settings = db.prepare('SELECT * FROM user_settings WHERE user_id = ?').get(req.userId);

  if (!settings) {
    db.prepare('INSERT INTO user_settings (user_id) VALUES (?)').run(req.userId);
    settings = db.prepare('SELECT * FROM user_settings WHERE user_id = ?').get(req.userId);
  }

  res.json({
    notifications: Boolean(settings.notifications),
    soundAlerts: Boolean(settings.sound_alerts),
    autoBreak: Boolean(settings.auto_break),
    focusMode: Boolean(settings.focus_mode),
    focusLength: settings.focus_length,
    shortBreakLength: settings.short_break_length,
    longBreakLength: settings.long_break_length,
  });
});

// PUT /api/settings
router.put('/', (req, res) => {
  const {
    notifications,
    soundAlerts,
    autoBreak,
    focusMode,
    focusLength,
    shortBreakLength,
    longBreakLength,
  } = req.body;

  const db = getDB();
  db.prepare(`
    UPDATE user_settings
    SET notifications      = COALESCE(?, notifications),
        sound_alerts       = COALESCE(?, sound_alerts),
        auto_break         = COALESCE(?, auto_break),
        focus_mode         = COALESCE(?, focus_mode),
        focus_length       = COALESCE(?, focus_length),
        short_break_length = COALESCE(?, short_break_length),
        long_break_length  = COALESCE(?, long_break_length)
    WHERE user_id = ?
  `).run(
    notifications !== undefined ? (notifications ? 1 : 0) : null,
    soundAlerts !== undefined ? (soundAlerts ? 1 : 0) : null,
    autoBreak !== undefined ? (autoBreak ? 1 : 0) : null,
    focusMode !== undefined ? (focusMode ? 1 : 0) : null,
    focusLength ?? null,
    shortBreakLength ?? null,
    longBreakLength ?? null,
    req.userId
  );

  const s = db.prepare('SELECT * FROM user_settings WHERE user_id = ?').get(req.userId);
  res.json({
    notifications: Boolean(s.notifications),
    soundAlerts: Boolean(s.sound_alerts),
    autoBreak: Boolean(s.auto_break),
    focusMode: Boolean(s.focus_mode),
    focusLength: s.focus_length,
    shortBreakLength: s.short_break_length,
    longBreakLength: s.long_break_length,
  });
});

export default router;
