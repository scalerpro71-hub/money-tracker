import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatINR } from '../../lib/dateUtils';

export function CategoryPieChart({ categoryTotals }) {
  if (!categoryTotals.length) return <div className="empty-chart">No data</div>;

  const top = categoryTotals.slice(0, 6);

  return (
    <div className="chart-card">
      <h4>By Category</h4>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie data={top} dataKey="total" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={2}>
            {top.map(cat => <Cell key={cat.id} fill={cat.color} />)}
          </Pie>
          <Tooltip formatter={(v) => formatINR(v)} />
          <Legend formatter={(v) => v} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
