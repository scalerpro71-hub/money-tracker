import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuthCtx } from '../../app/auth-context';
import { useProfile, useUpdateProfile } from '../../lib/queries';
import { Icon } from '../../components/layout/Icon';

const STEP_SPRING = { type: 'spring', stiffness: 320, damping: 30, mass: 0.9 };

const EXPERIENCE_OPTIONS = [
  { value: 'beginner', emoji: '🌱', title: 'Total beginner', sub: "I've never invested — I don't even know where to start" },
  { value: 'curious', emoji: '👀', title: 'Curious but confused', sub: "I've read a bit, but it all feels overwhelming" },
  { value: 'dabbled', emoji: '🧪', title: "I've dabbled", sub: 'I tried something once (a stock, a fund) without a plan' },
];

const GOAL_OPTIONS = [
  { value: 'stop_living_paycheck', emoji: '🛟', title: 'Stop living paycheck to paycheck', sub: 'I want money left at the end of the month' },
  { value: 'build_safety_net', emoji: '🛡️', title: 'Build a safety net', sub: 'An emergency fund so surprises don\'t sink me' },
  { value: 'grow_wealth', emoji: '📈', title: 'Grow long-term wealth', sub: 'Make my money work while I sleep' },
  { value: 'big_goal', emoji: '🏠', title: 'Save for something big', sub: 'A home, a wedding, a sabbatical…' },
];

const RISK_OPTIONS = [
  { value: 'low', emoji: '🐢', title: 'Slow and steady', sub: "I'd rather grow slowly than see my money dip" },
  { value: 'medium', emoji: '⚖️', title: 'Balanced', sub: 'Some ups and downs are fine for better growth' },
  { value: 'high', emoji: '🚀', title: 'Growth-first', sub: "Short-term dips don't scare me" },
];

const SAFETY_OPTIONS = [
  { value: 'none', emoji: '🪂', title: 'No safety net yet', sub: 'If income stopped, I\'d be in trouble fast' },
  { value: 'family_support', emoji: '👨‍👩‍👧', title: 'Family has my back', sub: 'Family could support me if things went wrong' },
  { value: 'own_emergency_fund', emoji: '🏦', title: 'I have some savings', sub: 'I could cover a few months myself' },
];

function OptionCards({ options, value, onPick }) {
  return (
    <div className="ob-options">
      {options.map(opt => (
        <button
          key={opt.value}
          className={`ob-option${value === opt.value ? ' on' : ''}`}
          onClick={() => onPick(opt.value)}
        >
          <span className="ob-option-emoji">{opt.emoji}</span>
          <span className="ob-option-text">
            <span className="ob-option-title">{opt.title}</span>
            <span className="ob-option-sub">{opt.sub}</span>
          </span>
          <span className="ob-option-check"><Icon name="check" size={16} /></span>
        </button>
      ))}
    </div>
  );
}

