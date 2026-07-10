import { Link, useNavigate } from 'react-router';
import { useSnapshot } from '../../lib/journey/useSnapshot';
import { Spinner } from '../../components/layout/Spinner';
import { Icon } from '../../components/layout/Icon';
import { formatDate } from '../../lib/dateUtils';

/* Indian market falls and what came after — the antidote to a red portfolio. */
const CRASHES = [
  { name: '2008 global financial crisis', fall: 'Sensex fell ~60%', recovery: 'back at its old high in about 2 years — then tripled over the next decade' },
  { name: '2020 COVID crash', fall: 'Sensex fell ~38% in one month', recovery: 'recovered in about 9 months and hit new all-time highs the same year' },
  { name: '2016 demonetisation dip', fall: 'markets fell ~7%', recovery: 'recovered within weeks' },
];

const RULES = [
  { emoji: '🛑', title: "Don't sell", body: 'A fall only becomes a loss the moment you sell. Units you hold recover with the market; money you pull out never does.' },
  { emoji: '🔁', title: 'Let the SIP run', body: "This month's SIP buys the same funds at a discount. Downturns are where long-term returns are actually made." },
  { emoji: '📵', title: 'Stop checking daily', body: 'Your plan is measured in years. Checking a 10-year investment every day is reading the last letter of every word.' },
  { emoji: '🧾', title: 'Reread your reasons', body: 'You wrote down why you bought each investment on a calm day. That version of you was thinking clearly — trust them.' },
];

export function SteadyPage() {
  const { snapshot: s, loading } = useSnapshot();
  const navigate = useNavigate();

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}><Spinner size={36} /></div>;
  }

  const reasons = s.investments.filter(i => i.reason);
  const datedGoals = s.goals.filter(g => g.target_date && g.target_date > s.today);

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      <Link to="/invest?tab=portfolio" className="more-link" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
        <Icon name="chevL" size={14} />Portfolio
      </Link>

      <div className="nw-hero rise">
        <div className="hero-label">Steady</div>
        <div style={{ fontSize: 'clamp(26px, 4vw, 34px)', fontWeight: 800, letterSpacing: '-0.02em', margin: '10px 0 8px' }}>
          Markets fall. Plans don't have to.
        </div>
        <div className="hero-sub" style={{ color: 'rgba(255,255,255,0.68)', maxWidth: 520 }}>
          Every rupee you've invested has lived through crashes before — inside other people's
          portfolios. The ones who came out fine are the ones who did the least. This page is
          your reminder of what you already decided.
        </div>
      </div>

      {reasons.length > 0 && (
        <div className="card pad rise" style={{ marginTop: 18 }}>
          <div className="eyebrow" style={{ marginBottom: 12 }}>In your own words — why you bought</div>
          {reasons.map(inv => (
            <div key={inv.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--hair-2)' }}>
              <div style={{ fontSize: 13.5, fontWeight: 800 }}>{inv.name}</div>
              <div style={{ fontSize: 13.5, color: 'var(--ink-2)', fontWeight: 600, fontStyle: 'italic', marginTop: 3, lineHeight: 1.5 }}>
                “{inv.reason}”
              </div>
            </div>
          ))}
          <div style={{ fontSize: 12.5, color: 'var(--ink-3)', fontWeight: 600, marginTop: 10 }}>
            Written by you, on a day the market wasn't scaring you.
          </div>
        </div>
      )}

      <div className="card pad rise" style={{ marginTop: 14 }}>
        <div className="eyebrow" style={{ marginBottom: 12 }}>Your money's actual deadline</div>
        {datedGoals.length > 0 ? (
          datedGoals.map(g => (
            <div key={g.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '8px 0' }}>
              <div style={{ fontSize: 13.5, fontWeight: 700 }}>{g.name}</div>
              <div style={{ fontSize: 13, color: 'var(--ink-3)', fontWeight: 700, whiteSpace: 'nowrap' }}>{formatDate(g.target_date)}</div>
            </div>
          ))
        ) : (
          <div style={{ fontSize: 13.5, color: 'var(--ink-2)', fontWeight: 600, lineHeight: 1.6 }}>
            You're investing for years from now, not for this week. Today's price only matters
            to someone selling today — that isn't you.
          </div>
        )}
        {datedGoals.length > 0 && (
          <div style={{ fontSize: 12.5, color: 'var(--ink-3)', fontWeight: 600, marginTop: 10 }}>
            None of these need the money today. What the market does this week is noise on these timelines.
          </div>
        )}
      </div>

      <div className="card pad rise" style={{ marginTop: 14 }}>
        <div className="eyebrow" style={{ marginBottom: 12 }}>Every crash so far has ended the same way</div>
        {CRASHES.map(c => (
          <div key={c.name} style={{ padding: '9px 0', borderBottom: '1px solid var(--hair-2)' }}>
            <div style={{ fontSize: 13.5, fontWeight: 800 }}>{c.name}</div>
            <div style={{ fontSize: 13, color: 'var(--ink-2)', fontWeight: 600, marginTop: 2, lineHeight: 1.5 }}>
              {c.fall} — {c.recovery}.
            </div>
          </div>
        ))}
        <div style={{ fontSize: 12.5, color: 'var(--ink-3)', fontWeight: 600, marginTop: 10 }}>
          Past recoveries don't guarantee the next one — but betting against them has been the losing side every single time so far.
        </div>
      </div>

      <div className="grid-2" style={{ marginTop: 14 }}>
        {RULES.map(r => (
          <div key={r.title} className="card pad rise">
            <div style={{ fontSize: 24, marginBottom: 8 }}>{r.emoji}</div>
            <div style={{ fontSize: 14.5, fontWeight: 800 }}>{r.title}</div>
            <div style={{ fontSize: 13, color: 'var(--ink-2)', fontWeight: 600, marginTop: 4, lineHeight: 1.55 }}>{r.body}</div>
          </div>
        ))}
      </div>

      <div className="card pad rise" style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 220 }}>
          <div style={{ fontSize: 14.5, fontWeight: 800 }}>Still feeling the itch to act?</div>
          <div style={{ fontSize: 13, color: 'var(--ink-3)', fontWeight: 600, marginTop: 2 }}>
            Talk it through before touching anything — that's what the coach is for.
          </div>
        </div>
        <button
          className="btn-accent"
          onClick={() => navigate('/coach', { state: { ask: 'Markets are falling and I feel like selling my investments. Talk me through what I should actually do.' } })}
        >
          <Icon name="sparkle" size={16} />Ask the coach
        </button>
      </div>
    </div>
  );
}
