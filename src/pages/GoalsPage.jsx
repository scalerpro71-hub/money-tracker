import { useState } from 'react';
import { AddGoalModal } from '../components/goals/AddGoalModal';
import { useToast } from '../components/layout/Toast';
import { Icon } from '../components/layout/Icon';
import { cur, fmtK } from '../lib/formatUtils';

function GoalCard({ goal, onEdit, onDelete, index }) {
  const pct = goal.target_amount > 0
    ? Math.min(100, Math.round((goal.current_amount / goal.target_amount) * 100))
    : 0;
  const remaining = Math.max(0, goal.target_amount - goal.current_amount);
  const monthsLeft = goal.target_date
    ? Math.max(1, Math.ceil((new Date(goal.target_date) - new Date()) / (1000 * 60 * 60 * 24 * 30)))
    : null;
  const monthlyNeeded = monthsLeft ? Math.ceil(remaining / monthsLeft) : null;

  return (
    <div className="goal-card rise" style={{ '--d': `${index * 60}ms` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div className="goal-emoji-tile">{goal.emoji || '🎯'}</div>
        <div style={{ display: 'flex', gap: 4 }}>
          <button className="icon-btn" style={{ width: 32, height: 32 }} onClick={() => onEdit(goal)}>
            <Icon name="gear" size={15} />
          </button>
          <button className="icon-btn" style={{ width: 32, height: 32, color: 'var(--neg)' }} onClick={() => onDelete(goal.id)}>
            ×
          </button>
        </div>
      </div>
      <div className="goal-name">{goal.name}</div>
      {goal.target_date && (
        <div className="goal-sub">{new Date(goal.target_date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</div>
      )}
      <div className="goal-amounts">
        <span className="goal-current num">{fmtK(goal.current_amount || 0)}</span>
        <span className="goal-target"> of {fmtK(goal.target_amount)}</span>
      </div>
      <div className="goal-bar">
        <div className="goal-bar-fill" style={{ width: pct + '%' }} />
      </div>
      <div className="goal-stats">
        <div className="goal-stat">{pct}% <span>funded</span></div>
        {monthsLeft && <div className="goal-stat">{monthsLeft} <span>mo left</span></div>}
        {monthlyNeeded && <div className="goal-stat">{fmtK(monthlyNeeded)}<span>/mo</span></div>}
      </div>
    </div>
  );
}

export function GoalsPage({ goals, onAdd, onUpdate, onDelete }) {
  const [showAdd, setShowAdd] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const toast = useToast();

  async function handleAdd(data) { await onAdd(data); toast('Goal added!'); setShowAdd(false); }
  async function handleUpdate(data) { await onUpdate(editingGoal.id, data); toast('Goal updated'); setEditingGoal(null); }
  async function handleDelete(id) {
    if (!confirm('Delete this goal?')) return;
    await onDelete(id);
    toast('Goal deleted');
  }

  return (
    <div>
      <div className="sec-head" style={{ marginTop: 0 }}>
        <h3>Savings Goals</h3>
        <button className="btn-accent" onClick={() => setShowAdd(true)}>
          <Icon name="plus" size={15} />New goal
        </button>
      </div>

      <div className="goals-grid">
        {goals.map((g, i) => (
          <GoalCard key={g.id} goal={g} onEdit={setEditingGoal} onDelete={handleDelete} index={i} />
        ))}
        <button className="goal-new-card" onClick={() => setShowAdd(true)}>
          <Icon name="plus" size={24} />
          <span style={{ fontWeight: 700, fontSize: 14 }}>New goal</span>
        </button>
      </div>

      {(showAdd || editingGoal) && (
        <AddGoalModal
          initialData={editingGoal}
          onAdd={editingGoal ? handleUpdate : handleAdd}
          onClose={() => { setShowAdd(false); setEditingGoal(null); }}
        />
      )}
    </div>
  );
}
