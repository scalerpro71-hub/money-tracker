import { formatINR } from '../../lib/dateUtils';

export function CategoryBreakdown({ categoryTotals, total }) {
  if (!categoryTotals.length) return <div className="chart-slide-empty">No data</div>;

  const top = categoryTotals.slice(0, 7);

  return (
    <div>
      <div className="chart-slide-title">Category Breakdown</div>
      <div className="cat-breakdown-list">
        {top.map(cat => {
          const pct = total > 0 ? Math.round((cat.total / total) * 100) : 0;
          return (
            <div key={cat.id} className="cat-breakdown-row">
              <div className="cat-breakdown-header">
                <span className="cat-breakdown-name">
                  <span style={{ background: cat.color + '22', color: cat.color, borderRadius: 8, padding: '2px 6px', fontSize: 13 }}>
                    {cat.icon} {cat.name}
                  </span>
                </span>
                <span className="cat-breakdown-amt">{formatINR(cat.total)}</span>
              </div>
              <div className="cat-breakdown-bar-bg">
                <div className="cat-breakdown-bar-fill" style={{ width: `${pct}%`, background: cat.color }} />
              </div>
              <div className="cat-breakdown-pct">{pct}% of spend</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
