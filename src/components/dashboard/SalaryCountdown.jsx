import { formatINR } from '../../lib/dateUtils';

export function SalaryCountdown({ profile, monthTotal, budgets, categorySpendMap }) {
  const payday = profile?.payday_day;
  const income = profile?.monthly_income;
  if (!payday || !income) return null;

  const today = new Date();
  const todayDay = today.getDate();
  let daysToSalary;
  if (todayDay < payday) {
    daysToSalary = payday - todayDay;
  } else if (todayDay === payday) {
    daysToSalary = 0;
  } else {
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, payday);
    daysToSalary = Math.ceil((nextMonth - today) / (1000 * 60 * 60 * 24));
  }

  const totalBudget = budgets.reduce((a, b) => a + b.limit_amount, 0) || income;
  const budgetRemaining = Math.max(0, totalBudget - monthTotal);
  const dailyBudget = daysToSalary > 0 ? Math.round(budgetRemaining / daysToSalary) : 0;

  if (daysToSalary === 0) {
    return (
      <div className="salary-card salary-card--today">
        <span className="salary-icon">🎉</span>
        <div className="salary-text">
          <strong>Salary day today!</strong>
          <span>Time to review your expenses and plan the month.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="salary-card">
      <span className="salary-icon">💰</span>
      <div className="salary-text">
        <strong>{daysToSalary} day{daysToSalary !== 1 ? 's' : ''} to salary</strong>
        <span>{formatINR(budgetRemaining)} remaining · {formatINR(dailyBudget)}/day budget</span>
      </div>
    </div>
  );
}
