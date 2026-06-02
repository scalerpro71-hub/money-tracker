import { useState, useMemo } from 'react';
import { Icon } from '../components/layout/Icon';
import { Ring } from '../components/charts/Ring';
import { cur, fmtK } from '../lib/formatUtils';
import { BudgetAlert } from '../components/dashboard/BudgetAlert';
import { SpendingStreak } from '../components/dashboard/SpendingStreak';
import { EmiSummary } from '../components/dashboard/EmiSummary';
import { SalaryCountdown } from '../components/dashboard/SalaryCountdown';
import { CashbackWidget } from '../components/dashboard/CashbackWidget';
import { useDashboardData } from '../hooks/useDashboardData';

function getMonthKey(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function monthLabel(key) {
  const [y, m] = key.split('-');
  return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
}

function monthShort(key) {
  const [y, m] = key.split('-');
  return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
}

function getAvailableMonths(expenses) {
  const keys = new Set(expenses.map(e => e.date?.slice(0, 7)).filter(Boolean));
  const today = new Date();
  keys.add(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`);
  return Array.from(keys).sort().reverse();
}

function daysLeftInMonth() {
  const today = new Date();
  const last = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  return last.getDate() - today.getDate();
}

function classifyInsight(text) {
  if (text.startsWith('💚') || text.startsWith('📉')) return 'good';
  if (text.startsWith('🔴') || text.startsWith('🚨') || text.startsWith('📈')) return 'warn';
  return 'tip';
}

function cleanInsightText(text) {
  return text.replace(/^[💚🟡⚠️🔴📈📉🚨🎯]\s*/, '');
}

function generateInsights(monthTotal, savingsRate, income, budgets, categorySpendMap, prevMonthTotal) {
  const insights = [];
  if (savingsRate !== null) {
    if (savingsRate >= 30) insights.push({ tag: 'good', title: 'Great savings rate', body: `You saved ${savingsRate}% of income this month — on track to build wealth.` });
    else if (savingsRate >= 10) insights.push({ tag: 'tip', title: 'Room to save more', body: `You saved ${savingsRate}% of income. Target 30% for long-term wealth building.` });
    else if (savingsRate < 0) insights.push({ tag: 'warn', title: 'Overspent this month', body: `You exceeded income by ${cur(Math.abs(income - monthTotal))} this month.` });
    else insights.push({ tag: 'tip', title: 'Low savings rate', body: `Only ${savingsRate}% saved — try to cut one discretionary category.` });
  }
  if (prevMonthTotal > 0) {
    const change = ((monthTotal - prevMonthTotal) / prevMonthTotal) * 100;
    if (change > 15) insights.push({ tag: 'warn', title: `Spending up ${Math.round(change)}%`, body: 'Higher than last month — check if any category spiked.' });
    else if (change < -15) insights.push({ tag: 'good', title: `Spending down ${Math.round(Math.abs(change))}%`, body: 'Great control compared to last month. Keep it up!' });
  }
  if (budgets.length > 0) {
    const over = budgets.filter(b => (categorySpendMap[b.category_id] || 0) > b.limit_amount).length;
    if (over > 0) insights.push({ tag: 'warn', title: `${over} budget${over > 1 ? 's' : ''} exceeded`, body: `Review overspent categories to get back on track.` });
  }
  return insights.slice(0, 3);
}

export function DashboardPage({ expenses, budgets, profile, bills, emis, investments, goals, assets, liabilities, onAddExpense }) {
  const availableMonths = useMemo(() => getAvailableMonths(expenses), [expenses]);
  const defaultMonth = useMemo(() => {
    const withData = availableMonths.find(m => expenses.some(e => e.date?.startsWith(m)));
    return withData || availableMonths[0];
  }, [availableMonths, expenses]);

  const [selectedMonth, setSelectedMonth] = useState(null);
  const activeMonth = selectedMonth || defaultMonth || getMonthKey(new Date());
  const isCurrentMonth = activeMonth === getMonthKey(new Date());

  const monthExpenses = useMemo(() =>
    expenses.filter(e => e.date?.startsWith(activeMonth) && e.type !== 'income'), [expenses, activeMonth]);
  const monthIncome = useMemo(() =>
    expenses.filter(e => e.date?.startsWith(activeMonth) && e.type === 'income')
      .reduce((a, e) => a + Number(e.amount), 0), [expenses, activeMonth]);

  const monthTotal = monthExpenses.reduce((a, e) => a + Number(e.amount), 0);
  const income = Number(profile?.monthly_income) || monthIncome;
  const totalBudget = budgets.reduce((a, b) => a + b.limit_amount, 0);
  const spendable = totalBudget > 0 ? totalBudget - monthTotal : income - monthTotal;
  const budgetPct = totalBudget > 0 ? Math.round((monthTotal / totalBudget) * 100) : 0;
  const savingsRate = income > 0 ? Math.round(((income - monthTotal) / income) * 100) : null;
  const saved = income > 0 ? income - monthTotal : 0;

  const categorySpendMap = useMemo(() => {
    const map = {};
    for (const e of monthExpenses) {
      const id = e.category_id || 'uncategorized';
      map[id] = (map[id] || 0) + Number(e.amount);
    }
    return map;
  }, [monthExpenses]);

  const prevMonthKey = useMemo(() => {
    const [y, m] = activeMonth.split('-');
    let pm = Number(m) - 1, py = Number(y);
    if (pm < 1) { pm = 12; py--; }
    return `${py}-${String(pm).padStart(2, '0')}`;
  }, [activeMonth]);
  const prevMonthTotal = useMemo(() =>
    expenses.filter(e => e.date?.startsWith(prevMonthKey) && e.type !== 'income')
      .reduce((a, e) => a + Number(e.amount), 0), [expenses, prevMonthKey]);

  const insights = generateInsights(monthTotal, savingsRate, income, budgets, categorySpendMap, prevMonthTotal);

  const data = useDashboardData(expenses, 'monthly');

  // Top categories with budget info
  const topCategories = useMemo(() => {
    return Object.entries(categorySpendMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([catId, amt]) => {
        const exp = expenses.find(e => e.category_id === catId);
        const budget = budgets.find(b => b.category_id === catId);
        return {
          catId, amt,
          name: exp?.category?.name || 'Other',
          icon: exp?.category?.icon || '💰',
          color: exp?.category?.color || '#6b7280',
          budget: budget?.limit_amount || 0,
        };
      });
  }, [categorySpendMap, expenses, budgets]);

  const recentTxns = useMemo(() => [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 6), [expenses]);
  const upcomingBills = useMemo(() => {
    if (!bills) return [];
    const today = new Date().getDate();
    return bills
      .filter(b => b.due_day)
      .sort((a, b) => {
        const da = a.due_day >= today ? a.due_day - today : a.due_day + 31 - today;
        const db = b.due_day >= today ? b.due_day - today : b.due_day + 31 - today;
        return da - db;
      })
      .slice(0, 4);
  }, [bills]);

  // Projected month-end spend
  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const dayOfMonth = today.getDate();
  const dailySafe = totalBudget > 0 && daysLeftInMonth() > 0
    ? Math.max(0, spendable / daysLeftInMonth())
    : null;
  const projected = isCurrentMonth && dayOfMonth > 0
    ? Math.round((monthTotal / dayOfMonth) * daysInMonth)
    : null;

  const MONTHS_EN = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

  return (
    <div className="dash">
      {/* HERO CARD */}
      <div className="hero rise" style={{ '--d': '0ms' }}>
        <div className="hero-top">
          <div className="hero-label">SPENDABLE THIS MONTH</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <select
              value={activeMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              className="hero-pill"
              style={{ background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.18)', color: 'rgba(255,255,255,0.95)', cursor: 'pointer', outline: 'none' }}
            >
              {availableMonths.map(m => (
                <option key={m} value={m} style={{ background: '#14181f', color: '#eef1f5' }}>{monthShort(m)}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="hero-bal">
          <span className="cur">₹</span>
          <span className="num">{fmtK(Math.abs(spendable))}</span>
        </div>
        <div className="hero-sub">
          {totalBudget > 0
            ? `of ${cur(totalBudget)} budget · ${budgetPct}% used${isCurrentMonth ? ` · resets in ${daysLeftInMonth()} days` : ''}`
            : monthTotal > 0 ? `spent of ${cur(income)} income` : 'No budget set · go to Settings'}
        </div>
        <div className="hero-splits">
          <div className="hero-split">
            <div className="hs-label"><span className="dot in" />Income</div>
            <div className="hs-val num">{fmtK(income)}</div>
          </div>
          <div className="hero-split">
            <div className="hs-label"><span className="dot out" />Spent</div>
            <div className="hs-val num">{fmtK(monthTotal)}</div>
          </div>
          <div className="hero-split">
            <div className="hs-label"><span className="dot save" />Saved</div>
            <div className="hs-val num">{fmtK(Math.max(0, saved))}</div>
          </div>
        </div>
        <div className="hero-actions">
          <button className="ha solid" onClick={onAddExpense}>
            <Icon name="plus" size={15} />Add expense
          </button>
          <button className="ha">
            <Icon name="arrowR" size={15} />Transfer
          </button>
          <button className="ha">
            <Icon name="wallet" size={15} />Pay bills
          </button>
        </div>
      </div>

      {/* ROW 1: Budget Ring + Smart Insights */}
      <div className="grid-2" style={{ marginTop: 18 }}>
        <div className="card pad rise" style={{ '--d': '60ms' }}>
          <div className="eyebrow" style={{ marginBottom: 18 }}>Budget Overview</div>
          <div className="ring-card">
            <div className="ring-wrap" style={{ width: 130, height: 130 }}>
              <Ring pct={budgetPct} size={130} stroke={14} />
              <div className="ring-center">
                <div className="rc-pct num">{budgetPct}%</div>
                <div className="rc-cap">used</div>
              </div>
            </div>
            <div className="ring-facts">
              {dailySafe !== null && (
                <div className="ring-fact">
                  <div className="rf-label">Daily safe-to-spend</div>
                  <div className="rf-val num">{cur(Math.round(dailySafe))}</div>
                </div>
              )}
              {projected !== null && (
                <div className="ring-fact">
                  <div className="rf-label">Projected month-end</div>
                  <div className="rf-val num" style={{ color: projected > totalBudget ? 'var(--neg)' : 'inherit' }}>
                    {cur(projected)}
                  </div>
                </div>
              )}
              {savingsRate !== null && (
                <div className="ring-fact">
                  <div className="rf-label">Savings rate</div>
                  <div className="rf-val num" style={{ color: savingsRate >= 20 ? 'var(--pos)' : savingsRate < 0 ? 'var(--neg)' : 'inherit' }}>
                    {savingsRate}%
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="card pad rise" style={{ '--d': '120ms' }}>
          <div className="insights-head">
            <h3>Smart insights</h3>
            <span className="ai-chip">AI</span>
          </div>
          {insights.length === 0 ? (
            <div style={{ color: 'var(--ink-3)', fontSize: 13, fontWeight: 600 }}>Add expenses to see insights.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {insights.slice(0, 2).map((ins, i) => (
                <div key={i} className="ins-card">
                  <div className={`ins-tag ${ins.tag}`}>{ins.tag === 'good' ? '✓ Good' : ins.tag === 'warn' ? '⚠ Watch out' : '💡 Tip'}</div>
                  <div className="ins-title">{ins.title}</div>
                  <div className="ins-body">{ins.body}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ROW 2: Where it went + Recent activity */}
      <div className="grid-2" style={{ marginTop: 18 }}>
        <div className="card pad rise" style={{ '--d': '180ms' }}>
          <div className="sec-head" style={{ marginTop: 0, marginBottom: 16 }}>
            <h3>Where it went</h3>
          </div>
          {topCategories.length === 0 ? (
            <div style={{ color: 'var(--ink-3)', fontSize: 13, fontWeight: 600 }}>No expenses yet.</div>
          ) : topCategories.map(cat => {
            const pct = Math.min(monthTotal > 0 ? (cat.amt / monthTotal) * 100 : 0, 100);
            const over = cat.budget > 0 && cat.amt > cat.budget;
            return (
              <div key={cat.catId} className="catbar">
                <div className="catbar-head">
                  <div className="catbar-name"><span className="ce">{cat.icon}</span>{cat.name}</div>
                  <div className="catbar-val">
                    <span className="num">{fmtK(cat.amt)}</span>
                    {cat.budget > 0 && <span style={{ color: 'var(--ink-3)', fontWeight: 600 }}> / {fmtK(cat.budget)}</span>}
                  </div>
                </div>
                <div className="catbar-track">
                  <div className="catbar-fill" style={{ width: pct + '%', background: over ? 'var(--neg)' : `linear-gradient(90deg, ${cat.color}, ${cat.color}88)` }} />
                </div>
              </div>
            );
          })}
        </div>

        <div className="card pad rise" style={{ '--d': '240ms' }}>
          <div className="sec-head" style={{ marginTop: 0, marginBottom: 16 }}>
            <h3>Recent activity</h3>
          </div>
          <div className="txn-list">
            {recentTxns.length === 0 ? (
              <div style={{ color: 'var(--ink-3)', fontSize: 13, fontWeight: 600 }}>No transactions yet.</div>
            ) : recentTxns.map(txn => (
              <div key={txn.id} className="txn">
                <div className="txn-ico">{txn.category?.icon || '💰'}</div>
                <div className="txn-mid">
                  <div className="txn-name">{txn.description || txn.category?.name || 'Expense'}</div>
                  <div className="txn-meta">
                    <span>{new Date(txn.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                    {txn.payment_mode && <><span>·</span><span>{txn.payment_mode}</span></>}
                  </div>
                </div>
                <div className={`txn-amt${txn.type === 'income' ? ' income' : ''}`}>
                  {txn.type === 'income' ? '+' : '–'}<span className="num">{cur(txn.amount)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upcoming bills */}
      {upcomingBills.length > 0 && (
        <div className="card pad rise" style={{ '--d': '300ms', marginTop: 18 }}>
          <div className="sec-head" style={{ marginTop: 0, marginBottom: 8 }}>
            <h3>Upcoming bills</h3>
          </div>
          <div>
            {upcomingBills.map(bill => {
              const due = bill.due_day;
              const month = MONTHS_EN[new Date().getMonth()];
              return (
                <div key={bill.id} className="bill">
                  <div className="bill-date">
                    <div className="bd-day">{due}</div>
                    <div className="bd-mon">{month}</div>
                  </div>
                  <div className="bill-mid">
                    <div className="bill-name">{bill.name}</div>
                    {bill.category?.name && <div className="bill-sub">{bill.category.name}</div>}
                  </div>
                  <div className="bill-amt num">{cur(bill.amount)}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Extra widgets row */}
      {isCurrentMonth && (
        <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 18 }}>
          <SalaryCountdown profile={profile} monthTotal={monthTotal} budgets={budgets} categorySpendMap={categorySpendMap} />
          <BudgetAlert budgets={budgets} categorySpendMap={categorySpendMap} />
          <SpendingStreak profile={profile} />
        </div>
      )}
      <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 18 }}>
        <EmiSummary emis={emis} />
        <CashbackWidget expenses={monthExpenses} />
      </div>
    </div>
  );
}
