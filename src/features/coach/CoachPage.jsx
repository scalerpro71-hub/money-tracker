import { useEffect, useMemo, useRef, useState } from 'react';
import { useJourney } from '../../lib/journey/useJourney';
import { buildCoachContext, buildWeeklyMetrics, lastWeekStart } from '../../lib/journey/aiContext';
import { callAiChat, generateWeeklyReview } from '../../lib/ai';
import { useProfile, useExpenses, useWeeklyReviews, useMarkReviewRead } from '../../lib/queries';
import { useAuthCtx } from '../../app/auth-context';
import { Icon } from '../../components/layout/Icon';
import { Spinner } from '../../components/layout/Spinner';
import { formatShortDate } from '../../lib/dateUtils';

const CHAT_KEY = 'pc-chat-v1';

const SUGGESTIONS = [
  'What should I do next?',
  'Where did my money go this month?',
  'How big should my emergency fund be?',
  'Can I afford a ₹2,000 treat this weekend?',
  "Explain SIP like I'm five",
  'How am I doing overall?',
];

function loadChat() {
  try { return JSON.parse(sessionStorage.getItem(CHAT_KEY)) ?? []; }
  catch { return []; }
}

function ReviewBody({ text }) {
  return text.split('\n').filter(Boolean).map((line, i) => {
    if (line.startsWith('Win:')) {
      return <div key={i} className="rv-line win">🏆 <strong>Win</strong>{line.slice(4)}</div>;
    }
    if (line.startsWith('Focus:')) {
      return <div key={i} className="rv-line focus">🎯 <strong>Focus</strong>{line.slice(6)}</div>;
    }
    return <p key={i} className="rv-p">{line}</p>;
  });
}

function WeeklyReviews({ snapshot, journey }) {
  const { data: reviews = [], isLoading, refetch } = useWeeklyReviews();
  const { data: expenses = [] } = useExpenses();
  const markRead = useMarkReviewRead();
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState('');
  const attempted = useRef(false);

  const weekStart = lastWeekStart();
  const hasLastWeek = reviews.some(r => r.period_start === weekStart);
  const canGenerate = snapshot.entryCount >= 3;

  async function generate() {
    setGenerating(true);
    setGenError('');
    try {
      const metrics = buildWeeklyMetrics(expenses, snapshot);
      metrics.journeyLevel = journey.current ? `${journey.current.order} - ${journey.current.title}` : null;
      await generateWeeklyReview(weekStart, metrics);
      await refetch();
    } catch (err) {
      setGenError(err.message);
    } finally {
      setGenerating(false);
    }
  }

  /* auto-generate last week's review on first visit after Monday */
  useEffect(() => {
    if (isLoading || attempted.current || hasLastWeek || !canGenerate) return;
    const guard = `pc-review-attempt-${weekStart}`;
    if (localStorage.getItem(guard)) return;
    localStorage.setItem(guard, '1');
    attempted.current = true;
    generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, hasLastWeek, canGenerate, weekStart]);

  return (
    <div>
      <div className="sec-head" style={{ marginTop: 0 }}>
        <h3>Weekly reviews</h3>
        {!hasLastWeek && canGenerate && !generating && (
          <button className="more-link" onClick={generate}>Generate last week's</button>
        )}
      </div>

      {generating && (
        <div className="card pad" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <Spinner size={20} />
          <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--ink-2)' }}>Your coach is reviewing your week…</span>
        </div>
      )}
      {genError && (
        <div className="auth-error" style={{ marginBottom: 12 }}>{genError}</div>
      )}

      {reviews.length === 0 && !generating && (
        <div className="card pad" style={{ textAlign: 'center', padding: '30px 20px', color: 'var(--ink-3)' }}>
          <div style={{ fontSize: 30, marginBottom: 8 }}>📬</div>
          <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--ink)' }}>No reviews yet</div>
          <div style={{ fontSize: 12.5, fontWeight: 600, marginTop: 4, lineHeight: 1.5 }}>
            {canGenerate
              ? 'Your first weekly review lands after a week of logging.'
              : 'Log a few expenses first — the coach reviews real weeks, not empty ones.'}
          </div>
        </div>
      )}

      {reviews.map((review, i) => {
        const unread = !review.read_at;
        return (
          <details
            key={review.id}
            className="card rv-card"
            open={i === 0}
            onToggle={e => { if (e.target.open && unread) markRead.mutate(review.id); }}
          >
            <summary className="rv-summary">
              <span className="rv-week">Week of {formatShortDate(review.period_start)}</span>
              {unread && <span className="rv-dot" />}
              <Icon name="chevD" size={15} style={{ marginLeft: 'auto', color: 'var(--ink-4)' }} />
            </summary>
            <div className="rv-body">
              <ReviewBody text={review.ai_summary || ''} />
            </div>
          </details>
        );
      })}
    </div>
  );
}

