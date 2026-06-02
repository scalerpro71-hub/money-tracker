import { formatINR } from '../../lib/dateUtils';

export function CashbackWidget({ expenses }) {
  const today = new Date();
  const monthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  const yearStr = `${today.getFullYear()}`;

  const monthCashback = expenses
    .filter(e => e.date?.startsWith(monthStr) && e.type !== 'income')
    .reduce((a, e) => a + Number(e.cashback_amount || 0), 0);

  const yearCashback = expenses
    .filter(e => e.date?.startsWith(yearStr) && e.type !== 'income')
    .reduce((a, e) => a + Number(e.cashback_amount || 0), 0);

  if (yearCashback === 0) return null;

  return (
    <div className="cashback-card">
      <div className="cashback-icon">💰</div>
      <div className="cashback-info">
        <div className="cashback-title">Cashback & Rewards</div>
        <div className="cashback-row">
          <span>This month</span>
          <strong style={{ color: '#f59e0b' }}>{formatINR(monthCashback)}</strong>
        </div>
        <div className="cashback-row">
          <span>This year</span>
          <strong style={{ color: '#f59e0b' }}>{formatINR(yearCashback)}</strong>
        </div>
      </div>
    </div>
  );
}
