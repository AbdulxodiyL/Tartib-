import { Router } from 'express';
import { getDB } from '../db/database.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

// GET /api/tasks
router.get('/', async (req, res) => {
  try {
    const db = getDB();
    const { rows } = await db.query(
      'SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at DESC',
      [req.userId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/tasks
router.post('/', async (req, res) => {
  const { text, category = 'Boshqa', due_date, priority = 'medium', start_time, end_time } = req.body;
  if (!text?.trim())
    return res.status(400).json({ error: "Vazifa matni bo'sh bo'lmasligi kerak." });

  try {
    const db = getDB();
    const { rows } = await db.query(
      'INSERT INTO tasks (user_id, text, category, due_date, priority, start_time, end_time) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [req.userId, text.trim(), category, due_date || null, priority, start_time || null, end_time || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/tasks/:id
router.put('/:id', async (req, res) => {
  try {
    const db = getDB();
    const check = await db.query('SELECT * FROM tasks WHERE id = $1 AND user_id = $2', [req.params.id, req.userId]);
    if (check.rows.length === 0) return res.status(404).json({ error: 'Task topilmadi.' });

    const { text, category, due_date, completed, priority, start_time, end_time } = req.body;
    const { rows } = await db.query(`
      UPDATE tasks
      SET text       = COALESCE($1, text),
          category   = COALESCE($2, category),
          due_date   = COALESCE($3, due_date),
          completed  = COALESCE($4, completed),
          priority   = COALESCE($5, priority),
          start_time = COALESCE($6, start_time),
          end_time   = COALESCE($7, end_time)
      WHERE id = $8 AND user_id = $9
      RETURNING *
    `, [
      text ?? null,
      category ?? null,
      due_date ?? null,
      completed !== undefined ? completed : null,
      priority ?? null,
      start_time ?? null,
      end_time ?? null,
      req.params.id,
      req.userId,
    ]);

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/tasks/:id
router.delete('/:id', async (req, res) => {
  try {
    const db = getDB();
    const result = await db.query('DELETE FROM tasks WHERE id = $1 AND user_id = $2', [req.params.id, req.userId]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Task topilmadi.' });
    res.json({ message: "Task o'chirildi." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/tasks — completed tasklarni tozalash
router.delete('/', async (req, res) => {
  try {
    const db = getDB();
    const result = await db.query('DELETE FROM tasks WHERE user_id = $1 AND completed = TRUE', [req.userId]);
    res.json({ message: `${result.rowCount} ta bajarilgan task o'chirildi.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
