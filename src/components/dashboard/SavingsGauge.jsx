import { formatINR } from '../../lib/dateUtils';

const R = 54, CX = 70, CY = 70, SW = 10;
const CIRC = Math.PI * R; // half-circle circumference

function gaugeColor(rate) {
  if (rate >= 30) return '#10b981';
  if (rate >= 10) return '#f59e0b';
  return '#ef4444';
}

export function SavingsGauge({ income, spent }) {
  if (!income) return null;
  const saved = income - spent;
  const rate = Math.max(0, Math.min(100, Math.round((saved / income) * 100)));
  const color = gaugeColor(rate);
  // strokeDashoffset for half-circle gauge
  const offset = CIRC * (1 - rate / 100);

  return (
    <div>
      <div className="chart-slide-title">Savings Rate</div>
      <div className="gauge-wrap">
        <svg width="140" height="80" viewBox="0 0 140 80">
          {/* Track */}
          <path
            d={`M ${CX - R} ${CY} A ${R} ${R} 0 0 1 ${CX + R} ${CY}`}
            fill="none"
            stroke="var(--color-surface-2)"
            strokeWidth={SW}
            strokeLinecap="round"
          />
          {/* Fill */}
          <path
            d={`M ${CX - R} ${CY} A ${R} ${R} 0 0 1 ${CX + R} ${CY}`}
            fill="none"
            stroke={color}
            strokeWidth={SW}
            strokeLinecap="round"
            strokeDasharray={CIRC}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.8s ease' }}
          />
          <text x={CX} y={CY - 4} textAnchor="middle" fontSize="22" fontWeight="800" fill={color}>{rate}%</text>
          <text x={CX} y={CY + 14} textAnchor="middle" fontSize="10" fill="var(--color-text-muted)">savings rate</text>
        </svg>
        <div className="gauge-detail">
          <div className="gauge-row">
            <span>Income</span><span style={{ color: '#10b981', fontWeight: 700 }}>{formatINR(income)}</span>
          </div>
          <div className="gauge-row">
            <span>Spent</span><span style={{ color: '#ef4444', fontWeight: 700 }}>{formatINR(spent)}</span>
          </div>
          <div className="gauge-row">
            <span>Saved</span><span style={{ color, fontWeight: 800 }}>{formatINR(Math.max(0, saved))}</span>
          </div>
        </div>
      </div>
      <div className="gauge-zones">
        <span style={{ color: '#ef4444' }}>⬤ Poor &lt;10%</span>
        <span style={{ color: '#f59e0b' }}>⬤ Ok 10-30%</span>
        <span style={{ color: '#10b981' }}>⬤ Good &gt;30%</span>
      </div>
    </div>
  );
}
