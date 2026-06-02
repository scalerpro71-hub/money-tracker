import { formatINR } from '../../lib/dateUtils';

const R = 30, CX = 40, CY = 40, SW = 7;
const CIRC = 2 * Math.PI * R;

function statusColor(pct) {
  if (pct >= 90) return '#ef4444';
  if (pct >= 70) return '#f59e0b';
  return '#10b981';
}

export function BudgetRing({ budget, spent }) {
  const cat = budget.category;
  const limit = Number(budget.limit_amount);
  const pct = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
  const color = statusColor(pct);
  const offset = CIRC * (1 - pct / 100);

  return (
    <div className="budget-ring-item">
      <div className="budget-ring-svg-wrap">
        <svg width="80" height="80" viewBox="0 0 80 80">
          <circle
            cx={CX} cy={CY} r={R}
            fill="none"
            stroke="var(--color-surface-2)"
            strokeWidth={SW}
          />
          <circle
            cx={CX} cy={CY} r={R}
            fill="none"
            stroke={color}
            strokeWidth={SW}
            strokeLinecap="round"
            strokeDasharray={CIRC}
            strokeDashoffset={offset}
            transform={`rotate(-90 ${CX} ${CY})`}
            style={{ transition: 'stroke-dashoffset 0.6s ease' }}
          />
        </svg>
        <div className="budget-ring-icon">{cat?.icon}</div>
      </div>
      <div className="budget-ring-label">{cat?.name}</div>
      <div className="budget-ring-amounts" style={{ color }}>
        {formatINR(spent)}
        <span className="budget-ring-limit"> / {formatINR(limit)}</span>
      </div>
      {pct >= 90 && (
        <div className="budget-ring-warn" style={{ color }}>
          {pct >= 100 ? 'Over!' : 'Near limit'}
        </div>
      )}
    </div>
  );
}
