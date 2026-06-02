import { useState, useEffect, Component } from 'react';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { useAuth } from './hooks/useAuth';
import { useExpenses } from './hooks/useExpenses';
import { useCategories } from './hooks/useCategories';
import { useBudgets } from './hooks/useBudgets';
import { useGoals } from './hooks/useGoals';
import { useProfile } from './hooks/useProfile';
import { useEmis } from './hooks/useEmis';
import { useBills } from './hooks/useBills';
import { useNetWorth } from './hooks/useNetWorth';
import { useInvestments } from './hooks/useInvestments';
import { useEvents } from './hooks/useEvents';
import { useTax } from './hooks/useTax';
import { autoLogRecurring } from './lib/recurringAutoLog';
import { LoginPage } from './components/auth/LoginPage';
import { AddExpenseModal } from './components/expenses/AddExpenseModal';
import { DashboardPage } from './pages/DashboardPage';
import { ExpensesPage } from './pages/ExpensesPage';
import { AiPage } from './pages/AiPage';
import { GoalsPage } from './pages/GoalsPage';
import { SettingsPage } from './pages/SettingsPage';
import { ImportPage } from './pages/ImportPage';
import { NetWorthPage } from './pages/NetWorthPage';
import { InvestmentsPage } from './pages/InvestmentsPage';
import { EventsPage } from './pages/EventsPage';
import { TaxPage } from './pages/TaxPage';
import { MorePage } from './pages/MorePage';
import { ToastProvider, useToast } from './components/layout/Toast';
import { Spinner } from './components/layout/Spinner';
import { Icon } from './components/layout/Icon';

const NAV_GROUPS = [
  { label: 'Overview', items: [
    { id: 'home',     label: 'Home',        icon: 'home' },
    { id: 'insights', label: 'Coach',       icon: 'sparkle' },
    { id: 'txns',     label: 'Activity',    icon: 'list' },
  ]},
  { label: 'Grow', items: [
    { id: 'invest',   label: 'Investments', icon: 'trend' },
    { id: 'goals',    label: 'Goals',       icon: 'target' },
    { id: 'networth', label: 'Net Worth',   icon: 'gem' },
    { id: 'events',   label: 'Events',      icon: 'calendar' },
  ]},
  { label: 'Plan', items: [
    { id: 'tax',      label: 'Tax',         icon: 'shield' },
    { id: 'import',   label: 'Import',      icon: 'download' },
    { id: 'settings', label: 'Settings',    icon: 'gear' },
  ]},
];

const MOBILE_NAV = [
  { id: 'home',     label: 'Home',     icon: 'home' },
  { id: 'insights', label: 'Coach',    icon: 'sparkle' },
  { id: 'txns',     label: 'Activity', icon: 'list' },
  { id: 'goals',    label: 'Goals',    icon: 'target' },
  { id: 'more',     label: 'More',     icon: 'grip' },
];

const PAGE_TITLES = {
  home: 'Dashboard', insights: 'AI Coach', txns: 'Activity', goals: 'Goals',
  networth: 'Net Worth', invest: 'Investments', events: 'Events',
  tax: 'Tax Planner', import: 'Import', settings: 'Settings', more: 'More',
};

