import { useState } from 'react';
import { useProfile } from '../../lib/queries';
import { useSnapshot } from '../../lib/journey/useSnapshot';
import { Area } from '../../components/charts/Area';
import { cur, fmtK } from '../../lib/formatUtils';

/** Minimal **bold** / *italic* renderer for lesson text. */
export function Rich({ text }) {
  const parts = text.split(/(\*\*.+?\*\*|\*.+?\*)/g);
  return (
    <>
      {parts.map((p, i) => {
        if (p.startsWith('**') && p.endsWith('**')) return <strong key={i}>{p.slice(2, -2)}</strong>;
        if (p.startsWith('*') && p.endsWith('*')) return <em key={i}>{p.slice(1, -1)}</em>;
        return <span key={i}>{p}</span>;
      })}
    </>
  );
}

function SplitCalc() {
  const { data: profile } = useProfile();
  const [income, setIncome] = useState(Number(profile?.monthly_income) || 40000);
  return (
    <div className="lp-calc">
      <div className="lp-calc-title">Your 50/30/20 split</div>
      <input
        type="range" min="10000" max="300000" step="5000" value={income}
        onChange={e => setIncome(Number(e.target.value))} className="lp-slider"
      />
      <div className="lp-calc-sub">In-hand income: <strong className="num">{cur(income)}</strong></div>
      <div className="lp-split-row">
        <div className="lp-split need"><div className="lp-split-cap">Needs 50%</div><div className="lp-split-val num">{fmtK(income * 0.5)}</div></div>
        <div className="lp-split want"><div className="lp-split-cap">Wants 30%</div><div className="lp-split-val num">{fmtK(income * 0.3)}</div></div>
        <div className="lp-split save"><div className="lp-split-cap">Savings 20%</div><div className="lp-split-val num">{fmtK(income * 0.2)}</div></div>
      </div>
    </div>
  );
}

function EfCalc() {
  const { snapshot } = useSnapshot();
  const [months, setMonths] = useState(3);
  const base = Math.max(5000, Math.round(snapshot.monthlyExpenseBaseline / 500) * 500);
  return (
    <div className="lp-calc">
      <div className="lp-calc-title">Size your emergency fund</div>
      <div className="lp-calc-sub">Your monthly expenses run about <strong className="num">{cur(base)}</strong> (from your own data)</div>
      <input
        type="range" min="1" max="6" step="1" value={months}
        onChange={e => setMonths(Number(e.target.value))} className="lp-slider"
      />
      <div className="lp-calc-big">
        <span className="num">{cur(base * months)}</span>
        <span className="lp-calc-big-cap">= {months} month{months > 1 ? 's' : ''} of your life, pre-paid</span>
      </div>
    </div>
  );
}

function SipCalc() {
  const [monthly, setMonthly] = useState(2000);
  const [years, setYears] = useState(15);
  const r = 0.12 / 12;
  const n = years * 12;
  const corpus = Math.round(monthly * ((Math.pow(1 + r, n) - 1) / r) * (1 + r));
  const invested = monthly * n;
  const series = Array.from({ length: years + 1 }, (_, y) => {
    const m = y * 12;
    return m === 0 ? 0 : monthly * ((Math.pow(1 + r, m) - 1) / r) * (1 + r);
  });
  return (
    <div className="lp-calc">
      <div className="lp-calc-title">The compounding curve</div>
      <div className="lp-calc-controls">
        <label>SIP <strong className="num">{cur(monthly)}</strong>/mo
          <input type="range" min="500" max="25000" step="500" value={monthly} onChange={e => setMonthly(Number(e.target.value))} className="lp-slider" />
        </label>
        <label><strong className="num">{years}</strong> years
          <input type="range" min="5" max="30" step="1" value={years} onChange={e => setYears(Number(e.target.value))} className="lp-slider" />
        </label>
      </div>
      <Area data={series} h={90} />
      <div className="lp-calc-big">
        <span className="num">{fmtK(corpus)}</span>
        <span className="lp-calc-big-cap">from {fmtK(invested)} invested · assumes 12%/yr — markets vary, a lot</span>
      </div>
    </div>
  );
}

export function Block({ block }) {
  switch (block.t) {
    case 'p':
      return <p className="lp-p"><Rich text={block.text} /></p>;
    case 'callout':
      return (
        <div className="lp-callout">
          <div className="lp-callout-emoji">{block.emoji}</div>
          <div>
            <div className="lp-callout-title">{block.title}</div>
            <div className="lp-callout-text"><Rich text={block.text} /></div>
          </div>
        </div>
      );
    case 'list':
      return (
        <ul className="lp-list">
          {block.items.map((item, i) => <li key={i}><Rich text={item} /></li>)}
        </ul>
      );
    case 'calc':
      if (block.kind === 'split') return <SplitCalc />;
      if (block.kind === 'ef') return <EfCalc />;
      if (block.kind === 'sip') return <SipCalc />;
      return null;
    case 'disclaimer':
      return (
        <div className="lp-disclaimer">
          PaisaCoach teaches concepts and never recommends specific funds, stocks or platforms.
          This is education, not SEBI-registered investment advice. Markets carry risk — read all
          scheme documents before investing.
        </div>
      );
    default:
      return null;
  }
}
