import { useEffect, useState } from 'react';
import { makeConfetti } from '../../lib/confetti';

export function Confetti({ trigger, onDone }) {
  const [pieces, setPieces] = useState([]);

  useEffect(() => {
    if (!trigger) return;
    setPieces(makeConfetti());
    const t = setTimeout(() => { setPieces([]); onDone?.(); }, 2000);
    return () => clearTimeout(t);
  }, [trigger, onDone]);

  if (!pieces.length) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 200, overflow: 'hidden' }}>
      {pieces.map(p => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            top: '-10vh',
            width: p.size,
            height: p.size,
            background: p.color,
            borderRadius: p.round ? '50%' : '2px',
            animation: `confetti-fall ${p.duration}ms ease-in forwards`,
            animationDelay: `${p.delay}ms`,
          }}
        />
      ))}
    </div>
  );
}
