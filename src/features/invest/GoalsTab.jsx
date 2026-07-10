import { useState } from 'react';
import { useGoals, useGoalMutations } from '../../lib/queries';
import { useToast } from '../../components/layout/Toast';
import { Modal } from '../../components/layout/Modal';
import { Icon } from '../../components/layout/Icon';
import { cur } from '../../lib/formatUtils';

function GoalModal({ initial, efSuggestedTarget, onClose }) {
  const { add, update } = useGoalMutations();
  const toast = useToast();
  const editing = !!initial;
  const isEf = initial?.kind === 'emergency_fund';
  const [name, setName] = useState(initial?.name || '');
  const [target, setTarget] = useState(initial?.target_amount || (isEf ? efSuggestedTarget : ''));
  const [current, setCurrent] = useState(initial?.current_amount ?? 0);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      const row = { name: name.trim(), target_amount: Number(target), current_amount: Number(current) || 0 };
      if (editing) {
        await update.mutateAsync({ id: initial.id, ...row });
        toast('Goal updated');
      } else {
        await add.mutateAsync({ ...row, kind: 'custom' });
        toast('Goal created 🎯');
      }
      onClose();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={editing ? `Update ${isEf ? 'Emergency Fund' : 'goal'}` : 'New savings goal'} onClose={onClose}>
      {!isEf && (
        <div className="form-group">
          <label>What are you saving for?</label>
          <input autoFocus value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Goa trip, new laptop" />
        </div>
      )}
      <div className="form-row">
        <div className="form-group">
          <label>Target</label>
          <input type="number" inputMode="numeric" min="0" value={target} onChange={e => setTarget(e.target.value)} placeholder="₹" />
        </div>
        <div className="form-group">
          <label>Saved so far</label>
          <input type="number" inputMode="numeric" min="0" value={current} onChange={e => setCurrent(e.target.value)} autoFocus={isEf} />
        </div>
      </div>
      <button className="btn-primary" onClick={save} disabled={saving || !name.trim() || !(Number(target) > 0)}>
        {saving ? 'Saving…' : 'Save'}
      </button>
    </Modal>
  );
}

export function GoalsTab({ snapshot }) {
  const { data: goals = [] } = useGoals();
  const { add, remove } = useGoalMutations();
  const toast = useToast();
  const [modal, setModal] = useState(null); // 'new' | goal row

  const efSuggestedTarget = Math.max(10000, Math.round((snapshot.monthlyExpenseBaseline * 3) / 1000) * 1000);
  const efGoal = goals.find(g => g.kind === 'emergency_fund');
  const ordered = [...goals].sort((a, b) => (a.kind === 'emergency_fund' ? -1 : b.kind === 'emergency_fund' ? 1 : 0));

  async function createEf() {
    try {
      await add.mutateAsync({ name: 'Emergency Fund', kind: 'emergency_fund', target_amount: efSuggestedTarget, current_amount: 0 });
      toast('Emergency Fund goal created 🛡️');
    } catch (err) { toast(err.message, 'error'); }
  }

  async function handleDelete(goal) {
    if (!confirm(`Delete the "${goal.name}" goal?`)) return;
    try { await remove.mutateAsync(goal.id); toast('Deleted'); }
    catch (err) { toast(err.message, 'error'); }
  }

  return (
    <div>
      {!efGoal && (
        <div className="card pad" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <div style={{ fontSize: 30 }}>🛡️</div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontWeight: 800, fontSize: 14.5 }}>No emergency fund yet</div>
            <div style={{ fontSize: 12.5, color: 'var(--ink-3)', fontWeight: 600, marginTop: 2 }}>
              The journey's most important goal — about {cur(efSuggestedTarget)} (3 months) for you.
            </div>
          </div>
          <button className="btn-accent" style={{ padding: '10px 16px', fontSize: 13.5 }} onClick={createEf}>Create it</button>
        </div>
      )}

      <div className="goals-grid">
        {ordered.map(goal => {
          const pct = goal.target_amount > 0 ? Math.min(100, Math.round((goal.current_amount / goal.target_amount) * 100)) : 0;
          const isEf = goal.kind === 'emergency_fund';
          return (
            <div key={goal.id} className="goal-card" onClick={() => setModal(goal)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div className="goal-emoji-tile">{isEf ? '🛡️' : '🎯'}</div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button
                    className="icon-btn" style={{ width: 28, height: 28 }} aria-label="Edit goal"
                    onClick={e => { e.stopPropagation(); setModal(goal); }}
                  ><Icon name="edit" size={12} /></button>
                  <button
                    className="icon-btn" style={{ width: 28, height: 28 }} aria-label="Delete goal"
                    onClick={e => { e.stopPropagation(); handleDelete(goal); }}
                  >×</button>
                </div>
              </div>
              <div className="goal-name">{goal.name}</div>
              {isEf && (
                <div className="goal-sub">
                  {snapshot.efMonthsCovered >= 1
                    ? `${snapshot.efMonthsCovered.toFixed(1)} months of expenses covered`
                    : 'First milestone: 1 month of expenses'}
                </div>
              )}
              <div className="goal-amounts">
                <span className="goal-current">{cur(Math.round(goal.current_amount))}</span>
                <span className="goal-target">/ {cur(Math.round(goal.target_amount))}</span>
              </div>
              <div className="goal-bar">
                <div className="goal-bar-fill" style={{ width: `${pct}%` }} />
              </div>
              <div className="goal-stats">
                <span className="goal-stat"><span>{pct}%</span> there</span>
                <span className="goal-stat">tap to update</span>
              </div>
            </div>
          );
        })}

        <button className="goal-new-card" onClick={() => setModal('new')}>
          <Icon name="plus" size={22} />
          <span style={{ fontSize: 13.5, fontWeight: 700 }}>New goal</span>
        </button>
      </div>

      {modal && (
        <GoalModal initial={modal === 'new' ? null : modal} efSuggestedTarget={efSuggestedTarget} onClose={() => setModal(null)} />
      )}
    </div>
  );
}
