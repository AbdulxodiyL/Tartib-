import React, { useState, useEffect, lazy, Suspense } from 'react';
import Seadbar from './components/seadbar';
import Auth from './components/Auth';
import Landing from './peyj/Landing';
import { ToastProvider } from './contexts/toast';

const Dashbord          = lazy(() => import('./peyj/Dashbord'));
const PomidorTime       = lazy(() => import('./peyj/Pomidor.time'));
const Tasklar           = lazy(() => import('./peyj/Tasklar'));
const DaromadStatistica = lazy(() => import('./peyj/DaromadStatistica'));
const Kalendar          = lazy(() => import('./peyj/Kalendar'));
const Profile           = lazy(() => import('./peyj/Profile'));
const Sozlamalar        = lazy(() => import('./peyj/Sozlamalar'));
const AiYordamchi       = lazy(() => import('./peyj/AiYordamchi'));
const Odatlar           = lazy(() => import('./peyj/Odatlar'));
const Premium           = lazy(() => import('./peyj/Premium'));

import { translations } from './utils/translations';
import { api, clearAuth, getToken } from './utils/api';
import { requestNotificationPermission } from './utils/notifications';
import { getTheme, applyTheme } from './utils/theme';
import { LayoutDashboard, Timer, CheckSquare, Calendar, Sparkles, Crown } from 'lucide-react';
import FloatingAI from './components/FloatingAI';
import './App.css';

const PAGE_LOADER = (
  <div style={{ padding: '2rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
    Yuklanmoqda...
  </div>
);

function AppInner() {
  const [user, setUser]               = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showAuth, setShowAuth]       = useState(false);
  const [authMode, setAuthMode]       = useState('login');
  const [activeTab, setActiveTab]     = useState('dashboard');
  const [isDarkMode, setIsDarkMode]   = useState(true);
  const [language, setLanguage]       = useState('uz');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => { applyTheme(getTheme()); }, []);

  useEffect(() => {
    const token = getToken();
    if (!token) { setAuthLoading(false); return; }
    api.me()
      .then(data => setUser(data.user))
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

  const openLogin    = () => { setAuthMode('login');    setShowAuth(true); };
  const openRegister = () => { setAuthMode('register'); setShowAuth(true); };

  const t = translations[language];
  const isPremium = user?.plan === 'premium';

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
          <Auth initialMode={authMode} onSuccess={handleAuthSuccess} onClose={() => setShowAuth(false)} />
        )}
      </>
    );
  }

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashbord t={t} user={user} onGoToPremium={() => setActiveTab('premium')} />;
      case 'pomodoro':  return <PomidorTime t={t} isPremium={isPremium} onGoToPremium={() => setActiveTab('premium')} />;
      case 'tasks':     return <Tasklar t={t} isPremium={isPremium} onGoToPremium={() => setActiveTab('premium')} />;
      case 'income':    return <DaromadStatistica t={t} />;
      case 'calendar':  return <Kalendar t={t} />;
      case 'profile':   return <Profile t={t} user={user} setUser={setUser} onGoToPremium={() => setActiveTab('premium')} />;
      case 'settings':  return <Sozlamalar t={t} isPremium={isPremium} onGoToPremium={() => setActiveTab('premium')} />;
      case 'ai':        return <AiYordamchi t={t} />;
      case 'odatlar':   return <Odatlar t={t} isPremium={isPremium} onGoToPremium={() => setActiveTab('premium')} />;
      case 'premium':   return (
        <Premium
          user={user}
          onBack={() => setActiveTab('dashboard')}
          onUpgrade={(u) => setUser(u)}
        />
      );
      default: return <Dashbord t={t} user={user} />;
    }
  };

  const bottomNavItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Bosh' },
    { id: 'tasks',     icon: CheckSquare,     label: 'Tasklar' },
    { id: 'pomodoro',  icon: Timer,           label: 'Timer' },
    { id: 'odatlar',   icon: Sparkles,        label: 'Odatlar' },
    { id: 'calendar',  icon: Calendar,        label: 'Kalendar' },
  ];

  return (
    <div className="app-container">
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
        isPremium={isPremium}
        onGoPremium={() => setActiveTab('premium')}
      />

      <main className="main-content">
        <div className="mobile-profile-header" onClick={() => setActiveTab('profile')}>
          <div className="mobile-avatar">
            {(user?.first_name || user?.email || 'U')[0].toUpperCase()}
          </div>
          <div className="mobile-profile-info">
            <span className="mobile-profile-name">
              {user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : user?.email}
              {isPremium && <span className="mobile-premium-badge"><Crown size={10} /> PRO</span>}
            </span>
            <span className="mobile-profile-sub">
              Daraja {user?.level || 1} · {user?.xp || 0} XP
            </span>
          </div>
          <svg className="mobile-profile-arrow" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        <Suspense fallback={PAGE_LOADER}>
          {renderActiveView()}
        </Suspense>
      </main>

      <FloatingAI t={t} isPremium={isPremium} onGoToPremium={() => setActiveTab('premium')} />

      {/* Premium upgrade banner — faqat bepul foydalanuvchilar uchun */}
      {!isPremium && activeTab !== 'premium' && (
        <button className="premium-fab" onClick={() => setActiveTab('premium')} title="Premium olish">
          <Crown size={16} />
          <span>Premium</span>
        </button>
      )}

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

export default function App() {
  return (
    <ToastProvider>
      <AppInner />
    </ToastProvider>
  );
}
