import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { getDB } from '../db/database.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

// GET /api/profile
router.get('/', (req, res) => {
  const db = getDB();
  const user = db.prepare(
    'SELECT id, email, first_name, last_name, profession, bio, xp, level, created_at FROM users WHERE id = ?'
  ).get(req.userId);

  if (!user) return res.status(404).json({ error: 'Profil topilmadi.' });
  res.json(user);
});

// PUT /api/profile — profilni yangilash
router.put('/', (req, res) => {
  const { first_name, last_name, profession, bio, email } = req.body;
  const db = getDB();

  if (email) {
    const conflict = db.prepare('SELECT id FROM users WHERE email = ? AND id != ?')
      .get(email, req.userId);
    if (conflict) return res.status(409).json({ error: 'Bu email allaqachon ishlatilmoqda.' });
  }

  db.prepare(`
    UPDATE users
    SET first_name = COALESCE(?, first_name),
        last_name  = COALESCE(?, last_name),
        profession = COALESCE(?, profession),
        bio        = COALESCE(?, bio),
        email      = COALESCE(?, email)
    WHERE id = ?
  `).run(
    first_name ?? null,
    last_name ?? null,
    profession ?? null,
    bio ?? null,
    email ?? null,
    req.userId
  );

  const updated = db.prepare(
    'SELECT id, email, first_name, last_name, profession, bio, xp, level FROM users WHERE id = ?'
  ).get(req.userId);

  res.json(updated);
});

// PUT /api/profile/password — parolni o'zgartirish
router.put('/password', (req, res) => {
  const { current_password, new_password } = req.body;

  if (!current_password || !new_password) {
    return res.status(400).json({ error: 'Joriy va yangi parol majburiy.' });
  }
  if (new_password.length < 6) {
    return res.status(400).json({ error: 'Yangi parol kamida 6 ta belgidan iborat bo\'lishi kerak.' });
  }

  const db = getDB();
  const user = db.prepare('SELECT password FROM users WHERE id = ?').get(req.userId);
  const valid = bcrypt.compareSync(current_password, user.password);
  if (!valid) return res.status(401).json({ error: 'Joriy parol noto\'g\'ri.' });

  const hashed = bcrypt.hashSync(new_password, 10);
  db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hashed, req.userId);

  res.json({ message: 'Parol muvaffaqiyatli o\'zgartirildi.' });
});

export default router;
