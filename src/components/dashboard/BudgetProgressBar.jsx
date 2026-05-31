import { formatINR } from '../../lib/dateUtils';

function getColor(pct) {
  if (pct >= 90) return '#ef4444';
  if (pct >= 70) return '#f59e0b';
  return '#10b981';
}

export function BudgetProgressBar({ budget, spent }) {
  const cat = budget.category;
  const limit = Number(budget.limit_amount);
  const pct = Math.min((spent / limit) * 100, 100);
  const color = getColor(pct);

  return (
    <div className="budget-row">
      <div className="budget-label">
        <span>{cat?.icon} {cat?.name}</span>
        <span style={{ color }}>{formatINR(spent)} / {formatINR(limit)}</span>
      </div>
      <div className="budget-bar-bg">
        <div className="budget-bar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      {pct >= 90 && <div className="budget-warning" style={{ color }}>⚠️ {pct >= 100 ? 'Over budget!' : 'Near limit'}</div>}
    </div>
  );
}
