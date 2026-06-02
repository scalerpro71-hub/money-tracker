import { useState } from 'react';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { useAuth } from './hooks/useAuth';
import { useExpenses } from './hooks/useExpenses';
import { useCategories } from './hooks/useCategories';
import { useBudgets } from './hooks/useBudgets';
import { useGoals } from './hooks/useGoals';
import { useProfile } from './hooks/useProfile';
import { useEmis } from './hooks/useEmis';
import { useBills } from './hooks/useBills';
import { LoginPage } from './components/auth/LoginPage';
import { AddExpenseModal } from './components/expenses/AddExpenseModal';
import { DashboardPage } from './pages/DashboardPage';
import { ExpensesPage } from './pages/ExpensesPage';
import { AiPage } from './pages/AiPage';
import { AiChatPage } from './pages/AiChatPage';
import { GoalsPage } from './pages/GoalsPage';
import { SettingsPage } from './pages/SettingsPage';
import { ImportPage } from './pages/ImportPage';
import { ToastProvider, useToast } from './components/layout/Toast';
import { Spinner } from './components/layout/Spinner';

const TABS = [
  { id: 'dashboard', label: 'Home', icon: '📊' },
  { id: 'expenses', label: 'Expenses', icon: '📝' },
  { id: 'chat', label: 'Ask AI', icon: '✨' },
  { id: 'goals', label: 'Goals', icon: '🎯' },
  { id: 'import', label: 'Import', icon: '📂' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
];

function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button className="btn-theme-toggle" onClick={toggle} aria-label="Toggle theme">
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
}

function AppInner() {
  const { session, user, signIn, signUp, signInWithMagicLink, signOut } = useAuth();
  const [tab, setTab] = useState('dashboard');
  const [showAdd, setShowAdd] = useState(false);
  const toast = useToast();

  const userId = user?.id;
  const { expenses, loading: expLoading, addExpense, updateExpense, deleteExpense } = useExpenses(userId);
  const { categories, addCategory, deleteCategory } = useCategories(userId);
  const { budgets, upsertBudget } = useBudgets(userId);
  const { goals, addGoal, updateGoal, deleteGoal } = useGoals(userId);
  const { profile, updateProfile } = useProfile(userId);
  const { emis, addEmi, deleteEmi } = useEmis(userId);
  const { bills, addBill, deleteBill } = useBills(userId);

  if (session === undefined) {
    return (
      <div className="loading-screen">
        <Spinner size={48} />
        <p>Loading...</p>
      </div>
    );
  }

  if (!session) {
    return <LoginPage onSignIn={signIn} onSignUp={signUp} onMagicLink={signInWithMagicLink} />;
  }

  async function handleAddExpense(data) {
    try {
      await addExpense(data);
      toast(`₹${data.amount} added!`);
      updateStreakIfNeeded();
    } catch (err) {
      toast(err.message, 'error');
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

  return (
    <div className="app">
      <header className="top-bar">
        <div className="app-title">💰 Rupee Tracker</div>
        <div className="top-bar-actions">
          <ThemeToggle />
          <button className="btn-add" onClick={() => setShowAdd(true)}>+ Add</button>
        </div>
      </header>

      <main className="main-content">
        {expLoading && tab === 'dashboard' ? (
          <div className="loading-screen"><Spinner size={32} /><p>Loading...</p></div>
        ) : (
          <>
            {tab === 'dashboard' && <DashboardPage expenses={expenses} budgets={budgets} profile={profile} bills={bills} emis={emis} />}
            {tab === 'expenses' && (
              <ExpensesPage
                expenses={expenses}
                categories={categories}
                onAdd={handleAddExpense}
                onUpdate={updateExpense}
                onDelete={deleteExpense}
              />
            )}
            {tab === 'ai' && (
              <AiPage userId={userId} expenses={expenses} budgets={budgets} goals={goals} profile={profile} />
            )}
            {tab === 'chat' && (
              <AiChatPage userId={userId} expenses={expenses} budgets={budgets} goals={goals} profile={profile} />
            )}
            {tab === 'goals' && (
              <GoalsPage goals={goals} onAdd={addGoal} onUpdate={updateGoal} onDelete={deleteGoal} />
            )}
            {tab === 'import' && (
              <ImportPage categories={categories} onAdd={handleAddExpense} />
            )}
            {tab === 'settings' && (
              <SettingsPage
                profile={profile}
                onUpdateProfile={updateProfile}
                categories={categories}
                onAddCategory={addCategory}
                onDeleteCategory={deleteCategory}
                budgets={budgets}
                onUpsertBudget={upsertBudget}
                emis={emis}
                onAddEmi={addEmi}
                onDeleteEmi={deleteEmi}
                bills={bills}
                onAddBill={addBill}
                onDeleteBill={deleteBill}
                expenses={expenses}
                userId={userId}
                onSignOut={signOut}
              />
            )}
          </>
        )}
      </main>

      <nav className="tab-bar">
        {TABS.map(t => (
          <button key={t.id} className={`tab-btn ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
            <span className="tab-icon">{t.icon}</span>
            <span className="tab-label">{t.label}</span>
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

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AppInner />
      </ToastProvider>
    </ThemeProvider>
  );
}
