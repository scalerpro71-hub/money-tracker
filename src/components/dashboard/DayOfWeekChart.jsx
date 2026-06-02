import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { formatINR } from '../../lib/dateUtils';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function DayOfWeekChart({ expenses }) {
  const totals = [0, 0, 0, 0, 0, 0, 0];
  const counts = [0, 0, 0, 0, 0, 0, 0];

  for (const e of expenses) {
    if (!e.date) continue;
    const dow = new Date(e.date + 'T00:00:00').getDay();
    totals[dow] += Number(e.amount);
    counts[dow]++;
  }

  const data = DAYS.map((label, i) => ({
    label,
    avg: counts[i] > 0 ? Math.round(totals[i] / counts[i]) : 0,
    total: Math.round(totals[i]),
  }));

  const max = Math.max(...data.map(d => d.avg));

  if (max === 0) return <div className="chart-slide-empty">No data yet</div>;

  return (
    <div>
      <div className="chart-slide-title">Avg Spend by Day of Week</div>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
          <XAxis dataKey="label" tick={{ fontSize: 11 }} />
          <YAxis hide />
          <Tooltip formatter={(v) => formatINR(v)} labelFormatter={(l) => l} />
          <Bar dataKey="avg" radius={[5, 5, 0, 0]} maxBarSize={36}>
            {data.map((d, i) => (
              <Cell key={i} fill={d.avg === max ? '#ef4444' : d.avg > max * 0.6 ? '#f59e0b' : '#6366f1'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--color-text-muted)', marginTop: 4 }}>
        🔴 Highest spend day · 🟡 High · 🟣 Normal
      </div>
    </div>
  );
}
