import { useState } from 'react';
import { StatCard } from '../components/dashboard/StatCard';
import { SpendingChart } from '../components/dashboard/SpendingChart';
import { CategoryPieChart } from '../components/dashboard/CategoryPieChart';
import { BudgetProgressBar } from '../components/dashboard/BudgetProgressBar';
import { useDashboardData } from '../hooks/useDashboardData';
import { startOfMonthStr } from '../lib/dateUtils';

const RANGES = ['daily', 'weekly', 'monthly'];
const RANGE_LABELS = { daily: 'Today', weekly: 'This Week', monthly: 'This Month' };

export function DashboardPage({ expenses, budgets }) {
  const [range, setRange] = useState('monthly');
  const data = useDashboardData(expenses, range);

  const monthStart = startOfMonthStr();
  const categorySpendMap = {};
  for (const e of expenses.filter(ex => ex.date >= monthStart)) {
    const id = e.category_id || 'uncategorized';
    categorySpendMap[id] = (categorySpendMap[id] || 0) + Number(e.amount);
  }

  return (
    <div className="page">
      <div className="page-header">
        <h2>Dashboard</h2>
        <div className="range-toggle">
          {RANGES.map(r => (
            <button key={r} className={range === r ? 'active' : ''} onClick={() => setRange(r)}>
              {RANGE_LABELS[r]}
            </button>
          ))}
        </div>
      </div>

      <div className="stat-grid">
        <StatCard label="Today" amount={data.todayTotal} icon="📅" color="#6366f1" />
        <StatCard label="This Week" amount={data.weekTotal} icon="📆" color="#0ea5e9" />
        <StatCard label="This Month" amount={data.monthTotal} icon="🗓️" color="#f59e0b" />
      </div>

      <SpendingChart dailyBars={data.dailyBars} />
      <CategoryPieChart categoryTotals={data.categoryTotals} />

      {budgets.length > 0 && (
        <div className="section-card">
          <h4>Budget Status (This Month)</h4>
          {budgets.map(b => (
            <BudgetProgressBar key={b.id} budget={b} spent={categorySpendMap[b.category_id] || 0} />
          ))}
        </div>
      )}

      {budgets.length === 0 && (
        <div className="empty-hint">
          💡 Set monthly budgets in Settings to track spending limits.
        </div>
      )}
    </div>
  );
}
