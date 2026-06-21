const PALETTE = ['#0a9d72', '#34e0a8', '#f59e0b', '#3b82f6', '#ec4899', '#a855f7'];

export function makeConfetti(count = 60) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
    size: Math.random() * 8 + 4,
    duration: Math.random() * 1500 + 1000,
    delay: Math.random() * 500,
    round: Math.random() > 0.5,
  }));
}
