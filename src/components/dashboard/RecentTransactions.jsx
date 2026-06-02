import { formatINR, formatShortDate } from '../../lib/dateUtils';

export function RecentTransactions({ expenses }) {
  const recent = expenses.slice(0, 6);
  if (!recent.length) return null;

  return (
    <div className="section-card">
      <h4>Recent Transactions</h4>
      <div className="recent-list">
        {recent.map(e => (
          <div key={e.id} className="recent-row">
            <div className="recent-icon" style={{ background: (e.category?.color || '#6366f1') + '22', color: e.category?.color || '#6366f1' }}>
              {e.category?.icon || '💰'}
            </div>
            <div className="recent-info">
              <div className="recent-note">{e.note || e.category?.name || 'Expense'}</div>
              <div className="recent-meta">{e.category?.name} · {formatShortDate(e.date)}</div>
            </div>
            <div className="recent-amt">−{formatINR(e.amount)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
