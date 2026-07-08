import { localDateStr, todayStr, startOfWeekStr, startOfMonthStr, getLast7Days, daysRemainingInMonth } from '../dateUtils';

/**
 * One pure snapshot of the user's finances, computed from the query caches.
 * The journey criteria, the Home page, and the AI context all read this -
 * a level unlocks because these numbers moved, never because of a flag.
 */
export function buildSnapshot({
  expenses = [],
  budgets = [],
  goals = [],
  investments = [],
  emis = [],
  bills = [],
  recurring = [],
  assets = [],
  liabilities = [],
  profile = null,
}) {
  const today = todayStr();
  const weekStart = startOfWeekStr();
  const monthStart = startOfMonthStr();
  const sum = arr => arr.reduce((acc, e) => acc + Number(e.amount), 0);

  const spendEntries = expenses.filter(e => e.type !== 'income');
  const incomeEntries = expenses.filter(e => e.type === 'income');

  const todayTotal = sum(spendEntries.filter(e => e.date === today));
  const weekTotal = sum(spendEntries.filter(e => e.date >= weekStart));
  const monthSpend = sum(spendEntries.filter(e => e.date >= monthStart));
  const monthIncomeLogged = sum(incomeEntries.filter(e => e.date >= monthStart));
  const monthlyIncome = Number(profile?.monthly_income) || monthIncomeLogged || 0;

  /* per-category month totals, largest first */
  const categoryTotals = {};
  for (const e of spendEntries.filter(e => e.date >= monthStart)) {
    const key = e.category?.id || 'uncategorized';
    if (!categoryTotals[key]) {
      categoryTotals[key] = {
        id: key,
        name: e.category?.name || 'Uncategorized',
        icon: e.category?.icon || '💰',
        color: e.category?.color || '#6B7280',
        total: 0,
      };
    }
    categoryTotals[key].total += Number(e.amount);
  }
  const topCategories = Object.values(categoryTotals).sort((a, b) => b.total - a.total);

  /* 7-day bars */
  const dailyBars = getLast7Days().map(date => ({
    date,
    amount: sum(spendEntries.filter(e => e.date === date)),
  }));

  /* logging streak: consecutive days (ending today or yesterday) with >= 1 entry */
  const logDays = new Set(expenses.map(e => e.date));
  let loggingStreak = 0;
  {
    const cursor = new Date();
    if (!logDays.has(localDateStr(cursor))) cursor.setDate(cursor.getDate() - 1);
    while (logDays.has(localDateStr(cursor))) {
      loggingStreak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
  }

  /* month history: spend + savings rate for the last 3 finished-or-current months */
  const monthHistory = [];
  for (let i = 0; i < 3; i++) {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const spend = sum(spendEntries.filter(e => e.date?.startsWith(key)));
    const incomeLogged = sum(incomeEntries.filter(e => e.date?.startsWith(key)));
    const income = Number(profile?.monthly_income) || incomeLogged;
    monthHistory.push({
      key,
      spend,
      income,
      savingsRate: income > 0 ? Math.round(((income - spend) / income) * 100) : null,
    });
  }
  const currentSavingsRate = monthHistory[0].savingsRate;
  // last month is a full month, so its rate is the honest one for unlock checks
  const lastFullMonthSavingsRate = monthHistory[1]?.spend > 0 ? monthHistory[1].savingsRate : null;

  /* baseline monthly expenses for emergency-fund sizing */
  const pastMonths = monthHistory.slice(1).filter(m => m.spend > 0);
  const monthlyExpenseBaseline = pastMonths.length
    ? Math.round(pastMonths.reduce((a, m) => a + m.spend, 0) / pastMonths.length)
    : monthSpend || Math.round(monthlyIncome * 0.7);

  /* emergency fund */
  const efGoal = goals.find(g => g.kind === 'emergency_fund') || null;
  const efCurrent = Number(efGoal?.current_amount) || 0;
  const efMonthsCovered = monthlyExpenseBaseline > 0 ? efCurrent / monthlyExpenseBaseline : 0;

  /* investments */
  const invested = investments.reduce((a, i) => a + Number(i.invested_amount || 0), 0);
  const portfolioValue = investments.reduce((a, i) => a + Number(i.current_value || i.invested_amount || 0), 0);
  const investmentTypes = [...new Set(investments.map(i => i.type))];
  const sips = investments.filter(i => i.type === 'sip' || i.type === 'mf');
  const firstSip = sips.length
    ? sips.reduce((a, b) => ((a.start_date || a.created_at) < (b.start_date || b.created_at) ? a : b))
    : null;
  const sipMonthly = investments.reduce((a, i) => a + Number(i.monthly_amount || 0), 0);

  /* commitments */
  const activeEmiTotal = emis.reduce((acc, e) => {
    const start = new Date(e.start_date + 'T00:00:00');
    const now = new Date();
    const elapsed = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
    return elapsed < e.tenure_months ? acc + Number(e.emi_amount) : acc;
  }, 0);
  const billsTotal = bills.filter(b => b.is_active).reduce((a, b) => a + Number(b.amount), 0);
  const emiPctOfIncome = monthlyIncome > 0 ? Math.round((activeEmiTotal / monthlyIncome) * 100) : 0;

  /* budgets for the current month */
  const monthKey = `${monthStart.slice(0, 7)}`;
  const monthBudgets = budgets.filter(b => b.month?.startsWith(monthKey));
  const totalBudget = sum2(monthBudgets, 'limit_amount');

  /* net worth */
  const assetsTotal = assets.reduce((a, x) => a + Number(x.value || 0), 0);
  const liabilitiesTotal = liabilities.reduce((a, x) => a + Number(x.amount || 0), 0);

  const daysLeft = daysRemainingInMonth();
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const daysPassed = daysInMonth - daysLeft;

  return {
    today,
    todayTotal,
    weekTotal,
    monthSpend,
    monthIncomeLogged,
    monthlyIncome,
    spendable: Math.max(0, monthlyIncome - monthSpend),
    currentSavingsRate,
    lastFullMonthSavingsRate,
    monthHistory,
    monthlyExpenseBaseline,
    topCategories,
    dailyBars,
    expenseCount: spendEntries.length,
    entryCount: expenses.length,
    distinctLogDays: logDays.size,
    loggingStreak,
    avgDailySpend: daysPassed > 0 ? Math.round(monthSpend / daysPassed) : 0,
    daysLeft,
    budgetCount: monthBudgets.length,
    monthBudgets,
    totalBudget,
    goals,
    efGoal,
    efCurrent,
    efMonthsCovered,
    investments,
    investmentCount: investments.length,
    investmentTypes,
    invested,
    portfolioValue,
    sipMonthly,
    firstSipDate: firstSip ? (firstSip.start_date || firstSip.created_at?.slice(0, 10)) : null,
    emiCount: emis.length,
    activeEmiTotal,
    emiPctOfIncome,
    billCount: bills.length,
    billsTotal,
    recurringCount: recurring.length,
    assetsTotal,
    liabilitiesTotal,
    netWorth: assetsTotal + portfolioValue - liabilitiesTotal,
  };
}

function sum2(arr, field) {
  return arr.reduce((a, x) => a + Number(x[field] || 0), 0);
}

/** Convenience hook-side bundle: pass every query's data in one object. */
export function snapshotInputsFromQueries(q) {
  return {
    expenses: q.expenses.data ?? [],
    budgets: q.budgets.data ?? [],
    goals: q.goals.data ?? [],
    investments: q.investments.data ?? [],
    emis: q.emis.data ?? [],
    bills: q.bills.data ?? [],
    recurring: q.recurring.data ?? [],
    assets: q.assets.data ?? [],
    liabilities: q.liabilities.data ?? [],
    profile: q.profile.data ?? null,
  };
}
