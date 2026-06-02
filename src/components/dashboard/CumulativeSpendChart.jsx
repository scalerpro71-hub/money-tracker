import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Area, AreaChart } from 'recharts';
import { formatINR } from '../../lib/dateUtils';

export function CumulativeSpendChart({ expenses, budgetTotal }) {
  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const monthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  const monthExpenses = expenses.filter(e => e.date?.startsWith(monthStr));

  // Build cumulative data per day
  let running = 0;
  const data = Array.from({ length: today.getDate() }, (_, i) => {
    const day = i + 1;
    const dateStr = `${monthStr}-${String(day).padStart(2, '0')}`;
    const dayAmt = monthExpenses.filter(e => e.date === dateStr).reduce((a, e) => a + Number(e.amount), 0);
    running += dayAmt;
    const pace = budgetTotal > 0 ? Math.round((budgetTotal / daysInMonth) * (i + 1)) : null;
    return { day: `${day}`, actual: Math.round(running), pace };
  });

  if (data.length === 0) return <div className="chart-slide-empty">No data this month</div>;

  return (
    <div>
      <div className="chart-slide-title">Monthly Cumulative Spend</div>
      <ResponsiveContainer width="100%" height={160}>
        <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="cumGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="day" tick={{ fontSize: 10 }} interval={4} />
          <YAxis hide />
          <Tooltip formatter={(v, n) => [formatINR(v), n === 'actual' ? 'Spent' : 'Budget pace']} />
          <Area type="monotone" dataKey="actual" stroke="#6366f1" strokeWidth={2} fill="url(#cumGrad)" dot={false} />
          {budgetTotal > 0 && <Line type="monotone" dataKey="pace" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="4 3" dot={false} />}
        </AreaChart>
      </ResponsiveContainer>
      {budgetTotal > 0 && (
        <div className="chart-legend-row">
          <span><span className="legend-dot" style={{ background: '#6366f1' }} /> Actual spend</span>
          <span><span className="legend-dot legend-dot--dashed" style={{ background: '#f59e0b' }} /> Budget pace</span>
        </div>
      )}
    </div>
  );
}
