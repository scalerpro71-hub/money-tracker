import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { evaluatePlan } from '../../lib/journey/planCriteria';
import { useGoalMutations } from '../../lib/queries';
import { useToast } from '../../components/layout/Toast';
import { Icon } from '../../components/layout/Icon';
import { cur } from '../../lib/formatUtils';
import { AddInvestmentModal } from './AddInvestmentModal';

function StatusMark({ step }) {
  if (step.status === 'done') {
    return (
      <div className="lp-action-ico" style={{ flexShrink: 0 }}>
        <Icon name="check" size={16} />
      </div>
    );
  }
  const current = step.status === 'current';
  return (
    <div
      style={{
        width: 34, height: 34, borderRadius: 12, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: current ? 16 : 14, fontWeight: 800,
        background: current ? 'var(--accent-soft, rgba(120,120,255,0.14))' : 'var(--surface-2, transparent)',
        border: '1px solid var(--hair)',
        color: current ? 'var(--ink)' : 'var(--ink-4)',
      }}
    >
      {current ? step.emoji : step.order}
    </div>
  );
}

function StepCard({ step, snapshot, onSwitchTab }) {
  const [modal, setModal] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const { add: addGoal } = useGoalMutations();
  const toast = useToast();
  const navigate = useNavigate();

  const open = step.status === 'current' || expanded;
  const muted = step.status === 'upcoming' || step.status === 'optional';

  async function handleCta() {
    const { kind } = step.cta;
    if (kind === 'log-investment') { setModal(true); return; }
    if (kind === 'goals') {
      if (step.id === 'cushion' && !snapshot.efGoal) {
        const target = Math.max(10000, Math.round((snapshot.monthlyExpenseBaseline * 3) / 1000) * 1000);
        try {
          await addGoal.mutateAsync({ name: 'Emergency Fund', kind: 'emergency_fund', target_amount: target, current_amount: 0 });
          toast('Emergency Fund goal created 🛡️');
        } catch (err) { toast(err.message, 'error'); }
      }
      onSwitchTab('goals');
      return;
    }
    onSwitchTab(kind); // 'portfolio' | 'explore'
  }

  return (
    <div className="card pad" style={{ marginBottom: 12, opacity: muted && !open ? 0.72 : 1 }}>
      <div
        style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: step.status === 'current' ? 'default' : 'pointer' }}
        onClick={() => step.status !== 'current' && setExpanded(e => !e)}
      >
        <StatusMark step={step} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="eyebrow">Step {step.order}</span>
            {step.optional && <span className="chip" style={{ fontSize: 10.5 }}>optional</span>}
            {step.status === 'current' && <span className="chip" style={{ fontSize: 10.5 }}>you are here</span>}
          </div>
          <div style={{ fontWeight: 800, fontSize: 15.5, marginTop: 2 }}>{step.title}</div>
        </div>
        {step.status !== 'current' && (
          <Icon name="chevD" size={15} style={{ color: 'var(--ink-4)', transform: open ? 'rotate(180deg)' : 'none' }} />
        )}
      </div>

      <div className="jm-bar" style={{ marginTop: 12 }}>
        <div className="jm-bar-fill" style={{ width: `${Math.round(step.progress * 100)}%` }} />
      </div>
      <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--ink-3)', marginTop: 6 }}>{step.label}</div>

      {open && (
        <div className="anim-fadeUp" style={{ marginTop: 12 }}>
          <p className="lp-p" style={{ margin: 0 }}>{step.why}</p>

          {step.status !== 'done' && (
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 12 }}>
              <span className="num" style={{ fontSize: 22, fontWeight: 800 }}>{cur(step.amount)}</span>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--ink-3)' }}>{step.amountCap}</span>
            </div>
          )}

          {step.fear && step.status !== 'done' && (
            <div className="lp-callout" style={{ marginTop: 12 }}>
              <div className="lp-callout-emoji">😨</div>
              <div>
                <div className="lp-callout-title">The fear, measured</div>
                <div className="lp-callout-text">{step.fear}</div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginTop: 14 }}>
            {step.status !== 'done' && (
              <button className="btn-accent" style={{ padding: '10px 16px', fontSize: 13.5 }} onClick={handleCta}>
                {step.cta.label}
              </button>
            )}
            <button
              className="more-link"
              onClick={() => navigate('/coach', { state: { ask: step.coachQuestion } })}
            >
              Ask coach about this
            </button>
            {step.optionId && (
              <Link to={`/invest/options/${step.optionId}`} className="more-link">
                Learn more →
              </Link>
            )}
          </div>
        </div>
      )}

      {modal && (
        <AddInvestmentModal
          preset={{ type: step.cta.presetType, monthly_amount: step.cta.presetType === 'sip' ? step.amount : undefined }}
          onClose={() => setModal(false)}
        />
      )}
    </div>
  );
}

export function PlanTab({ snapshot, onSwitchTab }) {
  const steps = evaluatePlan(snapshot);
  const done = steps.filter(s => s.status === 'done').length;
  const current = steps.find(s => s.status === 'current');

  return (
    <div>
      <div className="card pad" style={{ marginBottom: 16 }}>
        <div className="eyebrow" style={{ marginBottom: 4 }}>Your starter plan</div>
        <div style={{ fontWeight: 800, fontSize: 17 }}>
          {done === steps.length
            ? 'All steps done — you built the whole base 🎉'
            : current
              ? `Step ${current.order} of ${steps.length}: ${current.title}`
              : 'Core plan complete — step 5 is optional'}
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-3)', marginTop: 4, lineHeight: 1.5 }}>
          Every step completes on its own when your real numbers move — no checkboxes.
          The amounts are sized from your own income and spending.
        </div>
      </div>

      {steps.map(step => (
        <StepCard key={step.id} step={step} snapshot={snapshot} onSwitchTab={onSwitchTab} />
      ))}

      <div className="lp-disclaimer" style={{ marginTop: 16 }}>
        This plan teaches a sequence, not products — PaisaCoach never recommends specific funds,
        stocks or platforms. Education, not SEBI-registered investment advice.
      </div>
    </div>
  );
}
