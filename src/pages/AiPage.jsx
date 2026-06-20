import { useState, useRef, useEffect, useMemo } from 'react';
import { callAiChat, callAiSuggest } from '../lib/claudeApi';
import { Icon } from '../components/layout/Icon';
import { cur, fmtK } from '../lib/formatUtils';
import { localDateStr, startOfMonthStr } from '../lib/dateUtils';

const SUGGESTIONS = [
  "Can I afford a ₹15,000 trip this month?",
  "What's eating my budget most?",
  "How long to reach my goals?",
  "Am I saving enough?",
  "Where should I cut spending?",
  "How should I start investing my monthly surplus?",
  "What's a SIP?",
];

const AI_INSIGHTS = [
  { id: 'weekly_money_story', title: 'Weekly Money Story', body: 'What changed this week, in normal words.' },
  { id: 'unusual_transactions', title: 'Unusual Spends', body: 'Transactions or merchants that stand out.' },
  { id: 'hidden_patterns', title: 'Hidden Patterns', body: 'Repeated habits and leaks you may miss.' },
  { id: 'monthly_summary', title: 'Monthly Summary', body: 'A clear summary of this month so far.' },
  { id: 'why_spend_more', title: 'Why Spend Changed', body: 'Why this period is higher or lower.' },
  { id: 'budget_explanation', title: 'Budget Warnings', body: 'Explain budget pressure by category.' },
  { id: 'investment_starter_plan', title: 'Investing Starter Plan', body: 'A beginner plan for your real surplus, explained.' },
];

const RISK_OPTIONS = [
  { id: 'low', label: 'Low' },
  { id: 'medium', label: 'Medium' },
  { id: 'high', label: 'High' },
];

const SAFETY_NET_OPTIONS = [
  { id: 'family_support', label: 'Family support' },
  { id: 'own_emergency_fund', label: 'I have my own emergency fund' },
  { id: 'none', label: 'No safety net yet' },
];

function coachFallback(q, context) {
  const q2 = q.toLowerCase();
  const rate = context.savingsRate;
  const total = cur(context.monthTotal);
  const count = context.txCount;

  if (q2.includes('afford') || q2.includes('trip') || q2.includes('buy')) {
    const left = cur(context.spendable);
    return `You have ${left} left in your budget this month. Factor in any upcoming bills before committing.`;
  }
  if (q2.includes('budget') || q2.includes('eat') || q2.includes('top')) {
    return context.topCat
      ? `${context.topCat.icon} ${context.topCat.name} is your biggest category at ${cur(context.topCat.amt)}.`
      : 'Add budget categories in Settings to track your spending better.';
  }
  if (q2.includes('goal') || q2.includes('reach')) {
    return context.goals?.length
      ? `You have ${context.goals.length} active goal(s). Keep saving consistently!`
      : 'Set savings goals in the Goals tab to track your progress.';
  }
  if (q2.includes('save') || q2.includes('saving')) {
    if (rate === null) return 'Set your monthly income in Settings for personalised savings advice.';
    const saved = context.income - context.monthTotal;
    const targetSaving = context.income * 0.3;
    const extraNeeded = Math.max(0, Math.round(targetSaving - saved));
    return extraNeeded > 0
      ? `You're saving ${rate}% of income. The 30% rule suggests saving ₹${extraNeeded.toLocaleString('en-IN')} more each month.`
      : `You're saving ${rate}% of income, which is already above the 30% savings target.`;
  }
  return `You've spent ${total} across ${count} transaction${count !== 1 ? 's' : ''} this month${rate !== null ? `, saving ${rate}% of income` : ''}.`;
}

