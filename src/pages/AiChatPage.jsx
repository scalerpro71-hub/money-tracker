import { useState, useRef, useEffect } from 'react';
import { callAiChat } from '../lib/claudeApi';
import { daysAgoStr, startOfMonthStr, daysRemainingInMonth } from '../lib/dateUtils';
import '../styles/ai-chat.css';

const SUGGESTIONS = [
  "How much did I spend this month?",
  "What's my biggest expense category?",
  "Am I on track with my budgets?",
  "How can I save more money?",
  "Compare this week vs last week",
  "What are my top 5 expenses?",
];

function buildContext(expenses, budgets, goals, profile) {
  const monthStart = startOfMonthStr();
  const last90 = daysAgoStr(90);

  const recent = expenses.filter(e => e.date >= last90);
  const thisMonth = expenses.filter(e => e.date >= monthStart);

  const byCategory = {};
  for (const e of recent) {
    const name = e.category?.name || 'Uncategorized';
    byCategory[name] = (byCategory[name] || 0) + Number(e.amount);
  }

  const monthByCategory = {};
  for (const e of thisMonth) {
    const name = e.category?.name || 'Uncategorized';
    monthByCategory[name] = (monthByCategory[name] || 0) + Number(e.amount);
  }

  const top5 = [...thisMonth]
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5)
    .map(e => ({ note: e.note || e.category?.name, amount: Number(e.amount), category: e.category?.name, date: e.date }));

  const budgetStatus = budgets.map(b => ({
    category: b.category?.name || b.category_id,
    limit: b.limit_amount,
    spent: monthByCategory[b.category?.name] || 0,
    remaining: b.limit_amount - (monthByCategory[b.category?.name] || 0),
  }));

  const goalsList = goals.map(g => ({
    name: g.name,
    target: g.target_amount,
    saved: g.current_amount,
    remaining: g.target_amount - g.current_amount,
    target_date: g.target_date,
  }));

  return {
    profile: {
      monthly_income: profile?.monthly_income || null,
      currency: 'INR',
    },
    this_month: {
      total_spent: thisMonth.reduce((a, e) => a + Number(e.amount), 0),
      transaction_count: thisMonth.length,
      by_category: monthByCategory,
      top_5_expenses: top5,
      days_remaining: daysRemainingInMonth(),
    },
    last_90_days_by_category: byCategory,
    budgets: budgetStatus,
    goals: goalsList,
  };
}

function ChatBubble({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`chat-bubble-wrap ${isUser ? 'chat-bubble-wrap--user' : 'chat-bubble-wrap--ai'}`}>
      {!isUser && <div className="chat-avatar">✨</div>}
      <div className={`chat-bubble ${isUser ? 'chat-bubble--user' : 'chat-bubble--ai'}`}>
        {msg.content}
      </div>
    </div>
  );
}

export function AiChatPage({ userId, expenses, budgets, goals, profile }) {
  const [history, setHistory] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [contextSent, setContextSent] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, loading]);

  async function send(text) {
    const msg = text.trim();
    if (!msg || loading) return;

    setInput('');
    const userMsg = { role: 'user', content: msg };
    setHistory(h => [...h, userMsg]);
    setLoading(true);

    try {
      const ctx = !contextSent ? buildContext(expenses, budgets, goals, profile) : null;
      if (!contextSent) setContextSent(true);

      const reply = await callAiChat(msg, ctx, history);
      setHistory(h => [...h, { role: 'assistant', content: reply }]);
    } catch (err) {
      setHistory(h => [...h, { role: 'assistant', content: `Sorry, something went wrong: ${err.message}` }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  }

  return (
    <div className="chat-page">
      <div className="chat-messages">
        {history.length === 0 && (
          <div className="chat-empty">
            <div className="chat-empty-icon">✨</div>
            <div className="chat-empty-title">Ask me anything about your money</div>
            <div className="chat-empty-sub">I have access to your expenses, budgets, and goals.</div>
            <div className="chat-suggestions">
              {SUGGESTIONS.map(s => (
                <button key={s} className="chat-suggestion" onClick={() => send(s)}>{s}</button>
              ))}
            </div>
          </div>
        )}

        {history.map((msg, i) => <ChatBubble key={i} msg={msg} />)}

        {loading && (
          <div className="chat-bubble-wrap chat-bubble-wrap--ai">
            <div className="chat-avatar">✨</div>
            <div className="chat-bubble chat-bubble--ai chat-bubble--typing">
              <span /><span /><span />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="chat-input-bar">
        <textarea
          ref={inputRef}
          className="chat-input"
          placeholder="Ask about your spending..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          rows={1}
        />
        <button
          className="chat-send"
          onClick={() => send(input)}
          disabled={!input.trim() || loading}
          aria-label="Send"
        >
          ↑
        </button>
      </div>
    </div>
  );
}
