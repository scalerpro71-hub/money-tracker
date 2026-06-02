import { formatINR, formatShortDate } from '../../lib/dateUtils';

export function TopExpenses({ expenses }) {
  const top = [...expenses]
    .sort((a, b) => Number(b.amount) - Number(a.amount))
    .slice(0, 6);

  if (!top.length) return <div className="chart-slide-empty">No expenses yet</div>;

  const max = Number(top[0].amount);

  return (
    <div>
      <div className="chart-slide-title">Top Expenses This Month</div>
      <div className="top-exp-list">
        {top.map((e, i) => {
          const pct = max > 0 ? (Number(e.amount) / max) * 100 : 0;
          return (
            <div key={e.id} className="top-exp-row">
              <div className="top-exp-rank">#{i + 1}</div>
              <div className="top-exp-info">
                <div className="top-exp-header">
                  <span className="top-exp-note">{e.note || e.category?.name || 'Expense'}</span>
                  <span className="top-exp-amt">{formatINR(e.amount)}</span>
                </div>
                <div className="top-exp-bar-bg">
                  <div className="top-exp-bar-fill" style={{ width: `${pct}%` }} />
                </div>
                <div className="top-exp-meta">{e.category?.icon} {e.category?.name} · {formatShortDate(e.date)}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
