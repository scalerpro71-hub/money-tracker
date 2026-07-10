/* The Explore catalog - one deep, honest page per instrument, so the decision
   to invest is made understanding the thing, not hoping about it.
   Numbers here are teaching aids (historical ballparks, current rules as of
   mid-2026) - never predictions. Blocks reuse the lesson renderer. */

export const OPTIONS = [
  {
    id: 'index-sip',
    type: 'sip',
    emoji: '🧺',
    title: 'Index fund SIP',
    tagline: 'The boring default that beats most clever ideas',
    riskLevel: 'medium',
    startFrom: 500,
    facts: {
      returns: '~10–12%/yr long-term average — single years swing from -38% to +75%',
      lockIn: 'None — redeem any time, money lands in 2–3 working days',
      taxes: 'Held 1yr+: 12.5% on gains above ₹1.25L/yr. Under 1yr: 20%',
      effort: '10 minutes to set up, near-zero after that',
    },
    blocks: [
      { t: 'p', text: "An index fund doesn't try to be clever. It buys **all of India's biggest companies at once** — a Nifty 50 fund automatically holds the 50 largest — so you own a slice of the whole economy instead of betting on any single business or manager." },
      { t: 'p', text: 'The **SIP** part means a fixed amount auto-invests every month. Markets down? Your money buys more units. Markets up? Fewer, but your older units grew. This **rupee-cost averaging** turns volatility from an enemy into the mechanism — and permanently deletes the question "is now a good time?"' },
      { t: 'callout', emoji: '🏆', title: 'Why this is the classic first investment', text: 'Decades of data show most expensive "actively managed" funds fail to beat this boring basket over the long run. You get the market\'s growth with tiny fees (0.1–0.3%) and nothing to out-guess. Boring is the feature.' },
      { t: 'calc', kind: 'sip' },
      { t: 'p', text: 'Three checkboxes when you pick one: **Direct plan** (no distributor commission — same fund, cheaper), **Growth option** (returns stay invested and compound), **low expense ratio**. That\'s the whole selection process.' },
    ],
    howToStart: [
      '**KYC once** — PAN + Aadhaar + a selfie video on any SEBI-registered platform (your bank\'s app or a broker like Zerodha Coin or Groww — PaisaCoach doesn\'t care which), ~10 minutes, free',
      '**Search "Nifty 50 index fund"** — pick Direct plan, Growth option, lowest expense ratio',
      '**Set the SIP** — an amount you won\'t miss, dated 2–3 days after payday, auto-debit on',
      '**Log it in PaisaCoach** — so your plan and your coach see the full picture',
    ],
    mistakes: [
      'Stopping the SIP in a red month — that\'s exactly when your money buys the most units',
      'Picking Regular plan instead of Direct — same fund, but a middleman quietly takes a cut for decades',
      'Checking the value daily — this is a 5+ year machine; daily prices are noise',
      'Starting big and quitting — ₹500 that survives 5 years beats ₹5,000 that dies in 3 months',
    ],
    fearCheck: {
      worstYearPct: -0.38,
      worstYearLabel: "FY2008-09 — the Nifty 50's worst year on record",
      recoveryNote: 'The index was back above its pre-crash peak within about two years — and SIP installments during the crash bought the cheapest units of the decade. The loss was only real for people who sold.',
    },
    coachQuestion: 'I want to start an index fund SIP. Walk me through picking one and what could go wrong.',
  },

  {
    id: 'active-mf',
    type: 'mf',
    emoji: '🎯',
    title: 'Active mutual funds',
    tagline: 'A professional picks the stocks — for a fee',
    riskLevel: 'medium',
    startFrom: 500,
    facts: {
      returns: 'Aims to beat the index; most don\'t after fees. Same -40% bad years',
      lockIn: 'None (some have small exit loads under 1 year)',
      taxes: 'Same as index funds: 12.5% LTCG above ₹1.25L/yr, 20% STCG',
      effort: 'Low to run, but picking (and re-checking) the fund is on you',
    },
    blocks: [
      { t: 'p', text: 'An **active fund** hires a manager to pick stocks they believe will beat the market. You pay for that belief: expense ratios run **1–2% a year versus ~0.2%** for an index fund — deducted every year, up or down.' },
      { t: 'callout', emoji: '🧮', title: 'The uncomfortable math', text: 'A 1.5% extra annual fee sounds tiny. Over 20 years it quietly eats **roughly a quarter of your final corpus**. For the fee to be worth it, the manager must beat the index by more than the fee, every year, for decades. Most don\'t.' },
      { t: 'p', text: "That said, active funds aren't a scam — some categories (small-cap, flexi-cap) have pockets where good managers add real value. The honest framing: this is a **step-two instrument**, after your index SIP habit is boring and you actually enjoy comparing funds." },
    ],
    howToStart: [
      '**Same KYC and platform** as any mutual fund — nothing new to set up',
      '**Compare within a category** — a small-cap fund vs its small-cap index, over 5–10 years, not last year',
      '**Direct plan, Growth option** — the middleman\'s cut hurts double on top of active fees',
      '**Log it in PaisaCoach** under Mutual fund',
    ],
    mistakes: [
      'Buying last year\'s #1 performer — chart-toppers rotate; fees don\'t',
      'Holding 6 different funds that all own the same 50 stocks — that\'s an expensive index fund',
      'Judging over 6 months — active bets need full market cycles to prove anything',
    ],
    fearCheck: {
      worstYearPct: -0.45,
      worstYearLabel: 'a typical equity fund in the 2008 crash — many fell harder than the index',
      recoveryNote: 'Diversified funds recovered with the market. The extra risk vs an index fund isn\'t the crash — it\'s picking a manager who underperforms for a decade while charging you for it.',
    },
    coachQuestion: 'When does an active mutual fund actually make sense over an index fund for me?',
  },

  {
    id: 'elss',
    type: 'mf',
    emoji: '🧾',
    title: 'ELSS (tax-saver fund)',
    tagline: 'An equity fund that also cuts your tax bill — old regime only',
    riskLevel: 'medium',
    startFrom: 500,
    facts: {
      returns: 'Equity-like: ~10–12%/yr long-term, with equity-sized swings',
      lockIn: '3 years per installment — shortest of all 80C options',
      taxes: 'Invests up to ₹1.5L/yr deductible under 80C (old regime only); gains taxed like equity',
      effort: 'Same as any fund, plus one look at your tax regime first',
    },
    blocks: [
      { t: 'p', text: 'An **ELSS** is a normal diversified equity fund with two twists: what you put in (up to **₹1.5L/year**) is deductible under **Section 80C** — and each installment is **locked for 3 years**.' },
      { t: 'callout', emoji: '⚠️', title: 'Check your tax regime first', text: 'The 80C deduction exists only in the **old tax regime**. If you\'re on the new regime (most salaried people now are, by default), ELSS gives you **no tax benefit** — it becomes just an equity fund with a lock-in. This single check decides whether ELSS makes any sense for you.' },
      { t: 'p', text: 'One subtlety SIP investors miss: the 3-year lock applies **per installment**. A SIP running 3 years means the last installment unlocks at year 6. Fine if you know it; a surprise if you don\'t.' },
    ],
    howToStart: [
      '**Confirm you\'re on the old tax regime** and have unused 80C room (EPF and insurance premiums also fill it)',
      '**Pick one ELSS fund** — same rules: Direct, Growth, sensible long-term record',
      '**Prefer lump sums or short SIP windows** near your tax-planning month to keep unlock dates simple',
      '**Log it in PaisaCoach** under Mutual fund',
    ],
    mistakes: [
      'Buying ELSS while on the new tax regime — lock-in with zero benefit',
      'Panic that money is "stuck" — the lock-in is real; only invest money with a 3+ year horizon',
      'Buying a new ELSS every year from ads — one good fund, repeated, is cleaner',
    ],
    fearCheck: {
      worstYearPct: -0.38,
      worstYearLabel: 'equity crash years hit ELSS exactly like any equity fund',
      recoveryNote: 'The 3-year lock-in has an odd upside: it forced 2008 investors to hold through the recovery. The tax saving (up to ~₹46,800/yr at the 30% slab, old regime) is a guaranteed head start no market can take back.',
    },
    coachQuestion: 'Does ELSS make sense for me given my tax regime, or should I skip it?',
  },

  {
    id: 'fd-rd',
    type: 'fd',
    emoji: '🏦',
    title: 'Fixed & recurring deposits',
    tagline: 'The return is known on day one — that certainty is the product',
    riskLevel: 'low',
    startFrom: 1000,
    facts: {
      returns: '~6.5–7.5%/yr, fixed at booking. Small banks pay more for more risk',
      lockIn: 'You pick the tenure; early exit allowed with a ~1% penalty',
      taxes: 'Interest taxed at your full income slab, every year — the big catch',
      effort: 'Two minutes in your bank app. Genuinely nothing after',
    },
    blocks: [
      { t: 'p', text: "An **FD** hands the bank a lump sum for a fixed tenure at a fixed rate — you know the exact maturity amount before you start. An **RD** is the same deal in monthly installments, which makes it a decent training-wheels version of a SIP." },
      { t: 'p', text: 'Safety, precisely stated: deposits are insured by **DICGC up to ₹5 lakh per bank** (principal + interest). Under that limit in a scheduled bank, an FD is about as close to risk-free as Indian retail money gets.' },
      { t: 'callout', emoji: '🐢', title: 'The quiet catch: slab tax + inflation', text: 'FD interest is taxed at your **full income slab** every year. At 7% interest and the 30% slab, you keep ~4.9% — roughly what inflation runs. Your money is perfectly safe and barely growing. FDs are for **parking** money (goals under ~3 years, cushion), not for **building** wealth.' },
    ],
    howToStart: [
      '**Open it inside your existing bank app** — no new KYC, no new platform',
      '**Pick the tenure to match the goal** — money needed in 14 months → a 14-month FD',
      '**Skip auto-renew** unless you\'ve decided that on purpose',
      '**Log it in PaisaCoach** under Fixed deposit',
    ],
    mistakes: [
      'Chasing a 9% FD at an unfamiliar small bank with more than the ₹5L insured limit',
      'Breaking a big FD for a small need — ladder several smaller FDs instead',
      'Parking 10-year money in FDs — safety today, inflation loss over a decade',
      'Forgetting the interest is taxable even though it auto-renews',
    ],
    fearCheck: {
      worstYearPct: 0.07,
      worstYearLabel: 'an FD never has a red year — the risk wears a disguise',
      recoveryNote: 'The real worst case: at ~7% before tax and ~6% inflation, your "safe" money gains almost nothing in buying power, year after year. Safe for parking; a slow leak for wealth-building.',
    },
    coachQuestion: 'When should I use an FD instead of investing, and how much is too much in FDs?',
  },

  {
    id: 'ppf',
    type: 'ppf',
    emoji: '🏛️',
    title: 'PPF',
    tagline: 'Government-backed, tax-free compounding — for the patient',
    riskLevel: 'low',
    startFrom: 500,
    facts: {
      returns: '~7.1%/yr (government revises quarterly), fully tax-free',
      lockIn: '15 years — partial withdrawals allowed from year 7',
      taxes: 'The famous EEE: deposit deductible (80C, old regime), interest tax-free, maturity tax-free',
      effort: 'Open once at any bank/post office; ₹500–₹1.5L per year keeps it alive',
    },
    blocks: [
      { t: 'p', text: 'The **Public Provident Fund** is a government-run account: sovereign guarantee, interest set by the government (~7.1% lately), and the cleanest tax treatment in India — **nothing about it is ever taxed**.' },
      { t: 'p', text: 'Compare honestly with an FD at the 30% slab: FD keeps ~4.9% after tax, PPF keeps the full 7.1%. Over 15 years that gap is enormous. The price you pay is **time**: 15-year maturity, partial withdrawals only from year 7.' },
      { t: 'callout', emoji: '🔒', title: 'The lock-in is the feature', text: 'PPF is where money goes to be **un-touchable** — retirement-flavoured, panic-proof savings. You can\'t sell it in a crash because there\'s nothing to crash. Pair it with an equity SIP and the two cover each other\'s weaknesses.' },
    ],
    howToStart: [
      '**Open a PPF account** in your bank app (most allow it online) or at a post office — one account per person, lifetime',
      '**Deposit anything from ₹500 to ₹1.5L per financial year** — before the 5th of the month earns that month\'s interest',
      '**Set a yearly reminder** — miss a year and the account needs a small penalty to revive',
      '**Log it in PaisaCoach** under PPF',
    ],
    mistakes: [
      'Putting short-term money in — this is a 15-year vault, not a savings account',
      'Ignoring it because 7.1% "sounds low" — tax-free 7.1% beats taxed 8.5%',
      'Forgetting the minimum ₹500/year and letting the account go dormant',
    ],
    fearCheck: {
      worstYearPct: 0.071,
      worstYearLabel: 'PPF has never had a down year — sovereign guarantee',
      recoveryNote: 'The only real risks are inflation outpacing the rate in some years, and the lock-in pinching if you over-commit money you\'ll need sooner. Size it so the 15 years feel like a feature, not a trap.',
    },
    coachQuestion: 'How much of my monthly saving should go to PPF versus my SIP?',
  },

  {
    id: 'nps',
    type: 'nps',
    emoji: '🧓',
    title: 'NPS',
    tagline: 'A retirement pot with the lowest fees in the country',
    riskLevel: 'medium',
    startFrom: 500,
    facts: {
      returns: '~8–10%/yr historically for balanced mixes — depends on your equity %',
      lockIn: 'Until age 60 (that\'s the point). Then 60% lump sum tax-free, 40% buys a pension',
      taxes: 'Extra ₹50k/yr deduction under 80CCD(1B) on the old regime; growth untaxed',
      effort: 'One-time setup, then auto-debit. Choose your equity % once',
    },
    blocks: [
      { t: 'p', text: 'The **National Pension System** is a government-regulated retirement account that invests your money in a mix of **equity (up to 75%) and bonds** — you pick the mix, or let "auto" glide it down as you age. Fund management fees are absurdly low (~0.1%).' },
      { t: 'p', text: 'The deal at 60: **60% comes out as a tax-free lump sum**, and the remaining **40% must buy an annuity** — a monthly pension for life. That annuity rule annoys people, but it exists to stop 60-year-olds from blowing the pot in year one.' },
      { t: 'callout', emoji: '⏳', title: 'Be honest about the horizon', text: "Money in NPS is gone until you're 60 — early exit rules are strict and mostly force an annuity. In your 20s or 30s, that's 30+ years of compounding at rock-bottom fees (great) with zero flexibility (the trade). Fund it after your SIP and cushion, not instead of them." },
    ],
    howToStart: [
      '**Open online via the eNPS portal** or through your bank — PAN + Aadhaar, ~15 minutes',
      '**Pick "Active" choice with a high equity %** if you\'re young, or "Auto" to not think about it',
      '**Set a monthly auto-debit** — treat it like a far-future SIP',
      '**Log it in PaisaCoach** under NPS',
    ],
    mistakes: [
      'Opening NPS only for the ₹50k tax break while on the new regime — the break doesn\'t apply there',
      'Putting emergency-adjacent money in — this is your least accessible rupee',
      'Choosing 100% government-bond allocation at 25 — decades of growth traded for comfort you don\'t need yet',
    ],
    fearCheck: {
      worstYearPct: -0.15,
      worstYearLabel: 'a rough year for a 50% equity NPS mix (equity portion crashing)',
      recoveryNote: "With retirement decades away, a -15% year is noise — every contribution during it buys cheaper units, and you can't panic-sell what you can't touch. The lock-in quietly protects you from yourself.",
    },
    coachQuestion: 'Is NPS worth starting now at my age, and what equity mix should I pick?',
  },

  {
    id: 'gold',
    type: 'gold',
    emoji: '🥇',
    title: 'Gold (ETF / fund)',
    tagline: 'The anti-panic asset — shines exactly when stocks don\'t',
    riskLevel: 'medium',
    startFrom: 100,
    facts: {
      returns: '~8–9%/yr long-term in rupees, but in violent, unpredictable bursts',
      lockIn: 'None for ETFs/funds — sell any market day',
      taxes: 'Listed gold ETFs held 1yr+: 12.5% LTCG. Physical gold: 12.5% after 2yrs',
      effort: 'Buying is easy; the discipline is keeping it to a small slice',
    },
    blocks: [
      { t: 'p', text: "Gold's job in a portfolio isn't returns — it's **behaving differently**. In 2008, while equities halved, gold rose. That negative correlation is why a 5–10% slice makes the whole portfolio calmer, which makes *you* less likely to panic-sell the equity part." },
      { t: 'p', text: 'Skip jewellery as an investment — **making charges (8–25%) and GST** mean you lose a chunk at the counter. The clean routes are a **gold ETF** (needs a demat account) or a **gold mutual fund** (works like any fund, no demat). Sovereign Gold Bonds were the best deal but **new issues stopped in 2024-25** — existing ones trade secondhand on exchanges.' },
      { t: 'callout', emoji: '⚖️', title: 'Small slice, rebalanced', text: 'Gold can also sleep for years (2012–2018, roughly flat) while equities triple. It\'s insurance, not an engine — buy your 5–10%, rebalance yearly, and don\'t chase it after a hot run.' },
    ],
    howToStart: [
      '**Gold mutual fund** — simplest: any fund platform, SIP-able from ₹100–500, no demat needed',
      '**Gold ETF** — slightly cheaper to hold if you already have a demat account with a broker',
      '**Aim for 5–10% of your portfolio** — this is a seasoning, not the meal',
      '**Log it in PaisaCoach** under Gold',
    ],
    mistakes: [
      'Buying jewellery and calling it investing — making charges eat years of returns',
      'Going 30–40% gold because it\'s familiar — it has decade-long flat stretches',
      'Buying only after gold makes headlines — you\'re buying the top of the burst',
    ],
    fearCheck: {
      worstYearPct: -0.2,
      worstYearLabel: '2013 — gold\'s worst modern year in rupee terms, roughly',
      recoveryNote: 'Gold recovered, but slowly — it went mostly sideways for five more years. That\'s the real risk: not a crash, but a long boring stretch that tests why you bought it. The answer should be "insurance", not "returns".',
    },
    coachQuestion: 'How much gold should I hold, and is a gold fund or ETF better for me?',
  },

  {
    id: 'stocks',
    type: 'stock',
    emoji: '📈',
    title: 'Direct stocks',
    tagline: 'Maximum control, maximum ways to hurt yourself',
    riskLevel: 'high',
    startFrom: 100,
    facts: {
      returns: 'Unbounded both ways: multibaggers exist, and so does zero',
      lockIn: 'None — sell any market day (which is part of the danger)',
      taxes: 'Same as equity funds: 12.5% LTCG above ₹1.25L/yr, 20% STCG',
      effort: 'High, honestly — real research per company, plus emotional discipline',
    },
    blocks: [
      { t: 'p', text: 'Buying a stock means owning a slice of **one single business**. No manager, no basket, no cushion: if the company stumbles — fraud, disruption, one bad product cycle — nothing offsets it. **Individual stocks can go to zero. Diversified funds cannot.**' },
      { t: 'callout', emoji: '🎢', title: 'The behaviour trap', text: 'The danger isn\'t only the company — it\'s you. Stocks tempt you into checking prices hourly, averaging down on losers, and confusing a bull market for skill. Every rule you built with SIPs gets stress-tested here.' },
      { t: 'p', text: "The sane way in, once your base exists: **one company you actually understand** (you use its products, you can say how it earns money), sized so that its **total loss wouldn't change your life** — under ~10% of your portfolio. That's learning by owning, with the blast radius capped." },
      { t: 'p', text: 'And remember: your index fund **already owns** Reliance, HDFC Bank, Infosys and the rest. Buying them directly isn\'t diversification — it\'s concentration with extra steps.' },
    ],
    howToStart: [
      '**Open a demat + trading account** with any SEBI-registered broker (Zerodha, Groww, your bank — the steps are identical)',
      '**Pick one business you genuinely understand** and read its last annual report — if that sounds tedious, that\'s the signal to stay with funds',
      '**Cap the position** — one stock under ~10% of your total portfolio, bought with delivery (never intraday, never margin)',
      '**Log it in PaisaCoach** under Stock',
    ],
    mistakes: [
      'Buying from tips — Telegram groups, YouTube thumbnails, a friend\'s "sure thing"',
      'Intraday trading and F&O as a beginner — SEBI\'s own study: ~9 in 10 individual F&O traders lose money',
      'Averaging down on a falling stock without re-checking the business',
      'Ten random stocks instead of one understood one — that\'s a bad fund with no manager',
    ],
    fearCheck: {
      worstYearPct: -0.6,
      worstYearLabel: 'a typical mid-cap stock in the 2008 crash',
      recoveryNote: 'Unlike an index, many individual stocks never recovered — some of 2008\'s favourites no longer exist. This is why the position cap matters more than the pick: cap it at 10% and even a zero is a lesson, not a disaster.',
    },
    coachQuestion: 'I\'m thinking about buying my first individual stock. How do I do this without wrecking my plan?',
  },

  {
    id: 'liquid-fund',
    type: 'mf',
    emoji: '💧',
    title: 'Liquid fund',
    tagline: 'A smarter parking spot for your cushion',
    riskLevel: 'low',
    startFrom: 500,
    facts: {
      returns: '~6–7%/yr — a bit above savings accounts, close to short FDs',
      lockIn: 'None — money back in your bank in about one working day',
      taxes: 'Gains taxed at your income slab (debt-fund rule), only when you withdraw',
      effort: 'Same as any mutual fund; some apps offer instant withdrawal up to ₹50k',
    },
    blocks: [
      { t: 'p', text: 'A **liquid fund** is a debt mutual fund that lends only to the highest-rated borrowers for **up to 91 days** at a time. Ultra-short lending to solid names is about as tame as market instruments get — think of it as a savings account that tries a little harder.' },
      { t: 'p', text: 'Its natural job in your plan: **housing your emergency cushion**. It beats a savings account\'s ~3%, doesn\'t lock like an FD, and most platforms return the money to your bank in one working day — some instantly up to ₹50,000.' },
      { t: 'callout', emoji: '🧯', title: 'Tame, not guaranteed', text: 'Unlike an FD there\'s no DICGC insurance — the NAV can wobble a hair on a bad credit day (2020\'s worst weeks cost some liquid funds a fraction of a percent). Stick to large funds from large houses that hold mostly government/AAA paper, and split the cushion: some in bank, some here.' },
    ],
    howToStart: [
      '**Same platform as your SIP** — search "liquid fund", prefer large AUM and highest-quality holdings',
      '**Direct plan, Growth option** — the same two checkboxes as always',
      '**Move the cushion gradually** — e.g. a chunk each payday until 1 month of expenses sits there',
      '**Log it in PaisaCoach** under Mutual fund (it\'s your cushion, not your growth engine)',
    ],
    mistakes: [
      'Confusing it with an equity fund — a liquid fund is for parking, its returns will never impress',
      'Chasing the highest-yield "credit risk" debt fund for 1% extra — that 1% is the risk',
      'Keeping the entire emergency fund here — keep a bank slice for the 2 a.m. emergency',
    ],
    fearCheck: {
      worstYearPct: 0.06,
      worstYearLabel: 'liquid funds don\'t have red years — worst weeks cost a fraction of a percent',
      recoveryNote: 'The honest risk is the same as the FD\'s: at ~6.5% before slab tax, this money keeps pace with inflation at best. Perfect for the cushion, wrong for wealth-building — which is exactly the division of labour in your plan.',
    },
    coachQuestion: 'Should my emergency cushion sit in a liquid fund, an FD, or my savings account?',
  },
];

export function getOption(id) {
  return OPTIONS.find(o => o.id === id) || null;
}
