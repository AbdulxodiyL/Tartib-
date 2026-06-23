import React, { useState, useEffect } from 'react';
import { Timer, CheckCircle2, TrendingUp, Sparkles, ArrowUpRight } from 'lucide-react';
import { api } from '../../utils/api';

function Dashbord({ t, user }) {
  const [stats, setStats] = useState({ sessions: null, tasks: null, income: null });

  useEffect(() => {
    Promise.all([
      api.getSessions().catch(() => null),
      api.getTasks().catch(() => null),
      api.getSummary().catch(() => null),
    ]).then(([sessData, tasksData, incData]) => {
      setStats({
        sessions: sessData,
        tasks: tasksData,
        income: incData,
      });
    });
  }, []);

  const todayMinutes = stats.sessions?.today?.minutes ?? 0;
  const todayHours = (todayMinutes / 60).toFixed(1);
  const totalTasks = stats.tasks?.length ?? 0;
  const doneTasks = stats.tasks?.filter((t) => t.completed).length ?? 0;
  const earned = stats.income?.earned ?? 0;

  const taskPct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const firstName = user?.first_name || (t.uz ? 'Foydalanuvchi' : 'User');

  const statCards = [
    {
      title: t.db_focusTime,
      value: t.uz ? `${todayHours} soat` : `${todayHours} hours`,
      change: t.db_focusChange,
      icon: Timer,
      color: '#8b5cf6',
      progress: Math.min((todayMinutes / 120) * 100, 100),
    },
    {
      title: t.db_tasksLabel,
      value: `${doneTasks} / ${totalTasks}`,
      change: `${taskPct}% ${t.uz ? 'yakunlandi' : 'completed'}`,
      icon: CheckCircle2,
      color: '#10b981',
      progress: taskPct,
    },
    {
      title: t.db_incomeLabel,
      value: `$${earned.toLocaleString()}`,
      change: t.db_incomeChange,
      icon: TrendingUp,
      color: '#3b82f6',
      progress: Math.min((earned / 1000) * 100, 100),
    },
  ];

  const welcomeText = t.uz
    ? `Xush kelibsiz, ${firstName}!`
    : `Welcome back, ${firstName}!`;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">{welcomeText}</h1>
        <p className="page-subtitle">{t.db_subtitle}</p>
      </div>

      <div className="dashboard-grid">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="dashboard-card stat-card">
              <div className="stat-card-header">
                <span className="stat-title">{stat.title}</span>
                <div className="stat-icon-wrapper" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                  <Icon size={18} />
                </div>
              </div>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-change" style={{ color: stat.color }}>{stat.change}</div>
              <div className="stat-progress-bar">
                <div className="stat-progress-fill" style={{ width: `${stat.progress}%`, backgroundColor: stat.color }} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="dashboard-sections">
        <div className="dashboard-card section-card">
          <div className="section-card-header">
            <h3>{t.db_chartTitle}</h3>
            <span className="header-badge">
              {t.db_chartBadge} <ArrowUpRight size={12} />
            </span>
          </div>
          <div className="chart-placeholder">
            <svg viewBox="0 0 400 150" className="svg-chart">
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2"/>
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0"/>
                </linearGradient>
              </defs>
              <line x1="10" y1="20" x2="390" y2="20" stroke="var(--border-color)" strokeDasharray="4 4" />
              <line x1="10" y1="60" x2="390" y2="60" stroke="var(--border-color)" strokeDasharray="4 4" />
              <line x1="10" y1="100" x2="390" y2="100" stroke="var(--border-color)" strokeDasharray="4 4" />
              <line x1="10" y1="140" x2="390" y2="140" stroke="var(--border-color)" />
              <path d="M 10 140 L 10 120 Q 80 90, 140 100 T 270 40 T 390 30 L 390 140 Z" fill="url(#chartGrad)" />
              <path d="M 10 120 Q 80 90, 140 100 T 270 40 T 390 30" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="10" cy="120" r="3" fill="#3b82f6" stroke="var(--bg-card)" strokeWidth="1.5" />
              <circle cx="140" cy="100" r="3" fill="#3b82f6" stroke="var(--bg-card)" strokeWidth="1.5" />
              <circle cx="270" cy="40" r="3" fill="#3b82f6" stroke="var(--bg-card)" strokeWidth="1.5" />
              <circle cx="390" cy="30" r="3" fill="#3b82f6" stroke="var(--bg-card)" strokeWidth="1.5" />
            </svg>
            <div className="chart-labels">
              {t.uz ? (
                <><span>Du</span><span>Se</span><span>Ch</span><span>Pa</span><span>Ju</span><span>Sha</span><span>Yak</span></>
              ) : (
                <><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span></>
              )}
            </div>
          </div>
        </div>

        <div className="dashboard-card section-card ai-insight-card">
          <div className="section-card-header">
            <h3>{t.db_aiAdvisor}</h3>
            <Sparkles size={16} className="ai-sparkle-icon" />
          </div>
          <div className="ai-insight-content">
            <div className="ai-message-bubble">
              {t.uz ? (
                <>
                  <p>
                    Salom {firstName}! Bugun {stats.sessions?.today?.sessions ?? 0} ta fokus seansi bajardingiz.
                    Jami {doneTasks} ta vazifani yakunladingiz.
                  </p>
                  <p className="ai-tip-badge">
                    Maslahat: Eng qiyin vazifani kunning birinchi yarmida bajarishga harakat qiling — bu vaqtda energiyangiz eng yuqori bo&apos;ladi.
                  </p>
                </>
              ) : (
                <>
                  <p>
                    Hello {firstName}! You completed {stats.sessions?.today?.sessions ?? 0} focus sessions today.
                    You&apos;ve finished {doneTasks} tasks total.
                  </p>
                  <p className="ai-tip-badge">
                    Tip: Try to tackle your hardest task in the first half of the day — that&apos;s when your energy is highest.
                  </p>
                </>
              )}
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
