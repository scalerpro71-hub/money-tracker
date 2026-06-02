export function BarChart({ data, height = 132 }) {
  if (!data || !data.length) return null;
  const max = Math.max(...data.map(d => d.v || 0)) || 1;
  const peak = data.reduce((a, b) => ((b.v || 0) > (a.v || 0) ? b : a), data[0]);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height, paddingTop: 8 }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, height: '100%', justifyContent: 'flex-end' }}>
          <div style={{
            width: '100%', maxWidth: 28, borderRadius: '8px 8px 5px 5px', minHeight: 6,
            height: `${((d.v || 0) / max) * 100}%`,
            background: d === peak
              ? 'linear-gradient(180deg, var(--accent), var(--accent-2))'
              : 'var(--surface-3)',
            transition: 'height .5s cubic-bezier(.4,0,.2,1)',
          }} />
          {d.d && <div style={{ fontSize: 10.5, fontWeight: 700, color: d === peak ? 'var(--ink)' : 'var(--ink-3)' }}>{d.d}</div>}
        </div>
      ))}
    </div>
  );
}
