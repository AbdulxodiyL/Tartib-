import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Flame, Coffee, Award } from 'lucide-react';
import { api } from '../../utils/api';

function PomidorTime({ t }) {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState('focus');
  const [statsToday, setStatsToday] = useState({ sessions: 0, minutes: 0 });
  const timerRef = useRef(null);

  useEffect(() => {
    api.getSessions()
      .then((data) => setStatsToday(data.today))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setSeconds((sec) => {
          if (sec > 0) return sec - 1;
          setMinutes((min) => {
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
    } catch (err) {
      console.error(err);
    }

    if (mode === 'focus') {
      alert(t.uz ? 'Ajoyib! Fokus seansi yakunlandi. Endi dam oling!' : 'Excellent! Focus session completed. Take a break now!');
      switchMode('shortBreak');
    } else {
      alert(t.uz ? 'Tanaffus yakunlandi! Ishga qaytish vaqti keldi.' : 'Break completed! Time to get back to work.');
      switchMode('focus');
    }
  };

  const playAlert = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.5, ctx.currentTime);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) {
      console.log('Audio error:', e);
    }
  };

  const switchMode = (newMode) => {
    setIsActive(false);
    setMode(newMode);
    setSeconds(0);
    if (newMode === 'focus') setMinutes(25);
    else if (newMode === 'shortBreak') setMinutes(5);
    else setMinutes(15);
  };

  const resetTimer = () => {
    setIsActive(false);
    setSeconds(0);
    if (mode === 'focus') setMinutes(25);
    else if (mode === 'shortBreak') setMinutes(5);
    else setMinutes(15);
  };

  const formatTime = (m, s) =>
    `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;

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
            <button className={`mode-btn ${mode === 'focus' ? 'active' : ''}`} onClick={() => switchMode('focus')}>
              <Flame size={14} /> {t.pm_focus}
            </button>
            <button className={`mode-btn ${mode === 'shortBreak' ? 'active' : ''}`} onClick={() => switchMode('shortBreak')}>
              <Coffee size={14} /> {t.pm_shortBreak}
            </button>
            <button className={`mode-btn ${mode === 'longBreak' ? 'active' : ''}`} onClick={() => switchMode('longBreak')}>
              <Coffee size={14} /> {t.pm_longBreak}
            </button>
          </div>

          <div className="timer-display-container">
            <div className="timer-ring-outer">
              <svg className="timer-svg" viewBox="0 0 100 100">
                <circle className="timer-ring-bg" cx="50" cy="50" r="45" />
                <circle
                  className="timer-ring-fill"
                  cx="50" cy="50" r="45"
                  strokeDasharray="283"
                  strokeDashoffset={283 - (283 * progressPercent) / 100}
                  style={{ stroke: mode === 'focus' ? '#4f46e5' : '#10b981' }}
                />
              </svg>
              <div className="timer-text-overlay">
                <div className="timer-digits">{formatTime(minutes, seconds)}</div>
                <div className="timer-status">
                  {mode === 'focus' ? t.pm_statusFocus : t.pm_statusBreak}
                </div>
              </div>
            </div>
          </div>

          <div className="timer-controls">
            <button className="control-btn play-pause-btn" onClick={() => setIsActive(!isActive)}>
              {isActive ? <Pause size={18} /> : <Play size={18} />}
              <span>{isActive ? 'Pause' : 'Start'}</span>
            </button>
            <button className="control-btn reset-btn" onClick={resetTimer}>
              <RotateCcw size={16} />
              <span>Reset</span>
            </button>
          </div>
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
              <div
                className="target-progress-fill"
                style={{ width: `${Math.min((statsToday.sessions / 4) * 100, 100)}%` }}
              />
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
