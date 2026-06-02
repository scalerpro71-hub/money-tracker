import { CategoryBadge } from './CategoryBadge';
import { formatINR, formatShortDate } from '../../lib/dateUtils';
import { hexWithAlpha } from '../../lib/colorUtils';

const MODE_ICONS = { upi: '📱', cash: '💵', card: '💳', netbanking: '🏦' };

export function ExpenseItem({ expense, onEdit, onDelete }) {
  const catColor = expense.category?.color;
  const rowTint = catColor ? hexWithAlpha(catColor, '0d') : 'transparent';

  return (
    <div className="expense-item" style={{ backgroundColor: rowTint }}>
      <div className="expense-left">
        <div
          className="expense-icon expense-icon--lg"
          style={{ background: catColor ? hexWithAlpha(catColor, '33') : 'var(--color-surface-2)' }}
        >
          {expense.category?.icon || '💰'}
        </div>
        <div className="expense-info">
          <div className="expense-note">{expense.note || expense.category?.name || 'Expense'}</div>
          <div className="expense-meta">
            <CategoryBadge category={expense.category} />
            <span className="expense-date">{formatShortDate(expense.date)}</span>
            <span className="expense-mode">{MODE_ICONS[expense.payment_mode]}</span>
          </div>
        </div>
      </div>
      <div className="expense-right">
        <div className="expense-amount">{formatINR(expense.amount)}</div>
        <div className="expense-actions">
          <button className="btn-icon" onClick={() => onEdit(expense)} title="Edit">✏️</button>
          <button className="btn-icon" onClick={() => onDelete(expense.id)} title="Delete">🗑️</button>
        </div>
      </div>
    </div>
  );
}
