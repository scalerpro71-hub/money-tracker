import { useState } from 'react';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { useAuth } from './hooks/useAuth';
import { useExpenses } from './hooks/useExpenses';
import { useCategories } from './hooks/useCategories';
import { useBudgets } from './hooks/useBudgets';
import { useGoals } from './hooks/useGoals';
import { useProfile } from './hooks/useProfile';
import { LoginPage } from './components/auth/LoginPage';
import { AddExpenseModal } from './components/expenses/AddExpenseModal';
import { DashboardPage } from './pages/DashboardPage';
import { ExpensesPage } from './pages/ExpensesPage';
import { AiPage } from './pages/AiPage';
import { GoalsPage } from './pages/GoalsPage';
import { SettingsPage } from './pages/SettingsPage';
import { ImportPage } from './pages/ImportPage';
import { ToastProvider, useToast } from './components/layout/Toast';
import { Spinner } from './components/layout/Spinner';

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'expenses', label: 'Expenses', icon: '📝' },
  { id: 'ai', label: 'AI', icon: '✨' },
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
    } catch (err) {
      toast(err.message, 'error');
      throw err;
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
            {tab === 'dashboard' && <DashboardPage expenses={expenses} budgets={budgets} profile={profile} />}
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
