import React, { useState } from 'react';
import { api, saveToken } from '../../utils/api';
import './style.css';

function Auth({ onSuccess, onClose }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ email: '', password: '', first_name: '', last_name: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = mode === 'login'
        ? await api.login({ email: form.email, password: form.password })
        : await api.register(form);

      saveToken(data.token);
      localStorage.setItem('tartib_user', JSON.stringify(data.user));
      onSuccess(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setError('');
  };

  return (
    <div className="auth-overlay" onClick={(e) => e.target === e.currentTarget && onClose?.()}>
      <div className="auth-card">
        <div className="auth-logo">T</div>
        <h2 className="auth-title">
          {mode === 'login' ? 'Tizimga kirish' : "Ro'yxatdan o'tish"}
        </h2>
        <p className="auth-subtitle">
          {mode === 'login' ? 'Hisobingizga kiring' : 'Yangi hisob yarating'}
        </p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === 'register' && (
            <div className="auth-row">
              <input
                className="auth-input"
                placeholder="Ism"
                value={form.first_name}
                onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                required
              />
              <input
                className="auth-input"
                placeholder="Familiya"
                value={form.last_name}
                onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                required
              />
            </div>
          )}
          <input
            className="auth-input"
            type="email"
            placeholder="Email manzil"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <input
            className="auth-input"
            type="password"
            placeholder="Parol (kamida 6 ta belgi)"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Yuklanmoqda...' : mode === 'login' ? 'Kirish' : "Ro'yxatdan o'tish"}
          </button>
        </form>

        <p className="auth-switch-text">
          {mode === 'login' ? "Hisobingiz yo'qmi?" : 'Hisobingiz bormi?'}
          {' '}
          <button className="auth-switch-btn" onClick={switchMode}>
            {mode === 'login' ? "Ro'yxatdan o'tish" : 'Kirish'}
          </button>
        </p>
      </div>
    </div>
  );
}

export default Auth;
