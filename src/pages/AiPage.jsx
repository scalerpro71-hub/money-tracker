import { AiFeatureCard } from '../components/ai/AiFeatureCard';
import { useAiSuggestions } from '../hooks/useAiSuggestions';
import { getLast30Days, daysAgoStr, startOfMonthStr, daysRemainingInMonth } from '../lib/dateUtils';

export function AiPage({ userId, expenses, budgets, goals, profile }) {
  const { suggestions, loading, error, generate } = useAiSuggestions(userId);

  function buildSpendingPatternsData() {
    const last30 = daysAgoStr(30);
    const recent = expenses.filter(e => e.date >= last30);
    const byCategory = {};
    for (const e of recent) {
      const name = e.category?.name || 'Other';
      byCategory[name] = (byCategory[name] || 0) + Number(e.amount);
    }
    const days = getLast30Days();
    const dailyTotals = days.map(d => ({
      date: d,
      amount: recent.filter(e => e.date === d).reduce((a, e) => a + Number(e.amount), 0),
    }));
    const top5 = [...recent].sort((a, b) => b.amount - a.amount).slice(0, 5)
      .map(e => ({ note: e.note || e.category?.name, amount: e.amount, category: e.category?.name }));
    return {
      last_30_days_by_category: byCategory,
      daily_totals_last_30_days: dailyTotals,
      top_5_expenses: top5,
      monthly_income_estimate: profile?.monthly_income || 'Not set',
    };
  }

  function buildBudgetAdviceData() {
    const monthStart = startOfMonthStr();
    const thisMonth = expenses.filter(e => e.date >= monthStart);
    const spending = {};
    for (const e of thisMonth) {
      const name = e.category?.name || 'Other';
      spending[name] = (spending[name] || 0) + Number(e.amount);
    }
    const budgetMap = {};
    for (const b of budgets) budgetMap[b.category?.name || b.category_id] = b.limit_amount;
    return {
      current_month_spending: spending,
      current_budgets: budgetMap,
      monthly_income_estimate: profile?.monthly_income || 'Not set',
      days_remaining_in_month: daysRemainingInMonth(),
    };
  }

  function buildAnomalyData() {
    const last7Start = daysAgoStr(7);
    const last30Start = daysAgoStr(30);
    const last7 = expenses.filter(e => e.date >= last7Start);
    const last30 = expenses.filter(e => e.date >= last30Start);

    const avgByCategory = {};
    for (const e of last30) {
      const name = e.category?.name || 'Other';
      if (!avgByCategory[name]) avgByCategory[name] = { total: 0, count: 0 };
      avgByCategory[name].total += Number(e.amount);
      avgByCategory[name].count++;
    }
    const averages = {};
    for (const [k, v] of Object.entries(avgByCategory)) {
      averages[k] = Math.round(v.total / 30);
    }
    const totalLast30 = last30.reduce((a, e) => a + Number(e.amount), 0);
    return {
      last_7_days: last7.map(e => ({ date: e.date, amount: e.amount, category: e.category?.name, note: e.note })),
      avg_daily_spend_last_30_days: Math.round(totalLast30 / 30),
      category_averages: averages,
    };
  }

  function buildSavingsPlanData() {
    const last3months = daysAgoStr(90);
    const recent = expenses.filter(e => e.date >= last3months);
    const avgMonthly = Math.round(recent.reduce((a, e) => a + Number(e.amount), 0) / 3);
    const income = profile?.monthly_income || 0;
    const savingsRate = income > 0 ? ((income - avgMonthly) / income) : null;
    return {
      goals: goals.map(g => ({ name: g.name, target: g.target_amount, current: g.current_amount, target_date: g.target_date })),
      monthly_income_estimate: income || 'Not set',
      avg_monthly_spend_last_3_months: avgMonthly,
      current_savings_rate: savingsRate !== null ? `${Math.round(savingsRate * 100)}%` : 'Unknown',
    };
  }

  return (
    <div className="page">
      <div className="page-header">
        <h2>AI Insights</h2>
        <p className="page-sub">Powered by Claude — personalized for your spending</p>
      </div>

      {!profile?.monthly_income && (
        <div className="ai-notice">
          💡 Set your monthly income in Settings for more accurate AI advice.
        </div>
      )}

      <AiFeatureCard title="Spending Patterns" icon="🔍"
        description="Claude will analyze where your money is going and find patterns in your last 30 days of spending."
        suggestion={suggestions.spending_patterns} loading={loading.spending_patterns} error={error.spending_patterns}
        onGenerate={() => generate('spending_patterns', buildSpendingPatternsData())} />

      <AiFeatureCard title="Budget Advice" icon="📊"
        description="Claude will look at your budgets vs actual spending and suggest specific cuts for next month."
        suggestion={suggestions.budget_advice} loading={loading.budget_advice} error={error.budget_advice}
        onGenerate={() => generate('budget_advice', buildBudgetAdviceData())} />

      <AiFeatureCard title="Anomaly Alerts" icon="⚠️"
        description="Claude will flag unusual spends in the last 7 days — anything that's 3x your normal for that category."
        suggestion={suggestions.anomaly_alerts} loading={loading.anomaly_alerts} error={error.anomaly_alerts}
        onGenerate={() => generate('anomaly_alerts', buildAnomalyData())} />

      <AiFeatureCard title="Savings Plan" icon="🎯"
        description="Claude will build a month-by-month savings plan to reach your goals based on your income and spending."
        suggestion={suggestions.savings_plan} loading={loading.savings_plan} error={error.savings_plan}
        onGenerate={() => generate('savings_plan', buildSavingsPlanData())} />
    </div>
  );
}
