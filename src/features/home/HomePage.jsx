import { Link, useNavigate } from 'react-router';
import { useJourney } from '../../lib/journey/useJourney';
import { evaluatePlan } from '../../lib/journey/planCriteria';
import { useOpenAdd } from '../../app/shell/AppShell';
import { Icon } from '../../components/layout/Icon';
import { Spinner } from '../../components/layout/Spinner';
import { Confetti } from '../../components/layout/Confetti';
import { BarChart } from '../../components/charts/BarChart';
import { Ring } from '../../components/charts/Ring';
import { cur, fmtK } from '../../lib/formatUtils';

function dayLetter(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short' }).slice(0, 2);
}

export function HomePage() {
  const journey = useJourney();
  const { snapshot: s, loading, current, nextStep, celebrating, clearCelebration } = journey;
  const openAdd = useOpenAdd();
  const navigate = useNavigate();

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}><Spinner size={36} /></div>;
  }

  const budgetPct = s.totalBudget > 0 ? Math.round((s.monthSpend / s.totalBudget) * 100) : null;
  const planCurrent = s.monthlyIncome > 0 ? evaluatePlan(s).find(st => st.status === 'current') : null;

  return (
    <div className="dash">
      <Confetti trigger={celebrating} onDone={clearCelebration} />
      {/* HERO — what's safe to spend */}
      <div className="hero rise" style={{ '--d': '0ms' }}>
        <div className="hero-top">
          <div className="hero-label">Left to spend this month</div>
          {s.loggingStreak > 1 && (
            <div className="hero-pill"><Icon name="flame" size={14} />{s.loggingStreak}-day streak</div>
          )}
        </div>
        <div className="hero-bal">
          <span className="cur">₹</span>{fmtK(Math.round(s.spendable)).replace('₹', '')}
        </div>
        <div className="hero-sub">
          {s.monthlyIncome > 0
            ? `of ${cur(Math.round(s.monthlyIncome))} income · ${s.daysLeft} days left`
            : 'Set your income in Settings to see this'}
        </div>
        <div className="hero-splits">
          <div className="hero-split">
            <div className="hs-label"><span className="dot in" />In</div>
            <div className="hs-val">{fmtK(Math.round(s.monthlyIncome))}</div>
          </div>
          <div className="hero-split">
            <div className="hs-label"><span className="dot out" />Out</div>
            <div className="hs-val">{fmtK(Math.round(s.monthSpend))}</div>
          </div>
          <div className="hero-split">
            <div className="hs-label"><span className="dot save" />Kept</div>
            <div className="hs-val">{s.currentSavingsRate != null ? `${s.currentSavingsRate}%` : '—'}</div>
          </div>
        </div>
        <div className="hero-actions">
          <button className="ha solid" onClick={() => openAdd('expense')}><Icon name="plus" size={16} />Expense</button>
          <button className="ha" onClick={() => openAdd('income')}><Icon name="arrowDn" size={16} />Income</button>
          <button className="ha" onClick={() => navigate('/coach')}><Icon name="sparkle" size={16} />Ask coach</button>
        </div>
      </div>

      {/* JOURNEY NUDGE — the coach's next concrete step */}
      <Link
        to={nextStep?.kind === 'lesson' ? `/learn/${nextStep.levelId}/${nextStep.lesson.id}` : '/learn'}
        style={{ textDecoration: 'none', color: 'inherit' }}
      >
        <div className="card pad rise btn-lift" style={{ '--d': '60ms', marginTop: 18, display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer' }}>
          <div style={{ width: 46, height: 46, borderRadius: 14, flexShrink: 0, background: 'var(--accent-grad)', display: 'grid', placeItems: 'center', fontSize: 22, boxShadow: '0 8px 18px -8px var(--glow)' }}>
            {current?.emoji || '🗺️'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--accent)' }}>
              {current ? `Level ${current.order} · ${current.title}` : 'Your journey'}
            </div>
            <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: '-0.01em', marginTop: 3 }}>
              {nextStep?.kind === 'lesson' ? nextStep.label : 'Continue your journey'}
            </div>
            {nextStep?.kind === 'criteria' && (
              <div style={{ fontSize: 12.5, color: 'var(--ink-3)', fontWeight: 650, marginTop: 2 }}>
                To finish this level: {nextStep.label}
              </div>
            )}
          </div>
          <Icon name="chevR" size={18} style={{ color: 'var(--ink-4)', flexShrink: 0 }} />
        </div>
      </Link>

      {/* INVESTING PLAN NUDGE — the current step of the starter plan */}
      {planCurrent && (
        <Link to="/invest?tab=plan" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="card pad rise btn-lift" style={{ '--d': '90ms', marginTop: 12, display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer' }}>
            <div style={{ width: 46, height: 46, borderRadius: 14, flexShrink: 0, border: '1px solid var(--hair)', display: 'grid', placeItems: 'center', fontSize: 22 }}>
              {planCurrent.emoji}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--accent)' }}>
                Investing plan · step {planCurrent.order} of 5
              </div>
              <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: '-0.01em', marginTop: 3 }}>
                {planCurrent.title}
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--ink-3)', fontWeight: 650, marginTop: 2 }}>
                About {cur(planCurrent.amount)} {planCurrent.amountCap} — sized from your numbers
              </div>
            </div>
            <Icon name="chevR" size={18} style={{ color: 'var(--ink-4)', flexShrink: 0 }} />
          </div>
        </Link>
      )}

      {/* CHARTS ROW */}
      <div className="grid-2" style={{ marginTop: 18 }}>
        <div className="card pad rise" style={{ '--d': '120ms' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
            <div className="eyebrow">Last 7 days</div>
            <div className="num" style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink-2)' }}>{cur(Math.round(s.weekTotal))}</div>
          </div>
          <BarChart data={s.dailyBars.map(b => ({ v: b.amount, d: dayLetter(b.date) }))} height={120} />
        </div>

        <div className="card pad rise ring-card" style={{ '--d': '180ms' }}>
          {budgetPct != null ? (
            <>
              <div className="ring-wrap">
                <Ring pct={budgetPct} />
                <div className="ring-center">
                  <div className="rc-pct">{budgetPct}%</div>
                  <div className="rc-cap">of budget</div>
                </div>
              </div>
              <div className="ring-facts">
                <div className="ring-fact">
                  <div className="rf-label">Budgeted</div>
                  <div className="rf-val">{fmtK(s.totalBudget)}</div>
                </div>
                <div className="ring-fact">
                  <div className="rf-label">Spent</div>
                  <div className="rf-val">{fmtK(Math.round(s.monthSpend))}</div>
                </div>
                <div className="ring-fact">
                  <div className="rf-label">Daily pace</div>
                  <div className="rf-val">{fmtK(s.avgDailySpend)}<small>/day</small></div>
                </div>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', width: '100%', padding: '14px 0' }}>
              <div style={{ fontSize: 30, marginBottom: 10 }}>🎯</div>
              <div style={{ fontWeight: 800, fontSize: 14.5 }}>No budgets yet</div>
              <div style={{ fontSize: 12.5, color: 'var(--ink-3)', fontWeight: 600, margin: '4px 0 14px' }}>
                Budgets turn "where did it all go?" into a plan.
              </div>
              <button className="btn-ghost" style={{ fontSize: 13 }} onClick={() => navigate('/money')}>Set budgets</button>
            </div>
          )}
        </div>
      </div>

      {/* TOP CATEGORIES */}
      {s.topCategories.length > 0 && (
        <>
          <div className="sec-head">
            <h3>Where it went this month</h3>
            <button className="more-link" onClick={() => navigate('/money')}>All activity</button>
          </div>
          <div className="card pad rise" style={{ '--d': '240ms' }}>
            {s.topCategories.slice(0, 5).map(cat => {
              const pct = s.monthSpend > 0 ? Math.round((cat.total / s.monthSpend) * 100) : 0;
              return (
                <div className="catbar" key={cat.id}>
                  <div className="catbar-head">
                    <div className="catbar-name"><span className="ce">{cat.icon}</span>{cat.name}</div>
                    <div className="catbar-val">{cur(Math.round(cat.total))} · {pct}%</div>
                  </div>
                  <div className="catbar-track">
                    <div className="catbar-fill anim-barGrow" style={{ width: `${pct}%`, background: cat.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* EMPTY FIRST-RUN STATE */}
      {s.entryCount === 0 && (
        <div className="card pad rise" style={{ '--d': '240ms', marginTop: 18, textAlign: 'center', padding: '36px 24px' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>✍️</div>
          <div style={{ fontWeight: 800, fontSize: 16 }}>Log your first expense</div>
          <div style={{ fontSize: 13.5, color: 'var(--ink-3)', fontWeight: 600, margin: '6px auto 16px', maxWidth: 380, lineHeight: 1.55 }}>
            Everything starts with knowing where the money goes. Even that ₹20 chai counts —
            especially the ₹20 chai.
          </div>
          <button className="btn-accent" onClick={() => openAdd('expense')}>
            <Icon name="plus" size={16} />Add your first expense
          </button>
        </div>
      )}
    </div>
  );
}
