import React, { useState, useEffect } from 'react';
import './style.css';

function Landing({ onLogin, onRegister }) {
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    document.body.classList.add('landing-open');
    document.documentElement.classList.add('landing-open');
    return () => {
      document.body.classList.remove('landing-open');
      document.documentElement.classList.remove('landing-open');
    };
  }, []);

  const features = [
    {
      icon: '✅',
      color: '#6366f1',
      title: 'Vazifalar Menejeri',
      desc: "Kunlik va haftalik tasklaringizni kategoriyalarga ajrating. Muddatlarni belgilang, bajarilganlarini kuzating. Real vaqtda progress ko'ring.",
      tags: ['Kategoriya', 'Muddat', 'Progress'],
    },
    {
      icon: '🍅',
      color: '#ef4444',
      title: 'Pomodoro Timer',
      desc: '25 daqiqa fokus + 5 daqiqa dam olish. Ilmiy asoslangan texnika. Har seans uchun XP yig\'ing va darajangizni ko\'taring.',
      tags: ['25/5 min', 'XP tizimi', 'Statistika'],
    },
    {
      icon: '💰',
      color: '#10b981',
      title: 'Daromad Statistikasi',
      desc: "Loyihalaringizdan tushgan daromadlarni kuzating. Bajarilgan va kutilayotgan to'lovlarni alohida ko'ring. Moliyaviy reja tuzing.",
      tags: ['Loyihalar', "To'lovlar", 'Hisobot'],
    },
    {
      icon: '📅',
      color: '#3b82f6',
      title: 'Aqlli Kalendar',
      desc: "Kunlik uchrashuvlar va rejalarni kalendarda ko'ring. Tasklar avtomatik taqvimda paydo bo'ladi. Oy bo'yicha navigatsiya.",
      tags: ['Uchrashuvlar', 'Tasklar', 'Navigatsiya'],
    },
    {
      icon: '🤖',
      color: '#a78bfa',
      title: 'AI Yordamchi',
      desc: "xAI (Grok) asosida ishlaydi. Samaradorlik maslahatlarini oling, rejalaringizni optimallashtiring. O'zbek tilida javob beradi.",
      tags: ['xAI Grok', "O'zbek tili", 'Maslahat'],
    },
    {
      icon: '🏆',
      color: '#f59e0b',
      title: 'Gamification',
      desc: "Har fokus seansi uchun 10 XP. Darajalar tizimi. Yutuqlar va nishonlar. Samaradorlikni o'yinga aylantiring.",
      tags: ['XP & Daraja', 'Yutuqlar', 'Motivatsiya'],
    },
  ];

  const stats = [
    { value: '8+', label: 'Asosiy funksiya', icon: '⚡' },
    { value: '25m', label: 'Fokus sessiya', icon: '🍅' },
    { value: '100%', label: 'Bepul va ochiq', icon: '🎁' },
    { value: '∞', label: 'Imkoniyatlar', icon: '🚀' },
  ];

  const steps = [
    {
      num: '01',
      icon: '👤',
      title: "Ro'yxatdan o'ting",
      desc: "30 soniyada bepul hisob yarating. Email va parol yetarli — boshqa ma'lumot kerak emas.",
      color: '#6366f1',
    },
    {
      num: '02',
      icon: '📋',
      title: "Vazifalarni kiriting",
      desc: "Bugungi tasklaringizni qo'shing, kategoriyaga ajrating va muddatini belgilang.",
      color: '#10b981',
    },
    {
      num: '03',
      icon: '🍅',
      title: 'Fokuslanib ishlang',
      desc: "Pomodoro taymer boshlang. 25 daqiqa to'liq diqqat, keyin 5 daqiqa dam oling.",
      color: '#ef4444',
    },
    {
      num: '04',
      icon: '📊',
      title: "Natijalarni kuzating",
      desc: "Dashboard-da bugungi statistikangizni ko'ring: fokus vaqti, tasklar, daromad.",
      color: '#f59e0b',
    },
  ];

  const faqs = [
    {
      q: 'Tartib bepulmi?',
      a: "Ha, Tartib to'liq bepul. Hech qanday yashirin to'lov yoki obuna yo'q.",
    },
    {
      q: 'Ma\'lumotlarim xavfsizmi?',
      a: "Barcha ma'lumotlar JWT token bilan himoyalangan. Parollar bcrypt bilan shifrlangan. Ma'lumotlar faqat sizga tegishli.",
    },
    {
      q: 'AI yordamchi qanday ishlaydi?',
      a: "AI yordamchi xAI Grok modeli asosida ishlaydi. U sizning task va sessiya ma'lumotlaringizdan foydalanib, shaxsiylashtirilgan maslahatlar beradi.",
    },
    {
      q: 'Mobil qurilmada ham ishlaydimi?',
      a: "Ha, Tartib to'liq responsive — telefon, planshet va kompyuterda bir xil yaxshi ishlaydi.",
    },
  ];

  return (
    <div className="landing">

      {/* ──────────── NAVBAR ──────────── */}
      <nav className="landing-nav">
        <div className="landing-nav-inner">
          <div className="landing-logo">
            <span className="landing-logo-icon">T</span>
            <span className="landing-logo-text">TARTIB</span>
          </div>
          <div className="landing-nav-links">
            <a href="#features" className="landing-nav-link">Funksiyalar</a>
            <a href="#how" className="landing-nav-link">Qanday ishlaydi</a>
            <a href="#faq" className="landing-nav-link">FAQ</a>
          </div>
          <div className="landing-nav-actions">
            <button className="landing-nav-btn outline" onClick={onLogin}>Kirish</button>
            <button className="landing-nav-btn solid" onClick={onRegister}>Bepul boshlash</button>
          </div>
        </div>
      </nav>

      {/* ──────────── HERO ──────────── */}
      <section className="landing-hero">
        <div className="hero-glow hero-glow-1" />
        <div className="hero-glow hero-glow-2" />

        <div className="landing-hero-content">
          <div className="landing-hero-badge">
            <span className="badge-dot" />
            Shaxsiy unumdorlik platformasi
          </div>

          <h1 className="landing-hero-title">
            Hayotingizni
            <br />
            <span className="landing-hero-accent">Tartibga soling</span>
          </h1>

          <p className="landing-hero-subtitle">
            Vazifalar, Pomodoro taymer, daromad statistikasi, AI yordamchi va aqlli
            kalendar — barchasini bitta platformada. Samaradorligingizni oshiring.
          </p>

          <div className="landing-hero-cta">
            <button className="landing-cta-main" onClick={onRegister}>
              Bepul boshlash
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button className="landing-cta-outline" onClick={onLogin}>
              Hisobga kirish
            </button>
          </div>

          <div className="hero-trust-badges">
            <span className="trust-badge">🔒 Xavfsiz</span>
            <span className="trust-badge">⚡ Tez ishlaydi</span>
            <span className="trust-badge">🎁 100% bepul</span>
            <span className="trust-badge">🌙 Dark mode</span>
          </div>
        </div>

        {/* App Mockup */}
        <div className="hero-mockup-wrapper">
          <div className="hero-mockup">
            <div className="mockup-titlebar">
              <span className="titlebar-dot red" />
              <span className="titlebar-dot yellow" />
              <span className="titlebar-dot green" />
              <span className="titlebar-url">tartib.app</span>
            </div>
            <div className="mockup-body">
              <div className="mockup-sidebar">
                <div className="mockup-logo">T</div>
                {['📊','🍅','✅','💰','📅','🤖'].map((icon, i) => (
                  <div key={i} className={`mockup-nav ${i === 0 ? 'active' : ''}`}>{icon}</div>
                ))}
              </div>
              <div className="mockup-main">
                <div className="mockup-header-row">
                  <div>
                    <div className="mockup-bar w-48" />
                    <div className="mockup-bar w-32 short mt-1" />
                  </div>
                </div>
                <div className="mockup-cards">
                  {[
                    { color: '#6366f1', w: '75%', label: 'Fokus vaqti' },
                    { color: '#10b981', w: '80%', label: 'Tasklar' },
                    { color: '#3b82f6', w: '60%', label: 'Daromad' },
                  ].map((c, i) => (
                    <div key={i} className="mockup-card">
                      <div className="mockup-card-icon" style={{ color: c.color }}>{['⏱','✅','💰'][i]}</div>
                      <div className="mockup-bar w-full" />
                      <div className="mockup-bar short" />
                      <div className="mockup-progress-bg">
                        <div className="mockup-progress-fill" style={{ width: c.w, background: c.color }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mockup-chart">
                  <svg viewBox="0 0 260 70" style={{ width: '100%' }}>
                    <path d="M0 60 Q40 40,80 50 T160 25 T260 15" fill="none" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M0 60 Q40 40,80 50 T160 25 T260 15 L260 70 L0 70 Z" fill="rgba(99,102,241,0.08)" />
                  </svg>
                </div>
                <div className="mockup-tasks">
                  {[
                    { text: 'Loyihani yakunlash', done: true },
                    { text: 'Mijoz bilan uchrashuv', done: false },
                    { text: 'Hisobot tayyorlash', done: false },
                  ].map((tk, i) => (
                    <div key={i} className="mockup-task-row">
                      <span className={`mockup-check ${tk.done ? 'done' : ''}`} />
                      <span className="mockup-task-text" style={{ textDecoration: tk.done ? 'line-through' : 'none', opacity: tk.done ? 0.5 : 1 }}>{tk.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────── STATS ──────────── */}
      <section className="landing-stats">
        <div className="landing-stats-inner">
          {stats.map((s, i) => (
            <div key={i} className="landing-stat-item">
              <div className="stat-icon-emoji">{s.icon}</div>
              <div className="landing-stat-value">{s.value}</div>
              <div className="landing-stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ──────────── FEATURES ──────────── */}
      <section className="landing-features" id="features">
        <div className="landing-section-header">
          <div className="section-badge">✨ Funksiyalar</div>
          <h2 className="landing-section-title">Kerakli hamma narsa — bitta joyda</h2>
          <p className="landing-section-subtitle">
            Samarali hayot kechirish uchun zarur bo&apos;lgan barcha vositalar birlashtirilgan
          </p>
        </div>
        <div className="landing-features-grid">
          {features.map((f, i) => (
            <div key={i} className="landing-feature-card">
              <div className="feature-icon-wrap" style={{ background: f.color + '18', border: `1px solid ${f.color}30` }}>
                <span className="landing-feature-icon">{f.icon}</span>
              </div>
              <h3 className="landing-feature-title">{f.title}</h3>
              <p className="landing-feature-desc">{f.desc}</p>
              <div className="feature-tags">
                {f.tags.map((tag, j) => (
                  <span key={j} className="feature-tag" style={{ color: f.color, background: f.color + '12', border: `1px solid ${f.color}25` }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ──────────── HOW IT WORKS ──────────── */}
      <section className="landing-how" id="how">
        <div className="landing-section-header">
          <div className="section-badge">🗺️ Yo'riqnoma</div>
          <h2 className="landing-section-title">4 qadamda boshlang</h2>
          <p className="landing-section-subtitle">Tartibni o&apos;rganish uchun maxsus bilim shart emas</p>
        </div>
        <div className="landing-steps">
          {steps.map((step, i) => (
            <div key={i} className="landing-step">
              <div className="step-connector" style={{ opacity: i < steps.length - 1 ? 1 : 0 }} />
              <div className="step-icon-wrap" style={{ background: step.color + '18', border: `2px solid ${step.color}40` }}>
                <span className="step-icon">{step.icon}</span>
              </div>
              <div className="step-num" style={{ color: step.color }}>{step.num}</div>
              <h3 className="landing-step-title">{step.title}</h3>
              <p className="landing-step-desc">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ──────────── TECH STACK ──────────── */}
      <section className="landing-tech">
        <div className="landing-section-header">
          <div className="section-badge">🛠️ Texnologiyalar</div>
          <h2 className="landing-section-title">Zamonaviy texnologiyalar asosida</h2>
        </div>
        <div className="tech-stack">
          {[
            { name: 'React 19', icon: '⚛️', desc: 'Frontend' },
            { name: 'Node.js', icon: '🟢', desc: 'Backend' },
            { name: 'SQLite', icon: '🗄️', desc: 'Database' },
            { name: 'JWT Auth', icon: '🔐', desc: 'Xavfsizlik' },
            { name: 'xAI Grok', icon: '🤖', desc: 'AI Engine' },
            { name: 'Vite', icon: '⚡', desc: 'Build tool' },
          ].map((tech, i) => (
            <div key={i} className="tech-card">
              <span className="tech-icon">{tech.icon}</span>
              <span className="tech-name">{tech.name}</span>
              <span className="tech-desc">{tech.desc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ──────────── FAQ ──────────── */}
      <section className="landing-faq" id="faq">
        <div className="landing-section-header">
          <div className="section-badge">❓ FAQ</div>
          <h2 className="landing-section-title">Ko&apos;p so&apos;raladigan savollar</h2>
        </div>
        <div className="faq-list">
          {faqs.map((faq, i) => (
            <div key={i} className={`faq-item ${openFaq === i ? 'open' : ''}`}>
              <button className="faq-question" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                <span>{faq.q}</span>
                <span className="faq-arrow">{openFaq === i ? '−' : '+'}</span>
              </button>
              {openFaq === i && <div className="faq-answer">{faq.a}</div>}
            </div>
          ))}
        </div>
      </section>

      {/* ──────────── CTA BOTTOM ──────────── */}
      <section className="landing-cta-section">
        <div className="cta-glow" />
        <div className="landing-cta-inner">
          <div className="cta-emoji">🚀</div>
          <h2 className="landing-cta-title">Bugun boshlab ko&apos;ring!</h2>
          <p className="landing-cta-subtitle">
            30 soniyada ro&apos;yxatdan o&apos;ting va samarali hayot kechira boshlang.
            <br />
            Tartibli hayot — muvaffaqiyatli hayot.
          </p>
          <div className="cta-buttons">
            <button className="landing-cta-main large" onClick={onRegister}>
              Bepul hisob yaratish
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button className="landing-cta-outline" onClick={onLogin}>
              Kirish
            </button>
          </div>
          <p className="cta-note">
            💳 Kredit karta kerak emas &nbsp;·&nbsp; 🔒 Ma&apos;lumotlar xavfsiz &nbsp;·&nbsp; ⚡ Darhol boshlash
          </p>
        </div>
      </section>

      {/* ──────────── FOOTER ──────────── */}
      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <div className="footer-left">
            <div className="landing-logo">
              <span className="landing-logo-icon" style={{ width: 30, height: 30, fontSize: '0.95rem' }}>T</span>
              <span className="landing-logo-text">TARTIB</span>
            </div>
            <p className="footer-tagline">Shaxsiy unumdorlik platformasi</p>
          </div>
          <div className="footer-links">
            <a href="#features" className="footer-link">Funksiyalar</a>
            <a href="#how" className="footer-link">Qanday ishlaydi</a>
            <a href="#faq" className="footer-link">FAQ</a>
          </div>
          <div className="footer-right">
            <p className="landing-footer-text">© 2026 Tartib. Barcha huquqlar himoyalangan.</p>
            <p style={{ fontSize: '0.75rem', color: '#374151', marginTop: '0.2rem' }}>
              Made with ❤️ in Uzbekistan
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
