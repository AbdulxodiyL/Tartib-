import { Router } from 'express';
import { getDB } from '../db/database.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

const PLANS = {
  1:  { months: 1,  price_uzs: 69000,  label: '1 oy' },
  3:  { months: 3,  price_uzs: 179000, label: '3 oy' },
  12: { months: 12, price_uzs: 599000, label: '1 yil' },
};

// GET /api/subscription
router.get('/', async (req, res) => {
  try {
    const db = getDB();
    const { rows } = await db.query(
      'SELECT plan, plan_expires_at FROM users WHERE id = $1',
      [req.userId]
    );
    const u = rows[0];
    const now = new Date();
    const expires = u?.plan_expires_at ? new Date(u.plan_expires_at) : null;
    const isPremium = u?.plan === 'premium' && expires && expires > now;
    const daysLeft = isPremium
      ? Math.ceil((expires - now) / (1000 * 60 * 60 * 24))
      : 0;

    res.json({
      plan:    isPremium ? 'premium' : 'free',
      expires: u?.plan_expires_at || null,
      daysLeft,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/subscription/activate  — demo: haqiqiy to'lovsiz faollashtirish
// Keyinchalik: Payme/Click webhook shu yerga ulash
router.post('/activate', async (req, res) => {
  const { months = 1 } = req.body;
  const plan = PLANS[months] || PLANS[1];

  try {
    const db = getDB();
    const { rows } = await db.query('SELECT plan_expires_at FROM users WHERE id = $1', [req.userId]);
    const current = rows[0]?.plan_expires_at;

    // Agar hali muddat tugamagan bo'lsa — ustiga qo'shish
    const base = current && new Date(current) > new Date() ? new Date(current) : new Date();
    base.setMonth(base.getMonth() + plan.months);

    await db.query(
      'UPDATE users SET plan = $1, plan_expires_at = $2 WHERE id = $3',
      ['premium', base, req.userId]
    );

    res.json({ success: true, plan: 'premium', expires: base, daysLeft: plan.months * 30 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/subscription/cancel
router.post('/cancel', async (req, res) => {
  try {
    const db = getDB();
    await db.query(
      "UPDATE users SET plan = 'free', plan_expires_at = NULL WHERE id = $1",
      [req.userId]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
