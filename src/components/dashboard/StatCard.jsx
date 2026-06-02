import { formatINR } from '../../lib/dateUtils';
import { hexWithAlpha } from '../../lib/colorUtils';

export function StatCard({ label, amount, icon, color = '#6366f1', sub }) {
  return (
    <div className="stat-card" style={{ borderColor: hexWithAlpha(color, '44') }}>
      <div className="stat-icon" style={{ background: hexWithAlpha(color, '22'), color }}>{icon}</div>
      <div className="stat-info">
        <div className="stat-label">{label}</div>
        <div className="stat-amount" style={{ color }}>{formatINR(amount)}</div>
        {sub && <div className="stat-sub">{sub}</div>}
      </div>
    </div>
  );
}
