/* Level 3 — Pay Yourself First */

export default {
  id: 'l3',
  order: 3,
  emoji: '🛡️',
  title: 'Pay Yourself First',
  tagline: 'Savings is a bill you owe your future self',
  completeCriteria: 'l3_complete',
  completeHint: 'Hold a 10%+ savings rate for a month and fund your emergency fund to 1 month of expenses',
  lessons: [
    {
      id: 'l3-01',
      title: 'Savings rate: the only % that matters',
      minutes: 3,
      blocks: [
        { t: 'p', text: 'Forget "how much did I save?" The question is **what percent of income did I keep?** That\'s your savings rate — and it beats salary as a predictor of wealth. A ₹40k earner keeping 20% builds wealth faster than a ₹1L earner keeping 2%.' },
        { t: 'p', text: '**Savings rate = (income − spending) ÷ income.** Yours is computed live on your Home screen ("Kept"). The journey targets are: survive at 10%, get healthy at 20%, get wealthy at 30%+.' },
        { t: 'callout', emoji: '🔁', title: 'Why "pay yourself FIRST"', text: 'Saving what\'s left over fails because nothing is ever left over — spending expands to fill the account (Parkinson\'s law, wallet edition). The fix: move savings out on payday, day one, before life happens. Then spend the rest guilt-free.' },
        { t: 'p', text: "If you're at 0% right now, don't jump to 20% — that's a crash diet and it fails the same way. Go 5% → 10% → 15% over three months. The habit matters more than the number." },
      ],
      quiz: [
        { q: 'Savings rate is…', options: ['Whatever is left at month-end', '(Income − spending) ÷ income', 'Your FD interest rate'], answer: 1, explain: 'It\'s the share of income you keep — the single best habit-metric in personal finance.' },
        { q: 'Why does "save what\'s left" fail?', options: ['Maths is hard', 'Spending expands to fill the account — nothing is ever left', 'Banks charge fees'], answer: 1, explain: 'Parkinson\'s law. Reverse the order: save first, then spend what remains.' },
        { q: 'Who builds wealth faster?', options: ['₹1L earner keeping 2%', '₹40k earner keeping 20%', 'Same speed'], answer: 1, explain: '₹8,000/month kept beats ₹2,000/month kept — rate beats salary.' },
      ],
    },
    {
      id: 'l3-02',
      title: 'The emergency fund: your permission slip to invest',
      minutes: 4,
      blocks: [
        { t: 'p', text: "Before a single rupee goes into the market, you need a cushion: the **emergency fund**. Job change, medical bill, urgent travel, phone screen shattering — life sends invoices without warning." },
        { t: 'p', text: "Without a cushion, every emergency becomes debt (credit card at 40% APR) or forces you to sell investments at the worst time. With one, emergencies are just… expenses. **This fund is what makes investing safe** — it's why it comes first on the journey." },
        { t: 'calc', kind: 'ef' },
        { t: 'callout', emoji: '🏦', title: 'Where to keep it', text: 'Rule: boring and reachable. A separate savings account, a sweep-in FD, or a liquid fund. NOT stocks, NOT crypto, NOT locked FDs with penalties. You\'re optimising for "available on a bad Tuesday", not returns.' },
        { t: 'p', text: 'Create your Emergency Fund goal now — the journey tracks it from here. First milestone: **1 month of expenses**. Full strength: 3–6 months.' },
      ],
      action: { type: 'create_ef_goal', label: 'Create your Emergency Fund goal' },
      quiz: [
        { q: 'What does an emergency fund actually buy you?', options: ['Returns', 'Emergencies become expenses instead of debt or panic-selling', 'Tax savings'], answer: 1, explain: 'It converts crises into inconveniences — and makes it safe to lock money into investments.' },
        { q: 'Best home for an emergency fund?', options: ['Stocks — best returns', 'Savings account / sweep-in FD / liquid fund', 'A 5-year locked FD'], answer: 1, explain: 'Optimise for instant access and zero drama, not returns.' },
        { q: 'The first milestone on this journey is…', options: ['6 months of expenses', '1 month of expenses', '₹10 lakh'], answer: 1, explain: 'One month changes your psychology immediately. Then build toward 3–6.' },
      ],
    },
    {
      id: 'l3-03',
      title: 'Automate it: the payday ritual',
      minutes: 2,
      blocks: [
        { t: 'p', text: "Willpower is a terrible savings strategy — it runs out by the 10th. **Automation** is how ordinary people save extraordinary amounts: the money moves by itself, on payday, before you can negotiate with it." },
        { t: 'list', items: [
          'Set an auto-transfer (standing instruction) from salary account → savings/emergency account, dated 1–2 days after payday',
          'Start with your current savings-rate target — even 5% automated beats 15% intended',
          'Treat it like rent: it\'s a bill owed to future-you, not optional',
        ] },
        { t: 'callout', emoji: '📅', title: 'Your payday is the anchor', text: 'PaisaCoach knows your payday. Each month, the money that leaves on day one never gets missed — you simply live on what\'s visible. The "left to spend" number on Home already assumes you paid yourself.' },
        { t: 'p', text: "Once the transfer has run for a month and your emergency fund crosses one month of expenses, Level 3 completes — and the investing gates start opening." },
      ],
      quiz: [
        { q: 'Why automate savings?', options: ['Banks give bonuses', 'Willpower runs out; automation doesn\'t negotiate', 'It\'s faster'], answer: 1, explain: 'The transfer happens before the temptation does. That\'s the whole trick.' },
        { q: 'When should the auto-transfer fire?', options: ['Month-end, from what\'s left', '1–2 days after payday', 'Randomly'], answer: 1, explain: 'Payday +1: the money leaves before the month starts spending it.' },
        { q: '5% automated vs 15% intended —', options: ['15% intended wins', '5% automated wins', 'Same'], answer: 1, explain: 'Intentions don\'t compound. Standing instructions do.' },
      ],
    },
  ],
};
