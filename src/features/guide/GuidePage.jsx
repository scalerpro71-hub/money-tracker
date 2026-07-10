import { Link } from 'react-router';

/* "How to use PaisaCoach" - the full feature map, so nothing useful stays
   hidden. Static content on purpose: this page must work before any data
   is logged, since brand-new users are exactly who it's for. */

const FIRST_STEPS = [
  { title: 'Finish onboarding honestly', text: 'The four questions (experience, risk comfort, goal, safety net) aren\'t a quiz — the coach reads them with every answer it gives you.' },
  { title: 'Set your monthly income', text: 'One number powers "Left to spend", your savings rate, and the ₹ amounts your plan suggests.', to: '/settings', link: 'Open Settings' },
  { title: 'Log your first expense with the + button', text: 'The + Add button follows you on every screen. Even the ₹20 chai counts — especially the chai.' },
  { title: 'Set 3 budgets', text: 'Pick your three biggest categories. The Home ring starts tracking you against them immediately.', to: '/money', link: 'Money → Budgets' },
  { title: 'Add your fixed commitments', text: 'EMIs, bills, subscriptions — so the app knows what part of the month is already spoken for.', to: '/money', link: 'Money → Commitments' },
  { title: 'Create your Emergency Fund goal', text: 'Step 1 of your plan does it in one tap. It\'s the number that separates calm investors from panicked ones.', to: '/invest?tab=plan', link: 'Open My plan' },
  { title: 'Meet your investing roadmap', text: 'Five steps from cushion to first SIP to diversified. Steps complete on their own when real money moves.', to: '/invest?tab=plan', link: 'Invest → My plan' },
];

