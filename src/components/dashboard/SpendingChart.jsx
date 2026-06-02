import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { formatShortDate, formatINR } from '../../lib/dateUtils';

export function SpendingChart({ dailyBars }) {
  if (!dailyBars?.length) return null;

  return (
    <div className="chart-card">
      <h4>Last 7 Days</h4>
      <ResponsiveContainer width="100%" height={160}>
        <AreaChart data={dailyBars} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            tickFormatter={d => formatShortDate(d).split(' ')[0]}
            tick={{ fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11 }}
            tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={v => [formatINR(v), 'Spent']}
            labelFormatter={l => formatShortDate(l)}
            contentStyle={{
              borderRadius: 10,
              border: 'none',
              background: 'var(--color-surface-2)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
              fontSize: 13,
              color: 'var(--color-text)',
            }}
          />
          <Area
            type="monotone"
            dataKey="amount"
            stroke="#6366f1"
            strokeWidth={2.5}
            fill="url(#spendGrad)"
            dot={false}
            activeDot={{ r: 5, fill: '#6366f1', strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
