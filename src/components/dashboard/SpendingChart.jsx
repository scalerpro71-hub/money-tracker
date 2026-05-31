import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { formatShortDate, formatINR, todayStr } from '../../lib/dateUtils';

export function SpendingChart({ dailyBars }) {
  const today = todayStr();

  return (
    <div className="chart-card">
      <h4>Last 7 Days</h4>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={dailyBars} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <XAxis dataKey="date" tickFormatter={d => formatShortDate(d).split(' ')[0]} tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(1)}k` : v} />
          <Tooltip formatter={(v) => formatINR(v)} labelFormatter={l => formatShortDate(l)} />
          <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
            {dailyBars.map(d => (
              <Cell key={d.date} fill={d.date === today ? '#6366f1' : '#a5b4fc'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
