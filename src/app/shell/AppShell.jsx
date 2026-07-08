import { createContext, useContext, useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuthCtx } from '../auth-context';
import { useProfile, useExpensesRealtime } from '../../lib/queries';
import { autoLogRecurring } from '../../lib/recurringAutoLog';
import { Icon } from '../../components/layout/Icon';
import { AddEntrySheet } from '../../features/money/AddEntrySheet';

const NAV = [
  { to: '/', label: 'Home', icon: 'home', end: true },
  { to: '/money', label: 'Money', icon: 'wallet' },
  { to: '/learn', label: 'Learn', icon: 'book' },
  { to: '/invest', label: 'Invest', icon: 'trend' },
  { to: '/coach', label: 'Coach', icon: 'sparkle' },
];

const PAGE_TITLES = {
  '/money': 'Money',
  '/learn': 'Learn',
  '/invest': 'Invest',
  '/coach': 'Coach',
  '/settings': 'Settings',
};

const AddSheetCtx = createContext(() => {});

/** openAdd('expense' | 'income') from anywhere under the shell. */
export function useOpenAdd() {
  return useContext(AddSheetCtx);
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export function AppShell() {
  const { user, signOut } = useAuthCtx();
  const { data: profile } = useProfile();
  const { theme, toggle: toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [addType, setAddType] = useState(null); // null | 'expense' | 'income'

  useExpensesRealtime();
  const userId = user?.id;
  useEffect(() => { if (userId) autoLogRecurring(userId); }, [userId]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-accent', 'green');
  }, [theme]);

  const userName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'there';
  const userInitial = userName.charAt(0).toUpperCase();
  const isHome = location.pathname === '/';
  const title = PAGE_TITLES[Object.keys(PAGE_TITLES).find(p => location.pathname.startsWith(p))] || '';

  return (
    <AddSheetCtx.Provider value={setAddType}>
      <div className="app">
        {/* SIDEBAR */}
        <aside className="rail">
          <div className="brand">
            <div className="brand-mark"><Icon name="sparkle" size={19} /></div>
            <div className="brand-name">Paisa<span>Coach</span></div>
          </div>
          <nav className="rail-nav">
            {NAV.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => `rail-link${isActive ? ' on' : ''}`}
              >
                <Icon name={item.icon} size={20} />
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="rail-spacer" />
          <div className="rail-card">
            <div className="rail-user">
              <div className="avatar" onClick={() => navigate('/settings')}>{userInitial}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{userName}</div>
                <div style={{ fontSize: 11.5, color: 'var(--ink-3)', fontWeight: 600 }}>On the journey</div>
              </div>
              <button onClick={signOut} title="Sign out" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-3)', padding: 4, display: 'flex', alignItems: 'center' }}>
                <Icon name="logout" size={16} />
              </button>
            </div>
          </div>
        </aside>

        {/* MAIN COLUMN */}
        <div className="main">
          <header className="topbar">
            <div className="tb-title">
              {isHome ? (
                <>
                  <span className="tb-hi">{getGreeting()},</span>
                  <span className="tb-name">{userName} 👋</span>
                </>
              ) : (
                <span className="tb-name">{title}</span>
              )}
            </div>
            <div className="tb-grow" />
            <div className="tb-actions">
              <button className="icon-btn" onClick={toggleTheme} title="Toggle theme">
                <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={18} />
              </button>
              <button className="icon-btn" onClick={() => navigate('/settings')} title="Settings">
                <Icon name="gear" size={18} />
              </button>
              <button className="btn-accent" onClick={() => setAddType('expense')}>
                <Icon name="plus" size={16} />Add
              </button>
            </div>
          </header>

          <main className="content">
            <div className="wrap tab-enter" key={location.pathname}>
              <Outlet />
            </div>
          </main>
        </div>

        {/* MOBILE BOTTOM NAV */}
        <nav className="botnav">
          {NAV.map(item => (
            <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => (isActive ? 'on' : '')}>
              <Icon name={item.icon} size={22} />
              <span className="bn-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {addType && (
          <AddEntrySheet initialType={addType} onClose={() => setAddType(null)} />
        )}
      </div>
    </AddSheetCtx.Provider>
  );
}