const SECTIONS = [
  {
    id: 'home', title: 'Home', to: '/', sub: "Your 10-second morning glance: what's safe to spend, and the one next thing worth doing.",
    feats: [
      { name: 'Safe to spend today', text: 'One daily number: income minus what you\'ve spent, minus upcoming bills, EMIs and your SIP promise, divided over the days left. If a purchase fits under it, it\'s genuinely fine.' },
      { name: 'Runway meter', text: '"If your income stopped today, you\'d last X months" — liquid savings against your real monthly burn. The most honest measure of how safe you actually are; aim for 6 months.' },
      { name: 'Journey & plan nudges', text: 'Two tap-through cards: your next lesson, and your current plan step with a suggested ₹ amount sized from your numbers. If you only ever tap these, the app still works.' },
      { name: 'Charts & milestones', text: 'Last-7-days bars spot the leaky weekday; the budget ring makes overshoot visible mid-month. Milestone badges (first log → 3-month fund → ₹1L net worth → EMI-free) light up on their own as your numbers move.' },
    ],
  },
  {
    id: 'money', title: 'Money', to: '/money', sub: 'Six sub-tabs: Activity, Budgets, Commitments, Wishlist, Tax, Import.',
    feats: [
      { name: 'Activity', text: 'Every entry — filter, edit, delete. Log income here too (salary, refunds, cashback); your savings rate needs both sides.' },
      { name: 'Budgets + creep check', text: 'Monthly limits per category, plus a lifestyle-creep card that flags any category running 30%+ hotter than your last two months — creep is invisible day to day.' },
      { name: 'Commitments', text: 'EMIs, bills, and subscriptions auto-log themselves as expenses on their due day. Every active EMI also gets a "Prepay or invest?" calculator that answers the classic dilemma with your actual loan rate.' },
      { name: 'Wishlist — the 30-day rule', text: 'Want something big? Park it here instead of buying. After 30 days the app asks "still want it?" — most wants fade, and the ones that don\'t you buy guilt-free. Watch your "saved by waiting" total grow.' },
      { name: 'Tax', text: '80C progress against the ₹1.5L cap (plus 80D and friends) per financial year — so January never turns into a panic-buy of a bad insurance policy.' },
      { name: 'Import — most people miss this', text: 'Upload a bank statement (CSV/Excel — HDFC, ICICI, SBI, Axis, Kotak and more) and weeks of transactions land at once, auto-categorized.' },
    ],
    callout: { emoji: '⚡', title: 'The + button works from every screen', text: 'Don\'t navigate anywhere to log — hit +, type the amount, done in 5 seconds. Low friction is the whole game.' },
  },
  {
    id: 'learn', title: 'Learn', to: '/learn', sub: 'Seven levels that unlock because your numbers moved — never because you clicked a checkbox.',
    feats: [
      { name: 'The journey', text: 'Know Your Money → Budgets → Safety Net → Debt → Your First SIP → Diversify → Stay the Course. Each level shows exactly what unlocks it and how close you are.' },
      { name: 'Lessons', text: '~4-minute read → 3-question quiz (+50 XP) → often a real-world move with a "Do it" button that jumps to the right screen and completes from your data.' },
      { name: 'Calculators', text: '50/30/20 split, emergency-fund sizing, and the SIP compounding curve — pre-filled with your own income, not textbook numbers.' },
    ],
    callout: { emoji: '🎓', title: 'You don\'t have to finish Learn before investing', text: 'Level 5 completes the moment you log any first investment. Lessons are there for depth — Invest is open from day one.' },
  },
  {
    id: 'invest', title: 'Invest', to: '/invest', sub: 'Six sub-tabs. The first two get you from "scared to start" to invested; the rest track what you own.',
    feats: [
      { name: 'My plan — start here', text: 'Opens with a protection check (term & health cover vs your income — insurance is step zero), then your 5-step roadmap: cushion → small index SIP → automate 3 months → second asset → (optional) stocks. Every step shows a ₹ amount from your numbers and an "Ask coach" shortcut.' },
      { name: 'Explore — before you buy anything', text: 'Nine instruments, each with returns, lock-in, taxes, exact steps to start in India, beginner mistakes, and a worst-year calculator. Read, then hit "Start this".' },
      { name: 'Portfolio + decision journal', text: 'When you log an investment, the app asks why you\'re buying it. Your reason shows on the row — and gets read back to you on the day you\'ll need it most.' },
      { name: 'The Steady page', text: 'Markets falling? A calm page with your own written reasons, your goals\' real deadlines, and how every Indian crash so far recovered. Linked from Portfolio — read it before touching anything.' },
      { name: 'Net worth, Goals, Glossary', text: 'Assets minus liabilities with your runway in months; your Emergency Fund and custom goals; searchable plain-English definitions (NAV, ELSS, XIRR…).' },
    ],
    callout: { emoji: '✍️', title: 'No live prices — on purpose', text: 'Update values yourself from your broker app, monthly is plenty. No live ticker means no doomscrolling your portfolio — the exact habit that ruins beginners.' },
  },
  {
    id: 'coach', title: 'Coach', to: '/coach', sub: 'An AI mentor that already knows your numbers — you never have to explain your situation.',
    feats: [
      { name: 'Chat', text: '"Can I afford a ₹2,000 treat this weekend?" gets answered from your actual month, not generic advice.' },
      { name: 'Ask-coach shortcuts', text: 'Every plan step and Explore page has an "Ask coach about this" button that opens the chat with the right question pre-typed.' },
      { name: 'Weekly reviews', text: 'Each week the coach writes up your actual week — a Win to keep and a Focus for next week. It generates itself on your first visit after Monday.' },
    ],
  },
];

const DONT_MISS = [
  ['Import bank statements', 'Money → Import. One upload replaces weeks of manual logging.'],
  ['Log income, not just spending', 'The + button has an Income mode. Savings rate is wrong without it.'],
  ['The worst-year calculator', 'On every Explore page — fear shrinks when the worst case is a number you\'ve seen.'],
  ['Pre-filled logging', '"Log it" on a plan step and "Start this" on an option open the form already set up.'],
  ['Commitments auto-log', 'Bills, EMIs and subscriptions log themselves as expenses on their due day. Never forget rent or Netflix again.'],
  ['Prepay or invest?', 'On every active EMI in Commitments — guaranteed interest saved vs likely market growth, computed from your own loan.'],
  ['Tell the app your insurance', 'Settings → Protection. Two numbers, and the plan\'s step-zero check starts watching your back.'],
  ['Install it as an app', 'Use "Add to Home Screen" on your phone — PaisaCoach opens full-screen like a native app.'],
];

const RHYTHM = [
  ['Daily · 30 sec', 'Log the day\'s expenses with +. Glance at Left to spend.'],
  ['Monday · 2 min', 'Read your weekly review on Coach. Keep the Win, act on the Focus.'],
  ['Payday · 2 min', 'Log the income. Your SIP debits 2–3 days later; top up the Emergency Fund.'],
  ['Monthly · 5 min', 'Update portfolio values from your broker app. Adjust any budget that turned out to be fantasy.'],
  ['Market drops · 0 min', 'Nothing. Open the Steady page (Invest → Portfolio), reread your own reasons, let the SIP buy cheap units.'],
];

