import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { getOption } from '../../content/invest/options';
import { Block, Rich } from '../learn/blocks';
import { Icon } from '../../components/layout/Icon';
import { cur } from '../../lib/formatUtils';
import { AddInvestmentModal } from './AddInvestmentModal';

const RISK = {
  low: { label: 'Low risk', color: 'var(--viz-5)' },
  medium: { label: 'Medium risk', color: 'var(--viz-3)' },
  high: { label: 'High risk', color: 'var(--viz-2)' },
};

const FACT_LABELS = {
  returns: 'Returns',
  lockIn: 'Lock-in',
  taxes: 'Taxes',
  effort: 'Effort',
};

/* The fear, measured: what the worst year on record does to a sample amount.
   A positive worstYearPct means the instrument never has red years - the
   honest worst case there is inflation, framed in the recoveryNote. */
function FearCheck({ fearCheck }) {
  const [amount, setAmount] = useState(10000);
  const losing = fearCheck.worstYearPct < 0;
  const after = Math.round(amount * (1 + fearCheck.worstYearPct));
  return (
    <div className="lp-calc">
      <div className="lp-calc-title">{losing ? 'The fear, measured' : 'The quiet worst case'}</div>
      <div className="lp-calc-sub">
        Say you put in <strong className="num">{cur(amount)}</strong> — {fearCheck.worstYearLabel}:
      </div>
      <input
        type="range" min="1000" max="100000" step="1000" value={amount}
        onChange={e => setAmount(Number(e.target.value))} className="lp-slider"
      />
      <div className="lp-calc-big">
        <span className="num" style={losing ? { color: 'var(--danger, #d06050)' } : undefined}>{cur(after)}</span>
        <span className="lp-calc-big-cap">
          {losing
            ? `on paper after that worst year — a ${cur(amount - after)} dip, real only if you sell`
            : 'after a typical year — no red years here'}
        </span>
      </div>
      <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink-3)', lineHeight: 1.55, marginTop: 10 }}>
        {fearCheck.recoveryNote}
      </div>
    </div>
  );
}

export function OptionPage() {
  const { optionId } = useParams();
  const navigate = useNavigate();
  const option = getOption(optionId);
  const [modal, setModal] = useState(false);

  if (!option) {
    return (
      <div className="empty-state">
        <span className="empty-icon">🤔</span>
        <p>Option not found</p>
        <Link to="/invest?tab=explore" className="more-link">Back to Explore</Link>
      </div>
    );
  }

  const risk = RISK[option.riskLevel];

  return (
    <div className="lp-page">
      <div className="lp-top">
        <button className="icon-btn" onClick={() => navigate('/invest?tab=explore')} aria-label="Back to Explore">
          <Icon name="chevL" size={18} />
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="lp-crumb">Explore · {option.tagline}</div>
          <div className="lp-title">{option.emoji} {option.title}</div>
        </div>
        <span className="chip" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: 3, background: risk.color }} />
          {risk.label}
        </span>
      </div>

      <div className="card lp-body">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginBottom: 18 }}>
          {Object.entries(option.facts).map(([key, value]) => (
            <div key={key} style={{ padding: '10px 12px', borderRadius: 12, border: '1px solid var(--hair)' }}>
              <div className="eyebrow" style={{ marginBottom: 3 }}>{FACT_LABELS[key]}</div>
              <div style={{ fontSize: 12.5, fontWeight: 650, lineHeight: 1.5, color: 'var(--ink-2)' }}>{value}</div>
            </div>
          ))}
        </div>

        {option.blocks.map((block, i) => <Block key={i} block={block} />)}

        <div className="eyebrow" style={{ margin: '18px 0 6px' }}>How to start (in India)</div>
        <ul className="lp-list">
          {option.howToStart.map((item, i) => <li key={i}><Rich text={item} /></li>)}
        </ul>

        <div className="lp-callout">
          <div className="lp-callout-emoji">🚧</div>
          <div>
            <div className="lp-callout-title">Beginner mistakes to skip</div>
            <ul className="lp-list" style={{ margin: '6px 0 0' }}>
              {option.mistakes.map((item, i) => <li key={i}><Rich text={item} /></li>)}
            </ul>
          </div>
        </div>

        <FearCheck fearCheck={option.fearCheck} />

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginTop: 18 }}>
          <button className="btn-accent" onClick={() => setModal(true)}>
            <Icon name="plus" size={15} /> Start this — log investment
          </button>
          <button className="more-link" onClick={() => navigate('/coach', { state: { ask: option.coachQuestion } })}>
            Ask coach about this
          </button>
        </div>

        <Block block={{ t: 'disclaimer' }} />
      </div>

      {modal && (
        <AddInvestmentModal preset={{ type: option.type }} onClose={() => setModal(false)} />
      )}
    </div>
  );
}
