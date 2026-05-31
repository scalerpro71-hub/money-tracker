import { formatINR } from '../../lib/dateUtils';

export function StatCard({ label, amount, icon, color = '#6366f1', sub }) {
  return (
    <div className="stat-card" style={{ borderColor: color + '44' }}>
      <div className="stat-icon" style={{ background: color + '22', color }}>{icon}</div>
      <div className="stat-info">
        <div className="stat-label">{label}</div>
        <div className="stat-amount" style={{ color }}>{formatINR(amount)}</div>
        {sub && <div className="stat-sub">{sub}</div>}
      </div>
    </div>
  );
}
