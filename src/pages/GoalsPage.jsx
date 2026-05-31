import { useState } from 'react';
import { GoalCard } from '../components/goals/GoalCard';
import { AddGoalModal } from '../components/goals/AddGoalModal';
import { useToast } from '../components/layout/Toast';

export function GoalsPage({ goals, onAdd, onUpdate, onDelete }) {
  const [showAdd, setShowAdd] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const toast = useToast();

  async function handleAdd(data) { await onAdd(data); toast('Goal added!'); }
  async function handleUpdate(data) { await onUpdate(editingGoal.id, data); toast('Goal updated'); }
  async function handleDelete(id) {
    if (!confirm('Delete this goal?')) return;
    await onDelete(id);
    toast('Goal deleted');
  }

  return (
    <div className="page">
      <div className="page-header">
        <h2>Savings Goals</h2>
        <button className="btn-primary btn-sm" onClick={() => setShowAdd(true)}>+ Add Goal</button>
      </div>

      {goals.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: 48 }}>🎯</div>
          <p>No goals yet</p>
          <p className="empty-sub">Set a savings goal and let AI build your plan</p>
          <button className="btn-primary" onClick={() => setShowAdd(true)}>Add your first goal</button>
        </div>
      ) : (
        <div className="goals-list">
          {goals.map(g => <GoalCard key={g.id} goal={g} onEdit={setEditingGoal} onDelete={handleDelete} />)}
        </div>
      )}

      {(showAdd || editingGoal) && (
        <AddGoalModal initialData={editingGoal} onAdd={editingGoal ? handleUpdate : handleAdd}
          onClose={() => { setShowAdd(false); setEditingGoal(null); }} />
      )}
    </div>
  );
}
