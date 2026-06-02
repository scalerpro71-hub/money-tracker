import { hexWithAlpha } from '../../lib/colorUtils';

export function CategoryBadge({ category, size = 'sm' }) {
  if (!category) {
    return (
      <span className="badge badge-sm" style={{ background: 'var(--color-uncategorized-bg)', color: 'var(--color-uncategorized-text)' }}>
        Uncategorized
      </span>
    );
  }
  return (
    <span
      className={`badge badge-${size}`}
      style={{
        background: hexWithAlpha(category.color, '22'),
        color: category.color,
        border: `1px solid ${hexWithAlpha(category.color, '44')}`,
      }}
    >
      {category.icon} {category.name}
    </span>
  );
}
