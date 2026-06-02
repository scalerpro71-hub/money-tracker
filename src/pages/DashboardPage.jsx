import { useState, useMemo } from 'react';
import { StatCard } from '../components/dashboard/StatCard';
import { ChartCarousel } from '../components/dashboard/ChartCarousel';
import { BudgetRing } from '../components/dashboard/BudgetRing';
import { WeekComparison } from '../components/dashboard/WeekComparison';
import { BudgetAlert } from '../components/dashboard/BudgetAlert';
import { ExpenseVelocity } from '../components/dashboard/ExpenseVelocity';
import { SalaryCountdown } from '../components/dashboard/SalaryCountdown';
import { SpendingStreak } from '../components/dashboard/SpendingStreak';
import { BillsWidget } from '../components/dashboard/BillsWidget';
import { EmiSummary } from '../components/dashboard/EmiSummary';
import { RecentTransactions } from '../components/dashboard/RecentTransactions';
import { MonthlySavingsBar } from '../components/dashboard/MonthlySavingsBar';
import { CashbackWidget } from '../components/dashboard/CashbackWidget';
import { useDashboardData } from '../hooks/useDashboardData';

function getMonthKey(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function monthLabel(key) {
  const [y, m] = key.split('-');
  return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
}

function getAvailableMonths(expenses) {
  const keys = new Set(expenses.map(e => e.date?.slice(0, 7)).filter(Boolean));
  // Also add current month even if empty
  const today = new Date();
  keys.add(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`);
  return Array.from(keys).sort().reverse(); // newest first
}

export function DashboardPage({ expenses, budgets, profile, bills, emis }) {
  const availableMonths = useMemo(() => getAvailableMonths(expenses), [expenses]);

  // Default to the most recent month that has data
  const defaultMonth = useMemo(() => {
    const withData = availableMonths.find(m => expenses.some(e => e.date?.startsWith(m)));
    return withData || availableMonths[0];
  }, [availableMonths, expenses]);

  const [selectedMonth, setSelectedMonth] = useState(null);
  const activeMonth = selectedMonth || defaultMonth;

  const isCurrentMonth = activeMonth === getMonthKey(new Date());

  // Filter expenses for selected month
  const monthExpenses = useMemo(() =>
    expenses.filter(e => e.date?.startsWith(activeMonth) && e.type !== 'income'),
    [expenses, activeMonth]
  );
  const monthIncome = useMemo(() =>
    expenses.filter(e => e.date?.startsWith(activeMonth) && e.type === 'income')
      .reduce((a, e) => a + Number(e.amount), 0),
    [expenses, activeMonth]
  );

  const monthTotal = monthExpenses.reduce((a, e) => a + Number(e.amount), 0);
  const txCount = monthExpenses.length;

  const categorySpendMap = {};
  for (const e of monthExpenses) {
    const id = e.category_id || 'uncategorized';
    categorySpendMap[id] = (categorySpendMap[id] || 0) + Number(e.amount);
  }

  // Top category
  const topCatEntry = Object.entries(categorySpendMap).sort((a, b) => b[1] - a[1])[0];

  const data = useDashboardData(expenses, 'monthly');
  const income = Number(profile?.monthly_income) || monthIncome;

  // Savings
  const savings = income > 0 ? income - monthTotal : null;
  const savingsRate = income > 0 ? Math.round(((income - monthTotal) / income) * 100) : null;

  return (
    <div className="page">
      <SpendingStreak profile={profile} />

      {/* Month selector */}
      <div className="section-card" style={{ padding: '10px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-muted)' }}>Viewing</span>
          <select
            value={activeMonth}
            onChange={e => setSelectedMonth(e.target.value)}
            style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)', background: 'var(--color-surface-2)', border: '1.5px solid var(--color-border)', borderRadius: 8, padding: '4px 10px' }}
          >
            {availableMonths.map(m => (
              <option key={m} value={m}>{monthLabel(m)}{m === getMonthKey(new Date()) ? ' (current)' : ''}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Hero */}
      <div className="dashboard-hero">
        <div className="hero-label">Total spent · {monthLabel(activeMonth)}</div>
        <div className="hero-amount">₹{monthTotal.toLocaleString('en-IN')}</div>
        <div className="hero-sub">across {txCount} transaction{txCount !== 1 ? 's' : ''}</div>

        {/* Quick insight line */}
        {txCount > 0 && (
          <div style={{ marginTop: 8, fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>
            {savingsRate !== null
              ? savingsRate >= 0
                ? `💚 Saved ₹${Math.abs(savings).toLocaleString('en-IN')} (${savingsRate}% of income)`
                : `🔴 Overspent by ₹${Math.abs(savings).toLocaleString('en-IN')}`
              : `Avg ₹${Math.round(monthTotal / txCount).toLocaleString('en-IN')} per transaction`}
          </div>
        )}
      </div>

      {/* Stat cards */}
      <div className="stat-grid">
        <StatCard label="Total Spent" amount={monthTotal} icon="💸" color="#ef4444" />
        <StatCard label="Income" amount={income} icon="💰" color="#10b981" />
        <StatCard label="Saved" amount={Math.max(0, income - monthTotal)} icon="🏦" color="#6366f1" />
      </div>

      {/* Savings bar */}
      <MonthlySavingsBar income={income} spent={monthTotal} />

      {/* Category breakdown — top spends */}
      {Object.keys(categorySpendMap).length > 0 && (
        <div className="section-card">
          <h4>Where your money went</h4>
          <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {Object.entries(categorySpendMap)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 6)
              .map(([catId, amt]) => {
                const pct = Math.round((amt / monthTotal) * 100);
                const cat = expenses.find(e => e.category_id === catId)?.category;
                const label = cat?.name || 'Uncategorized';
                const icon = cat?.icon || '💰';
                const color = cat?.color || '#6b7280';
                return (
                  <div key={catId}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 3 }}>
                      <span>{icon} {label}</span>
                      <span style={{ fontWeight: 700 }}>₹{amt.toLocaleString('en-IN')} <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>({pct}%)</span></span>
                    </div>
                    <div style={{ height: 6, background: 'var(--color-surface-2)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 3, transition: 'width 0.6s ease' }} />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Only show current-month widgets when viewing current month */}
      {isCurrentMonth && (
        <>
          <SalaryCountdown profile={profile} monthTotal={monthTotal} budgets={budgets} categorySpendMap={categorySpendMap} />
          <BudgetAlert budgets={budgets} categorySpendMap={categorySpendMap} />
          <WeekComparison weekTotal={data.weekTotal} prevWeekTotal={data.prevWeekTotal} weekChange={data.weekChange} />
          <BillsWidget bills={bills} />
        </>
      )}

      <ExpenseVelocity monthlyTrend={data.monthlyTrend} />

      {/* Chart carousel */}
      <ChartCarousel data={data} profile={profile} expenses={monthExpenses} budgets={budgets} />

      <EmiSummary emis={emis} />

      {budgets.length > 0 && (
        <div className="section-card">
          <h4>Budget Status · {monthLabel(activeMonth)}</h4>
          <div className="budget-ring-grid">
            {budgets.map(b => (
              <BudgetRing key={b.id} budget={b} spent={categorySpendMap[b.category_id] || 0} />
            ))}
          </div>
        </div>
      )}

      <CashbackWidget expenses={monthExpenses} />
      <RecentTransactions expenses={monthExpenses} />

      {txCount === 0 && (
        <div className="empty-hint">
          💡 No transactions found for {monthLabel(activeMonth)}. Import your bank statement or add expenses manually.
        </div>
      )}
    </div>
  );
}
