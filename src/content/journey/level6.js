/* Level 6 — Build the Basket */

export default {
  id: 'l6',
  order: 6,
  emoji: '🧺',
  title: 'Build the Basket',
  tagline: 'One SIP is a seed. Now plant a garden',
  unlockCriteria: 'l6_unlock',
  unlockHint: 'Complete Level 5 — your first SIP should be running',
  completeCriteria: 'l6_complete',
  completeHint: 'Hold at least two different investment types in your portfolio',
  lessons: [
    {
      id: 'l6-01',
      title: 'The Indian menu: PPF, NPS, FD, gold',
      minutes: 5,
      blocks: [
        { t: 'p', text: "Equity index funds are your growth engine — but India offers a whole menu of instruments with different jobs. A quick tour, no sales pitch:" },
        { t: 'list', items: [
          '**PPF** — government-backed, ~7% tax-free, 15-year lock-in. The slow, unbreakable vault. Great for the safety layer; terrible for money you might need',
          '**EPF** — if you\'re salaried you already have it; your employer matches your 12%. It\'s forced debt investing — count it in your plan',
          '**NPS** — retirement account, equity + debt mix, extra tax deduction, locked till 60. Cheap fees; the lock-in is the feature AND the bug',
          '**FDs** — predictable, insured up to ₹5 lakh, interest taxed at your slab. Fine for short-term goals and emergency-fund parking; won\'t beat inflation by much',
          '**Gold** — culturally loved; financially use **SGBs or gold ETFs**, not lockers of jewellery (making charges eat 10–25%). A small slice (5–10%) hedges equity',
        ] },
        { t: 'callout', emoji: '🗺️', title: 'Jobs, not products', text: 'Ask "what job does this money have?" — growth (equity funds), stability (PPF/FD/debt), retirement (EPF/NPS), hedge (gold). A product without a job is clutter, whatever the ad says.' },
        { t: 'disclaimer' },
      ],
      quiz: [
        { q: 'PPF\'s 15-year lock-in makes it best for…', options: ['Emergency money', 'The long-term safety layer', 'Trading'], answer: 1, explain: 'Unbreakable and tax-free = great vault, terrible wallet.' },
        { q: 'The financially sane way to hold gold is…', options: ['Jewellery', 'SGBs or gold ETFs', 'Coins in a locker'], answer: 1, explain: 'Jewellery loses 10–25% to making charges the day you buy it.' },
        { q: 'FD interest is…', options: ['Tax-free', 'Taxed at your income slab', 'Taxed at 5% flat'], answer: 1, explain: 'Post-tax, FDs often barely match inflation — fine for parking, not for growth.' },
      ],
    },
    {
      id: 'l6-02',
      title: 'ELSS & Section 80C: the tax-saving investment',
      minutes: 3,
      blocks: [
        { t: 'p', text: "Under the **old tax regime**, Section 80C lets you deduct up to **₹1.5 lakh a year** from taxable income. The menu includes PPF, EPF, life-insurance premiums, 5-year FDs — and one equity option: **ELSS funds**." },
        { t: 'p', text: '**ELSS** = a normal equity mutual fund with a 3-year lock-in and a tax deduction attached. Among 80C options it has the shortest lock-in and the highest growth potential — the classic pick for young investors still on the old regime.' },
        { t: 'callout', emoji: '⚠️', title: 'Check your regime first', text: 'The NEW tax regime (default since FY 2023-24) has lower rates but no 80C deduction — for many salaried people, chasing 80C no longer makes sense. One evening with a regime-comparison calculator settles it. Never buy an investment for a deduction you don\'t actually get.' },
        { t: 'p', text: "And the golden rule survives taxes too: a bad investment doesn't become good because it saves tax. ELSS earns its place because it's a decent equity fund *first*, tax-saver second." },
        { t: 'disclaimer' },
      ],
      quiz: [
        { q: '80C lets you deduct up to…', options: ['₹1.5 lakh (old regime)', '₹5 lakh, any regime', 'Unlimited'], answer: 0, explain: '₹1.5L, and only on the old regime — check which regime you\'re actually on.' },
        { q: 'ELSS is…', options: ['A fixed deposit', 'An equity fund with 3-year lock-in + 80C deduction', 'A pension plan'], answer: 1, explain: 'Shortest lock-in in the 80C menu, with equity growth potential.' },
        { q: 'You\'re on the new tax regime. 80C investments…', options: ['Still save tax', 'Give no deduction — invest on merit only', 'Are mandatory'], answer: 1, explain: 'No deduction on the new regime. Buy investments for their job, not a phantom tax break.' },
      ],
    },
    {
      id: 'l6-03',
      title: 'Asset allocation: the only free lunch',
      minutes: 4,
      blocks: [
        { t: 'p', text: "Which fund you pick matters far less than **how you split money between equity, debt and gold**. That split — asset allocation — decides most of your outcome and all of your sleep quality." },
        { t: 'callout', emoji: '💯', title: 'A starting rule of thumb', text: '**Equity % ≈ 100 − your age** (a 25-year-old → ~75% equity, 25% debt/gold). Adjust for nerves: if a 20% dip would make you sell, hold less equity than the formula says. The best allocation is the one you can hold through a crash.' },
        { t: 'p', text: "Diversification isn't owning 12 equity funds — those all fall together. It's owning things that **fall at different times**: equity + PPF/debt + a sliver of gold. When one is red, another is green, and your average stays sane." },
        { t: 'p', text: '**Rebalancing** = once a year, sell a little of what grew and top up what shrank, back to your target split. It forces sell-high-buy-low mechanically, with zero prediction. Set a yearly reminder — birthday or new year — and it\'s done in an hour.' },
        { t: 'p', text: 'Your portfolio completes this level when it holds **two or more different types** — say your index SIP plus a PPF, FD ladder or gold ETF. Log each under Invest.' },
        { t: 'disclaimer' },
      ],
      action: { type: 'diversify', label: 'Hold and log at least 2 different investment types' },
      quiz: [
        { q: 'What decides most of your long-term outcome?', options: ['Picking star funds', 'The equity/debt/gold split', 'Timing entries'], answer: 1, explain: 'Allocation dwarfs selection. Get the split right and the details forgive you.' },
        { q: 'Owning 12 equity funds is…', options: ['Well diversified', 'Not diversified — they fall together', 'Illegal'], answer: 1, explain: 'Diversification means assets that move differently, not more of the same asset.' },
        { q: 'Rebalancing once a year means…', options: ['Selling everything', 'Trimming winners, topping up laggards, back to target', 'Chasing last year\'s best fund'], answer: 1, explain: 'It\'s mechanical sell-high-buy-low. No forecasts required.' },
      ],
    },
  ],
};