function buildCoachPrompt(q, context) {
  const { income, monthTotal, spendable, savingsRate, netWorth, portfolioValue, sipMonthly,
    topCategories, goals, upcomingBills, monthlySurplus, riskTolerance, investingGoal, safetyNet } = context;
  const budgetPct = income > 0 ? Math.round((monthTotal / income) * 100) : 0;

  const topCats = (topCategories || []).slice(0, 4)
    .map(c => `${c.name} ₹${fmtK(c.amt)}${c.budget ? ` (budget ₹${fmtK(c.budget)})` : ''}`).join(', ');

  const goalLines = (goals || []).slice(0, 3)
    .map(g => `${g.name}: ₹${fmtK(g.current_amount || 0)} of ₹${fmtK(g.target_amount)}`).join('; ');

  const billLines = (upcomingBills || []).slice(0, 3)
    .map(b => `${b.name} ₹${fmtK(b.amount)} due ${b.due_day}`).join('; ');

  return `You are Rupee Coach, a personal finance assistant grounded in the user's real data.

User's finances:
- Monthly income: ₹${fmtK(income || 0)}
- Spent this month: ₹${fmtK(monthTotal)} (${budgetPct}% of income)
- Savings rate: ${savingsRate !== null ? savingsRate + '%' : 'unknown'}
- Spendable left: ₹${fmtK(spendable)}
- Net worth: ₹${fmtK(netWorth || 0)}
- Portfolio value: ₹${fmtK(portfolioValue || 0)}${sipMonthly ? `, SIP ₹${fmtK(sipMonthly)}/mo` : ''}
- Top spending: ${topCats || 'no data'}
- Goals: ${goalLines || 'none'}
- Upcoming bills: ${billLines || 'none'}
- Monthly surplus available to invest: ₹${fmtK(monthlySurplus || 0)}
- Risk comfort: ${riskTolerance || 'not set yet'}
- Investing goal: ${investingGoal || 'not set yet'}
- Safety net: ${safetyNet || 'not set yet'}

Answer only from the above data. Use ₹ Indian formatting. Keep to 2-4 short sentences. No markdown. If asked something outside personal finance, politely steer back.

You also act as a beginner investing coach using this same data. When discussing investing: explain any jargon term in one short plain-English phrase the first time you use it; recommend only investment categories (e.g. index fund SIP, PPF, FD, NPS, gold ETF) and concrete selection criteria, never name a specific stock, mutual fund, or AMC; always state the reasoning behind any amount/allocation you suggest, not just the number; only raise emergency-fund advice if safety net is "none" — otherwise don't mention it.

User: ${q}`;
}

function healthScore(savingsRate, budgetAdherence) {
  let score = 60;
  if (savingsRate !== null) {
    if (savingsRate >= 30) score += 20;
    else if (savingsRate >= 20) score += 12;
    else if (savingsRate >= 10) score += 5;
    else if (savingsRate < 0) score -= 20;
  }
  if (budgetAdherence > 0.8) score += 15;
  else if (budgetAdherence > 0.5) score += 7;
  return Math.max(10, Math.min(99, score));
}

function sumEntries(entries) {
  return entries.reduce((a, e) => a + Number(e.amount || 0), 0);
}

function compactEntries(entries, limit = 35) {
  return [...entries]
    .sort((a, b) => `${b.date}`.localeCompare(`${a.date}`))
    .slice(0, limit)
    .map(e => ({
      date: e.date,
      amount: Number(e.amount),
      category: e.category?.name || 'Uncategorized',
      note: e.note || e.category?.name || 'Expense',
    }));
}