const MOBILE_IDS = new Set(MOBILE_NAV.map(n => n.id));

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function AppInner() {
  const { session, user, signIn, signUp, signInWithMagicLink, signOut } = useAuth();
  const { theme, toggle: toggleTheme } = useTheme();
  const [tab, setTab] = useState('home');
  const [showAdd, setShowAdd] = useState(false);
  const toast = useToast();

  const userId = user?.id;
  const { expenses, loading: expLoading, addExpense, updateExpense, deleteExpense } = useExpenses(userId);

  useEffect(() => { if (userId) autoLogRecurring(userId); }, [userId]);
  const { categories, addCategory, deleteCategory } = useCategories(userId);
  const { budgets, upsertBudget } = useBudgets(userId);
  const { goals, addGoal, updateGoal, deleteGoal } = useGoals(userId);
  const { profile, updateProfile } = useProfile(userId);
  const { emis, addEmi, updateEmi, deleteEmi } = useEmis(userId);
  const { bills, addBill, updateBill, deleteBill } = useBills(userId);
  const { assets, liabilities, addAsset, updateAsset, deleteAsset, addLiability, updateLiability, deleteLiability } = useNetWorth(userId);
  const { investments, addInvestment, updateInvestment, deleteInvestment } = useInvestments(userId);
  const { events, addEvent, updateEvent, deleteEvent } = useEvents(userId);
  const { declarations, addDeclaration, updateDeclaration, deleteDeclaration } = useTax(userId);

  // Sync data-theme and data-accent on root element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-accent', 'green');
  }, [theme]);

  if (session === undefined) {
    return (
      <div className="loading-screen">
        <Spinner size={48} />
        <p>Loading…</p>
      </div>
    );
  }

  if (!session) {
    return <LoginPage onSignIn={signIn} onSignUp={signUp} onMagicLink={signInWithMagicLink} />;
  }

  async function handleAddExpense(data, silent = false) {
    try {
      await addExpense(data);
      if (!silent) {
        toast(`₹${data.amount} added!`);
        updateStreakIfNeeded();
      }
    } catch (err) {
      if (!silent) toast(err.message, 'error');
      throw err;
    }
  }

  async function updateStreakIfNeeded() {
    if (!profile || !budgets.length) return;
    const today = new Date().toISOString().split('T')[0];
    if (profile.last_streak_date === today) return;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    const totalBudget = budgets.reduce((a, b) => a + b.limit_amount, 0);
    const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
    const dailyBudget = totalBudget / daysInMonth;
    const todaySpend = expenses.filter(e => e.date === today).reduce((a, e) => a + Number(e.amount), 0);
    if (todaySpend <= dailyBudget) {
      const wasStreakContinued = profile.last_streak_date === yesterdayStr;
      const newStreak = wasStreakContinued ? (profile.current_streak || 0) + 1 : 1;
      await updateProfile({
        current_streak: newStreak,
        longest_streak: Math.max(newStreak, profile.longest_streak || 0),
        last_streak_date: today,
      });
    }
  }

  const userName = profile?.name || user?.email?.split('@')[0] || 'there';
  const userInitial = userName.charAt(0).toUpperCase();
  const mobileActive = MOBILE_IDS.has(tab) ? tab : 'more';

  function renderPage() {
    switch (tab) {
      case 'home':
        return <DashboardPage expenses={expenses} budgets={budgets} profile={profile} bills={bills} emis={emis} investments={investments} goals={goals} assets={assets} liabilities={liabilities} onAddExpense={() => setShowAdd(true)} />;
      case 'insights':
        return <AiPage userId={userId} expenses={expenses} budgets={budgets} goals={goals} profile={profile} investments={investments} assets={assets} liabilities={liabilities} bills={bills} />;
      case 'txns':
        return <ExpensesPage expenses={expenses} categories={categories} onAdd={handleAddExpense} onUpdate={updateExpense} onDelete={deleteExpense} />;
      case 'invest':
        return <InvestmentsPage investments={investments} onAdd={addInvestment} onUpdate={updateInvestment} onDelete={deleteInvestment} />;
      case 'goals':
        return <GoalsPage goals={goals} onAdd={addGoal} onUpdate={updateGoal} onDelete={deleteGoal} />;
      case 'networth':
        return <NetWorthPage assets={assets} liabilities={liabilities} onAddAsset={addAsset} onUpdateAsset={updateAsset} onDeleteAsset={deleteAsset} onAddLiability={addLiability} onUpdateLiability={updateLiability} onDeleteLiability={deleteLiability} />;
      case 'events':
        return <EventsPage events={events} onAdd={addEvent} onUpdate={updateEvent} onDelete={deleteEvent} expenses={expenses} />;
      case 'tax':
        return <TaxPage declarations={declarations} onAdd={addDeclaration} onUpdate={updateDeclaration} onDelete={deleteDeclaration} />;
      case 'import':
        return <ImportPage categories={categories} onAdd={handleAddExpense} />;
      case 'settings':
        return (
          <SettingsPage
            profile={profile} onUpdateProfile={updateProfile}
            categories={categories} onAddCategory={addCategory} onDeleteCategory={deleteCategory}
            budgets={budgets} onUpsertBudget={upsertBudget}
            emis={emis} onAddEmi={addEmi} onUpdateEmi={updateEmi} onDeleteEmi={deleteEmi}
            bills={bills} onAddBill={addBill} onUpdateBill={updateBill} onDeleteBill={deleteBill}
            expenses={expenses} userId={userId} onSignOut={signOut}
          />
        );
      case 'more':
        return <MorePage onNav={setTab} />;
      default:
        return null;
    }
  }

  return (
    <div className="app" data-theme={theme} data-accent="green">
      {/* SIDEBAR */}
      <aside className="rail">
        <div className="brand">
          <div className="brand-mark"><Icon name="wallet" size={19} /></div>
          <div className="brand-name">Rupee<span>.</span></div>
        </div>
        <nav className="rail-nav">
          {NAV_GROUPS.map(group => (
            <div key={group.label}>
              <div className="rail-group">{group.label}</div>
              {group.items.map(item => (
                <button
                  key={item.id}
                  className={`rail-link${tab === item.id ? ' on' : ''}`}
                  onClick={() => setTab(item.id)}
                >
                  <Icon name={item.icon} size={20} />
                  {item.label}
                </button>
              ))}
            </div>
          ))}
        </nav>
        <div className="rail-spacer" />
        <button className="rail-link" onClick={toggleTheme}>
          <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={20} />
          {theme === 'dark' ? 'Light mode' : 'Dark mode'}
        </button>
        <div className="rail-card">
          <div className="rail-user">
            <div className="avatar">{userInitial}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13.5, fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{userName}</div>
              <div style={{ fontSize: 11.5, color: 'var(--ink-3)', fontWeight: 600 }}>✦ Premium</div>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN COLUMN */}
      <div className="main">
        <header className="topbar">
          <div className="tb-title">
            {tab === 'home' ? (
              <>
                <span className="tb-hi">{getGreeting()},</span>
                <span className="tb-name">{userName} 👋</span>
              </>
            ) : (
              <span className="tb-name">{PAGE_TITLES[tab] || ''}</span>
            )}
          </div>
          <div className="tb-grow" />
          <div className="tb-actions">
            <button className="icon-btn" onClick={toggleTheme} title="Toggle theme">
              <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={18} />
            </button>
            <button className="icon-btn tb-search" title="Search">
              <Icon name="search" size={18} />
            </button>
            <button className="icon-btn tb-bell" title="Notifications">
              <Icon name="bell" size={18} />
            </button>
            <button className="btn-accent" onClick={() => setShowAdd(true)}>
              <Icon name="plus" size={16} />Add
            </button>
          </div>
        </header>

        <main className="content">
          <div className="wrap">
            {expLoading && tab === 'home' ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
                <Spinner size={32} />
              </div>
            ) : renderPage()}
          </div>
        </main>
      </div>

      {/* MOBILE BOTTOM NAV */}
      <nav className="botnav">
        {MOBILE_NAV.map(item => (
          <button
            key={item.id}
            className={mobileActive === item.id ? 'on' : ''}
            onClick={() => setTab(item.id)}
          >
            <Icon name={item.icon} size={22} />
            <span className="bn-label">{item.label}</span>
          </button>
        ))}
      </nav>

      {showAdd && (
        <AddExpenseModal
          categories={categories}
          onAdd={handleAddExpense}
          onClose={() => setShowAdd(false)}
        />
      )}
    </div>
  );
}

