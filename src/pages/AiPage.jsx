import { useState, useRef, useEffect, useMemo } from 'react';
import { callAiChat } from '../lib/claudeApi';
import { Icon } from '../components/layout/Icon';
import { cur, fmtK } from '../lib/formatUtils';
import { startOfMonthStr } from '../lib/dateUtils';

const SUGGESTIONS = [
  "Can I afford a ₹15,000 trip this month?",
  "What's eating my budget most?",
  "How long to reach my goals?",
  "Am I saving enough?",
  "Where should I cut spending?",
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
    topCategories, goals, upcomingBills } = context;
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

Answer only from the above data. Use ₹ Indian formatting. Keep to 2-4 short sentences. No markdown. If asked something outside personal finance, politely steer back.

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

export function AiPage({ expenses, budgets, goals, profile, investments, assets, liabilities, bills }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
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

  const context = {
    income, monthTotal, spendable, savingsRate, netWorth, portfolioValue, sipMonthly,
    topCategories, topCat, goals, upcomingBills: bills, txCount: monthExpenses.length,
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

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); ask(input); }
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
