import { localDateStr } from '../dateUtils';
import { evaluatePlan } from './planCriteria';

/** Compact JSON the mentor sees with every chat message. Small on purpose -
    round numbers, top-3s only - so tokens stay cheap and answers stay focused.
    Every field here is defined in the ai-chat system prompt's data dictionary;
    keep the two in sync when renaming or adding fields. */
export function buildCoachContext(snapshot, journey, profile, categories = []) {
  const s = snapshot;
  const planSteps = evaluatePlan(s);
  const planCurrent = planSteps.find(st => st.status === 'current');
  const categoryName = id =>
    categories.find(c => c.id === id)?.name
    ?? s.topCategories.find(c => c.id === id)?.name
    ?? 'Unknown';
  const spentInCategory = id => Math.round(s.topCategories.find(c => c.id === id)?.total ?? 0);
  return {
    today: s.today,
    month: {
      income: Math.round(s.monthlyIncome),
      spent: Math.round(s.monthSpend),
      upcomingCommitmentsDue: Math.round(s.upcomingCommitments),
      safeLeftThisMonth: Math.round(s.safeMonthLeft),
      safePerDayRemaining: Math.round(s.safeToSpendToday),
      savingsRatePct: s.currentSavingsRate,
      daysLeft: s.daysLeft,
      avgDailySpend: s.avgDailySpend,
      topCategories: s.topCategories.slice(0, 3).map(c => ({ name: c.name, total: Math.round(c.total) })),
    },
    budgets: s.monthBudgets.slice(0, 8).map(b => ({
      category: categoryName(b.category_id),
      limit: Math.round(Number(b.limit_amount)),
      spentSoFar: spentInCategory(b.category_id),
    })),
    recentMonths: s.monthHistory.map(m => ({
      month: m.key,
      spent: Math.round(m.spend),
      savingsRatePct: m.savingsRate,
    })),
    habits: {
      loggingStreakDays: s.loggingStreak,
      totalEntries: s.entryCount,
      budgetsSet: s.budgetCount,
      totalBudget: s.totalBudget,
    },
    safety: {
      emergencyFundSaved: Math.round(s.efCurrent),
      emergencyFundMonths: Number(s.efMonthsCovered.toFixed(1)),
      monthlyExpenseBaseline: s.monthlyExpenseBaseline,
      liquidSavings: Math.round(s.liquidTotal),
      runwayMonths: Number(s.runwayMonths.toFixed(1)),
    },
    protection: {
      termCoverAmount: s.termCover,
      healthCoverAmount: s.healthCover,
    },
    investing: {
      portfolioValue: Math.round(s.portfolioValue),
      invested: Math.round(s.invested),
      sipPerMonth: s.sipMonthly,
      types: s.investmentTypes,
    },
    starterPlan: {
      currentStep: planCurrent ? `${planCurrent.order} of ${planSteps.length}: ${planCurrent.title}` : 'all core steps done',
      stepsDone: planSteps.filter(st => st.status === 'done').length,
      suggestedAmount: planCurrent?.amount ?? null,
    },
    commitments: {
      emiPerMonth: Math.round(s.activeEmiTotal),
      emiPctOfIncome: s.emiPctOfIncome,
      billsPerMonth: Math.round(s.billsTotal),
    },
    netWorth: Math.round(s.netWorth),
    profile: profile ? {
      experience: profile.investing_experience,
      riskTolerance: profile.risk_tolerance,
      goal: profile.investing_goal,
      safetyNet: profile.safety_net,
    } : null,
    journey: journey?.current ? {
      currentLevel: journey.current.order,
      currentLevelTitle: journey.current.title,
      nextStep: journey.nextStep?.label ?? null,
      xp: journey.xp,
      completedLevels: journey.completedIds.length,
    } : null,
  };
}

/** Monday of the most recently finished week (local time). */
export function lastWeekStart() {
  const d = new Date();
  const day = d.getDay(); // 0 Sun .. 6 Sat
  const sinceMonday = (day + 6) % 7;
  d.setDate(d.getDate() - sinceMonday - 7);
  return localDateStr(d);
}

/** Metrics for the finished week [monday, sunday] the review is written about. */
export function buildWeeklyMetrics(expenses, snapshot) {
  const start = lastWeekStart();
  const end = new Date(start + 'T00:00:00');
  end.setDate(end.getDate() + 6);
  const endStr = localDateStr(end);
  const prevStart = new Date(start + 'T00:00:00');
  prevStart.setDate(prevStart.getDate() - 7);
  const prevStartStr = localDateStr(prevStart);

  const sum = arr => arr.reduce((a, e) => a + Number(e.amount), 0);
  const spend = expenses.filter(e => e.type !== 'income');
  const weekRows = spend.filter(e => e.date >= start && e.date <= endStr);
  const prevRows = spend.filter(e => e.date >= prevStartStr && e.date < start);

  const byCat = {};
  for (const e of weekRows) {
    const name = e.category?.name || 'Uncategorized';
    byCat[name] = (byCat[name] || 0) + Number(e.amount);
  }
  const topCategory = Object.entries(byCat).sort(([, a], [, b]) => b - a)[0] ?? null;

  return {
    periodStart: start,
    weekSpend: Math.round(sum(weekRows)),
    prevWeekSpend: Math.round(sum(prevRows)),
    transactionCount: weekRows.length,
    daysLogged: new Set(weekRows.map(e => e.date)).size,
    prevWeekDaysLogged: new Set(prevRows.map(e => e.date)).size,
    topCategory: topCategory ? { name: topCategory[0], total: Math.round(topCategory[1]) } : null,
    monthlyIncome: Math.round(snapshot.monthlyIncome),
    savingsRatePct: snapshot.currentSavingsRate,
    loggingStreakDays: snapshot.loggingStreak,
    budgetsSet: snapshot.budgetCount,
    emergencyFundMonths: Number(snapshot.efMonthsCovered.toFixed(1)),
    journeyLevel: null, // filled by caller if journey is loaded
  };
}
