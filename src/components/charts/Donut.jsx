/* Donut for categorical shares. Colors come in with the segments (fixed
   entity colors, never cycled); 2px surface gaps separate fills. Identity
   is carried by the caller's direct-labeled legend, not color alone. */
export function Donut({ segments, size = 148, stroke = 20 }) {
  const total = segments.reduce((a, s) => a + s.value, 0);
  if (total <= 0) return null;
  const r = (size - stroke) / 2;
  const C = 2 * Math.PI * r;
  const gap = 2; // px of surface between fills

  const arcs = segments.filter(s => s.value > 0).reduce((acc, s) => {
    const offset = acc.length ? acc[acc.length - 1].offset + acc[acc.length - 1].fullLen : 0;
    const fullLen = (s.value / total) * C;
    acc.push({ ...s, fullLen, len: Math.max(0, fullLen - gap), offset });
    return acc;
  }, []);

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }} role="img" aria-label="Allocation donut chart">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-3)" strokeWidth={stroke * 0.55} />
      {arcs.map((a, i) => (
        <circle
          key={i}
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={a.color} strokeWidth={stroke}
          strokeDasharray={`${a.len} ${C - a.len}`}
          strokeDashoffset={-a.offset - gap / 2}
          style={{ transition: 'stroke-dasharray .6s cubic-bezier(.4,0,.2,1)' }}
        >
          <title>{`${a.label}: ${Math.round((a.value / total) * 100)}%`}</title>
        </circle>
      ))}
    </svg>
  );
}
