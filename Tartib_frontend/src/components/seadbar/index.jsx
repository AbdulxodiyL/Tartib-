import './css/style.css';
import LogoWhite from './images/logo.png';
import {
  LayoutDashboard,
  Timer,
  CheckSquare,
  TrendingUp,
  Calendar,
  User,
  Settings,
  Bot,
  Sun,
  Moon,
  X,
  LogOut,
  Crown,
  Sparkles,
} from 'lucide-react';

function Seadbar({ activeTab, setActiveTab, isDarkMode, setIsDarkMode, language, setLanguage, t, isOpen, setIsOpen, user, onLogout, isPremium, onGoPremium }) {
  const menuItems = [
    { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard },
    { id: 'pomodoro',  label: t.pomodoro,  icon: Timer },
    { id: 'tasks',     label: t.tasks,     icon: CheckSquare },
    { id: 'income',    label: t.income,    icon: TrendingUp },
    { id: 'calendar',  label: t.calendar,  icon: Calendar },
    { id: 'odatlar',   label: 'Odatlar',   icon: Sparkles },
    { id: 'profile',   label: t.profile,   icon: User },
    { id: 'settings',  label: t.settings,  icon: Settings },
  ];

  return (
    <div className={`seadbar-container${isOpen ? ' sidebar-open' : ''}`}>
      <div>
        <div className="logo-box">
          <div className="logo-left">
            <img className="logo" src={LogoWhite} alt="Logo" />
            <span className="logo-text">{t.brand}</span>
          </div>
          <div className="logo-actions">
            <button
              className="lang-toggle-btn"
              onClick={() => setLanguage(language === 'uz' ? 'en' : 'uz')}
              title={language === 'uz' ? 'Switch to English' : "O'zbekchaga o'tish"}
            >
              {language.toUpperCase()}
            </button>
            <button
              className="theme-toggle-btn"
              onClick={() => setIsDarkMode(!isDarkMode)}
              title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
            >
              {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button
              className="sidebar-close-btn"
              onClick={() => setIsOpen(false)}
              aria-label="Menyuni yopish"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* User Profile */}
        <div className="user-profile">
          <div className="avatar-container">
            <div className="avatar">{(user?.first_name || user?.email || 'U')[0].toUpperCase()}</div>
            <span className="status-badge"></span>
          </div>
          <div className="user-info">
            <span className="username">
              {user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : (user?.email || '')}
              {isPremium && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '2px',
                  background: 'linear-gradient(135deg,#f59e0b,#fbbf24)',
                  color: '#000', fontSize: '0.58rem', fontWeight: 800,
                  padding: '1px 5px', borderRadius: '5px', marginLeft: '5px',
                  verticalAlign: 'middle',
                }}>
                  <Crown size={9} /> PRO
                </span>
              )}
            </span>
            <span className="email">{user?.email || ''}</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="nav-links">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => { setActiveTab(item.id); setIsOpen(false); }}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </div>
            );
          })}
        </nav>
      </div>

      {/* Bottom section */}
      <div className="bottom-section">
        {/* Premium button — faqat bepul foydalanuvchilar uchun */}
        {!isPremium && (
          <button
            className="sidebar-premium-btn"
            onClick={() => { onGoPremium?.(); setIsOpen(false); }}
          >
            <Crown size={15} />
            <span>Premium olish</span>
          </button>
        )}

        <button
          className={`ai-assistant-btn ${activeTab === 'ai' ? 'active' : ''}`}
          onClick={() => { setActiveTab('ai'); setIsOpen(false); }}
        >
          <Bot size={18} />
          <span>{t.ai}</span>
        </button>

        <button
          className="ai-assistant-btn"
          onClick={onLogout}
          style={{ marginTop: '0.35rem', color: '#ef4444', opacity: 0.7 }}
        >
          <LogOut size={18} />
          <span>Chiqish</span>
        </button>
      </div>
    </div>
  );
}

export default Seadbar;
