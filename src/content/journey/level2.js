/* Level 2 — Where Does It Go? */

export default {
  id: 'l2',
  order: 2,
  emoji: '🧭',
  title: 'Where Does It Go?',
  tagline: 'Read your own money story, then give it rules',
  completeCriteria: 'l2_complete',
  completeHint: 'Set budgets on your top 3 categories and reach 14 days of logging',
  lessons: [
    {
      id: 'l2-01',
      title: 'Your top 3 tell the whole story',
      minutes: 3,
      blocks: [
        { t: 'p', text: "Open your Home screen and look at **Where it went this month**. For almost everyone, the top 3 categories are 70–80% of all spending. That's the Pareto rule working on your wallet — and it's great news." },
        { t: 'p', text: "It means you don't need to micro-manage twenty categories. Winning your top 3 wins the month. If Rent is #1 (it usually is), your real battleground is #2 and #3 — typically **Food** and **Shopping** in India's UPI economy." },
        { t: 'callout', emoji: '🔍', title: 'Read it like a coach', text: 'Don\'t ask "did I spend too much?" Ask: "was that #2 category chosen, or did it just happen?" ₹4,000 of chosen dinners with friends is a life. ₹4,000 of bored midnight scrolling orders is a leak.' },
        { t: 'p', text: 'This week, just notice your top 3. Next lesson gives them rules.' },
      ],
      quiz: [
        { q: 'Roughly what share of spending sits in most people\'s top 3 categories?', options: ['20–30%', '50%', '70–80%'], answer: 2, explain: 'Money concentrates. Manage the big three and the rest mostly behaves.' },
        { q: 'Your #1 category is Rent. Where\'s the real battleground?', options: ['Rent — move out', 'Categories #2 and #3', 'The smallest categories'], answer: 1, explain: 'Rent is fixed. The flexible top categories are where choices actually change the number.' },
        { q: '₹4,000 on dinners with friends vs ₹4,000 on bored impulse orders —', options: ['Both equally bad', 'The first is a chosen life, the second is a leak', 'Both fine, food is a need'], answer: 1, explain: 'Budgeting protects what you value by cutting what you don\'t. Intent is the difference.' },
      ],
    },
    {
      id: 'l2-02',
      title: 'The 50/30/20 rule, Indian edition',
      minutes: 4,
      blocks: [
        { t: 'p', text: 'The most useful starting rule in personal finance: split your in-hand income **50% needs, 30% wants, 20% savings**. Not because the numbers are magic — because they force one decision: *savings gets a fixed share, every month, before the month begins*.' },
        { t: 'calc', kind: 'split' },
        { t: 'p', text: "In metro India, rent alone can eat 30–40%, so your split might start at 60/25/15. Fine. The rule bends — **the savings slice just can't be zero**. Start where you are; the journey raises it later." },
        { t: 'callout', emoji: '🎯', title: 'Turn the rule into budgets', text: 'Go to Money → Budgets and set monthly limits on your top 3 categories. A budget is not a punishment — it\'s pre-deciding what a good month looks like, so you\'re not negotiating with yourself at the checkout screen.' },
      ],
      action: { type: 'set_budgets', count: 3, label: 'Set budgets on your top 3 spending categories' },
      quiz: [
        { q: 'In 50/30/20, the 20 is for…', options: ['Wants', 'Savings — set aside before the month starts', 'Rent'], answer: 1, explain: 'The whole trick is savings being a fixed pre-decided share, not "whatever is left".' },
        { q: 'Your rent pushes needs to 60%. What now?', options: ['Give up on the rule', 'Bend it — 60/25/15 — but never let savings hit zero', 'Cut food to 10%'], answer: 1, explain: 'The rule is a starting posture, not a law. The non-negotiable part is a non-zero savings slice.' },
        { q: 'What is a budget really?', options: ['A punishment', 'Pre-deciding what a good month looks like', 'A guess'], answer: 1, explain: 'Decide once at month-start, then the daily choices get easy.' },
      ],
    },
    {
      id: 'l2-03',
      title: 'Fixed vs flexible: know your commitments',
      minutes: 3,
      blocks: [
        { t: 'p', text: "Some money is spent before the month even starts: rent, EMIs, phone bill, Netflix, the gym you swear you'll use. These are your **commitments** — and most people underestimate them by thousands." },
        { t: 'p', text: 'Commitments matter because **income − commitments = what you actually control**. If ₹60k income carries ₹38k of commitments, you\'re not managing ₹60k — you\'re managing ₹22k. Knowing that number changes how the month feels.' },
        { t: 'callout', emoji: '📉', title: 'The subscription audit', text: 'Check your last 2 months of card/UPI statements for recurring charges. The average urban Indian carries 2–3 forgotten subscriptions. Cancelling one ₹499/month service you don\'t use = ₹6,000/year — found money.' },
        { t: 'p', text: 'Add your bills, EMIs and subscriptions under Money → Commitments. The app will auto-log the recurring ones so your tracking stays honest without effort.' },
      ],
      action: { type: 'add_commitment', label: 'Add your bills, EMIs and subscriptions in Money → Commitments' },
      quiz: [
        { q: 'Income ₹60k, commitments ₹38k. How much do you actually control?', options: ['₹60k', '₹38k', '₹22k'], answer: 2, explain: 'Committed money is already spent. Your real month is the flexible remainder.' },
        { q: 'Why list commitments in the app?', options: ['To feel bad', 'So they auto-log and your real controllable number is visible', 'Banks require it'], answer: 1, explain: 'Automation keeps tracking honest, and the "left to spend" number becomes real.' },
        { q: 'A forgotten ₹499/month subscription costs per year…', options: ['₹499', 'about ₹6,000', 'about ₹2,000'], answer: 1, explain: '₹499 × 12 ≈ ₹6,000. Forgotten money is the easiest money to save.' },
      ],
    },
  ],
};
