import { fmtK } from '../../lib/formatUtils';

/* The wealth-building path as visible badges. Everything is computed from the
   snapshot — a milestone lights up because the numbers moved, like the journey. */
function buildMilestones(s) {
  const list = [
    { id: 'first-log', emoji: '✍️', title: 'First expense logged', done: s.entryCount >= 1 },
    { id: 'streak-7', emoji: '🔥', title: '7-day logging streak', done: s.loggingStreak >= 7 },
    { id: 'first-budget', emoji: '🎯', title: 'First budget set', done: s.budgetCount >= 1 },
    { id: 'cushion-1', emoji: '🛡️', title: '1-month emergency cushion', done: s.efMonthsCovered >= 1 },
    { id: 'first-invest', emoji: '🌱', title: 'First investment', done: s.investmentCount >= 1 },
    { id: 'invested-10k', emoji: '💪', title: `${fmtK(10000)} invested`, done: s.invested >= 10000 },
    { id: 'cushion-3', emoji: '🏰', title: '3-month emergency fund', done: s.efMonthsCovered >= 3 },
    { id: 'diversified', emoji: '🧩', title: 'Second asset class', done: s.investmentTypes.length >= 2 },
    { id: 'networth-1l', emoji: '🏆', title: `${fmtK(100000)} net worth`, done: s.netWorth >= 100000 },
    { id: 'saver-20', emoji: '💎', title: '20% saved in a full month', done: (s.lastFullMonthSavingsRate ?? 0) >= 20 },
  ];
  if (s.emiCount > 0) {
    list.push({ id: 'emi-free', emoji: '🕊️', title: 'EMI-free', done: s.activeEmiTotal === 0 });
  }
  return list;
}

export function Milestones({ snapshot }) {
  const milestones = buildMilestones(snapshot);
  const done = milestones.filter(m => m.done).length;
  const nextIdx = milestones.findIndex(m => !m.done);

  return (
    <>
      <div className="sec-head">
        <h3>Milestones</h3>
        <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--ink-3)' }}>{done} of {milestones.length}</span>
      </div>
      <div className="card pad rise" style={{ '--d': '300ms' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10 }}>
          {milestones.map((m, i) => {
            const isNext = i === nextIdx;
            return (
              <div
                key={m.id}
                style={{
                  border: `1px solid ${isNext ? 'var(--accent)' : 'var(--hair)'}`,
                  borderRadius: 12, padding: '12px 12px',
                  opacity: m.done || isNext ? 1 : 0.5,
                  background: m.done ? 'var(--accent-soft, rgba(10,157,114,0.08))' : 'transparent',
                }}
              >
                <div style={{ fontSize: 20, filter: m.done || isNext ? 'none' : 'grayscale(1)' }}>{m.emoji}</div>
                <div style={{ fontSize: 12.5, fontWeight: 750, marginTop: 6, lineHeight: 1.35 }}>{m.title}</div>
                <div style={{ fontSize: 11, fontWeight: 700, marginTop: 3, color: m.done ? 'var(--accent)' : 'var(--ink-4)' }}>
                  {m.done ? 'Done ✓' : isNext ? 'You are here' : 'Ahead'}
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 600, marginTop: 12, lineHeight: 1.5 }}>
          The boring middle years are where most people quit — these light up on their own as your
          numbers move.
        </div>
      </div>
    </>
  );
}