function totalsByCategory(entries) {
  const map = {};
  for (const e of entries) {
    const name = e.category?.name || 'Uncategorized';
    map[name] = (map[name] || 0) + Number(e.amount || 0);
  }
  return Object.entries(map)
    .map(([name, amount]) => ({ name, amount: Math.round(amount) }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 10);
}

function totalsByMerchant(entries) {
  const map = {};
  for (const e of entries) {
    const key = (e.note || e.category?.name || 'Unknown').slice(0, 40);
    if (!map[key]) map[key] = { merchant: key, amount: 0, count: 0 };
    map[key].amount += Number(e.amount || 0);
    map[key].count += 1;
  }
  return Object.values(map)
    .map(x => ({ ...x, amount: Math.round(x.amount) }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 10);
}

function topTransactions(entries, limit = 8) {
  return [...entries]
    .sort((a, b) => Number(b.amount) - Number(a.amount))
    .slice(0, limit)
    .map(e => ({
      date: e.date,
      amount: Number(e.amount),
      category: e.category?.name || 'Uncategorized',
      note: e.note || e.category?.name || 'Expense',
    }));
}

function daysAgoIso(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return localDateStr(d);
}

function monthKey(offset = 0) {
  const d = new Date();
  d.setMonth(d.getMonth() + offset);
  return d.toISOString().slice(0, 7);
}

function buildAiInsightData(feature, { expenses, budgets, goals, profile, investments, assets, liabilities, bills, monthlySurplus }) {
  const spendEntries = (expenses || []).filter(e => e.type !== 'income');
  const incomeEntries = (expenses || []).filter(e => e.type === 'income');
  const weekStart = daysAgoIso(7);
  const prevWeekStart = daysAgoIso(14);
  const month = monthKey(0);
  const prevMonth = monthKey(-1);
  const week = spendEntries.filter(e => e.date >= weekStart);
  const prevWeek = spendEntries.filter(e => e.date >= prevWeekStart && e.date < weekStart);
  const monthSpend = spendEntries.filter(e => e.date?.startsWith(month));
  const prevMonthSpend = spendEntries.filter(e => e.date?.startsWith(prevMonth));
  const monthIncome = incomeEntries.filter(e => e.date?.startsWith(month));
  const currentPeriod = feature === 'weekly_money_story' || feature === 'hidden_patterns' ? week : monthSpend;
  const previousPeriod = feature === 'weekly_money_story' || feature === 'hidden_patterns' ? prevWeek : prevMonthSpend;
  const categoryTotals = totalsByCategory(currentPeriod);
  const monthByCategory = totalsByCategory(monthSpend);
  const budgetStatus = (budgets || []).map(b => {
    const spent = monthByCategory.find(c => c.name === b.category?.name)?.amount || 0;
    return {
      category: b.category?.name || 'Category',
      limit: Number(b.limit_amount),
      spent,
      remaining: Number(b.limit_amount) - spent,
    };
  });

  return {
    feature,
    generated_for: new Date().toISOString().slice(0, 10),
    profile: {
      monthly_income: Number(profile?.monthly_income || 0),
      payday_day: profile?.payday_day || null,
    },
    investor_profile: {
      experience: profile?.investing_experience || 'beginner',
      risk_tolerance: profile?.risk_tolerance || null,
      goal: profile?.investing_goal || null,
      safety_net: profile?.safety_net || null,
      monthly_surplus: Math.round(monthlySurplus || 0),
    },
    current_period: {
      label: feature === 'weekly_money_story' || feature === 'hidden_patterns' ? 'last 7 days' : month,
      total_spent: Math.round(sumEntries(currentPeriod)),
      transaction_count: currentPeriod.length,
      by_category: categoryTotals,
      by_merchant: totalsByMerchant(currentPeriod),
      largest_transactions: topTransactions(currentPeriod),
      recent_transactions: compactEntries(currentPeriod),
    },
    previous_period: {
      label: feature === 'weekly_money_story' || feature === 'hidden_patterns' ? 'previous 7 days' : prevMonth,
      total_spent: Math.round(sumEntries(previousPeriod)),
      transaction_count: previousPeriod.length,
      by_category: totalsByCategory(previousPeriod),
      by_merchant: totalsByMerchant(previousPeriod),
    },
    this_month: {
      total_spent: Math.round(sumEntries(monthSpend)),
      income_logged: Math.round(sumEntries(monthIncome)),
      by_category: monthByCategory,
      largest_transactions: topTransactions(monthSpend),
    },
    budgets: budgetStatus,
    goals: (goals || []).slice(0, 8).map(g => ({
      name: g.name,
      target: Number(g.target_amount),
      saved: Number(g.current_amount || 0),
      target_date: g.target_date,
    })),
    wealth: {
      investments: (investments || []).slice(0, 8).map(i => ({
        name: i.name,
        type: i.type,
        invested: Number(i.invested_amount || 0),
        current: Number(i.current_value || i.invested_amount || 0),
      })),
      assets_total: Math.round((assets || []).reduce((a, x) => a + Number(x.value || 0), 0)),
      liabilities_total: Math.round((liabilities || []).reduce((a, x) => a + Number(x.amount || 0), 0)),
    },
    upcoming_bills: (bills || []).slice(0, 8).map(b => ({
      name: b.name,
      amount: Number(b.amount),
      due_day: b.due_day,
      category: b.category?.name || null,
    })),
  };
}

export function AiPage({ expenses, budgets, goals, profile, investments, assets, liabilities, bills, onUpdateProfile }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [insightResults, setInsightResults] = useState({});
  const [insightLoading, setInsightLoading] = useState(null);
  const [onboardRisk, setOnboardRisk] = useState(null);
  const [onboardSafetyNet, setOnboardSafetyNet] = useState(null);
  const [onboardGoal, setOnboardGoal] = useState('');
  const [onboardSaving, setOnboardSaving] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const monthStart = startOfMonthStr();
  const monthExpenses = useMemo(() =>
    expenses.filter(e => e.date >= monthStart && e.type !== 'income'), [expenses, monthStart]);
  const monthIncome = useMemo(() =>
    expenses.filter(e => e.date >= monthStart && e.type === 'income')
      .reduce((a, e) => a + Number(e.amount), 0), [expenses, monthStart]);

  const income = Number(profile?.monthly_income) || monthIncome;
  const monthTotal = monthExpenses.reduce((a, e) => a + Number(e.amount), 0);
  const totalBudget = budgets.reduce((a, b) => a + b.limit_amount, 0);
  const spendable = totalBudget > 0 ? totalBudget - monthTotal : income - monthTotal;
  const savingsRate = income > 0 ? Math.round(((income - monthTotal) / income) * 100) : null;
  const totalAssets = (assets || []).reduce((a, x) => a + Number(x.value), 0);
  const totalLiabilities = (liabilities || []).reduce((a, x) => a + Number(x.amount), 0);
  const netWorth = totalAssets - totalLiabilities;
  const portfolioValue = (investments || []).reduce((a, i) => a + Number(i.current_value || i.invested_amount), 0);
  const sipMonthly = (investments || []).filter(i => i.type === 'sip').reduce((a, i) => a + Number(i.monthly_amount || 0), 0);

  const catMap = useMemo(() => {
    const map = {};
    for (const e of monthExpenses) {
      const id = e.category_id || 'other';
      if (!map[id]) map[id] = { amt: 0, name: e.category?.name || 'Other', icon: e.category?.icon || '💰', catId: id };
      map[id].amt += Number(e.amount);
    }
    return map;
  }, [monthExpenses]);

  const topCategories = Object.values(catMap).sort((a, b) => b.amt - a.amt).map(c => {
    const b = budgets.find(x => x.category_id === c.catId);
    return { ...c, budget: b?.limit_amount || 0 };
  });
  const topCat = topCategories[0];

  const budgetAdherence = budgets.length > 0
    ? budgets.filter(b => (catMap[b.category_id]?.amt || 0) <= b.limit_amount).length / budgets.length
    : 0;
  const score = healthScore(savingsRate, budgetAdherence);

  const monthlySurplus = income - monthTotal;

  const context = {
    income, monthTotal, spendable, savingsRate, netWorth, portfolioValue, sipMonthly,
    topCategories, topCat, goals, upcomingBills: bills, txCount: monthExpenses.length,
    monthlySurplus,
    riskTolerance: profile?.risk_tolerance || null,
    investingGoal: profile?.investing_goal || null,
    safetyNet: profile?.safety_net || null,
  };

  const insightCards = useMemo(() => {
    const cards = [];
    if (savingsRate !== null) {
      if (savingsRate >= 30) cards.push({ tag: 'good', emoji: '💚', title: 'Strong savings rate', body: `${savingsRate}% of income saved this month. On track to build wealth.` });
      else if (savingsRate >= 10) cards.push({ tag: 'tip', emoji: '💡', title: 'Savings on track', body: `${savingsRate}% saved. Push to 30%+ for faster wealth building.` });
      else cards.push({ tag: 'warn', emoji: '⚠️', title: 'Low savings rate', body: `Only ${savingsRate}% saved this month. Review biggest spend categories.` });
    }
    if (topCat && monthTotal > 0) {
      const pct = Math.round((topCat.amt / monthTotal) * 100);
      if (pct > 40) cards.push({ tag: 'tip', emoji: '🎯', title: `${topCat.name} dominates`, body: `${pct}% of spend. Consider setting a budget cap for balance.` });
    }
    if (budgets.length > 0) {
      const over = budgets.filter(b => (catMap[b.category_id]?.amt || 0) > b.limit_amount).length;
      if (over > 0) cards.push({ tag: 'warn', emoji: '🚨', title: `${over} budget${over > 1 ? 's' : ''} exceeded`, body: 'Review overspent categories to get back on track.' });
    }
    cards.push({ tag: 'tip', emoji: '💬', title: 'Ask the Coach', body: 'Type a question below to get personalised advice based on your real data.' });
    return cards.slice(0, 4);
  }, [savingsRate, topCat, budgets, catMap, monthTotal]);

  async function ask(q) {
    if (!q.trim()) return;
    setInput('');
    setMessages(m => [...m, { role: 'user', content: q }]);
    setTyping(true);
    try {
      const prompt = buildCoachPrompt(q, context);
      const reply = await callAiChat(prompt, {}, []);
      setMessages(m => [...m, { role: 'ai', content: reply }]);
    } catch {
      setMessages(m => [...m, { role: 'ai', content: coachFallback(q, context) }]);
    } finally {
      setTyping(false);
    }
  }

  async function generateInsight(feature) {
    if (insightLoading) return;
    setInsightLoading(feature);
    try {
      const data = buildAiInsightData(feature, { expenses, budgets, goals, profile, investments, assets, liabilities, bills, monthlySurplus });
      const suggestion = await callAiSuggest(feature, data);
      setInsightResults(current => ({ ...current, [feature]: suggestion }));
    } catch (err) {
      setInsightResults(current => ({
        ...current,
        [feature]: `Could not generate this insight right now. ${err.message || 'Please try again.'}`,
      }));
    } finally {
      setInsightLoading(null);
    }
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); ask(input); }
  }

  async function submitOnboarding() {
    if (!onboardRisk || !onboardSafetyNet || onboardSaving) return;
    setOnboardSaving(true);
    try {
      await onUpdateProfile?.({
        risk_tolerance: onboardRisk,
        safety_net: onboardSafetyNet,
        investing_goal: onboardGoal.trim() || 'long-term wealth',
      });
    } finally {
      setOnboardSaving(false);
    }
  }

  return (
    <div className="coach-layout">
      {/* LEFT: Score + insights */}
      <div>
        <div className="score-hero rise" style={{ '--d': '0ms' }}>
          <div className="eyebrow" style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 12 }}>FINANCIAL HEALTH</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <div className="score-big num">{score}</div>
            <div className="score-denom">/100</div>
          </div>
          <div style={{ marginTop: 8 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: 'var(--r-pill)', padding: '5px 12px', fontSize: 12, fontWeight: 700 }}>
              {score >= 75 ? '✓ Excellent' : score >= 50 ? '↑ Good' : '⚠ Needs attention'}
            </span>
          </div>
          <div className="score-splits">
            {savingsRate !== null && (
              <div className="score-split">
                <div className="ss-label">Savings rate</div>
                <div className="ss-val num">{savingsRate}%</div>
              </div>
            )}
            <div className="score-split">
              <div className="ss-label">Budgets kept</div>
              <div className="ss-val num">{Math.round(budgetAdherence * 100)}%</div>
            </div>
            <div className="score-split">
              <div className="ss-label">Streak</div>
              <div className="ss-val num">{profile?.current_streak || 0}d</div>
            </div>
          </div>
        </div>

        <div className="sec-head" style={{ marginTop: 24 }}><h3>What I noticed</h3></div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {insightCards.map((ins, i) => (
            <div key={i} className="ins-card rise" style={{ '--d': `${(i + 1) * 80}ms` }}>
              <div className={`ins-tag ${ins.tag}`}>{ins.emoji} {ins.tag === 'good' ? 'Great' : ins.tag === 'warn' ? 'Watch out' : 'Tip'}</div>
              <div className="ins-title">{ins.title}</div>
              <div className="ins-body">{ins.body}</div>
            </div>
          ))}
        </div>

        {!profile?.investing_goal && (
          <div className="card pad rise" style={{ marginTop: 24 }}>
            <div className="sec-head" style={{ marginBottom: 4 }}><h3>Help me coach your investing</h3></div>
            <div className="ai-story-sub" style={{ marginBottom: 14 }}>
              Quick one-time questions so the coach can tailor investing advice to you. Takes 30 seconds.
            </div>

            <div style={{ marginBottom: 12 }}>
              <div className="ss-label" style={{ marginBottom: 6 }}>How comfortable are you with risk?</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {RISK_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    className={onboardRisk === opt.id ? 'btn-accent' : 'btn-ghost'}
                    style={{ padding: '6px 14px' }}
                    onClick={() => setOnboardRisk(opt.id)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 12 }}>
              <div className="ss-label" style={{ marginBottom: 6 }}>Do you have a safety net?</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {SAFETY_NET_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    className={onboardSafetyNet === opt.id ? 'btn-accent' : 'btn-ghost'}
                    style={{ padding: '6px 14px' }}
                    onClick={() => setOnboardSafetyNet(opt.id)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <div className="ss-label" style={{ marginBottom: 6 }}>What's your investing goal? (optional)</div>
              <input
                className="chat-input"
                placeholder="e.g. long-term wealth, a house down payment…"
                value={onboardGoal}
                onChange={e => setOnboardGoal(e.target.value)}
              />
            </div>

            <button
              className="btn-accent"
              style={{ padding: '8px 16px' }}
              onClick={submitOnboarding}
              disabled={!onboardRisk || !onboardSafetyNet || onboardSaving}
            >
              {onboardSaving ? 'Saving…' : 'Save and start'}
            </button>
          </div>
        )}

        <div className="sec-head" style={{ marginTop: 24 }}><h3>AI money stories</h3></div>
        <div className="ai-story-grid">
          {AI_INSIGHTS.map(item => (
            <div key={item.id} className="ai-story-card">
              <div>
                <div className="ai-story-title">{item.title}</div>
                <div className="ai-story-sub">{item.body}</div>
              </div>
              <button
                className="btn-ghost"
                style={{ padding: '8px 12px', alignSelf: 'flex-start' }}
                onClick={() => generateInsight(item.id)}
                disabled={Boolean(insightLoading)}
              >
                {insightLoading === item.id ? 'Thinking...' : insightResults[item.id] ? 'Refresh' : 'Generate'}
              </button>
              {insightResults[item.id] && (
                <div className="ai-story-result">
                  {insightResults[item.id]}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT: Chat panel */}
      <div>
        <div className="chat-panel rise" style={{ '--d': '100ms' }}>
          <div className="chat-header">
            <div className="brand-mark" style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(150deg, var(--accent), var(--accent-2))', display: 'grid', placeItems: 'center', color: 'var(--on-accent)', flexShrink: 0 }}>
              <Icon name="sparkle" size={17} />
            </div>
            <div>
              <div className="chat-header-title">Rupee Coach</div>
              <div className="chat-header-sub">Powered by OpenAI</div>
            </div>
          </div>

          <div className="chat-messages">
            {messages.length === 0 && (
              <div className="chat-bubble ai" style={{ maxWidth: '90%' }}>
                Hey! I'm your Rupee Coach. Ask me anything about your finances — affordability, savings, goals, or where your money's going.
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`chat-bubble ${msg.role}`}>{msg.content}</div>
            ))}
            {typing && (
              <div className="chat-typing">
                <span /><span /><span />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-suggestions">
            {SUGGESTIONS.map((s, i) => (
              <button key={i} className="chat-suggestion" onClick={() => ask(s)}>{s}</button>
            ))}
          </div>

          <div className="chat-input-row">
            <input
              className="chat-input"
              placeholder="Ask about your finances…"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              disabled={typing}
            />
            <button
              className="btn-accent"
              style={{ padding: '10px 14px', borderRadius: 'var(--r-pill)' }}
              onClick={() => ask(input)}
              disabled={typing || !input.trim()}
            >
              <Icon name="send" size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
