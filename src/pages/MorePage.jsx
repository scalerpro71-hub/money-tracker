import { Icon } from '../components/layout/Icon';

const MORE_ITEMS = [
  { id: 'events',   label: 'Events',      sub: 'Budget envelopes',     icon: 'calendar' },
  { id: 'tax',      label: 'Tax Planner', sub: 'Deductions & 80C',     icon: 'shield' },
  { id: 'import',   label: 'Import',      sub: 'Bank statement',       icon: 'download' },
  { id: 'settings', label: 'Settings',    sub: 'Profile & preferences', icon: 'gear' },
];

export function MorePage({ onNav }) {
  return (
    <div>
      <div className="sec-head" style={{ marginTop: 0 }}><h3>More</h3></div>
      <div className="more-grid">
        {MORE_ITEMS.map((item, i) => (
          <button
            key={item.id}
            className="more-cell rise"
            style={{ '--d': `${i * 50}ms` }}
            onClick={() => onNav(item.id)}
          >
            <div className="more-ico"><Icon name={item.icon} size={20} /></div>
            <div className="more-name">{item.label}</div>
            <div className="more-sub">{item.sub}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