export function CoachPage() {
  const journey = useJourney();
  const { data: profile } = useProfile();
  const { user } = useAuthCtx();
  const [messages, setMessages] = useState(loadChat);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef(null);

  const userName = profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'there';

  useEffect(() => {
    sessionStorage.setItem(CHAT_KEY, JSON.stringify(messages.slice(-40)));
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, thinking]);

  const greeting = useMemo(() => {
    if (journey.loading) return '…';
    const s = journey.snapshot;
    const bits = [];
    if (s.loggingStreak > 1) bits.push(`${s.loggingStreak}-day logging streak`);
    if (s.currentSavingsRate != null && s.currentSavingsRate > 0) bits.push(`keeping ${s.currentSavingsRate}% this month`);
    const praise = bits.length ? ` You're on a ${bits.join(' and ')} — nice.` : '';
    const next = journey.nextStep ? ` Your next step: ${journey.nextStep.label.toLowerCase?.() ?? journey.nextStep.label}.` : '';
    return `Hi ${userName}! I can see your full money picture — spending, budgets, safety net, journey progress.${praise}${next} Ask me anything.`;
  }, [journey.loading, journey.snapshot, journey.nextStep, userName]);

  async function send(text) {
    const message = (text ?? input).trim();
    if (!message || thinking) return;
    setInput('');
    const nextMessages = [...messages, { role: 'user', content: message }];
    setMessages(nextMessages);
    setThinking(true);
    try {
      const context = buildCoachContext(journey.snapshot, journey, profile);
      const reply = await callAiChat(message, context, nextMessages.slice(-12));
      setMessages(m => [...m, { role: 'assistant', content: reply }]);
    } catch {
      setMessages(m => [...m, {
        role: 'assistant',
        content: "I couldn't reach the AI service just now — check your connection and try again. Your data is safe and everything else in the app still works.",
      }]);
    } finally {
      setThinking(false);
    }
  }

  if (journey.loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}><Spinner size={36} /></div>;
  }

  return (
    <div className="coach-layout">
      {/* CHAT */}
      <div className="chat-panel" style={{ position: 'static', maxHeight: 'none' }}>
        <div className="chat-header">
          <div className="avatar" style={{ width: 38, height: 38 }}><Icon name="sparkle" size={18} /></div>
          <div>
            <div className="chat-header-title">Your coach</div>
            <div className="chat-header-sub">
              Knows your numbers · Level {journey.current?.order ?? 1} of the journey
            </div>
          </div>
        </div>

        <div className="chat-messages" ref={scrollRef} style={{ minHeight: 260, maxHeight: 440 }}>
          <div className="chat-bubble ai">{greeting}</div>
          {messages.map((m, i) => (
            <div key={i} className={`chat-bubble ${m.role === 'user' ? 'user' : 'ai'}`}>{m.content}</div>
          ))}
          {thinking && (
            <div className="chat-typing"><span /><span /><span /></div>
          )}
        </div>

        <div className="chat-suggestions">
          {SUGGESTIONS.map(s => (
            <button key={s} className="chat-suggestion" onClick={() => send(s)}>{s}</button>
          ))}
        </div>

        <div className="chat-input-row">
          <input
            className="chat-input"
            placeholder="Ask about your money…"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
          />
          <button
            className="btn-accent" style={{ padding: '11px 14px' }}
            onClick={() => send()} disabled={thinking || !input.trim()}
            aria-label="Send"
          >
            <Icon name="send" size={16} />
          </button>
        </div>
      </div>

      {/* REVIEWS */}
      <WeeklyReviews snapshot={journey.snapshot} journey={journey} />
    </div>
  );
}
