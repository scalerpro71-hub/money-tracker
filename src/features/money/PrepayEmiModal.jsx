import { useState } from 'react';
import { Modal } from '../../components/layout/Modal';
import { cur } from '../../lib/formatUtils';

/* The classic dilemma, answered with the user's own loan: put a lump sum
   toward the EMI (guaranteed "return" = loan rate) or invest it (higher
   expected return, not guaranteed). Pure math, no advice pretensions. */

function monthsLeft(emi) {
  const start = new Date(emi.start_date + 'T00:00:00');
  const now = new Date();
  const elapsed = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
  return Math.max(0, emi.tenure_months - elapsed);
}

function grow(amount, annualPct, months) {
  return amount * Math.pow(1 + annualPct / 1200, months);
}

export function PrepayEmiModal({ emi, onClose }) {
  const left = monthsLeft(emi);
  const [loanRate, setLoanRate] = useState(Number(emi.interest_rate) || '');
  const [expectedReturn, setExpectedReturn] = useState(12);
  const [lump, setLump] = useState(Math.round(Number(emi.emi_amount) * 6));

  const rate = Number(loanRate) || 0;
  const amount = Number(lump) || 0;
  const ready = rate > 0 && amount > 0 && left > 0;

  const interestSaved = ready ? grow(amount, rate, left) - amount : 0;
  const investGain = ready ? grow(amount, expectedReturn, left) - amount : 0;
  const margin = expectedReturn - rate;
  const verdict = margin <= 1 ? 'prepay' : margin <= 3 ? 'either' : 'invest';

  const VERDICTS = {
    prepay: {
      emoji: '🏦',
      title: 'Prepaying wins here',
      body: `Your loan charges ${rate}% — every rupee you prepay "earns" that rate guaranteed and tax-free. Investments would need to reliably beat it, and at this gap they can't be counted on to.`,
    },
    either: {
      emoji: '⚖️',
      title: "It's genuinely close",
      body: `The expected edge from investing is small (about ${margin.toFixed(1)}% a year) and not guaranteed, while prepaying is certain. Most people sleep better splitting the amount or just prepaying.`,
    },
    invest: {
      emoji: '📈',
      title: 'Investing likely wins — if you stay the course',
      body: `Your loan is cheap at ${rate}%. Historically equity has returned more, but it's not guaranteed and it will swing. Prepaying is still the right call if the debt stresses you.`,
    },
  };
  const v = VERDICTS[verdict];

  return (
    <Modal title={`Prepay ${emi.name} or invest?`} onClose={onClose}>
      <div className="form-row">
        <div className="form-group">
          <label>Lump sum you have</label>
          <input type="number" inputMode="numeric" min="0" value={lump} onChange={e => setLump(e.target.value)} placeholder="₹" />
        </div>
        <div className="form-group">
          <label>Loan interest rate (%)</label>
          <input type="number" inputMode="decimal" min="0" step="0.1" value={loanRate} onChange={e => setLoanRate(e.target.value)} placeholder="e.g. 10.5" />
        </div>
      </div>
      <div className="form-group">
        <label>Expected investment return</label>
        <select value={expectedReturn} onChange={e => setExpectedReturn(Number(e.target.value))}>
          <option value={7}>7% — FD-like, safe</option>
          <option value={10}>10% — balanced</option>
          <option value={12}>12% — equity, long-term average</option>
          <option value={14}>14% — optimistic equity</option>
        </select>
      </div>

      {ready ? (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, margin: '6px 0 14px' }}>
            <div style={{ border: '1px solid var(--hair)', borderRadius: 'var(--r-xs)', padding: '12px 14px' }}>
              <div className="eyebrow">Prepay now</div>
              <div className="num" style={{ fontSize: 18, fontWeight: 700, marginTop: 4 }}>{cur(Math.round(interestSaved))}</div>
              <div style={{ fontSize: 11.5, color: 'var(--ink-3)', fontWeight: 650, marginTop: 2 }}>
                interest avoided over {left} months — guaranteed
              </div>
            </div>
            <div style={{ border: '1px solid var(--hair)', borderRadius: 'var(--r-xs)', padding: '12px 14px' }}>
              <div className="eyebrow">Invest instead</div>
              <div className="num" style={{ fontSize: 18, fontWeight: 700, marginTop: 4 }}>{cur(Math.round(investGain))}</div>
              <div style={{ fontSize: 11.5, color: 'var(--ink-3)', fontWeight: 650, marginTop: 2 }}>
                expected growth at {expectedReturn}% — not guaranteed
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', background: 'var(--surface-2, var(--surface))', border: '1px solid var(--hair)', borderRadius: 'var(--r-xs)', padding: '12px 14px' }}>
            <div style={{ fontSize: 22 }}>{v.emoji}</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800 }}>{v.title}</div>
              <div style={{ fontSize: 12.5, color: 'var(--ink-2)', fontWeight: 600, lineHeight: 1.55, marginTop: 3 }}>{v.body}</div>
            </div>
          </div>
        </>
      ) : (
        <div style={{ fontSize: 13, color: 'var(--ink-3)', fontWeight: 600, lineHeight: 1.55 }}>
          {left === 0
            ? 'This EMI is already paid off — nothing to prepay. 🎉'
            : 'Enter your loan\'s interest rate (it\'s on your loan statement or bank app) and the lump sum you\'re considering.'}
        </div>
      )}
      <div style={{ fontSize: 11.5, color: 'var(--ink-4)', fontWeight: 600, lineHeight: 1.5, marginTop: 12 }}>
        Simplified math: compares compound growth of the lump sum at each rate over the remaining
        tenure. Ignores prepayment penalties, taxes and 80C effects. Education, not advice.
      </div>
    </Modal>
  );
}
