export function CategoryBadge({ category, size = 'sm' }) {
  if (!category) return <span className="badge badge-sm" style={{ background: '#e5e7eb', color: '#6b7280' }}>Uncategorized</span>;
  return (
    <span
      className={`badge badge-${size}`}
      style={{ background: category.color + '22', color: category.color, border: `1px solid ${category.color}44` }}
    >
      {category.icon} {category.name}
    </span>
  );
}