class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{ minHeight: '100vh', background: '#f4f2ec', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: 'Manrope, sans-serif' }}>
          <div style={{ background: '#fff', borderRadius: 18, border: '1px solid rgba(24,28,34,0.08)', boxShadow: '0 4px 24px rgba(24,28,34,.10)', padding: 36, maxWidth: 560, width: '100%' }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg,#e53935,#b71c1c)', display: 'grid', placeItems: 'center', color: '#fff', fontSize: 22, marginBottom: 20 }}>!</div>
            <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 8, color: '#181c22' }}>Something went wrong</div>
            <pre style={{ background: '#0a0c10', color: '#ff8a80', padding: '16px 18px', borderRadius: 12, fontSize: 12, overflowX: 'auto', lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {this.state.error.message}{'\n\n'}{this.state.error.stack}
            </pre>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const missingEnv = !import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY;

export default function App() {
  if (missingEnv) {
    return (
      <div style={{ minHeight: '100vh', background: '#f4f2ec', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: 'Manrope, sans-serif' }}>
        <div style={{ background: '#fff', borderRadius: 18, border: '1px solid rgba(24,28,34,0.08)', boxShadow: '0 2px 6px rgba(24,28,34,.05), 0 14px 30px -18px rgba(24,28,34,.28)', padding: 36, maxWidth: 480, width: '100%' }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg,#0a9d72,#0a8a86)', display: 'grid', placeItems: 'center', color: '#fff', fontSize: 22, marginBottom: 20 }}>₹</div>
          <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Setup required</div>
          <div style={{ fontSize: 14, color: '#565d68', lineHeight: 1.6, marginBottom: 20 }}>
            Create a <code style={{ background: '#f7f5ef', padding: '2px 6px', borderRadius: 6, fontFamily: 'monospace' }}>.env.local</code> file in the project root with your Supabase credentials:
          </div>
          <pre style={{ background: '#0a0c10', color: '#34e0a8', padding: '16px 18px', borderRadius: 12, fontSize: 12.5, overflowX: 'auto', marginBottom: 20, lineHeight: 1.7 }}>
{`VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key`}
          </pre>
          <div style={{ fontSize: 13, color: '#8a909b', fontWeight: 600 }}>
            Find these in <strong style={{ color: '#0a9d72' }}>Supabase Dashboard → Project Settings → API</strong>, then restart the dev server.
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ToastProvider>
          <AppInner />
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
