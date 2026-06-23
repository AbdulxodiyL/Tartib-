import { Router } from 'express';
import OpenAI from 'openai';
import { requireAuth } from '../middleware/auth.js';
import { getDB } from '../db/database.js';

const router = Router();
router.use(requireAuth);

let _client = null;
function getClient() {
  if (!_client) {
    _client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || 'placeholder' });
  }
  return _client;
}

const SYSTEM_PROMPT = `Sen "Tartib" — shaxsiy unumdorlik ilovasi uchun yaratilgan AI yordamchisan.
Foydalanuvchilarga quyidagi sohalarda yordam berasan:
- Vazifalarni boshqarish va ustuvorlik qilish (Tasks)
- Pomodoro texnikasi va vaqtni taqsimlash
- Moliyaviy rejalashtirish va daromadni kuzatish
- Kunlik va haftalik reja tuzish (Calendar)
- Samaradorlikni oshirish bo'yicha amaliy maslahatlar

Javoblaringni:
- Qisqa va aniq yozgin (3-5 jumla)
- O'zbek tilida javob ber (agar foydalanuvchi inglizcha yozsa, inglizcha javob ber)
- Amaliy va ijobiy ohangda bo'lsin
- Tartib ilovasining funksiyalariga yo'naltir`;

// POST /api/ai/chat
router.post('/chat', async (req, res) => {
  const { message, history = [] } = req.body;

  if (!message?.trim()) {
    return res.status(400).json({ error: 'Xabar bo\'sh bo\'lmasligi kerak.' });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(502).json({ error: 'AI xizmati sozlanmagan. OPENAI_API_KEY mavjud emas.' });
  }

  const db = getDB();
  const today = new Date().toISOString().split('T')[0];

  const taskStats = db.prepare(`
    SELECT COUNT(*) AS total,
           SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) AS done
    FROM tasks WHERE user_id = ?
  `).get(req.userId);

  const todaySessions = db.prepare(`
    SELECT COUNT(*) AS count
    FROM pomodoro_sessions
    WHERE user_id = ? AND mode = 'focus' AND date(completed_at) = ?
  `).get(req.userId, today);

  const contextNote = `[Foydalanuvchi ma'lumoti: Bugun ${todaySessions.count} ta fokus seansi bajarildi. Jami ${taskStats.total} ta vazifa bor, shundan ${taskStats.done} tasi bajarilgan.]`;

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'system', content: contextNote },
    ...history.slice(-6).map(m => ({ role: m.sender === 'user' ? 'user' : 'assistant', content: m.text })),
    { role: 'user', content: message.trim() },
  ];

  try {
    const response = await getClient().chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      max_tokens: 512,
      temperature: 0.7,
    });

    const reply = response.choices[0].message.content;
    res.json({ reply });
  } catch (err) {
    console.error('OpenAI API xatosi:', err.message);
    res.status(502).json({ error: 'AI javob bera olmadi. Keyinroq urinib ko\'ring.' });
  }
});

export default router;
