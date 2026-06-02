import { formatINR } from '../../lib/dateUtils';

export function ExpenseVelocity({ monthlyTrend }) {
  if (!monthlyTrend || monthlyTrend.length < 2) return null;
  const current = monthlyTrend[monthlyTrend.length - 1]?.amount || 0;
  const prev = monthlyTrend[monthlyTrend.length - 2]?.amount || 0;
  if (prev === 0) return null;

  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const daysPassed = today.getDate();
  const projected = daysPassed > 0 ? (current / daysPassed) * daysInMonth : current;
  const velocityPct = Math.round(((projected - prev) / prev) * 100);

  if (Math.abs(velocityPct) < 5) return null;

  const faster = velocityPct > 0;
  const color = faster ? 'var(--color-danger)' : 'var(--color-success)';
  const bg = faster ? 'var(--color-danger-bg)' : 'var(--color-success-bg)';

  return (
    <div className="velocity-card" style={{ background: bg, borderColor: faster ? 'var(--color-danger)' : 'var(--color-success)' }}>
      <span className="velocity-icon">{faster ? '📈' : '📉'}</span>
      <div className="velocity-text">
        <strong style={{ color }}>
          {faster ? '+' : ''}{velocityPct}% spending velocity
        </strong>
        {' '}— You're on track to spend {formatINR(Math.round(projected))} this month vs {formatINR(prev)} last month.
        {faster && ' Consider slowing down on discretionary spends.'}
      </div>
    </div>
  );
}
