import { formatINR } from '../../lib/dateUtils';

export function WeekComparison({ weekTotal, prevWeekTotal, weekChange }) {
  if (weekChange === null) return null;
  const up = weekChange > 0;
  const color = up ? 'var(--color-danger)' : 'var(--color-success)';
  const arrow = up ? '↑' : '↓';
  const abs = Math.abs(weekChange).toFixed(0);

  return (
    <div className="week-compare">
      <div className="week-compare-label">This week vs last week</div>
      <div className="week-compare-row">
        <div className="week-compare-amounts">
          <span className="week-compare-current">{formatINR(weekTotal)}</span>
          <span className="week-compare-prev">vs {formatINR(prevWeekTotal)}</span>
        </div>
        <div className="week-compare-badge" style={{ background: up ? 'var(--color-danger-bg)' : 'var(--color-success-bg)', color }}>
          {arrow} {abs}%
        </div>
      </div>
    </div>
  );
}
