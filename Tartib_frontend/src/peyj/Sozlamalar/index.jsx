import React, { useState, useEffect } from 'react';
import { Bell, Shield, Keyboard, Save } from 'lucide-react';
import { api } from '../../utils/api';

function Sozlamalar({ t }) {
  const [settings, setSettings] = useState({
    notifications: true, soundAlerts: true, autoBreak: false,
    focusMode: true, focusLength: 25, shortBreakLength: 5, longBreakLength: 15
  });
  const [loading, setLoading] = useState(true);
  const [saveFeedback, setSaveFeedback] = useState('');

  useEffect(() => {
    api.getSettings()
      .then((data) => setSettings(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleToggle = (key) => setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  const handleSlider = (key, value) => setSettings((prev) => ({ ...prev, [key]: parseInt(value) }));

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const updated = await api.updateSettings(settings);
      setSettings(updated);
      setSaveFeedback(t.st_saveSuccess);
      setTimeout(() => setSaveFeedback(''), 3000);
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div style={{ color: 'var(--text-muted)', padding: '2rem 0' }}>Yuklanmoqda...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">{t.st_title}</h1>
        <p className="page-subtitle">{t.st_subtitle}</p>
      </div>
      <div className="settings-layout">
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
                <input type="range" min="5" max="60" value={settings.focusLength} className="settings-slider" onChange={(e) => handleSlider('focusLength', e.target.value)} />
              </div>
              <div className="slider-group">
                <div className="slider-label-row"><span>{t.st_shortBreak}</span><strong>{settings.shortBreakLength} min</strong></div>
                <input type="range" min="1" max="20" value={settings.shortBreakLength} className="settings-slider" onChange={(e) => handleSlider('shortBreakLength', e.target.value)} />
              </div>
              <div className="slider-group">
                <div className="slider-label-row"><span>{t.st_longBreak}</span><strong>{settings.longBreakLength} min</strong></div>
                <input type="range" min="5" max="45" value={settings.longBreakLength} className="settings-slider" onChange={(e) => handleSlider('longBreakLength', e.target.value)} />
              </div>
            </div>

            <div className="settings-section">
              <div className="section-title-row">
                <Bell size={16} className="txt-indigo" />
                <h3>{t.st_notifTitle}</h3>
              </div>
              <div className="toggle-row" onClick={() => handleToggle('notifications')}>
                <div className="toggle-text"><span>{t.st_sysNotif}</span><p>{t.st_sysNotifSub}</p></div>
                <div className={`toggle-switch ${settings.notifications ? 'on' : ''}`}><span className="toggle-handle"></span></div>
              </div>
              <div className="toggle-row" onClick={() => handleToggle('soundAlerts')}>
                <div className="toggle-text"><span>{t.st_sound}</span><p>{t.st_soundSub}</p></div>
                <div className={`toggle-switch ${settings.soundAlerts ? 'on' : ''}`}><span className="toggle-handle"></span></div>
              </div>
              <div className="toggle-row" onClick={() => handleToggle('autoBreak')}>
                <div className="toggle-text"><span>{t.st_autoBreak}</span><p>{t.st_autoBreakSub}</p></div>
                <div className={`toggle-switch ${settings.autoBreak ? 'on' : ''}`}><span className="toggle-handle"></span></div>
              </div>
            </div>

            <div className="settings-section">
              <div className="section-title-row">
                <Shield size={16} className="txt-indigo" />
                <h3>{t.st_discTitle}</h3>
              </div>
              <div className="toggle-row" onClick={() => handleToggle('focusMode')}>
                <div className="toggle-text"><span>{t.st_strict}</span><p>{t.st_strictSub}</p></div>
                <div className={`toggle-switch ${settings.focusMode ? 'on' : ''}`}><span className="toggle-handle"></span></div>
              </div>
            </div>

            <button type="submit" className="add-task-btn save-settings-btn">
              <Save size={16} />
              <span>{t.st_saveBtn}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Sozlamalar;
