import { formatINR } from '../../lib/dateUtils';

export function BudgetAlert({ budgets, categorySpendMap }) {
  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const daysPassed = today.getDate();
  const paceRatio = daysPassed / daysInMonth;

  const alerts = budgets
    .map(b => {
      const spent = categorySpendMap[b.category_id] || 0;
      const projected = paceRatio > 0 ? spent / paceRatio : spent;
      const overshoot = projected - b.limit_amount;
      const pct = (spent / b.limit_amount) * 100;
      return { ...b, spent, projected, overshoot, pct };
    })
    .filter(b => b.projected > b.limit_amount && b.pct > 20); // only warn if at least 20% spent

  if (alerts.length === 0) return null;

  return (
    <div className="budget-alert-wrap">
      {alerts.map(a => (
        <div key={a.id} className="budget-alert">
          <span className="budget-alert-icon">⚠️</span>
          <div className="budget-alert-text">
            <strong>{a.category?.name || 'Category'}</strong> on track to exceed budget by{' '}
            <strong style={{ color: 'var(--color-danger)' }}>{formatINR(a.overshoot)}</strong> this month
          </div>
        </div>
      ))}
    </div>
  );
}
