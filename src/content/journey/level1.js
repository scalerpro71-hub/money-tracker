/* Level 1 — Know Your Money
   Block types: p (paragraph, **bold** supported), callout, list, calc, disclaimer */

export default {
  id: 'l1',
  order: 1,
  emoji: '🔍',
  title: 'Know Your Money',
  tagline: "You can't fix what you can't see",
  completeCriteria: 'l1_complete',
  completeHint: 'Log 10 expenses (or a 7-day logging streak) and set your income',
  lessons: [
    {
      id: 'l1-01',
      title: 'The invisible leak',
      minutes: 3,
      blocks: [
        { t: 'p', text: "Most people don't have an income problem. They have a **visibility problem**. Money doesn't disappear in big dramatic amounts — it leaks out ₹40, ₹150, ₹300 at a time, in taps of a UPI PIN you won't remember by Friday." },
        { t: 'callout', emoji: '☕', title: 'The ₹200-a-day leak', text: 'One chai + one auto + one "small" Swiggy order ≈ ₹200 a day. That is ₹6,000 a month — ₹73,000 a year. Enough for a decent emergency fund, leaking silently.' },
        { t: 'p', text: "This is why every money journey starts with **tracking, not cutting**. You don't have to spend less yet. You just have to *see* it. People who track their spending for one month typically find 2–3 leaks they genuinely don't care about — cutting those doesn't even hurt." },
        { t: 'list', items: [
          'Log the expense the moment it happens — it takes 5 seconds',
          "Small amounts count the most. The ₹20 chai IS the point",
          "Don't judge yourself yet. This month is for evidence, not verdicts",
        ] },
        { t: 'p', text: 'From today, PaisaCoach is your money mirror. The app auto-categorises the usual suspects (Swiggy, IRCTC, Amazon…) so a log takes one tap.' },
      ],
      action: { type: 'log_expense', label: 'Log one expense right now — even today\'s chai' },
      quiz: [
        { q: 'Why does tracking come before cutting?', options: ['Because cutting is impossible', 'Because you can only fix leaks you can see', 'Because apps need data'], answer: 1, explain: 'Cutting blind means cutting things you love while the real leaks stay open. Seeing comes first.' },
        { q: 'A ₹200/day habit costs roughly how much per year?', options: ['₹7,300', '₹73,000', '₹24,000'], answer: 1, explain: '₹200 × 365 = ₹73,000. Small daily amounts compound into big yearly ones.' },
        { q: 'What should you do when you spend ₹20 on chai?', options: ['Ignore it, too small', 'Log it — small amounts are the point', 'Round it up to ₹100'], answer: 1, explain: 'The invisible leak is made of small amounts. They matter most because they feel like nothing.' },
      ],
    },
    {
      id: 'l1-02',
      title: 'Needs, wants and the 24-hour rule',
      minutes: 3,
      blocks: [
        { t: 'p', text: "Every rupee you spend answers one of two questions: **do I need this to live and work**, or **do I want this to feel good**? Rent, groceries, commute, medicines — needs. Zomato at midnight, the third pair of sneakers, the OTT subscription you forgot about — wants." },
        { t: 'p', text: "Wants are not evil. A life of only needs is a sad spreadsheet. The problem is **unconscious wants** — spending that doesn't even make you happy because you never chose it. That's what tracking exposes." },
        { t: 'callout', emoji: '⏳', title: 'The 24-hour rule', text: "For any non-essential purchase over ₹1,000: put it in the cart, close the app, wait 24 hours. If you still want it tomorrow, buy it guilt-free. Most of the time, the itch is gone by morning — that was the app's design working on you, not a real want." },
        { t: 'p', text: 'When you log an expense here, the category does this thinking for you. Food, Transport, Rent lean "need"; Shopping and Entertainment lean "want". Your month-end split will show you the truth.' },
      ],
      action: { type: 'log_days', count: 3, label: 'Log at least one expense a day for 3 days' },
      quiz: [
        { q: 'What makes a "want" a problem?', options: ['Any want is a problem', 'When it\'s unconscious — you never really chose it', 'When it costs over ₹500'], answer: 1, explain: 'Chosen wants are the fun part of money. Unconscious wants are the leak.' },
        { q: 'The 24-hour rule applies to…', options: ['Every purchase including groceries', 'Non-essential purchases, especially over ₹1,000', 'Only electronics'], answer: 1, explain: "Needs don't require a cooling-off period. Impulse wants do." },
        { q: 'Midnight Zomato is usually a…', options: ['Need', 'Want', 'Investment'], answer: 1, explain: 'Delicious, yes. Need, no. Logging it honestly is what matters.' },
      ],
    },
    {
      id: 'l1-03',
      title: 'Know your number: income in hand',
      minutes: 2,
      blocks: [
        { t: 'p', text: "There's one number every plan is built on: what actually lands in your bank account each month. Not your CTC, not your package — the **in-hand amount** after PF, tax and deductions." },
        { t: 'callout', emoji: '🧮', title: 'CTC ≠ salary', text: 'A "₹6 LPA package" is often ₹40–43k in hand after PF, gratuity, professional tax and TDS. Planning with the CTC number is how people end up confused about where "all that money" went.' },
        { t: 'p', text: "Once PaisaCoach knows your in-hand income, everything lights up: how much is safe to spend, your savings rate, the right size for your emergency fund, and later — how much you can invest without feeling it." },
        { t: 'p', text: "If your income is irregular (freelance, business), use your **average of the last 3 months**, rounded down. Planning on your worst month, not your best, is what makes irregular income survivable." },
      ],
      action: { type: 'set_income', label: 'Make sure your monthly income is set (you did this in onboarding — update it in Settings if it changed)' },
      quiz: [
        { q: 'Which number should you plan your month on?', options: ['CTC ÷ 12', 'In-hand income after deductions', 'Gross salary'], answer: 1, explain: 'You can only spend what lands in the account. Everything else is accounting.' },
        { q: 'Freelancer with ₹30k, ₹80k, ₹40k months — plan on…', options: ['₹80k, be optimistic', '₹50k, the average', '₹45–50k, average rounded down'], answer: 2, explain: 'Average rounded down gives a cushion. Good surprises are better than bad ones.' },
        { q: 'Why does the app need your income?', options: ['To show ads', 'To size your budgets, safety net and investments', 'It doesn\'t'], answer: 1, explain: 'Every target on this journey — savings rate, emergency fund, first SIP — is a percentage of this number.' },
      ],
    },
  ],
};
