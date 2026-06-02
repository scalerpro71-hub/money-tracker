export function SpendingStreak({ profile }) {
  const streak = profile?.current_streak || 0;
  const longest = profile?.longest_streak || 0;
  if (streak === 0) return null;

  const emoji = streak >= 30 ? '🏆' : streak >= 14 ? '🔥' : streak >= 7 ? '⚡' : '✅';

  return (
    <div className="streak-badge">
      <span className="streak-icon">{emoji}</span>
      <div className="streak-text">
        <strong>{streak}-day streak</strong>
        <span>Under budget · Best: {longest} days</span>
      </div>
    </div>
  );
}
