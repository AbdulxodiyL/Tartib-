import React, { useState, useEffect } from 'react';
import { Timer, CheckCircle2, TrendingUp, Sparkles, Flame, Plus, Target, ArrowRight } from 'lucide-react';
import { api } from '../../utils/api';

const DAY_UZ = ['Yak', 'Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sha'];
const DAY_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function WeeklyChart({ weekly }) {
  const max = Math.max(...weekly.map(d => d.minutes), 1);
  return (
    <div className="weekly-chart">
      {weekly.map((d, i) => {
        const pct = Math.max((d.minutes / max) * 100, d.minutes > 0 ? 6 : 0);
        const dayName = DAY_UZ[new Date(d.date + 'T12:00:00').getDay()];
        const isToday = d.date === new Date().toISOString().split('T')[0];
        return (
          <div key={i} className="wc-col">
            <div className="wc-bar-wrap">
              {d.minutes > 0 && (
                <div className="wc-tooltip">{d.minutes} min</div>
              )}
              <div
                className={`wc-bar ${isToday ? 'today' : ''}`}
                style={{ height: `${pct}%` }}
              />
            </div>
            <span className={`wc-label ${isToday ? 'today' : ''}`}>{dayName}</span>
          </div>
        );
      })}
    </div>
  );
}

function Dashbord({ t, user, onGoToGoals }) {
  const [stats, setStats]       = useState({ sessions: null, tasks: null, income: null, goals: [] });
  const [quickTask, setQuickTask] = useState('');
  const [quickAdded, setQuickAdded] = useState(false);

  useEffect(() => {
    Promise.all([
      api.getSessions().catch(() => null),
      api.getTasks().catch(() => null),
      api.getSummary().catch(() => null),
      api.getGoals().catch(() => []),
    ]).then(([sessData, tasksData, incData, goalsData]) => {
      setStats({ sessions: sessData, tasks: tasksData, income: incData, goals: goalsData });
    });
  }, []);

  const todayMinutes = stats.sessions?.today?.minutes ?? 0;
  const todayHours   = (todayMinutes / 60).toFixed(1);
  const totalTasks   = stats.tasks?.length ?? 0;
  const doneTasks    = stats.tasks?.filter(t => t.completed).length ?? 0;
  const earned       = stats.income?.earned ?? 0;
  const streak       = stats.sessions?.streak ?? 0;
  const weekly       = stats.sessions?.weekly ?? Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    return { date: d.toISOString().split('T')[0], minutes: 0 };
  });

  const taskPct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
  const firstName = user?.first_name || 'Foydalanuvchi';

  const addQuickTask = async (e) => {
    e.preventDefault();
    if (!quickTask.trim()) return;
    try {
      await api.addTask({ text: quickTask.trim(), category: 'Ish', priority: 'medium' });
      setQuickTask('');
      setQuickAdded(true);
      setTimeout(() => setQuickAdded(false), 2000);
      const tasksData = await api.getTasks();
      setStats(prev => ({ ...prev, tasks: tasksData }));
    } catch (err) { console.error(err); }
  };

  const statCards = [
    {
      title: t.db_focusTime,
      value: `${todayHours} soat`,
      sub: `${stats.sessions?.today?.sessions ?? 0} seans bugun`,
      icon: Timer,
      color: '#16a34a',
      progress: Math.min((todayMinutes / 120) * 100, 100),
    },
    {
      title: t.db_tasksLabel,
      value: `${doneTasks} / ${totalTasks}`,
      sub: `${taskPct}% yakunlandi`,
      icon: CheckCircle2,
      color: '#10b981',
      progress: taskPct,
    },
    {
      title: t.db_incomeLabel,
      value: `$${earned.toLocaleString()}`,
      sub: t.db_incomeChange,
      icon: TrendingUp,
      color: '#3b82f6',
      progress: Math.min((earned / 1000) * 100, 100),
    },
    {
      title: 'Ketma-ket kun',
      value: `${streak} 🔥`,
      sub: streak > 0 ? `${streak} kunlik streak!` : 'Bugun boshlang!',
      icon: Flame,
      color: '#f59e0b',
      progress: Math.min((streak / 30) * 100, 100),
    },
  ];

  const welcomeText = `Xush kelibsiz, ${firstName}!`;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">{welcomeText}</h1>
        <p className="page-subtitle">{t.db_subtitle}</p>
      </div>

      <div className="dashboard-grid dashboard-grid-4">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="dashboard-card stat-card">
              <div className="stat-card-header">
                <span className="stat-title">{stat.title}</span>
                <div className="stat-icon-wrapper" style={{ backgroundColor: `${stat.color}18`, color: stat.color }}>
                  <Icon size={18} />
                </div>
              </div>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-change" style={{ color: stat.color }}>{stat.sub}</div>
              <div className="stat-progress-bar">
                <div className="stat-progress-fill" style={{ width: `${stat.progress}%`, backgroundColor: stat.color }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick task add */}
      <form className="quick-task-form dashboard-card" onSubmit={addQuickTask}>
        <input
          type="text"
          placeholder="⚡ Tezkor vazifa qo'shish... (Enter bosing)"
          value={quickTask}
          onChange={e => setQuickTask(e.target.value)}
          className="quick-task-input"
        />
        <button type="submit" className="quick-task-btn" disabled={!quickTask.trim()}>
          {quickAdded ? '✅' : <Plus size={18} />}
        </button>
      </form>

      <div className="dashboard-sections">
        <div className="dashboard-card section-card goal-dashboard-card">
          <div className="section-card-header"><h3><Target size={16} /> {t.db_activeGoals}</h3><button className="goal-dashboard-link" onClick={onGoToGoals}><ArrowRight size={16} /></button></div>
          {stats.goals.filter(goal => goal.status === 'active').slice(0, 2).map(goal => <button className="dashboard-goal-row" key={goal.id} onClick={onGoToGoals}><span><strong>{goal.title}</strong><small>{goal.current_milestone || t.db_goalRoadmap}</small></span><b>{goal.progress || 0}%</b></button>)}
          {!stats.goals.some(goal => goal.status === 'active') && <p className="empty-goal">{t.db_noGoals}</p>}
        </div>
        <div className="dashboard-card section-card">
          <div className="section-card-header">
            <h3>{t.db_chartTitle}</h3>
            <span className="header-badge">7 kun</span>
          </div>
          <WeeklyChart weekly={weekly} />
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Fokus vaqti (daqiqa)
          </p>
        </div>

        <div className="dashboard-card section-card ai-insight-card">
          <div className="section-card-header">
            <h3>{t.db_aiAdvisor}</h3>
            <Sparkles size={16} className="ai-sparkle-icon" />
          </div>
          <div className="ai-insight-content">
            <div className="ai-message-bubble">
              <p>
                Salom {firstName}! Bugun{' '}
                <strong style={{ color: 'var(--color-accent)' }}>
                  {stats.sessions?.today?.sessions ?? 0} fokus seansi
                </strong>{' '}
                bajardingiz va{' '}
                <strong style={{ color: '#10b981' }}>{doneTasks} vazifa</strong> yakunladingiz.
                {streak > 1 && ` 🔥 ${streak} kunlik streak davom etmoqda!`}
              </p>
              <p className="ai-tip-badge">
                {taskPct >= 80
                  ? '🎉 Ajoyib! Bugun juda samarali ishladingiz!'
                  : doneTasks === 0
                  ? '💡 Birinchi vazifangizni bajarib, streak boshlang!'
                  : '⚡ Eng qiyin vazifani kunning birinchi yarmida bajaring — energiya yuqori bo\'ladi.'}
              </p>
            </div>
            <button className="ai-cta-btn">
              <span>{t.db_aiCta}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashbord;
