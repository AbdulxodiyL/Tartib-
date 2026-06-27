import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { getDB } from '../db/database.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

// GET /api/profile
router.get('/', async (req, res) => {
  try {
    const db = getDB();
    const { rows } = await db.query(
      'SELECT id, email, first_name, last_name, profession, bio, xp, level, created_at FROM users WHERE id = $1',
      [req.userId]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Profil topilmadi.' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/profile
router.put('/', async (req, res) => {
  const { first_name, last_name, profession, bio, email } = req.body;

  try {
    const db = getDB();
    if (email) {
      const conflict = await db.query('SELECT id FROM users WHERE email = $1 AND id != $2', [email, req.userId]);
      if (conflict.rows.length > 0)
        return res.status(409).json({ error: 'Bu email allaqachon ishlatilmoqda.' });
    }

    const { rows } = await db.query(`
      UPDATE users
      SET first_name = COALESCE($1, first_name),
          last_name  = COALESCE($2, last_name),
          profession = COALESCE($3, profession),
          bio        = COALESCE($4, bio),
          email      = COALESCE($5, email)
      WHERE id = $6
      RETURNING id, email, first_name, last_name, profession, bio, xp, level
    `, [first_name ?? null, last_name ?? null, profession ?? null, bio ?? null, email ?? null, req.userId]);

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/profile/password
router.put('/password', async (req, res) => {
  const { current_password, new_password } = req.body;

  if (!current_password || !new_password)
    return res.status(400).json({ error: 'Joriy va yangi parol majburiy.' });
  if (new_password.length < 6)
    return res.status(400).json({ error: "Yangi parol kamida 6 ta belgidan iborat bo'lishi kerak." });

  try {
    const db = getDB();
    const { rows } = await db.query('SELECT password FROM users WHERE id = $1', [req.userId]);
    const valid = bcrypt.compareSync(current_password, rows[0].password);
    if (!valid) return res.status(401).json({ error: "Joriy parol noto'g'ri." });

    const hashed = bcrypt.hashSync(new_password, 10);
    await db.query('UPDATE users SET password = $1 WHERE id = $2', [hashed, req.userId]);

    res.json({ message: "Parol muvaffaqiyatli o'zgartirildi." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
