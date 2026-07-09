/* Level 4 — Debt & EMI Hygiene */

export default {
  id: 'l4',
  order: 4,
  emoji: '💳',
  title: 'Debt & EMI Hygiene',
  tagline: 'Debt is a tool — until it starts using you',
  completeCriteria: 'l4_complete',
  completeHint: 'Finish the three lessons (and log any EMIs under Commitments)',
  lessons: [
    {
      id: 'l4-01',
      title: 'Good debt, bad debt, and the 30% line',
      minutes: 3,
      blocks: [
        { t: 'p', text: "Not all debt is the enemy. **Good debt buys assets or earning power** — a reasonable home loan, an education loan that raises your income. **Bad debt buys lifestyle** — a phone on a 24-month EMI, a vacation on a credit card, 'no-cost' EMIs that quietly aren't." },
        { t: 'callout', emoji: '📏', title: 'The 30% rule', text: 'Keep all EMIs combined under 30% of in-hand income (40% is the red line banks themselves use). Above that, one bad month makes the whole tower wobble — and your ability to save or invest disappears.' },
        { t: 'p', text: "Check yourself: your Commitments tab shows total EMIs. Divide by income. Under 30%? You're fine — carry on. Over? The journey's next lessons are about getting back under the line before investing hard." },
        { t: 'p', text: '**No-cost EMI reality check:** the cost is usually hidden in a lost discount, a processing fee, or GST on interest. Nothing at a checkout counter is free.' },
      ],
      quiz: [
        { q: 'Which is closest to "good debt"?', options: ['Phone on 24-month EMI', 'Education loan that raises your income', 'Vacation on credit card'], answer: 1, explain: 'Good debt buys assets or earning power. Lifestyle on EMI is pre-spending your future raises.' },
        { q: 'Total EMIs should stay under…', options: ['30% of in-hand income', '50%', '70%'], answer: 0, explain: '30% keeps you resilient; 40%+ is where banks themselves get nervous about you.' },
        { q: '"No-cost EMI" usually means…', options: ['Genuinely free', 'Cost hidden in lost discount, fees, or GST', 'Illegal'], answer: 1, explain: 'The interest is in there somewhere. Read the bill.' },
      ],
    },
    {
      id: 'l4-02',
      title: 'The credit card trap (and how to use one well)',
      minutes: 3,
      blocks: [
        { t: 'p', text: "A credit card is a free 45-day loan and a cashback machine **if and only if** you pay the full bill every month. Miss that, and it becomes one of the most expensive loans legally available in India: **36–48% a year**." },
        { t: 'callout', emoji: '🕳️', title: 'The minimum-due illusion', text: 'That friendly "minimum amount due: ₹1,200"? Paying only that on a ₹40,000 bill can stretch the debt for years and nearly double what you repay. Minimum due is designed to keep you in debt, not get you out.' },
        { t: 'list', items: [
          'Autopay the FULL bill amount, never the minimum',
          'One card, used for planned spends, is plenty while you\'re learning',
          'If you already carry card debt: attack it before any investing — no investment reliably beats 40% interest',
        ] },
        { t: 'p', text: "Clearing a 40% APR card debt is, mathematically, **earning a 40% risk-free return**. No stock, fund or FD offers that. That's why debt-first beats invest-first when the debt is expensive." },
      ],
      quiz: [
        { q: 'A credit card is "free" only when…', options: ['You pay the minimum due', 'You pay the full bill every cycle', 'You have many cards'], answer: 1, explain: 'Full payment = free credit + rewards. Anything less = 36–48% APR.' },
        { q: 'Paying only minimum due on ₹40,000…', options: ['Clears it in months', 'Can stretch years and nearly double the repayment', 'Improves credit fastest'], answer: 1, explain: 'Minimum due mostly covers interest. The principal barely moves.' },
        { q: 'You have card debt at 40% APR and ₹10,000 spare. Best move?', options: ['Start a SIP', 'Clear the card debt first', 'FD at 7%'], answer: 1, explain: 'Killing 40% interest is a guaranteed 40% return. Nothing else comes close.' },
      ],
    },
    {
      id: 'l4-03',
      title: 'Protect before you grow: insurance basics',
      minutes: 3,
      blocks: [
        { t: 'p', text: "One hospital bill can erase five years of disciplined saving. Before wealth gets built, it needs a moat — that's insurance. In India you need exactly two kinds, and neither is sold with free gifts." },
        { t: 'list', items: [
          '**Health insurance** — your own policy (₹5–10 lakh cover), even if your employer gives one. Jobs change; illnesses don\'t wait for notice periods',
          '**Term life insurance** — ONLY if someone depends on your income. Cover ≈ 10–15× annual income. Pure term plans are cheap; that\'s the point',
        ] },
        { t: 'callout', emoji: '🚫', title: 'The mixing trap', text: 'Policies that "invest AND insure" (endowment, money-back, most ULIPs) usually do both badly — thin cover, weak returns, heavy exit penalties. The classic rule: insurance is for protection, investing is for growth. Never mix.' },
        { t: 'p', text: "This lesson is education, not a product pitch — PaisaCoach sells nothing and names no companies. When you buy, compare on a neutral aggregator, and read the claim-settlement ratio, not the ad." },
        { t: 'disclaimer' },
      ],
      quiz: [
        { q: 'Employer gives health cover. Do you need your own?', options: ['No, sorted', 'Yes — jobs change, illnesses don\'t wait', 'Only after 40'], answer: 1, explain: 'Employer cover vanishes with the job. Your own policy is continuity.' },
        { q: 'Who needs term life insurance?', options: ['Everyone', 'Anyone whose income someone depends on', 'Only business owners'], answer: 1, explain: 'No dependents = no income to replace = term insurance can wait.' },
        { q: 'Endowment / "insurance + investment" plans usually…', options: ['Do both jobs well', 'Do both jobs badly', 'Are mandatory'], answer: 1, explain: 'Split the jobs: cheap term cover for protection, real investments for growth.' },
      ],
    },
  ],
};
