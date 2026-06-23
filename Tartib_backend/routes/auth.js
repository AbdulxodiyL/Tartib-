import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDB } from '../db/database.js';

const router = Router();

// POST /api/auth/register
router.post('/register', (req, res) => {
  const { email, password, first_name = '', last_name = '' } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email va parol majburiy.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak.' });
  }

  const db = getDB();
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    return res.status(409).json({ error: 'Bu email allaqachon ro\'yxatdan o\'tgan.' });
  }

  const hashed = bcrypt.hashSync(password, 10);
  const result = db.prepare(
    'INSERT INTO users (email, password, first_name, last_name) VALUES (?, ?, ?, ?)'
  ).run(email, hashed, first_name, last_name);

  // Default settings yaratamiz
  db.prepare(
    'INSERT INTO user_settings (user_id) VALUES (?)'
  ).run(result.lastInsertRowid);

  const token = jwt.sign(
    { userId: result.lastInsertRowid },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  res.status(201).json({
    token,
    user: { id: result.lastInsertRowid, email, first_name, last_name },
  });
});

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email va parol majburiy.' });
  }

  const db = getDB();
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user) {
    return res.status(401).json({ error: 'Email yoki parol noto\'g\'ri.' });
  }

  const valid = bcrypt.compareSync(password, user.password);
  if (!valid) {
    return res.status(401).json({ error: 'Email yoki parol noto\'g\'ri.' });
  }

  const token = jwt.sign(
    { userId: user.id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      profession: user.profession,
    },
  });
});

// GET /api/auth/me — tokenni tekshirish
router.get('/me', (req, res) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token topilmadi.' });
  }
  try {
    const payload = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
    const db = getDB();
    const user = db.prepare(
      'SELECT id, email, first_name, last_name, profession, bio, xp, level FROM users WHERE id = ?'
    ).get(payload.userId);
    if (!user) return res.status(404).json({ error: 'Foydalanuvchi topilmadi.' });
    res.json({ user });
  } catch {
    res.status(401).json({ error: 'Token yaroqsiz.' });
  }
});

export default router;
