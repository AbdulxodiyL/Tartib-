import { Router } from 'express';
import OpenAI from 'openai';
import { requireAuth } from '../middleware/auth.js';
import { getDB } from '../db/database.js';

const router = Router();
router.use(requireAuth);

let _client = null;
function getClient() {
  if (!_client) {
    _client = new OpenAI({
      apiKey: process.env.GROQ_API_KEY || 'placeholder',
      baseURL: 'https://api.groq.com/openai/v1',
    });
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
- Qisqa va aniq yozgin (2-4 jumla)
- O'zbek tilida javob ber (agar foydalanuvchi inglizcha yozsa, inglizcha javob ber)
- Amaliy va ijobiy ohangda bo'lsin

VAZIFA QO'SHISH QOIDASI:
Agar foydalanuvchi vazifa qo'shishni so'rasa (masalan: "ertaga uchrashuv qo'sh", "task qo'y", "add task", "eslatma qo'y", "vazifa yoz"):
1. Qisqa matnli javob ber
2. Javob oxirida AYNAN quyidagi formatda yoz (boshqa narsa qo'shma):
[TASK:{"text":"vazifa matni bu yerga","category":"Ish","priority":"medium"}]

Kategoriyalar (faqat bulardan biri): "Ish", "Shaxsiy", "O'qish", "Boshqa"
Muhimliklar (faqat bulardan biri): "high", "medium", "low"

Misol: "Ertaga soat 10 da shifokorga boring" desa:
Albatta, qo'shib qo'ydim! [TASK:{"text":"Ertaga soat 10 da shifokorga borish","category":"Shaxsiy","priority":"medium"}]`;

// POST /api/ai/chat
router.post('/chat', async (req, res) => {
  const { message, history = [] } = req.body;

  if (!message?.trim())
    return res.status(400).json({ error: "Xabar bo'sh bo'lmasligi kerak." });

  if (!process.env.GROQ_API_KEY)
    return res.status(502).json({ error: 'AI xizmati sozlanmagan. GROQ_API_KEY mavjud emas.' });

  try {
    const db = getDB();
    const today = new Date().toISOString().split('T')[0];

    const taskRes = await db.query(
      'SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE completed = TRUE) AS done FROM tasks WHERE user_id = $1',
      [req.userId]
    );
    const sessRes = await db.query(
      "SELECT COUNT(*) AS count FROM pomodoro_sessions WHERE user_id = $1 AND mode = 'focus' AND completed_at::date = $2::date",
      [req.userId, today]
    );

    const { total, done } = taskRes.rows[0];
    const contextNote = `[Foydalanuvchi ma'lumoti: Bugun ${sessRes.rows[0].count} ta fokus seansi bajarildi. Jami ${total} ta vazifa bor, shundan ${done} tasi bajarilgan.]`;

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT + '\n\n' + contextNote },
      ...history.slice(-6).map(m => ({ role: m.sender === 'user' ? 'user' : 'assistant', content: m.text })),
      { role: 'user', content: message.trim() },
    ];

    const response = await getClient().chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages,
      max_tokens: 512,
      temperature: 0.7,
    });

    res.json({ reply: response.choices[0].message.content });
  } catch (err) {
    console.error('Groq API xatosi:', err.message);
    res.status(502).json({ error: "AI javob bera olmadi. Keyinroq urinib ko'ring." });
  }
});

export default router;
