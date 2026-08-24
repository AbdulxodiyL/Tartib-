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
  const { text, category = 'Boshqa', due_date, priority = 'medium', start_time, end_time, goal_id, milestone_id, ai_generated = false, duration_minutes = 0 } = req.body;
  if (!text?.trim())
    return res.status(400).json({ error: "Vazifa matni bo'sh bo'lmasligi kerak." });

  try {
    const db = getDB();
    const { rows } = await db.query(
      `INSERT INTO tasks (user_id, text, category, due_date, priority, start_time, end_time, goal_id, milestone_id, ai_generated, duration_minutes)
       SELECT $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
       WHERE ($8::integer IS NULL OR EXISTS (SELECT 1 FROM goals WHERE id = $8 AND user_id = $1))
         AND ($9::integer IS NULL OR EXISTS (SELECT 1 FROM goal_milestones m JOIN goals g ON g.id = m.goal_id WHERE m.id = $9 AND g.user_id = $1 AND ($8::integer IS NULL OR m.goal_id = $8)))
       RETURNING *`,
      [req.userId, text.trim(), category, due_date || null, priority, start_time || null, end_time || null, goal_id || null, milestone_id || null, Boolean(ai_generated), Math.max(0, Number(duration_minutes) || 0)]
    );
    if (rows.length === 0) return res.status(400).json({ error: 'Goal yoki milestone topilmadi.' });
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

    if (rows[0]?.milestone_id) {
      await db.query(`UPDATE goal_milestones m SET progress = COALESCE((SELECT ROUND(100.0 * COUNT(*) FILTER (WHERE completed) / NULLIF(COUNT(*), 0)) FROM tasks WHERE milestone_id = m.id), 0), updated_at = NOW() WHERE m.id = $1`, [rows[0].milestone_id]);
      await db.query("UPDATE goal_milestones SET status = CASE WHEN progress = 100 THEN 'completed' ELSE 'active' END WHERE id = $1", [rows[0].milestone_id]);
    }
    if (rows[0]?.goal_id) {
      await db.query(`UPDATE goals g SET progress = COALESCE((SELECT ROUND(AVG(progress)) FROM goal_milestones WHERE goal_id = g.id), (SELECT ROUND(100.0 * COUNT(*) FILTER (WHERE completed) / NULLIF(COUNT(*), 0)) FROM tasks WHERE goal_id = g.id), 0), updated_at = NOW() WHERE g.id = $1 AND g.user_id = $2`, [rows[0].goal_id, req.userId]);
      await db.query("UPDATE goals SET status = 'completed' WHERE id = $1 AND user_id = $2 AND progress = 100", [rows[0].goal_id, req.userId]);
    }

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
