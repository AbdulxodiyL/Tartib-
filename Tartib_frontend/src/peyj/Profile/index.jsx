import React, { useState, useEffect } from 'react';
import { Flame, CheckCircle, ShieldCheck, Award } from 'lucide-react';
import { api } from '../../utils/api';

function Profile({ t, user, setUser }) {
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [saveStatus, setSaveStatus] = useState('');
  const [pwForm, setPwForm] = useState({ current_password: '', new_password: '' });
  const [pwMsg, setPwMsg] = useState('');

  useEffect(() => {
    api.getProfile()
      .then((data) => {
        setProfile(data);
        setFormData({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          email: data.email || '',
          profession: data.profession || '',
          bio: data.bio || '',
        });
      })
      .catch(console.error);
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const updated = await api.updateProfile(formData);
      setProfile(updated);
      if (setUser) setUser((prev) => ({ ...prev, ...updated }));
      setEditMode(false);
      setSaveStatus(t.pr_saveSuccess);
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (err) {
      alert(err.message);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    try {
      await api.changePassword(pwForm);
      setPwMsg(t.uz ? 'Parol muvaffaqiyatli o\'zgartirildi!' : 'Password changed successfully!');
      setPwForm({ current_password: '', new_password: '' });
      setTimeout(() => setPwMsg(''), 3000);
    } catch (err) {
      setPwMsg(err.message);
    }
  };

  const achievements = [
    { title: t.uz ? 'Pomodoro ustasi' : 'Pomodoro Master', desc: t.uz ? '50+ fokus seansi yakunlandi' : '50+ focus sessions completed', icon: Flame, color: '#f59e0b' },
    { title: t.uz ? 'Tashkilotchi' : 'Organizer', desc: t.uz ? '100+ vazifa bajarildi' : '100+ tasks completed', icon: CheckCircle, color: '#10b981' },
    { title: t.uz ? 'Intizom chempioni' : 'Discipline Champion', desc: t.uz ? '7 kunlik ketma-ket reja bajarildi' : '7-day streak completed', icon: ShieldCheck, color: '#4f46e5' },
  ];

  if (!profile) {
    return (
      <div className="page-container">
        <div style={{ color: 'var(--text-muted)', padding: '2rem 0' }}>Yuklanmoqda...</div>
      </div>
    );
  }

  const displayName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.email;
  const avatarLetter = (profile.first_name || profile.email || 'U')[0].toUpperCase();
  const xpForNextLevel = 1500;
  const xpProgress = Math.min((profile.xp % xpForNextLevel) / xpForNextLevel * 100, 100);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">{t.pr_title}</h1>
        <p className="page-subtitle">{t.pr_subtitle}</p>
      </div>

      <div className="profile-layout">
        <div className="profile-main dashboard-card">
          <div className="profile-header-main">
            <div className="large-avatar">{avatarLetter}</div>
            <div className="profile-header-info">
              <h2>{displayName}</h2>
              <span className="profession-tag">{profile.profession || (t.uz ? 'Kasb belgilanmagan' : 'No profession set')}</span>
            </div>
          </div>

          {saveStatus && <div className="save-alert-success">{saveStatus}</div>}

          {!editMode ? (
            <div className="profile-view-details">
              <div className="detail-group">
                <span className="detail-label">{t.pr_email}</span>
                <span className="detail-value">{profile.email}</span>
              </div>
              {profile.bio && (
                <div className="detail-group">
                  <span className="detail-label">{t.pr_bio}</span>
                  <p className="detail-bio">{profile.bio}</p>
                </div>
              )}
              <button className="add-task-btn" onClick={() => setEditMode(true)}>
                {t.pr_editBtn}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSave} className="profile-edit-form">
              <div className="form-row">
                <div className="form-group">
                  <label>{t.pr_firstName}</label>
                  <input value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>{t.pr_lastName}</label>
                  <input value={formData.last_name} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label>{t.pr_profession}</label>
                <input value={formData.profession} onChange={(e) => setFormData({ ...formData, profession: e.target.value })} />
              </div>
              <div className="form-group">
                <label>{t.pr_email}</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
              </div>
              <div className="form-group">
                <label>{t.pr_bio}</label>
                <textarea rows="3" value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} />
              </div>
              <div className="form-actions-row">
                <button type="submit" className="add-task-btn">{t.pr_saveBtn}</button>
                <button type="button" className="cancel-btn" onClick={() => setEditMode(false)}>{t.pr_cancelBtn}</button>
              </div>
            </form>
          )}

          <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '1.5rem', paddingTop: '1.5rem' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-secondary)' }}>
              {t.uz ? "Parolni o'zgartirish" : 'Change Password'}
            </h4>
            {pwMsg && (
              <div className={`save-alert-success ${pwMsg.includes('xato') || pwMsg.includes('error') || pwMsg.includes('noto') ? '' : ''}`}
                style={{ color: pwMsg.includes('muvaffaq') || pwMsg.includes('success') ? '#10b981' : '#ef4444', background: pwMsg.includes('muvaffaq') ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)', border: '1px solid', borderColor: pwMsg.includes('muvaffaq') ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)' }}>
                {pwMsg}
              </div>
            )}
            <form onSubmit={handlePasswordChange} className="profile-edit-form">
              <div className="form-group">
                <label>{t.uz ? "Joriy parol" : 'Current password'}</label>
                <input type="password" value={pwForm.current_password} onChange={(e) => setPwForm({ ...pwForm, current_password: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>{t.uz ? "Yangi parol" : 'New password'}</label>
                <input type="password" value={pwForm.new_password} onChange={(e) => setPwForm({ ...pwForm, new_password: e.target.value })} required />
              </div>
              <button type="submit" className="add-task-btn">{t.uz ? "Parolni yangilash" : 'Update password'}</button>
            </form>
          </div>
        </div>

        <div className="profile-sidebar">
          <div className="dashboard-card status-panel">
            <div className="level-header">
              <Award size={18} className="txt-yellow" />
              <h3>{t.pr_levelTitle}</h3>
            </div>
            <div className="level-badge-wrap">
              <span className="level-num">{t.uz ? `Daraja ${profile.level}` : `Level ${profile.level}`}</span>
              <span className="xp-text">{profile.xp} XP</span>
            </div>
            <div className="level-bar-bg">
              <div className="level-bar-fill" style={{ width: `${xpProgress}%` }} />
            </div>
            <p className="level-tip">{t.pr_levelTip}</p>
          </div>

          <div className="dashboard-card status-panel">
            <h3>{t.pr_achTitle}</h3>
            <div className="achievements-list">
              {achievements.map((ach, i) => {
                const Icon = ach.icon;
                return (
                  <div key={i} className="achievement-item-row">
                    <div className="ach-icon-wrap" style={{ backgroundColor: `${ach.color}15`, color: ach.color }}>
                      <Icon size={16} />
                    </div>
                    <div className="ach-details">
                      <span className="ach-title">{ach.title}</span>
                      <span className="ach-desc">{ach.desc}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
