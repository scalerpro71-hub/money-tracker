/* Journey unlock/complete criteria - pure functions over the finance snapshot.
   Every criterion returns { met, progress (0-1), label } so the UI can show
   "why is this locked and how close am I". */

const CRITERIA = {
  l1_complete: (s) => {
    const logged = Math.max(
      Math.min(1, s.entryCount / 10),
      Math.min(1, s.loggingStreak / 7),
    );
    const incomeSet = s.monthlyIncome > 0 ? 1 : 0;
    return {
      met: (s.entryCount >= 10 || s.loggingStreak >= 7) && s.monthlyIncome > 0,
      progress: logged * 0.7 + incomeSet * 0.3,
      label: `${Math.min(10, s.entryCount)}/10 entries logged${s.loggingStreak > 1 ? ` · ${s.loggingStreak}-day streak` : ''}`,
    };
  },

  l2_complete: (s) => {
    const budgets = Math.min(1, s.budgetCount / 3);
    const days = Math.min(1, s.distinctLogDays / 14);
    return {
      met: s.budgetCount >= 3 && s.distinctLogDays >= 14,
      progress: budgets * 0.5 + days * 0.5,
      label: `${Math.min(3, s.budgetCount)}/3 budgets · ${Math.min(14, s.distinctLogDays)}/14 logging days`,
    };
  },

  l3_complete: (s) => {
    const rate = Math.max(s.lastFullMonthSavingsRate ?? 0, s.currentSavingsRate ?? 0);
    const rateOk = rate >= 10;
    const efOk = !!s.efGoal && s.efMonthsCovered >= 1;
    return {
      met: rateOk && efOk,
      progress: Math.min(1, Math.max(0, rate) / 10) * 0.5 + Math.min(1, s.efMonthsCovered) * 0.5,
      label: `Savings rate ${Math.max(0, Math.round(rate))}%/10% · emergency fund ${s.efMonthsCovered.toFixed(1)}/1 month${s.efGoal ? '' : ' (no goal yet)'}`,
    };
  },

  // Lessons carry Level 4; the data check is that commitments are being tracked
  // at all (0 EMIs is a perfectly good answer).
  l4_complete: (s, { lessonsDone }) => ({
    met: lessonsDone,
    progress: lessonsDone ? 1 : 0,
    label: s.emiCount > 0
      ? `EMIs are ${s.emiPctOfIncome}% of income (target: under 30%)`
      : 'No EMIs logged — debt-free is a fine answer',
  }),

  l5_unlock: (s) => ({
    met: s.efMonthsCovered >= 1,
    progress: Math.min(1, s.efMonthsCovered),
    label: `Emergency fund at ${s.efMonthsCovered.toFixed(1)}/1 month of expenses`,
  }),

  l5_complete: (s) => {
    const hasSip = s.investments.some(i => i.type === 'sip' || i.type === 'mf');
    return {
      met: hasSip,
      progress: hasSip ? 1 : 0,
      label: hasSip ? 'First SIP logged 🎉' : 'Log your first SIP / mutual fund under Invest',
    };
  },

  l6_unlock: () => ({ met: true, progress: 1, label: '' }),

  l6_complete: (s) => {
    const types = s.investmentTypes.length;
    return {
      met: types >= 2,
      progress: Math.min(1, types / 2),
      label: `${types}/2 investment types in your portfolio`,
    };
  },

  l7_unlock: () => ({ met: true, progress: 1, label: '' }),
};

export function evaluateCriteria(id, snapshot, extras = { lessonsDone: false }) {
  const fn = CRITERIA[id];
  if (!fn) return { met: true, progress: 1, label: '' };
  return fn(snapshot, extras);
}

/** Has a lesson's real-world action been done, judging purely from data? */
export function actionDone(action, snapshot) {
  if (!action) return true;
  switch (action.type) {
    case 'log_expense': return snapshot.entryCount >= 1;
    case 'log_days': return snapshot.distinctLogDays >= (action.count || 3);
    case 'set_income': return snapshot.monthlyIncome > 0;
    case 'set_budgets': return snapshot.budgetCount >= (action.count || 3);
    case 'add_commitment': return snapshot.billCount + snapshot.emiCount + snapshot.recurringCount > 0;
    case 'create_ef_goal': return !!snapshot.efGoal;
    case 'log_investment': return snapshot.investments.some(i => i.type === 'sip' || i.type === 'mf');
    case 'diversify': return snapshot.investmentTypes.length >= 2;
    default: return true;
  }
}
