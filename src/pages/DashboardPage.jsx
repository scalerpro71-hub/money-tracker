import { useState } from 'react';
import { StatCard } from '../components/dashboard/StatCard';
import { ChartCarousel } from '../components/dashboard/ChartCarousel';
import { BudgetRing } from '../components/dashboard/BudgetRing';
import { WeekComparison } from '../components/dashboard/WeekComparison';
import { useDashboardData } from '../hooks/useDashboardData';
import { startOfMonthStr } from '../lib/dateUtils';

const RANGES = ['daily', 'weekly', 'monthly'];
const RANGE_LABELS = { daily: 'Today', weekly: 'This Week', monthly: 'This Month' };

export function DashboardPage({ expenses, budgets, profile }) {
  const [range, setRange] = useState('monthly');
  const data = useDashboardData(expenses, range);

  const monthStart = startOfMonthStr();
  const monthExpenses = expenses.filter(ex => ex.date >= monthStart);
  const txCount = monthExpenses.length;

  const categorySpendMap = {};
  for (const e of monthExpenses) {
    const id = e.category_id || 'uncategorized';
    categorySpendMap[id] = (categorySpendMap[id] || 0) + Number(e.amount);
  }

  return (
    <div className="page">
      {/* Hero */}
      <div className="dashboard-hero">
        <div className="hero-label">Spent this month</div>
        <div className="hero-amount">₹{data.monthTotal.toLocaleString('en-IN')}</div>
        <div className="hero-sub">across {txCount} transaction{txCount !== 1 ? 's' : ''}</div>
        <div className="range-toggle hero-range-toggle">
          {RANGES.map(r => (
            <button key={r} className={range === r ? 'active' : ''} onClick={() => setRange(r)}>
              {RANGE_LABELS[r]}
            </button>
          ))}
        </div>
      </div>

      {/* Stat cards */}
      <div className="stat-grid">
        <StatCard label="Today" amount={data.todayTotal} icon="📅" color="#6366f1" />
        <StatCard label="This Week" amount={data.weekTotal} icon="📆" color="#0ea5e9" />
        <StatCard label="This Month" amount={data.monthTotal} icon="🗓️" color="#f59e0b" />
      </div>

      {/* Week comparison */}
      <WeekComparison
        weekTotal={data.weekTotal}
        prevWeekTotal={data.prevWeekTotal}
        weekChange={data.weekChange}
      />

      {/* Swipeable chart carousel */}
      <ChartCarousel data={data} profile={profile} />

      {/* Budget rings */}
      {budgets.length > 0 && (
        <div className="section-card">
          <h4>Budget Status (This Month)</h4>
          <div className="budget-ring-grid">
            {budgets.map(b => (
              <BudgetRing key={b.id} budget={b} spent={categorySpendMap[b.category_id] || 0} />
            ))}
          </div>
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
