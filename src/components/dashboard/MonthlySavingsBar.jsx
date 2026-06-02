import { formatINR } from '../../lib/dateUtils';

export function MonthlySavingsBar({ income, spent }) {
  if (!income || income <= 0) return null;
  const savings = income - spent;
  const savingsPct = Math.max(0, Math.min(100, Math.round((savings / income) * 100)));
  const spentPct = Math.min(100, Math.round((spent / income) * 100));
  const over = spent > income;

  return (
    <div className="savings-bar-card section-card">
      <h4>Monthly Budget Overview</h4>
      <div className="sbar-row">
        <span className="sbar-label">Spent</span>
        <span className="sbar-amt" style={{ color: over ? 'var(--color-danger)' : 'var(--color-text)' }}>{formatINR(spent)}</span>
      </div>
      <div className="sbar-track">
        <div className="sbar-fill" style={{ width: `${spentPct}%`, background: over ? 'var(--color-danger)' : 'var(--gradient-brand)' }} />
      </div>
      <div className="sbar-row" style={{ marginTop: 8 }}>
        <span className="sbar-label">Income</span>
        <span className="sbar-amt">{formatINR(income)}</span>
      </div>
      <div className="sbar-footer">
        {over ? (
          <span style={{ color: 'var(--color-danger)', fontWeight: 700 }}>⚠️ Over budget by {formatINR(Math.abs(savings))}</span>
        ) : (
          <span style={{ color: 'var(--color-success)', fontWeight: 700 }}>✅ Saved {formatINR(savings)} ({savingsPct}% savings rate)</span>
        )}
      </div>
    </div>
  );
}
