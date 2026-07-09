import { useState } from 'react';
import { GLOSSARY } from '../../content/journey/glossary';
import { Icon } from '../../components/layout/Icon';

export function GlossaryTab() {
  const [search, setSearch] = useState('');
  const filtered = GLOSSARY.filter(g =>
    !search ||
    g.term.toLowerCase().includes(search.toLowerCase()) ||
    g.def.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ maxWidth: 680 }}>
      <div style={{ position: 'relative', marginBottom: 16 }}>
        <Icon name="search" size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-3)' }} />
        <input
          type="search" placeholder="Search a term (NAV, ELSS, XIRR…)" value={search}
          onChange={e => setSearch(e.target.value)}
          className="focus-ring"
          style={{ width: '100%', padding: '12px 14px 12px 40px', borderRadius: 'var(--r-pill)', border: '1px solid var(--hair)', background: 'var(--surface)', color: 'var(--ink)', fontSize: 14, fontFamily: 'var(--font-body)', outline: 'none' }}
        />
      </div>
      <div className="card" style={{ padding: '6px 20px' }}>
        {filtered.map((g, i) => (
          <div key={g.term} style={{ padding: '14px 0', borderTop: i === 0 ? 'none' : '1px solid var(--hair)' }}>
            <div style={{ fontSize: 14.5, fontWeight: 800, letterSpacing: '-0.01em' }}>{g.term}</div>
            <div style={{ fontSize: 13.5, color: 'var(--ink-2)', fontWeight: 550, lineHeight: 1.6, marginTop: 4 }}>{g.def}</div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--ink-3)', fontWeight: 600, fontSize: 13.5 }}>
            No matches — ask the Coach instead, it knows more than this list.
          </div>
        )}
      </div>
    </div>
  );
}
