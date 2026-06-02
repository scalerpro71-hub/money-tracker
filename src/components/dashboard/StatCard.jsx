import { formatINR } from '../../lib/dateUtils';

const GRADIENT_MAP = {
  '#6366f1': 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
  '#0ea5e9': 'linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%)',
  '#f59e0b': 'linear-gradient(135deg, #10b981 0%, #065f46 100%)',
};

export function StatCard({ label, amount, icon, color = '#6366f1', sub }) {
  const gradient = GRADIENT_MAP[color] || `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)`;

  return (
    <div className="stat-card stat-card--gradient" style={{ background: gradient }}>
      <div className="stat-icon stat-icon--light">{icon}</div>
      <div className="stat-info">
        <div className="stat-label stat-label--light">{label}</div>
        <div className="stat-amount stat-amount--light">{formatINR(amount)}</div>
        {sub && <div className="stat-sub stat-sub--light">{sub}</div>}
      </div>
    </div>
  );
}