function Callout({ emoji, title, text }) {
  return (
    <div className="lp-callout" style={{ marginTop: 14 }}>
      <div className="lp-callout-emoji">{emoji}</div>
      <div>
        <div className="lp-callout-title">{title}</div>
        <div className="lp-callout-text">{text}</div>
      </div>
    </div>
  );
}

export function GuidePage() {
  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      <div style={{ fontSize: 14, color: 'var(--ink-2)', fontWeight: 600, lineHeight: 1.6, marginBottom: 22 }}>
        PaisaCoach is a coach, not just a tracker — it watches your real numbers and unlocks the
        next step when you're ready. This page walks the whole app once, so nothing useful stays hidden.
      </div>

      <div className="eyebrow" style={{ marginBottom: 8 }}>Your first 15 minutes</div>
      <div className="card" style={{ padding: '4px 20px', marginBottom: 28 }}>
        {FIRST_STEPS.map((step, i) => (
          <div key={i} style={{ display: 'flex', gap: 14, padding: '14px 0', borderTop: i === 0 ? 'none' : '1px solid var(--hair)' }}>
            <div style={{ width: 28, height: 28, borderRadius: 9, flexShrink: 0, marginTop: 2, background: 'var(--accent-grad)', color: '#fff', fontWeight: 800, fontSize: 13, display: 'grid', placeItems: 'center' }}>
              {i + 1}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 800, fontSize: 14.5 }}>{step.title}</div>
              <div style={{ fontSize: 13, color: 'var(--ink-2)', fontWeight: 550, lineHeight: 1.55, marginTop: 2 }}>
                {step.text}{' '}
                {step.to && <Link to={step.to} className="more-link">{step.link} →</Link>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {SECTIONS.map(sec => (
        <div key={sec.id} style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 4 }}>
            <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.01em' }}>{sec.title}</div>
            <Link to={sec.to} className="more-link">Open →</Link>
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--ink-3)', fontWeight: 600, marginBottom: 10 }}>{sec.sub}</div>
          <div className="card" style={{ padding: '4px 20px' }}>
            {sec.feats.map((f, i) => (
              <div key={f.name} style={{ padding: '13px 0', borderTop: i === 0 ? 'none' : '1px solid var(--hair)' }}>
                <div style={{ fontWeight: 800, fontSize: 14 }}>{f.name}</div>
                <div style={{ fontSize: 13, color: 'var(--ink-2)', fontWeight: 550, lineHeight: 1.55, marginTop: 2 }}>{f.text}</div>
              </div>
            ))}
          </div>
          {sec.callout && <Callout {...sec.callout} />}
        </div>
      ))}

      <div className="eyebrow" style={{ marginBottom: 8 }}>Easy to miss</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 10, marginBottom: 28 }}>
        {DONT_MISS.map(([title, text]) => (
          <div key={title} className="card" style={{ padding: '14px 16px' }}>
            <div style={{ fontWeight: 800, fontSize: 13.5 }}>{title}</div>
            <div style={{ fontSize: 12.5, color: 'var(--ink-2)', fontWeight: 550, lineHeight: 1.5, marginTop: 3 }}>{text}</div>
          </div>
        ))}
      </div>

      <div className="eyebrow" style={{ marginBottom: 8 }}>A rhythm that keeps it alive</div>
      <div className="card" style={{ padding: '4px 20px', marginBottom: 20 }}>
        {RHYTHM.map(([when, what], i) => (
          <div key={when} style={{ display: 'flex', gap: 14, padding: '12px 0', borderTop: i === 0 ? 'none' : '1px solid var(--hair)' }}>
            <div style={{ fontWeight: 800, fontSize: 12.5, whiteSpace: 'nowrap', width: 120, flexShrink: 0, color: 'var(--ink)' }}>{when}</div>
            <div style={{ fontSize: 13, color: 'var(--ink-2)', fontWeight: 550, lineHeight: 1.55 }}>{what}</div>
          </div>
        ))}
      </div>

      <div className="lp-disclaimer" style={{ marginBottom: 30 }}>
        PaisaCoach teaches concepts and never recommends specific funds, stocks or platforms.
        Education, not SEBI-registered investment advice — markets carry risk.
      </div>
    </div>
  );
}
