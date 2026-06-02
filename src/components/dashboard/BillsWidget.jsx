import { formatINR } from '../../lib/dateUtils';

export function BillsWidget({ bills }) {
  if (!bills || bills.length === 0) return null;

  const today = new Date();
  const todayDay = today.getDate();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

  const upcoming = bills
    .map(b => {
      let daysUntil = b.due_day - todayDay;
      if (daysUntil < 0) daysUntil += daysInMonth;
      return { ...b, daysUntil };
    })
    .filter(b => b.daysUntil <= 7)
    .sort((a, b) => a.daysUntil - b.daysUntil);

  if (upcoming.length === 0) return null;

  return (
    <div className="section-card">
      <h4>Bills Due This Week</h4>
      {upcoming.map(bill => {
        const overdue = bill.daysUntil === 0;
        return (
          <div key={bill.id} className="bill-row">
            <div className="bill-info">
              <span className="bill-icon">{bill.category?.icon || '💳'}</span>
              <div>
                <div className="bill-name">{bill.name}</div>
                <div className="bill-due" style={{ color: overdue ? 'var(--color-danger)' : 'var(--color-text-muted)' }}>
                  {overdue ? '⚠️ Due today' : `Due in ${bill.daysUntil} day${bill.daysUntil !== 1 ? 's' : ''}`}
                </div>
              </div>
            </div>
            <div className="bill-amount">{formatINR(bill.amount)}</div>
          </div>
        );
      })}
    </div>
  );
}
