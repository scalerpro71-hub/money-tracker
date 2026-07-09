/* Level 5 — Your First SIP */

export default {
  id: 'l5',
  order: 5,
  emoji: '🌱',
  title: 'Your First SIP',
  tagline: 'From saver to investor — the smallest brave step',
  unlockCriteria: 'l5_unlock',
  unlockHint: 'Complete Level 4 and fund your emergency fund to at least 1 month of expenses',
  completeCriteria: 'l5_complete',
  completeHint: 'Start a real investment (a SIP is the classic first step, but any counts), then log it under Invest',
  lessons: [
    {
      id: 'l5-01',
      title: 'What is a mutual fund, really?',
      minutes: 4,
      blocks: [
        { t: 'p', text: "A mutual fund is embarrassingly simple: **thousands of people pool money, and the pool buys a basket of stocks or bonds**. You own units of the basket. That's it. The mystique is marketing." },
        { t: 'p', text: 'Three words unlock every fund page you\'ll ever read: **NAV** — the price of one unit (basket value ÷ units). **Expense ratio** — the yearly fee, silently deducted (0.1–0.5% for index funds, 1–2% for active ones). **AUM** — how big the pool is.' },
        { t: 'callout', emoji: '🧺', title: 'Index funds: the beginner\'s superpower', text: 'An index fund doesn\'t try to be clever. It just buys ALL the big companies — a Nifty 50 fund holds India\'s 50 largest, automatically. No star manager, tiny fees, nothing to out-guess. Decades of data show most expensive "actively managed" funds fail to beat this boring basket over the long run.' },
        { t: 'p', text: "For a beginner, the choice is refreshingly small: a broad index fund (Nifty 50 or similar), **direct plan** (no distributor commission — same fund, cheaper), **growth option** (returns stay invested and compound)." },
        { t: 'disclaimer' },
      ],
      quiz: [
        { q: 'A mutual fund is…', options: ['A company\'s stock', 'A pooled basket of stocks/bonds you own units of', 'A fixed deposit'], answer: 1, explain: 'Pool + basket + units. Everything else is detail.' },
        { q: 'The expense ratio is…', options: ['Your profit', 'The yearly fee, silently deducted from returns', 'A government tax'], answer: 1, explain: 'It compounds against you — which is why low-fee index funds win over decades.' },
        { q: 'Why do index funds suit beginners?', options: ['Highest possible returns', 'Whole-market basket, tiny fees, nothing to out-guess', 'Guaranteed by RBI'], answer: 1, explain: 'You get the market\'s long-term growth without betting on a manager\'s genius.' },
      ],
    },
    {
      id: 'l5-02',
      title: 'SIP: autopilot for investing',
      minutes: 4,
      blocks: [
        { t: 'p', text: 'A **SIP (Systematic Investment Plan)** invests a fixed amount into a fund every month, automatically. It\'s the pay-yourself-first ritual from Level 3, pointed at the market. ₹500 is enough to start — this is about wiring the habit, not the amount.' },
        { t: 'callout', emoji: '⚖️', title: 'Why monthly beats "waiting for the dip"', text: 'When the market falls, your ₹2,000 buys MORE units; when it rises, fewer. This rupee-cost averaging means volatility quietly works for you — and you never have to answer the unanswerable "is now a good time?" The answer is always: it\'s SIP day.' },
        { t: 'calc', kind: 'sip' },
        { t: 'p', text: "The chart above uses an assumed long-term equity return — real years will swing wildly above and below it. The lesson of the curve isn't the exact number; it's the shape: **the later years do the heavy lifting, which is why starting now beats starting big.**" },
        { t: 'disclaimer' },
      ],
      quiz: [
        { q: 'A SIP is…', options: ['A stock tip service', 'A fixed monthly auto-investment into a fund', 'A type of FD'], answer: 1, explain: 'Automation + monthly rhythm. The market timing question disappears.' },
        { q: 'Markets fall 10% mid-SIP. Your monthly ₹2,000…', options: ['Buys more units — averaging works for you', 'Should be stopped immediately', 'Buys fewer units'], answer: 0, explain: 'Falling prices = cheaper units = more of them. Stopping the SIP in a dip breaks the whole mechanism.' },
        { q: 'The compounding curve teaches…', options: ['Returns are guaranteed', 'Later years do the heavy lifting — start early, start small', 'SIPs double money in 3 years'], answer: 1, explain: 'Time in the market is the ingredient you can\'t buy back later.' },
      ],
    },
    {
      id: 'l5-03',
      title: 'Do it for real: account, order, log',
      minutes: 4,
      blocks: [
        { t: 'p', text: "Time to cross the line from reading to owning. You'll do this in any SEBI-registered broker or fund platform app — PaisaCoach doesn't execute trades and doesn't care which platform you pick. The steps are the same everywhere:" },
        { t: 'list', items: [
          '**KYC** — PAN + Aadhaar + a selfie video, once, ~10 minutes, free',
          '**Find a broad index fund** — search "Nifty 50 index fund", pick a **Direct** plan, **Growth** option, low expense ratio',
          '**Start the SIP** — amount you won\'t miss (₹500–₹2,000), date 2–3 days after payday, enable auto-debit',
          '**Log it here** — add it under Invest so your coach sees the full picture',
        ] },
        { t: 'callout', emoji: '🧘', title: 'Pre-commit to the rules', text: 'Before the first debit, say these out loud: (1) This money has a 5+ year horizon. (2) A red month means units on sale, not an emergency. (3) The SIP stops for job loss — never for headlines.' },
        { t: 'p', text: "When the first installment goes through, log the investment in the Invest tab. That log is what completes this level — the journey celebrates real actions, not finished readings. And if your first real step turns out to be an FD, PPF or gold instead of a SIP, that counts too: log it, then ask your coach how to do that instrument well." },
        { t: 'disclaimer' },
      ],
      action: { type: 'log_investment', label: 'Log your first investment under Invest' },
      quiz: [
        { q: 'Direct plan vs Regular plan of the same fund —', options: ['Direct skips distributor commission, so returns are higher', 'Regular is safer', 'No difference'], answer: 0, explain: 'Same fund, same manager; Direct just removes the middleman\'s cut.' },
        { q: 'Best SIP date?', options: ['Month-end, from what\'s left', 'A few days after payday', 'The 15th, always'], answer: 1, explain: 'Payday +2: invest before the month can spend it — pay yourself first, market edition.' },
        { q: 'Markets drop 15% in month two. You…', options: ['Stop the SIP', 'Keep going — you\'re buying units on sale', 'Sell everything'], answer: 1, explain: 'This is the exact scenario SIPs are built for. The rule was pre-committed for this moment.' },
      ],
    },
  ],
};
