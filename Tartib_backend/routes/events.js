import { Router } from 'express';
import { getDB } from '../db/database.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

// GET /api/events?month=2026-06 — oylik eventlar
router.get('/', (req, res) => {
  const db = getDB();
  const { month } = req.query;

  let events;
  if (month) {
    events = db.prepare(
      "SELECT * FROM calendar_events WHERE user_id = ? AND strftime('%Y-%m', date) = ? ORDER BY date, time"
    ).all(req.userId, month);
  } else {
    events = db.prepare(
      'SELECT * FROM calendar_events WHERE user_id = ? ORDER BY date DESC, time'
    ).all(req.userId);
  }

  res.json(events);
});

// GET /api/events/:date — kunlik eventlar
router.get('/:date', (req, res) => {
  const db = getDB();
  const events = db.prepare(
    'SELECT * FROM calendar_events WHERE user_id = ? AND date = ? ORDER BY time'
  ).all(req.userId, req.params.date);
  res.json(events);
});

// POST /api/events
router.post('/', (req, res) => {
  const { date, time = '', title } = req.body;

  if (!date || !title?.trim()) {
    return res.status(400).json({ error: 'Sana va sarlavha majburiy.' });
  }

  const db = getDB();
  const result = db.prepare(
    'INSERT INTO calendar_events (user_id, date, time, title) VALUES (?, ?, ?, ?)'
  ).run(req.userId, date, time, title.trim());

  const event = db.prepare('SELECT * FROM calendar_events WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(event);
});

// PUT /api/events/:id
router.put('/:id', (req, res) => {
  const db = getDB();
  const ev = db.prepare('SELECT * FROM calendar_events WHERE id = ? AND user_id = ?')
    .get(req.params.id, req.userId);

  if (!ev) return res.status(404).json({ error: 'Event topilmadi.' });

  const { date, time, title } = req.body;
  db.prepare(`
    UPDATE calendar_events
    SET date  = COALESCE(?, date),
        time  = COALESCE(?, time),
        title = COALESCE(?, title)
    WHERE id = ? AND user_id = ?
  `).run(date ?? null, time ?? null, title ?? null, req.params.id, req.userId);

  const fresh = db.prepare('SELECT * FROM calendar_events WHERE id = ?').get(req.params.id);
  res.json(fresh);
});

// DELETE /api/events/:id
router.delete('/:id', (req, res) => {
  const db = getDB();
  const result = db.prepare('DELETE FROM calendar_events WHERE id = ? AND user_id = ?')
    .run(req.params.id, req.userId);

  if (result.changes === 0) return res.status(404).json({ error: 'Event topilmadi.' });
  res.json({ message: 'Event o\'chirildi.' });
});

export default router;
