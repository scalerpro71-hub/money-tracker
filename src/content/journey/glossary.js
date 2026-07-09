/* Beginner glossary - one plain-English line per term.
   The investment-type keys (sip, mf, fd, ...) match investments.type in the DB. */

export const TYPE_GLOSSARY = {
  sip: 'SIP — a fixed amount auto-invests into a mutual fund every month. Set it, forget it, let averaging work.',
  mf: 'Mutual fund — thousands of people pool money to buy a basket of stocks or bonds. You own units of the basket.',
  fd: 'Fixed deposit — you lock money with a bank for a fixed time at a fixed rate. Predictable, insured up to ₹5 lakh, taxed at your slab.',
  stock: 'Stock — a tiny slice of one company. Higher potential, higher drama. Index funds hold 50 of these so you don\'t have to pick.',
  ppf: 'PPF — government-backed savings, ~7% tax-free, locked for 15 years. The slow, unbreakable vault.',
  nps: 'NPS — a retirement account mixing equity and debt, locked till 60, with extra tax benefits.',
  gold: 'Gold (SGB/ETF) — paper gold without making charges. A small slice hedges your equity.',
  other: 'Anything else — real estate, crypto, that thing your cousin pitched. Log it so the picture stays complete.',
};

export const GLOSSARY = [
  { term: 'NAV', def: 'The price of one unit of a mutual fund: basket value ÷ number of units. It is not "cheap" at ₹10 or "expensive" at ₹500 — only growth matters.' },
  { term: 'Expense ratio', def: 'The yearly fee a fund deducts silently. Index funds: ~0.1–0.5%. Active funds: 1–2%. Fees compound against you.' },
  { term: 'Index fund', def: 'A fund that simply buys every big company in an index (like the Nifty 50). No star manager, tiny fees.' },
  { term: 'Direct plan', def: 'The same mutual fund without a distributor\'s commission baked in. Always the cheaper twin.' },
  { term: 'Growth option', def: 'Fund profits stay invested and compound, instead of being paid out. The default choice while building wealth.' },
  { term: 'ELSS', def: 'An equity fund with a 3-year lock-in that gives a Section 80C tax deduction (old regime only).' },
  { term: 'Section 80C', def: 'Old-regime tax deduction up to ₹1.5 lakh/year for PPF, EPF, ELSS, 5-year FDs and more.' },
  { term: 'Rupee-cost averaging', def: 'Investing a fixed amount monthly means you auto-buy more units when markets fall. A SIP\'s secret engine.' },
  { term: 'Asset allocation', def: 'How you split money between equity, debt and gold. Decides most of your outcome and all of your sleep.' },
  { term: 'Rebalancing', def: 'Once a year, trim what grew and top up what shrank, back to your target split. Mechanical sell-high-buy-low.' },
  { term: 'Emergency fund', def: '3–6 months of expenses in a savings account / liquid fund. Your permission slip to invest.' },
  { term: 'Compounding', def: 'Returns earning returns. Slow for years, then suddenly enormous — the later years do the heavy lifting.' },
  { term: 'SGB', def: 'Sovereign Gold Bond — government paper gold that also paid interest. Buy on exchanges; no locker, no making charges.' },
  { term: 'Term insurance', def: 'Pure life cover, ~10–15× annual income, cheap because it has no investment part. Only needed if someone depends on your income.' },
  { term: 'XIRR', def: 'The honest way to measure returns when you invested on many dates (like a SIP). Your platform computes it for you.' },
];
