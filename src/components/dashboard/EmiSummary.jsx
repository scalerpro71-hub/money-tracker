import { formatINR } from '../../lib/dateUtils';

function emiStats(emi) {
  const start = new Date(emi.start_date + 'T00:00:00');
  const today = new Date();
  const monthsPassed = Math.max(0,
    (today.getFullYear() - start.getFullYear()) * 12 + (today.getMonth() - start.getMonth())
  );
  const paid = Math.min(monthsPassed, emi.tenure_months);
  const remaining = Math.max(0, emi.tenure_months - paid);
  const totalPayable = emi.emi_amount * emi.tenure_months;
  const totalInterest = totalPayable - emi.principal;
  const endDate = new Date(start);
  endDate.setMonth(endDate.getMonth() + emi.tenure_months);
  return { paid, remaining, totalPayable, totalInterest, endDate };
}

export function EmiSummary({ emis }) {
  if (!emis || emis.length === 0) return null;

  const totalMonthlyEmi = emis.reduce((a, e) => a + Number(e.emi_amount), 0);

  return (
    <div className="section-card">
      <div className="section-header">
        <h4>EMI Tracker</h4>
        <span className="section-badge">{formatINR(totalMonthlyEmi)}/mo</span>
      </div>
      {emis.map(emi => {
        const { paid, remaining, totalInterest } = emiStats(emi);
        const pct = Math.round((paid / emi.tenure_months) * 100);
        return (
          <div key={emi.id} className="emi-row">
            <div className="emi-header">
              <span className="emi-name">{emi.name}</span>
              <span className="emi-emi">{formatINR(emi.emi_amount)}/mo</span>
            </div>
            <div className="emi-bar-bg">
              <div className="emi-bar-fill" style={{ width: `${pct}%` }} />
            </div>
            <div className="emi-meta">
              <span>{paid}/{emi.tenure_months} paid · {remaining} left</span>
              <span>Interest: {formatINR(totalInterest)}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
