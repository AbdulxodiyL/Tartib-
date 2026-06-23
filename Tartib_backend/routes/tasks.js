import { Router } from 'express';
import { getDB } from '../db/database.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

// GET /api/tasks — barcha tasklar
router.get('/', (req, res) => {
  const db = getDB();
  const tasks = db.prepare(
    'SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC'
  ).all(req.userId);

  res.json(tasks.map(t => ({ ...t, completed: Boolean(t.completed) })));
});

// POST /api/tasks — yangi task
router.post('/', (req, res) => {
  const { text, category = 'Boshqa', due_date } = req.body;
  if (!text?.trim()) {
    return res.status(400).json({ error: 'Vazifa matni bo\'sh bo\'lmasligi kerak.' });
  }

  const db = getDB();
  const result = db.prepare(
    'INSERT INTO tasks (user_id, text, category, due_date) VALUES (?, ?, ?, ?)'
  ).run(req.userId, text.trim(), category, due_date || null);

  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json({ ...task, completed: Boolean(task.completed) });
});

// PUT /api/tasks/:id — taskni yangilash yoki toggle
router.put('/:id', (req, res) => {
  const db = getDB();
  const task = db.prepare('SELECT * FROM tasks WHERE id = ? AND user_id = ?')
    .get(req.params.id, req.userId);

  if (!task) return res.status(404).json({ error: 'Task topilmadi.' });

  const { text, category, due_date, completed } = req.body;
  const updated = db.prepare(`
    UPDATE tasks
    SET text      = COALESCE(?, text),
        category  = COALESCE(?, category),
        due_date  = COALESCE(?, due_date),
        completed = COALESCE(?, completed)
    WHERE id = ? AND user_id = ?
  `).run(
    text ?? null,
    category ?? null,
    due_date ?? null,
    completed !== undefined ? (completed ? 1 : 0) : null,
    req.params.id,
    req.userId
  );

  if (updated.changes === 0) return res.status(404).json({ error: 'Task topilmadi.' });

  const fresh = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
  res.json({ ...fresh, completed: Boolean(fresh.completed) });
});

// DELETE /api/tasks/:id
router.delete('/:id', (req, res) => {
  const db = getDB();
  const result = db.prepare('DELETE FROM tasks WHERE id = ? AND user_id = ?')
    .run(req.params.id, req.userId);

  if (result.changes === 0) return res.status(404).json({ error: 'Task topilmadi.' });
  res.json({ message: 'Task o\'chirildi.' });
});

// DELETE /api/tasks — completed tasklarni tozalash
router.delete('/', (req, res) => {
  const db = getDB();
  const result = db.prepare('DELETE FROM tasks WHERE user_id = ? AND completed = 1').run(req.userId);
  res.json({ message: `${result.changes} ta bajarilgan task o'chirildi.` });
});

export default router;
