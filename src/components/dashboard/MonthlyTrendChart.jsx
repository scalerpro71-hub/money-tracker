import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { formatINR } from '../../lib/dateUtils';

export function MonthlyTrendChart({ monthlyTrend }) {
  const hasData = monthlyTrend?.some(m => m.amount > 0);
  if (!hasData) return (
    <div className="chart-slide-empty">No data yet</div>
  );

  return (
    <div>
      <div className="chart-slide-title">6-Month Trend</div>
      <ResponsiveContainer width="100%" height={140}>
        <AreaChart data={monthlyTrend} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="label" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11 }} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} axisLine={false} tickLine={false} />
          <Tooltip
            formatter={v => [formatINR(v), 'Spent']}
            contentStyle={{ borderRadius: 10, border: 'none', background: 'var(--color-surface-2)', fontSize: 13 }}
          />
          <Area type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={2.5} fill="url(#trendGrad)" dot={{ fill: '#10b981', r: 3 }} activeDot={{ r: 5, strokeWidth: 0 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