export function OnboardingPage() {
  const { user } = useAuthCtx();
  const { data: profile } = useProfile();
  const updateProfile = useUpdateProfile();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [name, setName] = useState(profile?.full_name || user?.user_metadata?.full_name || '');
  const [income, setIncome] = useState(profile?.monthly_income || '');
  const [payday, setPayday] = useState(profile?.payday_day || 1);
  const [experience, setExperience] = useState(null);
  const [goal, setGoal] = useState(null);
  const [risk, setRisk] = useState(null);
  const [safety, setSafety] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const steps = useMemo(() => ([
    { id: 'welcome', canNext: name.trim().length > 0 },
    { id: 'income', canNext: Number(income) > 0 },
    { id: 'experience', canNext: !!experience },
    { id: 'goal', canNext: !!goal },
    { id: 'risk', canNext: !!risk },
    { id: 'safety', canNext: !!safety },
    { id: 'journey', canNext: true },
  ]), [name, income, experience, goal, risk, safety]);

  const current = steps[step];
  const isLast = step === steps.length - 1;

  function go(delta) {
    setDir(delta);
    setStep(s => Math.min(steps.length - 1, Math.max(0, s + delta)));
  }

  function pickAndAdvance(setter) {
    return (value) => {
      setter(value);
      setTimeout(() => go(1), 220);
    };
  }

  async function finish() {
    setSaving(true);
    setError('');
    try {
      await updateProfile.mutateAsync({
        full_name: name.trim(),
        monthly_income: Number(income),
        payday_day: Number(payday),
        investing_experience: experience,
        investing_goal: goal,
        risk_tolerance: risk,
        safety_net: safety,
        onboarded_at: new Date().toISOString(),
      });
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'Could not save your profile. Please try again.');
      setSaving(false);
    }
  }

  return (
    <div className="ob-page">
      <div className="ob-shell">
        <div className="ob-top">
          {step > 0 ? (
            <button className="icon-btn" onClick={() => go(-1)} aria-label="Back">
              <Icon name="chevL" size={18} />
            </button>
          ) : <div style={{ width: 40 }} />}
          <div className="ob-progress">
            {steps.map((s, i) => (
              <div key={s.id} className={`ob-progress-seg${i <= step ? ' filled' : ''}`} />
            ))}
          </div>
          <div style={{ width: 40 }} />
        </div>

        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={current.id}
            className="ob-step"
            initial={{ opacity: 0, x: dir * 32 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: dir * -32, transition: { duration: 0.15 } }}
            transition={STEP_SPRING}
          >
            {current.id === 'welcome' && (
              <>
                <div className="ob-emoji anim-float2">👋</div>
                <h1 className="ob-title">Welcome to PaisaCoach</h1>
                <p className="ob-sub">
                  Think of this as your lifetime money coach. First you'll learn where your money goes,
                  then how to save — and when you're ready, how to invest. Step by step, no jargon.
                </p>
                <label className="field-label" htmlFor="ob-name">What should we call you?</label>
                <input
                  id="ob-name"
                  className="ob-input"
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Your first name"
                  maxLength={40}
                  autoFocus
                />
              </>
            )}

            {current.id === 'income' && (
              <>
                <div className="ob-emoji">💼</div>
                <h1 className="ob-title">What lands in your account each month?</h1>
                <p className="ob-sub">
                  Your take-home income (after tax). This stays private — the coach uses it to size
                  your budgets, safety net and first investments.
                </p>
                <label className="field-label" htmlFor="ob-income">Monthly income</label>
                <div className="ob-amount-wrap">
                  <span className="ob-amount-cur">₹</span>
                  <input
                    id="ob-income"
                    className="ob-input ob-amount"
                    type="number"
                    inputMode="numeric"
                    min="0"
                    value={income}
                    onChange={e => setIncome(e.target.value)}
                    placeholder="45,000"
                    autoFocus
                  />
                </div>
                <label className="field-label" htmlFor="ob-payday">Which day does salary usually arrive?</label>
                <select id="ob-payday" className="ob-input" value={payday} onChange={e => setPayday(e.target.value)}>
                  {Array.from({ length: 28 }, (_, i) => i + 1).map(d => (
                    <option key={d} value={d}>{d}{d === 1 ? 'st' : d === 2 ? 'nd' : d === 3 ? 'rd' : 'th'} of the month</option>
                  ))}
                </select>
              </>
            )}

            {current.id === 'experience' && (
              <>
                <div className="ob-emoji">🧭</div>
                <h1 className="ob-title">How much investing have you done?</h1>
                <p className="ob-sub">Be honest — the journey adapts to where you actually are.</p>
                <OptionCards options={EXPERIENCE_OPTIONS} value={experience} onPick={pickAndAdvance(setExperience)} />
              </>
            )}

            {current.id === 'goal' && (
              <>
                <div className="ob-emoji">🎯</div>
                <h1 className="ob-title">What matters most right now?</h1>
                <p className="ob-sub">Your coach will point everything at this first.</p>
                <OptionCards options={GOAL_OPTIONS} value={goal} onPick={pickAndAdvance(setGoal)} />
              </>
            )}

            {current.id === 'risk' && (
              <>
                <div className="ob-emoji">🎢</div>
                <h1 className="ob-title">Imagine your ₹10,000 dropped to ₹9,000 for a month.</h1>
                <p className="ob-sub">Markets do this. What's your honest reaction?</p>
                <OptionCards options={RISK_OPTIONS} value={risk} onPick={pickAndAdvance(setRisk)} />
              </>
            )}

            {current.id === 'safety' && (
              <>
                <div className="ob-emoji">🪢</div>
                <h1 className="ob-title">If your income stopped tomorrow…</h1>
                <p className="ob-sub">This decides how big your safety net needs to be before you invest.</p>
                <OptionCards options={SAFETY_OPTIONS} value={safety} onPick={pickAndAdvance(setSafety)} />
              </>
            )}

            {current.id === 'journey' && (
              <>
                <div className="ob-emoji anim-breathe">🗺️</div>
                <h1 className="ob-title">Here's your journey, {name.split(' ')[0]}</h1>
                <p className="ob-sub">Seven levels from "where does my money go?" to confident investor. Each one unlocks by doing, not just reading.</p>
                <div className="ob-journey">
                  {[
                    { n: 1, title: 'Know Your Money', state: 'now' },
                    { n: 2, title: 'Where Does It Go?', state: 'next' },
                    { n: 3, title: 'Pay Yourself First', state: 'locked' },
                    { n: 4, title: 'Debt & EMI Hygiene', state: 'locked' },
                    { n: 5, title: 'Your First SIP', state: 'locked' },
                    { n: 6, title: 'Build the Basket', state: 'locked' },
                    { n: 7, title: 'Stay the Course', state: 'locked' },
                  ].map(l => (
                    <div key={l.n} className={`ob-journey-row ${l.state}`}>
                      <div className="ob-journey-dot">{l.state === 'locked' ? <Icon name="lock" size={12} /> : l.n}</div>
                      <div className="ob-journey-name">{l.title}</div>
                      {l.state === 'now' && <span className="chip accent">Start here</span>}
                    </div>
                  ))}
                </div>
              </>
            )}

            {error && <div className="auth-error" style={{ marginTop: 14 }}>{error}</div>}
          </motion.div>
        </AnimatePresence>

        <div className="ob-bottom">
          {isLast ? (
            <button className="btn-accent ob-cta" onClick={finish} disabled={saving}>
              {saving ? 'Setting up…' : 'Start Level 1'}
              {!saving && <Icon name="arrowR" size={17} />}
            </button>
          ) : (
            <button className="btn-accent ob-cta" onClick={() => go(1)} disabled={!current.canNext}>
              Continue
              <Icon name="arrowR" size={17} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
