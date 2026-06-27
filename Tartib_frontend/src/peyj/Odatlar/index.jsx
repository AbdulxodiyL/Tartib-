import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Flame, Check } from 'lucide-react';
import { api } from '../../utils/api';

const EMOJIS = ['⭐','💪','📚','💧','🏃','🧘','🎯','✍️','🌿','😴','🎵','🍎','🧠','💻','🤝'];
const COLORS  = ['#6366f1','#a855f7','#3b82f6','#10b981','#f97316','#ec4899','#14b8a6','#f59e0b','#ef4444'];

function HabitCard({ habit, onCheckin, onDelete }) {
  const [checking, setChecking] = useState(false);

  const handleCheck = async () => {
    if (checking) return;
    setChecking(true);
    await onCheckin(habit.id);
    setChecking(false);
  };

  return (
    <div className={`habit-card dashboard-card ${habit.doneToday ? 'habit-done' : ''}`}>
      <div className="habit-card-top">
        <div className="habit-emoji-wrap" style={{ background: `${habit.color}18`, border: `1.5px solid ${habit.color}40` }}>
          <span style={{ fontSize: '1.5rem' }}>{habit.emoji}</span>
        </div>
        <div className="habit-info">
          <span className="habit-name">{habit.name}</span>
          <div className="habit-streak">
            <Flame size={13} style={{ color: habit.streak > 0 ? '#f59e0b' : 'var(--text-muted)' }} />
            <span style={{ color: habit.streak > 0 ? '#f59e0b' : 'var(--text-muted)' }}>
              {habit.streak} kun
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', marginLeft: 'auto' }}>
          <button
            className={`habit-check-btn ${habit.doneToday ? 'done' : ''}`}
            style={{ borderColor: habit.color, color: habit.doneToday ? '#fff' : habit.color, background: habit.doneToday ? habit.color : 'transparent' }}
            onClick={handleCheck}
          >
            <Check size={16} />
          </button>
          <button className="delete-task-btn" onClick={() => onDelete(habit.id)}>
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* 7-day grid */}
      <div className="habit-week">
        {habit.week.map((day, i) => {
          const d = new Date(day.date + 'T12:00:00');
          const label = ['Ya','Du','Se','Ch','Pa','Ju','Sh'][d.getDay()];
          return (
            <div key={i} className="habit-day">
              <div
                className={`habit-dot ${day.done ? 'done' : ''}`}
                style={{ background: day.done ? habit.color : undefined }}
                title={day.date}
              />
              <span className="habit-day-label">{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Odatlar({ t }) {
  const [habits, setHabits]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [name, setName]           = useState('');
  const [emoji, setEmoji]         = useState('⭐');
  const [color, setColor]         = useState('#6366f1');

  useEffect(() => {
    api.getHabits()
      .then(setHabits)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const addHabit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      const created = await api.addHabit({ name: name.trim(), emoji, color });
      setHabits(prev => [...prev, created]);
      setName('');
      setEmoji('⭐');
      setColor('#6366f1');
      setShowForm(false);
    } catch (err) { alert(err.message); }
  };

  const checkin = async (id) => {
    try {
      const result = await api.checkinHabit(id);
      setHabits(prev => prev.map(h => {
        if (h.id !== id) return h;
        const newStreak = result.doneToday
          ? h.streak + 1
          : Math.max(0, h.streak - 1);
        const today = new Date().toISOString().split('T')[0];
        return {
          ...h,
          doneToday: result.doneToday,
          streak: newStreak,
          week: h.week.map(d => d.date === today ? { ...d, done: result.doneToday } : d),
        };
      }));
    } catch (err) { console.error(err); }
  };

  const deleteHabit = async (id) => {
    try {
      await api.deleteHabit(id);
      setHabits(prev => prev.filter(h => h.id !== id));
    } catch (err) { alert(err.message); }
  };

  const doneToday = habits.filter(h => h.doneToday).length;
  const totalHabits = habits.length;

  if (loading) return (
    <div className="page-container">
      <div style={{ color: 'var(--text-muted)', padding: '2rem 0' }}>Yuklanmoqda...</div>
    </div>
  );

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Odatlar</h1>
          <p className="page-subtitle">Kundalik odatlarni kuzating va streak saqlang</p>
        </div>
        <button className="add-task-btn" onClick={() => setShowForm(v => !v)}>
          <Plus size={16} />
          <span>Yangi odat</span>
        </button>
      </div>

      {/* Progress bar */}
      {totalHabits > 0 && (
        <div className="dashboard-card" style={{ marginBottom: '1.25rem', padding: '1rem 1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Bugun: {doneToday}/{totalHabits} odat bajarildi
            </span>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-accent)' }}>
              {totalHabits > 0 ? Math.round((doneToday / totalHabits) * 100) : 0}%
            </span>
          </div>
          <div className="stat-progress-bar">
            <div className="stat-progress-fill" style={{ width: `${totalHabits > 0 ? (doneToday / totalHabits) * 100 : 0}%`, background: 'var(--color-accent)' }} />
          </div>
        </div>
      )}

      {/* Add form */}
      {showForm && (
        <div className="dashboard-card" style={{ marginBottom: '1.25rem', padding: '1.25rem' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>
            Yangi odat qo'shish
          </h3>
          <form onSubmit={addHabit}>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              <input
                type="text"
                className="task-input"
                placeholder="Odat nomi (masalan: Suv ichish)"
                value={name}
                onChange={e => setName(e.target.value)}
                style={{ flex: 1, minWidth: '180px' }}
                required
                autoFocus
              />
            </div>
            {/* Emoji picker */}
            <div style={{ marginBottom: '0.75rem' }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.4rem', fontWeight: 600 }}>Emoji tanlang:</p>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {EMOJIS.map(e => (
                  <button key={e} type="button"
                    onClick={() => setEmoji(e)}
                    style={{
                      fontSize: '1.3rem', width: '36px', height: '36px',
                      borderRadius: '8px', border: emoji === e ? '2px solid var(--color-accent)' : '2px solid transparent',
                      background: emoji === e ? 'var(--color-accent)18' : 'var(--bg-secondary)',
                      cursor: 'pointer', transition: 'all 0.15s',
                    }}>{e}</button>
                ))}
              </div>
            </div>
            {/* Color picker */}
            <div style={{ marginBottom: '1rem' }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.4rem', fontWeight: 600 }}>Rang tanlang:</p>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {COLORS.map(c => (
                  <button key={c} type="button" onClick={() => setColor(c)}
                    style={{
                      width: '26px', height: '26px', borderRadius: '50%',
                      background: c, border: color === c ? '3px solid white' : '2px solid transparent',
                      boxShadow: color === c ? `0 0 0 2px ${c}` : 'none',
                      cursor: 'pointer', transition: 'all 0.15s', flexShrink: 0,
                    }} />
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="submit" className="add-task-btn"><Plus size={15} /><span>Qo'shish</span></button>
              <button type="button" className="cancel-btn" onClick={() => setShowForm(false)}>Bekor</button>
            </div>
          </form>
        </div>
      )}

      {habits.length === 0 ? (
        <div className="dashboard-card" style={{ padding: '3rem', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌱</div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Hali odatlar yo'q. Birinchi odatingizni qo'shing!
          </p>
        </div>
      ) : (
        <div className="habits-grid">
          {habits.map(habit => (
            <HabitCard key={habit.id} habit={habit} onCheckin={checkin} onDelete={deleteHabit} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Odatlar;
