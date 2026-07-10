import { Link } from 'react-router';
import { OPTIONS } from '../../content/invest/options';
import { Icon } from '../../components/layout/Icon';
import { cur } from '../../lib/formatUtils';

const RISK = {
  low: { label: 'Low risk', color: 'var(--viz-5)' },
  medium: { label: 'Medium risk', color: 'var(--viz-3)' },
  high: { label: 'High risk', color: 'var(--viz-2)' },
};

export function ExploreTab() {
  return (
    <div style={{ maxWidth: 680 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-3)', lineHeight: 1.55, marginBottom: 16 }}>
        Every option below gets the full honest treatment — how it works, what it costs, the worst
        year on record — so you invest understanding the thing, not hoping about it.
      </div>
      {OPTIONS.map(opt => {
        const risk = RISK[opt.riskLevel];
        return (
          <Link
            key={opt.id}
            to={`/invest/options/${opt.id}`}
            className="card pad"
            style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 10, textDecoration: 'none', color: 'inherit' }}
          >
            <div style={{ fontSize: 26, width: 46, height: 46, borderRadius: 14, display: 'grid', placeItems: 'center', background: 'var(--surface-2, transparent)', border: '1px solid var(--hair)', flexShrink: 0 }}>
              {opt.emoji}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 800, fontSize: 15 }}>{opt.title}</div>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink-3)', marginTop: 2, lineHeight: 1.45 }}>{opt.tagline}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 6, fontSize: 11.5, fontWeight: 700, color: 'var(--ink-3)' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 3, background: risk.color }} />
                  {risk.label}
                </span>
                <span className="num">from {cur(opt.startFrom)}</span>
              </div>
            </div>
            <Icon name="chevR" size={16} style={{ color: 'var(--ink-4)', flexShrink: 0 }} />
          </Link>
        );
      })}
      <div className="lp-disclaimer" style={{ marginTop: 14 }}>
        PaisaCoach explains instruments and never recommends specific funds, stocks or platforms.
        Education, not SEBI-registered investment advice.
      </div>
    </div>
  );
}
