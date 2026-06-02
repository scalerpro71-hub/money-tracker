import { formatINR, formatShortDate } from '../../lib/dateUtils';
import { hexWithAlpha } from '../../lib/colorUtils';

function intensityColor(amount, max) {
  if (!amount || max === 0) return 'var(--color-surface-2)';
  const ratio = amount / max;
  if (ratio < 0.25) return hexWithAlpha('#6366f1', '33');
  if (ratio < 0.5)  return hexWithAlpha('#6366f1', '66');
  if (ratio < 0.75) return hexWithAlpha('#6366f1', '99');
  return '#6366f1';
}

export function SpendingHeatmap({ heatmapData }) {
  const max = Math.max(...heatmapData.map(d => d.amount), 1);
  const hasData = heatmapData.some(d => d.amount > 0);

  return (
    <div>
      <div className="chart-slide-title">30-Day Heatmap</div>
      {!hasData ? (
        <div className="chart-slide-empty">No spending data yet</div>
      ) : (
        <>
          <div className="heatmap-grid">
            {heatmapData.map(d => (
              <div
                key={d.date}
                className="heatmap-cell"
                style={{ background: intensityColor(d.amount, max) }}
                title={`${formatShortDate(d.date)}: ${d.amount ? formatINR(d.amount) : 'No spend'}`}
              />
            ))}
          </div>
          <div className="heatmap-legend">
            <span>Less</span>
            <div className="heatmap-legend-cells">
              {['33','55','88','bb','ff'].map(a => (
                <div key={a} className="heatmap-cell" style={{ background: hexWithAlpha('#6366f1', a) }} />
              ))}
            </div>
            <span>More</span>
          </div>
        </>
      )}
    </div>
  );
}
