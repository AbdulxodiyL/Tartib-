const BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api';

export function getToken() {
  return localStorage.getItem('tartib_token');
}

export function saveToken(token) {
  localStorage.setItem('tartib_token', token);
}

export function clearAuth() {
  localStorage.removeItem('tartib_token');
  localStorage.removeItem('tartib_user');
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...options, headers });

  if (res.status === 401) {
    clearAuth();
    window.location.reload();
    throw new Error('Sessiya tugadi. Qayta kiring.');
  }

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Server xatosi');
  return data;
}

export const api = {
  // Auth
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  me: () => request('/auth/me'),

  // Tasks
  getTasks: () => request('/tasks'),
  addTask: (body) => request('/tasks', { method: 'POST', body: JSON.stringify(body) }),
  updateTask: (id, body) => request(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteTask: (id) => request(`/tasks/${id}`, { method: 'DELETE' }),
  clearCompleted: () => request('/tasks', { method: 'DELETE' }),

  // Transactions
  getTransactions: () => request('/transactions'),
  getSummary: () => request('/transactions/summary'),
  addTransaction: (body) => request('/transactions', { method: 'POST', body: JSON.stringify(body) }),
  deleteTransaction: (id) => request(`/transactions/${id}`, { method: 'DELETE' }),

  // Sessions (Pomodoro)
  getSessions: () => request('/sessions'),
  addSession: (body) => request('/sessions', { method: 'POST', body: JSON.stringify(body) }),

  // Profile
  getProfile: () => request('/profile'),
  updateProfile: (body) => request('/profile', { method: 'PUT', body: JSON.stringify(body) }),
  changePassword: (body) => request('/profile/password', { method: 'PUT', body: JSON.stringify(body) }),

  // Settings
  getSettings: () => request('/settings'),
  updateSettings: (body) => request('/settings', { method: 'PUT', body: JSON.stringify(body) }),

  // Events (Calendar)
  getEvents: (month) => request(`/events${month ? `?month=${month}` : ''}`),
  addEvent: (body) => request('/events', { method: 'POST', body: JSON.stringify(body) }),
  deleteEvent: (id) => request(`/events/${id}`, { method: 'DELETE' }),

  // AI
  aiChat: (body) => request('/ai/chat', { method: 'POST', body: JSON.stringify(body) }),

  // Habits
  getHabits:     ()       => request('/habits'),
  addHabit:      (body)   => request('/habits', { method: 'POST', body: JSON.stringify(body) }),
  deleteHabit:   (id)     => request(`/habits/${id}`, { method: 'DELETE' }),
  checkinHabit:  (id)     => request(`/habits/${id}/checkin`, { method: 'POST', body: '{}' }),
};
