import React, { useState, useEffect } from 'react';
import Seadbar from './components/seadbar';
import Auth from './components/Auth';
import Landing from './peyj/Landing';
import Dashbord from './peyj/Dashbord';
import PomidorTime from './peyj/Pomidor.time';
import Tasklar from './peyj/Tasklar';
import DaromadStatistica from './peyj/DaromadStatistica';
import Kalendar from './peyj/Kalendar';
import Profile from './peyj/Profile';
import Sozlamalar from './peyj/Sozlamalar';
import AiYordamchi from './peyj/AiYordamchi';
import { translations } from './utils/translations';
import { api, clearAuth, getToken } from './utils/api';
import { requestNotificationPermission } from './utils/notifications';
import { LayoutDashboard, Timer, CheckSquare, TrendingUp, Calendar, Bot } from 'lucide-react';
import FloatingAI from './components/FloatingAI';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [language, setLanguage] = useState('uz');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setAuthLoading(false);
      return;
    }
    api.me()
      .then((data) => setUser(data.user))
      .catch(() => clearAuth())
      .finally(() => setAuthLoading(false));
  }, []);

  const handleAuthSuccess = (userData) => {
    setUser(userData);
    setShowAuth(false);
    setTimeout(() => requestNotificationPermission(), 2000);
  };

  const handleLogout = () => {
    clearAuth();
    setUser(null);
    setActiveTab('dashboard');
  };

  const openLogin = () => { setAuthMode('login'); setShowAuth(true); };
  const openRegister = () => { setAuthMode('register'); setShowAuth(true); };

  const t = translations[language];

  if (authLoading) {
    return (
      <div className="app-container dark-theme" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>Yuklanmoqda...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <Landing onLogin={openLogin} onRegister={openRegister} />
        {showAuth && (
          <Auth
            initialMode={authMode}
            onSuccess={handleAuthSuccess}
            onClose={() => setShowAuth(false)}
          />
        )}
      </>
    );
  }

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashbord t={t} user={user} />;
      case 'pomodoro':  return <PomidorTime t={t} />;
      case 'tasks':     return <Tasklar t={t} />;
      case 'income':    return <DaromadStatistica t={t} />;
      case 'calendar':  return <Kalendar t={t} />;
      case 'profile':   return <Profile t={t} user={user} setUser={setUser} />;
      case 'settings':  return <Sozlamalar t={t} />;
      case 'ai':        return <AiYordamchi t={t} />;
      default:          return <Dashbord t={t} user={user} />;
    }
  };

  const bottomNavItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: t.dashboard },
    { id: 'tasks',     icon: CheckSquare,    label: t.tasks },
    { id: 'pomodoro',  icon: Timer,          label: t.pomodoro },
    { id: 'calendar',  icon: Calendar,       label: t.calendar },
    { id: 'income',    icon: TrendingUp,     label: t.income },
  ];

  return (
    <div className={`app-container ${isDarkMode ? 'dark-theme' : ''}`}>
      {isSidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)} />
      )}

      <Seadbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        language={language}
        setLanguage={setLanguage}
        t={t}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        user={user}
        onLogout={handleLogout}
      />

      <main className="main-content">
        {/* Mobile profile header */}
        <div className="mobile-profile-header" onClick={() => setActiveTab('profile')}>
          <div className="mobile-avatar">
            {(user?.first_name || user?.email || 'U')[0].toUpperCase()}
          </div>
          <div className="mobile-profile-info">
            <span className="mobile-profile-name">
              {user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : user?.email}
            </span>
            <span className="mobile-profile-sub">
              Daraja {user?.level || 1} · {user?.xp || 0} XP
            </span>
          </div>
          <svg className="mobile-profile-arrow" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        {renderActiveView()}
      </main>

      {/* Floating AI button — all pages */}
      <FloatingAI t={t} />

      {/* Mobile bottom navigation */}
      <nav className="bottom-nav">
        {bottomNavItems.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            className={`bottom-nav-item ${activeTab === id ? 'active' : ''}`}
            onClick={() => setActiveTab(id)}
          >
            <Icon size={22} />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

export default App;
