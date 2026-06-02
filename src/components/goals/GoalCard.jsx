import { formatINR, formatDate } from '../../lib/dateUtils';

export function GoalCard({ goal, onEdit, onDelete }) {
  const pct = Math.min((Number(goal.current_amount) / Number(goal.target_amount)) * 100, 100);
  const remaining = Number(goal.target_amount) - Number(goal.current_amount);

  return (
    <div className="goal-card">
      <div className="goal-header">
        <div>
          <h4 className="goal-name">{goal.name}</h4>
          {goal.target_date && <div className="goal-date">🗓️ By {formatDate(goal.target_date)}</div>}
        </div>
        <div className="goal-actions">
          <button className="btn-icon" onClick={() => onEdit(goal)}>✏️</button>
          <button className="btn-icon" onClick={() => onDelete(goal.id)}>🗑️</button>
        </div>
      </div>
      <div className="goal-amounts">
        <span className="goal-current">{formatINR(goal.current_amount)} saved</span>
        <span className="goal-target">of {formatINR(goal.target_amount)}</span>
      </div>
      <div className="budget-bar-bg">
        <div className="goal-bar-fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="goal-footer">
        <span className="goal-pct">{pct.toFixed(0)}% complete</span>
        {remaining > 0 && <span className="goal-remaining">{formatINR(remaining)} to go</span>}
        {remaining <= 0 && <span className="goal-done">🎉 Goal reached!</span>}
      </div>
    </div>
  );
}
