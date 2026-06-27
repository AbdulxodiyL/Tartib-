import React, { useState, useEffect } from 'react';
import { Bell, Shield, Keyboard, Save, Palette } from 'lucide-react';
import { api } from '../../utils/api';
import { ACCENT_COLORS, BG_PRESETS, RADIUS_PRESETS, FONT_PRESETS, getTheme, saveTheme } from '../../utils/theme';

function Sozlamalar({ t }) {
  const [settings, setSettings] = useState({
    notifications: true, soundAlerts: true, autoBreak: false,
    focusMode: true, focusLength: 25, shortBreakLength: 5, longBreakLength: 15
  });
  const [loading, setLoading]       = useState(true);
  const [saveFeedback, setSaveFeedback] = useState('');
  const [theme, setTheme]           = useState(getTheme());

  useEffect(() => {
    api.getSettings()
      .then(data => setSettings(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleToggle = (key) => setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  const handleSlider = (key, value) => setSettings(prev => ({ ...prev, [key]: parseInt(value) }));

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const updated = await api.updateSettings(settings);
      setSettings(updated);
      setSaveFeedback(t.st_saveSuccess);
      setTimeout(() => setSaveFeedback(''), 3000);
    } catch (err) { alert(err.message); }
  };

  const updateTheme = (key, val) => {
    const next = { ...theme, [key]: val };
    setTheme(next);
    saveTheme(next);
  };

  if (loading) return (
    <div className="page-container">
      <div style={{ color: 'var(--text-muted)', padding: '2rem 0' }}>Yuklanmoqda...</div>
    </div>
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">{t.st_title}</h1>
        <p className="page-subtitle">{t.st_subtitle}</p>
      </div>

      <div className="settings-layout">
        {/* ── THEME CUSTOMIZER ────────────────── */}
        <div className="dashboard-card" style={{ marginBottom: '1.25rem', padding: '1.5rem' }}>
          <div className="section-title-row" style={{ marginBottom: '1.25rem' }}>
            <Palette size={16} className="txt-indigo" />
            <h3>Ilova ko'rinishini sozlash</h3>
          </div>

          {/* Accent color */}
          <div className="theme-section">
            <p className="theme-label">Asosiy rang</p>
            <div className="theme-colors">
              {Object.entries(ACCENT_COLORS).map(([key, c]) => (
                <button
                  key={key}
                  className={`theme-color-dot ${theme.accent === key ? 'active' : ''}`}
                  style={{ background: c.value, boxShadow: theme.accent === key ? `0 0 0 3px var(--bg-card), 0 0 0 5px ${c.value}` : 'none' }}
                  title={c.name}
                  onClick={() => updateTheme('accent', key)}
                />
              ))}
            </div>
          </div>

          {/* Background */}
          <div className="theme-section">
            <p className="theme-label">Fon uslubi</p>
            <div className="theme-chips">
              {Object.entries(BG_PRESETS).map(([key, bg]) => (
                <button
                  key={key}
                  className={`theme-chip ${theme.bg === key ? 'active' : ''}`}
                  style={{ background: bg.card, border: `2px solid ${theme.bg === key ? 'var(--color-accent)' : bg.border}` }}
                  onClick={() => updateTheme('bg', key)}
                >
                  <span style={{ display: 'block', width: '18px', height: '18px', borderRadius: '4px', background: bg.primary, border: `1px solid ${bg.border}`, marginBottom: '4px' }} />
                  <span style={{ fontSize: '0.65rem', color: bg.textSecondary, fontWeight: 700 }}>{bg.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Border radius */}
          <div className="theme-section">
            <p className="theme-label">Burchak uslubi</p>
            <div className="theme-chips">
              {Object.entries(RADIUS_PRESETS).map(([key, r]) => (
                <button
                  key={key}
                  className={`theme-chip ${theme.radius === key ? 'active' : ''}`}
                  onClick={() => updateTheme('radius', key)}
                >
                  <span style={{ display: 'block', width: '28px', height: '20px', background: 'var(--color-accent)', borderRadius: r.card, marginBottom: '4px' }} />
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 700 }}>{r.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Font size */}
          <div className="theme-section" style={{ marginBottom: 0 }}>
            <p className="theme-label">Shrift o'lchami</p>
            <div className="theme-chips">
              {Object.entries(FONT_PRESETS).map(([key, f]) => (
                <button
                  key={key}
                  className={`theme-chip ${theme.font === key ? 'active' : ''}`}
                  onClick={() => updateTheme('font', key)}
                >
                  <span style={{ fontSize: f.size, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>Aa</span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 700, display: 'block', marginTop: '4px' }}>{f.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── TIMER & OTHER SETTINGS ──────────── */}
        <div className="settings-main dashboard-card">
          <form onSubmit={handleSave}>
            {saveFeedback && <div className="save-alert-success">{saveFeedback}</div>}

            <div className="settings-section">
              <div className="section-title-row">
                <Keyboard size={16} className="txt-indigo" />
                <h3>{t.st_timesTitle}</h3>
              </div>
              <div className="slider-group">
                <div className="slider-label-row"><span>{t.st_focusSlider}</span><strong>{settings.focusLength} min</strong></div>
                <input type="range" min="5" max="60" value={settings.focusLength} className="settings-slider" onChange={e => handleSlider('focusLength', e.target.value)} />
              </div>
              <div className="slider-group">
                <div className="slider-label-row"><span>{t.st_shortBreak}</span><strong>{settings.shortBreakLength} min</strong></div>
                <input type="range" min="1" max="20" value={settings.shortBreakLength} className="settings-slider" onChange={e => handleSlider('shortBreakLength', e.target.value)} />
              </div>
              <div className="slider-group">
                <div className="slider-label-row"><span>{t.st_longBreak}</span><strong>{settings.longBreakLength} min</strong></div>
                <input type="range" min="5" max="45" value={settings.longBreakLength} className="settings-slider" onChange={e => handleSlider('longBreakLength', e.target.value)} />
              </div>
            </div>

            <div className="settings-section">
              <div className="section-title-row">
                <Bell size={16} className="txt-indigo" />
                <h3>{t.st_notifTitle}</h3>
              </div>
              {[
                ['notifications', t.st_sysNotif, t.st_sysNotifSub],
                ['soundAlerts',   t.st_sound,    t.st_soundSub],
                ['autoBreak',     t.st_autoBreak,t.st_autoBreakSub],
              ].map(([key, label, sub]) => (
                <div key={key} className="toggle-row" onClick={() => handleToggle(key)}>
                  <div className="toggle-text"><span>{label}</span><p>{sub}</p></div>
                  <div className={`toggle-switch ${settings[key] ? 'on' : ''}`}><span className="toggle-handle" /></div>
                </div>
              ))}
            </div>

            <div className="settings-section">
              <div className="section-title-row">
                <Shield size={16} className="txt-indigo" />
                <h3>{t.st_discTitle}</h3>
              </div>
              <div className="toggle-row" onClick={() => handleToggle('focusMode')}>
                <div className="toggle-text"><span>{t.st_strict}</span><p>{t.st_strictSub}</p></div>
                <div className={`toggle-switch ${settings.focusMode ? 'on' : ''}`}><span className="toggle-handle" /></div>
              </div>
            </div>

            <button type="submit" className="add-task-btn save-settings-btn">
              <Save size={16} /><span>{t.st_saveBtn}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Sozlamalar;
