<div align="center">

# 🗂️ Tartib — Shaxsiy Unumdorlik Platformasi

**O'zbekistonda yaratilgan, AI bilan kuchaytirilgan hayot boshqaruvi ilovasi**

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-Render-6366f1?style=for-the-badge)](https://tartib-frontend.onrender.com)
[![GitHub](https://img.shields.io/badge/GitHub-AbdulxodiyL-181717?style=for-the-badge&logo=github)](https://github.com/AbdulxodiyL/Tartib-)
[![Made in Uzbekistan](https://img.shields.io/badge/Made_in-Uzbekistan_🇺🇿-1da462?style=for-the-badge)](https://github.com/AbdulxodiyL)

</div>

---

## 📖 Tartib nima?

**Tartib** — bu o'zbek tilida gaplasha oladigan, AI yordamchi va gamification tizimi bilan birlashtirilgan zamonaviy unumdorlik ilovasi. Foydalanuvchi kunlik vazifalarini, odatlarini, pul kirimlarini va vaqtini bitta platformada boshqara oladi.

> *"Tartib" so'zi o'zbekcha — "tartib-intizom", "tashkilot" degan ma'noni anglatadi.*

---

## ✨ Asosiy Xususiyatlar

| Modul | Tavsif |
|-------|--------|
| ✅ **Vazifalar (Tasks)** | Muhimlik darajasi, kategoriya, ish vaqti, qidiruv, inline tahrirlash |
| 🍅 **Pomodoro Timer** | 25+5 daqiqa texnikasi, vazifaga ulash, avtomatik dam olish |
| 📊 **Daromad Statistikasi** | Loyiha daromadlarini kuzatish, kutilayotgan to'lovlar |
| 📅 **Aqlli Kalendar** | Uchrashuvlar, vazifalar bir sahifada |
| 🔥 **Odatlar (Habits)** | 7 kunlik grid, streak hisoblagich, emoji + rang |
| 🤖 **AI Yordamchi** | Ovozli buyruqlar, chat orqali vazifa qo'shish (Groq/Llama) |
| 🎨 **Tema Tizimi** | 8 ta rang, 6 ta fon (dark+light), burchak va shrift o'lchamlari |
| 🏆 **XP & Daraja** | Har seans/vazifa uchun tajriba ball, daraja tizimi |

---

## 🛠️ Texnologiyalar

```
Frontend:  React 19 + Vite 8 (rolldown)  │  CSS Custom Properties (tema tizimi)
Backend:   Node.js + Express              │  JWT autentifikatsiya
DB:        NeonDB (PostgreSQL serverless)  │  Pg Pool connection
AI:        Groq API (llama-3.1-8b-instant)│  OpenAI SDK compat.
Mobile:    Capacitor (Android APK)        │  Web Speech API (ovoz)
Deploy:    Render.com (backend + frontend)│  GitHub Actions (APK build)
```

---

## 🚀 Ishga tushirish

```bash
# 1. Clone
git clone https://github.com/AbdulxodiyL/Tartib-.git
cd Tartib-

# 2. Backend
cd Tartib_backend
cp .env.example .env          # .env ga ma'lumotlarni to'ldiring
npm install
npm start                     # http://localhost:3000

# 3. Frontend (yangi terminal)
cd Tartib_frontend
npm install
npm run dev                   # http://localhost:5173
```

**Kerakli `.env` ma'lumotlari:**
```
DATABASE_URL=postgresql://...   # NeonDB yoki boshqa Postgres
JWT_SECRET=your_secret_here
GROQ_API_KEY=gsk_...            # groq.com dan bepul
```

---

## 📱 Skrinshtlar

```
┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐
│   📊 Dashboard      │  │   ✅ Vazifalar       │  │   🔥 Odatlar        │
│                     │  │                     │  │                     │
│  Streak: 7 kun 🔥   │  │  🔴 Loyiha hisoboti  │  │  💧 Suv iching      │
│  XP: 1250          │  │  🟡 Email javoblash  │  │  ● ● ● ● ● ○ ○     │
│  Bugun: 4/6 vazifa  │  │  🟢 Kitob o'qish    │  │  Streak: 5 kun      │
│                     │  │                     │  │                     │
│  [Haftalik grafik]  │  │  🔍 Qidiruv...       │  │  📖 Kitob o'qish    │
└─────────────────────┘  └─────────────────────┘  └─────────────────────┘
```

---

## 💰 Pul Ishlash Imkoniyatlari

### 1️⃣ Freemium Model (Tavsiya etiladi)

**Bepul:** Asosiy funksiyalar (5 vazifa/kun, 3 odat, 7 kunlik statistika)

**Premium — $4.99/oy yoki $39/yil:**
- Cheksiz vazifalar va odatlar
- AI bilan kengaytirilgan suhbat (GPT-4 ulash)
- Kengaytirilgan statistika va hisobotlar
- Maxsus tema ranglar paketi
- Exel/PDF eksport

**Implementatsiya:** Stripe + `plan` ustuni users jadvalida. ~1000 foydalanuvchi = **$5000/oy**

---

### 2️⃣ B2B / Korporativ Versiya

**Muammo:** O'zbek kompaniyalar xodimlari unumdorligini kuzatishni xohlaydi.

**Yechim:** "Tartib Teams" — jamoa uchun dashboard:
- Menejer xodimlar progressini ko'radi
- Jamoa vazifalarini taqsimlash
- Haftalik/oylik hisobotlar (PDF)

**Narx:** $15/foydalanuvchi/oy → 20 kishilik jamoa = **$300/oy/kompaniya**

---

### 3️⃣ Mahalliy Bozor (O'zbekiston)

**Muammo:** Ko'plab o'zbek frilanserlari va tadbirkorlar angizashni xohlaydi.

**Yechim:**
- Payme / Click orqali to'lov (UZS)
- Telegram bot integratsiya (Tartib vazifalarini Telegram orqali boshqarish)
- Mahalliy kompaniyalarga B2B pitch

**Telegram bot monetizatsiya:** Bot subscription **29,000 UZS/oy**

---

### 4️⃣ Android App (Google Play)

**Status:** APK build GitHub Actions orqali allaqachon sozlangan.

**Strateg:**
- Google Play'ga chiqarish (bir martalik $25 ro'yxatdan o'tish)
- In-app purchase (Google Play Billing)
- Premium unlock: **$2.99 bir martalik** yoki **$0.99/oy**

---

### 5️⃣ SaaS White-label

**Fikr:** Boshqa startuplarga Tartib'ning unumdorlik tizimini brend ostida sotish.
- Fitness ilovalari → "Trening + Vazifalar"
- Ta'lim platformalari → "O'quv rejasi + Odatlar"
- **Narx: $500–2000/oy** litsenziya

---

## 📊 Moliyaviy Prognoz

| Stsena | Foydalanuvchi | Daromad/oy |
|--------|---------------|------------|
| Minimal | 200 premium | ~$1,000 |
| Realistik (1 yil) | 1000 premium + 3 B2B | ~$5,500 |
| Maqsad (2 yil) | 5000 premium + 20 B2B | ~$25,000+ |

---

## 🗺️ Keyingi Qadamlar (Roadmap)

- [ ] **v2.0** — Telegram bot (vazifa qo'shish, eslatmalar)
- [ ] **v2.1** — Stripe to'lov tizimi + Premium plan
- [ ] **v2.2** — Google Play nashr
- [ ] **v2.3** — Jamoa (Teams) funksiyasi
- [ ] **v3.0** — AI agent (vazifalarni avtomatik rejalash)

---

## 👨‍💻 Muallif

**Abdulxodiy Omonboyev** — O'zbekiston

*"Bu loyiha o'zimning kundalik unumdorlik muammomni hal qilishdan boshlandi."*

[![GitHub](https://img.shields.io/badge/GitHub-@AbdulxodiyL-181717?logo=github)](https://github.com/AbdulxodiyL)

---

<div align="center">

**⭐ Star bosing — loyihani qo'llab-quvvatlang!**

*Made with ❤️ in Uzbekistan 🇺🇿*

</div>
