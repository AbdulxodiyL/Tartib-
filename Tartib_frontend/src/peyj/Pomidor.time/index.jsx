import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Flame, Coffee, Award, ListTodo } from 'lucide-react';
import { api } from '../../utils/api';
import { sendNotification } from '../../utils/notifications';

function PomidorTime({ t }) {
  const [minutes, setMinutes]         = useState(25);
  const [seconds, setSeconds]         = useState(0);
  const [isActive, setIsActive]       = useState(false);
  const [mode, setMode]               = useState('focus');
  const [statsToday, setStatsToday]   = useState({ sessions: 0, minutes: 0 });
  const [tasks, setTasks]             = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskPicker, setShowTaskPicker] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    Promise.all([
      api.getSessions().catch(() => null),
      api.getTasks().catch(() => []),
    ]).then(([sessData, tasksData]) => {
      if (sessData) setStatsToday(sessData.today);
      setTasks((tasksData || []).filter(t => !t.completed));
    });
  }, []);

  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setSeconds(sec => {
          if (sec > 0) return sec - 1;
          setMinutes(min => {
            if (min === 0) {
              clearInterval(timerRef.current);
              handleTimerComplete();
              return 0;
            }
            return min - 1;
          });
          return sec === 0 ? 59 : 59;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isActive]);

  const handleTimerComplete = async () => {
    setIsActive(false);
    playAlert();
    const duration = mode === 'focus' ? 25 : mode === 'shortBreak' ? 5 : 15;
    try {
      await api.addSession({ mode, duration_min: duration });
      if (mode === 'focus') {
        const data = await api.getSessions();
        setStatsToday(data.today);
      }
    } catch (err) { console.error(err); }

    if (mode === 'focus') {
      sendNotification('🍅 Fokus seansi yakunlandi!', 'Ajoyib ish! Endi 5 daqiqa dam oling.');
      switchMode('shortBreak');
    } else {
      sendNotification('☕ Dam olish yakunlandi!', 'Ishga qaytish vaqti keldi!');
      switchMode('focus');
    }
  };

  const playAlert = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'sine'; osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.5, ctx.currentTime);
      osc.start(); osc.stop(ctx.currentTime + 0.3);
    } catch (e) {}
  };

  const switchMode = (newMode) => {
    setIsActive(false); setMode(newMode); setSeconds(0);
    if (newMode === 'focus')       setMinutes(25);
    else if (newMode === 'shortBreak') setMinutes(5);
    else setMinutes(15);
  };

  const resetTimer = () => {
    setIsActive(false); setSeconds(0);
    if (mode === 'focus')       setMinutes(25);
    else if (mode === 'shortBreak') setMinutes(5);
    else setMinutes(15);
  };

  const markTaskDone = async () => {
    if (!selectedTask) return;
    try {
      await api.updateTask(selectedTask.id, { completed: true });
      setTasks(prev => prev.filter(t => t.id !== selectedTask.id));
      setSelectedTask(null);
    } catch (err) { console.error(err); }
  };

  const formatTime = (m, s) => `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  const totalSeconds = mode === 'focus' ? 25 * 60 : mode === 'shortBreak' ? 5 * 60 : 15 * 60;
  const currentSeconds = minutes * 60 + seconds;
  const progressPercent = ((totalSeconds - currentSeconds) / totalSeconds) * 100;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">{t.pm_title}</h1>
        <p className="page-subtitle">{t.pm_subtitle}</p>
      </div>

      <div className="pomodoro-layout">
        <div className="pomodoro-main dashboard-card">
          <div className="pomodoro-modes">
            {[['focus', t.pm_focus, Flame], ['shortBreak', t.pm_shortBreak, Coffee], ['longBreak', t.pm_longBreak, Coffee]].map(([m, label, Icon]) => (
              <button key={m} className={`mode-btn ${mode === m ? 'active' : ''}`} onClick={() => switchMode(m)}>
                <Icon size={14} /> {label}
              </button>
            ))}
          </div>

          {/* Task picker */}
          <div className="pomodoro-task-picker">
            <button className="pomodoro-task-btn" onClick={() => setShowTaskPicker(v => !v)}>
              <ListTodo size={15} />
              <span>{selectedTask ? selectedTask.text : "Vazifa tanlang (ixtiyoriy)"}</span>
            </button>
            {showTaskPicker && (
              <div className="task-picker-dropdown">
                <button className="task-picker-item" onClick={() => { setSelectedTask(null); setShowTaskPicker(false); }}>
                  — Vazifasiz
                </button>
                {tasks.length === 0 && (
                  <div style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Faol vazifalar yo'q
                  </div>
                )}
                {tasks.map(task => (
                  <button key={task.id} className={`task-picker-item ${selectedTask?.id === task.id ? 'active' : ''}`}
                    onClick={() => { setSelectedTask(task); setShowTaskPicker(false); }}>
                    {task.text}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="timer-display-container">
            <div className="timer-ring-outer">
              <svg className="timer-svg" viewBox="0 0 100 100">
                <circle className="timer-ring-bg" cx="50" cy="50" r="45" />
                <circle className="timer-ring-fill" cx="50" cy="50" r="45"
                  strokeDasharray="283"
                  strokeDashoffset={283 - (283 * progressPercent) / 100}
                  style={{ stroke: mode === 'focus' ? 'var(--color-accent)' : '#10b981' }}
                />
              </svg>
              <div className="timer-text-overlay">
                <div className="timer-digits">{formatTime(minutes, seconds)}</div>
                <div className="timer-status">
                  {mode === 'focus' ? t.pm_statusFocus : t.pm_statusBreak}
                </div>
                {selectedTask && (
                  <div className="timer-task-label">📌 {selectedTask.text.length > 22 ? selectedTask.text.slice(0,22)+'…' : selectedTask.text}</div>
                )}
              </div>
            </div>
          </div>

          <div className="timer-controls">
            <button className="control-btn play-pause-btn" onClick={() => setIsActive(!isActive)}>
              {isActive ? <Pause size={18} /> : <Play size={18} />}
              <span>{isActive ? 'Pause' : 'Start'}</span>
            </button>
            <button className="control-btn reset-btn" onClick={resetTimer}>
              <RotateCcw size={16} /><span>Reset</span>
            </button>
          </div>

          {selectedTask && (
            <button className="task-done-inline-btn" onClick={markTaskDone}>
              ✅ Vazifani bajarildi deb belgilash
            </button>
          )}
        </div>

        <div className="pomodoro-sidebar">
          <div className="dashboard-card status-panel">
            <div className="status-panel-header">
              <Award size={18} className="achievement-icon" />
              <h3>{t.pm_stats}</h3>
            </div>
            <div className="stat-row">
              <span>{t.pm_sessions}</span>
              <strong>{statsToday.sessions} {t.uz ? 'seans' : 'sessions'}</strong>
            </div>
            <div className="stat-row">
              <span>{t.pm_totalTime}</span>
              <strong>{statsToday.minutes} {t.pm_minutes}</strong>
            </div>
            <div className="stat-row">
              <span>{t.pm_goal}</span>
              <strong>{t.pm_targetSessions}</strong>
            </div>
            <div className="target-progress-bar">
              <div className="target-progress-fill" style={{ width: `${Math.min((statsToday.sessions / 4) * 100, 100)}%` }} />
            </div>
            <p className="insight-text">
              {statsToday.sessions >= 4 ? t.pm_goalReached : t.pm_goalProgress}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PomidorTime;
