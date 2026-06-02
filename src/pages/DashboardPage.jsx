import { useState } from 'react';
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
import { startOfMonthStr } from '../lib/dateUtils';

const RANGES = ['daily', 'weekly', 'monthly'];
const RANGE_LABELS = { daily: 'Today', weekly: 'This Week', monthly: 'This Month' };

export function DashboardPage({ expenses, budgets, profile, bills, emis }) {
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

  const income = Number(profile?.monthly_income) || 0;

  return (
    <div className="page">
      {/* Streak */}
      <SpendingStreak profile={profile} />

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

      {/* Salary countdown */}
      <SalaryCountdown profile={profile} monthTotal={data.monthTotal} budgets={budgets} categorySpendMap={categorySpendMap} />

      {/* Stat cards */}
      <div className="stat-grid">
        <StatCard label="Today" amount={data.todayTotal} icon="📅" color="#6366f1" />
        <StatCard label="This Week" amount={data.weekTotal} icon="📆" color="#0ea5e9" />
        <StatCard label="This Month" amount={data.monthTotal} icon="🗓️" color="#f59e0b" />
      </div>

      {/* Monthly savings overview */}
      <MonthlySavingsBar income={income} spent={data.monthTotal} />

      {/* Predictive alerts */}
      <BudgetAlert budgets={budgets} categorySpendMap={categorySpendMap} />

      {/* Expense velocity */}
      <ExpenseVelocity monthlyTrend={data.monthlyTrend} />

      {/* Week comparison */}
      <WeekComparison weekTotal={data.weekTotal} prevWeekTotal={data.prevWeekTotal} weekChange={data.weekChange} />

      {/* Bills due this week */}
      <BillsWidget bills={bills} />

      {/* Chart carousel — 10 slides */}
      <ChartCarousel data={data} profile={profile} expenses={expenses} budgets={budgets} />

      {/* EMI tracker */}
      <EmiSummary emis={emis} />

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

      {/* Cashback tracker */}
      <CashbackWidget expenses={expenses} />

      {/* Recent transactions */}
      <RecentTransactions expenses={expenses} />

      {budgets.length === 0 && (
        <div className="empty-hint">
          💡 Set monthly budgets in Settings to track spending limits.
        </div>
      )}
    </div>
  );
}
