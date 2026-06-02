import { formatINR } from '../../lib/dateUtils';

export function IncomeExpenseBar({ income, spent }) {
  if (!income) return null;
  const saved = income - spent;
  const spentPct = Math.min((spent / income) * 100, 100);
  const savingsRate = income > 0 ? Math.max(0, Math.round(((income - spent) / income) * 100)) : 0;

  return (
    <div>
      <div className="chart-slide-title">Income vs Expense</div>
      <div className="ive-row">
        <div className="ive-label">
          <span className="ive-dot ive-dot--income" />
          <span>Income</span>
        </div>
        <span className="ive-amount ive-amount--income">{formatINR(income)}</span>
      </div>
      <div className="ive-bar-bg">
        <div className="ive-bar-fill ive-bar-fill--income" style={{ width: '100%' }} />
      </div>

      <div className="ive-row" style={{ marginTop: 10 }}>
        <div className="ive-label">
          <span className="ive-dot ive-dot--spent" />
          <span>Spent</span>
        </div>
        <span className="ive-amount ive-amount--spent">{formatINR(spent)}</span>
      </div>
      <div className="ive-bar-bg">
        <div className="ive-bar-fill ive-bar-fill--spent" style={{ width: `${spentPct}%` }} />
      </div>

      <div className="ive-summary">
        <div className={`ive-savings ${saved < 0 ? 'ive-savings--negative' : ''}`}>
          {saved >= 0 ? `💚 Saved ${formatINR(saved)}` : `🔴 Over by ${formatINR(Math.abs(saved))}`}
        </div>
        <div className="ive-rate">{savingsRate}% savings rate</div>
      </div>
    </div>
  );
}
