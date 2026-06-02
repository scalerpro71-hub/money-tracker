import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatINR } from '../../lib/dateUtils';

const MODE_LABELS = { upi: '📱 UPI', cash: '💵 Cash', card: '💳 Card', netbanking: '🏦 Net Banking' };
const MODE_COLORS = { upi: '#6366f1', cash: '#10b981', card: '#f59e0b', netbanking: '#0ea5e9' };

export function PaymentModeChart({ expenses }) {
  const totals = {};
  for (const e of expenses) {
    if (e.type === 'income') continue;
    const m = e.payment_mode || 'upi';
    totals[m] = (totals[m] || 0) + Number(e.amount);
  }

  const data = Object.entries(totals)
    .map(([mode, total]) => ({ name: MODE_LABELS[mode] || mode, mode, total }))
    .sort((a, b) => b.total - a.total);

  if (!data.length) return <div className="chart-slide-empty">No data</div>;

  return (
    <div>
      <div className="chart-slide-title">Payment Mode Breakdown</div>
      <ResponsiveContainer width="100%" height={160}>
        <PieChart>
          <Pie data={data} dataKey="total" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={2}>
            {data.map(d => <Cell key={d.mode} fill={MODE_COLORS[d.mode] || '#6b7280'} />)}
          </Pie>
          <Tooltip formatter={v => formatINR(v)} />
          <Legend formatter={v => v} iconSize={10} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
