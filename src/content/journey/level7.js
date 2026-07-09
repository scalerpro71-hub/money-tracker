/* Level 7 — Stay the Course (ongoing; never "completes") */

export default {
  id: 'l7',
  order: 7,
  emoji: '🧗',
  title: 'Stay the Course',
  tagline: 'The last skill is refusing to flinch',
  unlockCriteria: 'l7_unlock',
  unlockHint: 'Complete Level 6',
  completeCriteria: null,
  completeHint: 'Ongoing — this level is a practice, not a checkbox',
  ongoing: true,
  lessons: [
    {
      id: 'l7-01',
      title: 'When markets fall (they will)',
      minutes: 4,
      blocks: [
        { t: 'p', text: "Somewhere ahead, your portfolio will be 20–30% red and the news will use the word 'bloodbath'. This lesson exists so that future-you has already decided what to do: **nothing, except continue the SIP.**" },
        { t: 'callout', emoji: '📉', title: 'Crashes are features, not bugs', text: '2008: Sensex fell ~60% — then quadrupled over the next decade. March 2020: down ~38% in weeks — recovered within the year, then made new highs. Every crash in Indian market history has one thing in common: it ended. The investors who got hurt were the ones who sold inside it.' },
        { t: 'p', text: "Volatility is the *fee* equity charges for its long-term returns. FDs don't pay that fee — and don't earn those returns. You already built the shock absorber (emergency fund, Level 3) precisely so you'd never be forced to sell in a dip." },
        { t: 'p', text: "Practical armour: check your portfolio **monthly, not daily**. Delete the widget. A daily glance at a 20-year investment is like digging up a sapling every morning to check the roots." },
        { t: 'disclaimer' },
      ],
      quiz: [
        { q: 'Your portfolio is 25% down. The pre-decided move is…', options: ['Sell before it gets worse', 'Continue the SIP; do nothing dramatic', 'Take a loan and double down'], answer: 1, explain: 'The plan was made in calm weather exactly for this storm. Units are on sale.' },
        { q: 'Historically, every Indian market crash has…', options: ['Been permanent', 'Ended, with new highs after', 'Been predicted in advance'], answer: 1, explain: 'The damage happens to those who sell inside the crash, not those who sit through it.' },
        { q: 'Healthy portfolio-checking frequency for a long-term investor?', options: ['Every hour', 'Monthly-ish', 'Never, ever'], answer: 1, explain: 'Often enough to stay informed, rare enough to stay sane.' },
      ],
    },
    {
      id: 'l7-02',
      title: 'Step-up SIPs beat lifestyle creep',
      minutes: 3,
      blocks: [
        { t: 'p', text: "Every raise you'll ever get faces the same fork: lifestyle absorbs it silently, or your future takes a cut first. **Lifestyle creep** is why people earning 3× their old salary somehow still save the same ₹2,000." },
        { t: 'callout', emoji: '📈', title: 'The 50% raise rule', text: 'When income rises, raise your SIP by half the raise. A ₹10,000 bump → SIP up ₹5,000, lifestyle up ₹5,000. You feel richer AND compound faster — nobody loses. Most platforms automate this as an annual "step-up SIP" (10% a year is a common default).' },
        { t: 'p', text: "The arithmetic is violent: ₹5,000/month for 25 years at long-term equity rates builds roughly ₹85–95 lakh. The same SIP stepped up 10% yearly crosses **₹2 crore**. Same person, same fund — just raises that didn't all evaporate into lifestyle." },
        { t: 'disclaimer' },
      ],
      quiz: [
        { q: 'Lifestyle creep is…', options: ['Inflation', 'Raises silently absorbed by lifestyle, savings stuck', 'A yoga pose'], answer: 1, explain: 'Income triples, savings don\'t move. The fix is pre-deciding where raises go.' },
        { q: 'The 50% raise rule says…', options: ['Save the whole raise', 'Split it — half to SIP, half to life', 'Spend it, YOLO'], answer: 1, explain: 'Sustainable beats heroic. You feel the raise and compound it.' },
        { q: 'A 10% yearly step-up on a 25-year SIP roughly…', options: ['Changes little', 'Can more than double the final corpus', 'Doubles the risk'], answer: 1, explain: 'Step-ups put your raises inside the compounding machine for decades.' },
      ],
    },
    {
      id: 'l7-03',
      title: 'The annual money hour',
      minutes: 3,
      blocks: [
        { t: 'p', text: "Once the machine runs, it needs one honest hour a year. Pick a date you can't forget — birthday, New Year, Diwali — and run this checklist:" },
        { t: 'list', items: [
          'Emergency fund still ≈ 3–6 months of *current* expenses? (Lifestyle grew? The fund grows too)',
          'Rebalance to your target equity/debt/gold split',
          'Step up the SIP if income rose this year',
          'Insurance covers still match your life? (marriage, kids, loans change the math)',
          'Kill zombie subscriptions and review the top 3 spending categories',
          'Nominees named on every account, folio and policy — the unglamorous act of love',
        ] },
        { t: 'callout', emoji: '♾️', title: 'This level never ends — by design', text: 'There is no final boss in personal finance. There\'s just the yearly hour, the monthly SIP, and the weekly glance at your coach. Boring, repeated, unstoppable — that\'s what wealth actually looks like from the inside.' },
        { t: 'p', text: "You started this journey unable to see where the money went. Now you track, budget, hold a cushion, invest on autopilot and know how to sit through a storm. **You're no longer a beginner. Stay the course.**" },
      ],
      quiz: [
        { q: 'The annual money hour includes…', options: ['Predicting next year\'s market', 'Rebalance, step-up, EF top-up, insurance & nominee check', 'Changing brokers yearly'], answer: 1, explain: 'One hour of maintenance keeps a decades-long machine honest.' },
        { q: 'Your expenses grew 20% this year. Your emergency fund should…', options: ['Stay the same', 'Grow to match 3–6 months of the NEW expenses', 'Be invested in equity'], answer: 1, explain: 'The cushion is sized in months-of-life, and your life got more expensive.' },
        { q: 'What does wealth-building actually look like?', options: ['One brilliant trade', 'Boring, repeated habits sustained for decades', 'Constant portfolio activity'], answer: 1, explain: 'The most powerful force here is consistency. You now have the whole toolkit.' },
      ],
    },
  ],
};
