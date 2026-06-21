import { useRef, useState } from 'react';

export function Tilt({ max = 8, glow = false, locked = false, className = '', style, children, ...rest }) {
  const ref = useRef(null);
  const [transform, setTransform] = useState('');
  const [transitioning, setTransitioning] = useState(false);

  function handleMove(e) {
    if (locked || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setTransitioning(false);
    setTransform(`perspective(800px) rotateX(${(-py * max * 2).toFixed(2)}deg) rotateY(${(px * max * 2).toFixed(2)}deg) scale3d(1.02,1.02,1.02)`);
  }

  function handleLeave() {
    setTransitioning(true);
    setTransform('');
  }

  return (
    <div
      ref={ref}
      className={`tilt-layer ${locked ? 'card-locked' : ''} ${className}`}
      style={{
        position: 'relative',
        transform,
        transition: transitioning ? 'transform 0.4s cubic-bezier(0.2,0.7,0.2,1)' : 'none',
        ...style,
      }}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      {...rest}
    >
      {children}
      {glow && !locked && <div className="sheen" />}
    </div>
  );
}
