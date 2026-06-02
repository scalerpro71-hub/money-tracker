import { formatINR, formatDate } from '../../lib/dateUtils';

export function GoalCard({ goal, onEdit, onDelete }) {
  const pct = Math.min((Number(goal.current_amount) / Number(goal.target_amount)) * 100, 100);
  const remaining = Number(goal.target_amount) - Number(goal.current_amount);

  // Calculate monthly contribution needed
  let monthlyNeeded = 0;
  let daysLeft = 0;
  if (goal.target_date && remaining > 0) {
    const today = new Date();
    const target = new Date(goal.target_date + 'T00:00:00');
    daysLeft = Math.max(0, Math.floor((target - today) / (1000 * 60 * 60 * 24)));
    const monthsLeft = Math.max(1, Math.ceil(daysLeft / 30));
    monthlyNeeded = Math.ceil(remaining / monthsLeft);
  }

  const isAchievable = daysLeft === 0 || monthlyNeeded <= (Number(goal.target_amount) / 12);
  const status = remaining <= 0 ? 'achieved' : !isAchievable ? 'at-risk' : 'on-track';

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

      {/* Insight line */}
      {remaining > 0 && daysLeft > 0 && (
        <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--color-border)', fontSize: 12, color: 'var(--color-text-muted)' }}>
          {status === 'achieved' && <div>✅ {daysLeft} days left</div>}
          {status === 'on-track' && <div>💚 {daysLeft} days left · {formatINR(monthlyNeeded)}/month to stay on track</div>}
          {status === 'at-risk' && <div>⚠️ Need {formatINR(monthlyNeeded)}/month (above average) — revisit timeline</div>}
        </div>
      )}
    </div>
  );
}
