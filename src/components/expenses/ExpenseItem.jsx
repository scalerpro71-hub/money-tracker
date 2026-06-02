import { useRef, useState } from 'react';
import { CategoryBadge } from './CategoryBadge';
import { formatINR, formatShortDate } from '../../lib/dateUtils';
import { hexWithAlpha } from '../../lib/colorUtils';

const MODE_ICONS = { upi: '📱', cash: '💵', card: '💳', netbanking: '🏦' };

export function ExpenseItem({ expense, onEdit, onDelete }) {
  const catColor = expense.category?.color;
  const rowTint = catColor && expense.type !== 'income' ? hexWithAlpha(catColor, '0d') : 'transparent';
  const isIncome = expense.type === 'income';

  const touchStartX = useRef(null);
  const [swiped, setSwiped] = useState(false);

  function onTouchStart(e) {
    touchStartX.current = e.touches[0].clientX;
    setSwiped(false);
  }
  function onTouchEnd(e) {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 60) setSwiped(true);
    else if (diff < -20) setSwiped(false);
    touchStartX.current = null;
  }

  return (
    <div className="expense-item-wrap">
      <div
        className={`expense-item ${swiped ? 'expense-item--swiped' : ''}`}
        style={{ backgroundColor: isIncome ? 'rgba(16,185,129,0.05)' : rowTint }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div className="expense-left">
          <div
            className="expense-icon expense-icon--lg"
            style={{ background: isIncome ? '#10b98122' : (catColor ? hexWithAlpha(catColor, '33') : 'var(--color-surface-2)') }}
          >
            {isIncome ? '📥' : (expense.category?.icon || '💰')}
          </div>
          <div className="expense-info">
            <div className="expense-note">
              {isIncome ? (expense.note || 'Income') : (expense.note || expense.category?.name || 'Expense')}
            </div>
            <div className="expense-meta">
              {!isIncome && <CategoryBadge category={expense.category} />}
              {isIncome && <span className="expense-badge expense-badge--income">Income</span>}
              <span className="expense-date">{formatShortDate(expense.date)}</span>
              {expense.payment_mode && <span className="expense-mode">{MODE_ICONS[expense.payment_mode]}</span>}
              {expense.cashback_amount > 0 && (
                <span className="expense-cashback">💰 {formatINR(expense.cashback_amount)} back</span>
              )}
            </div>
          </div>
        </div>
        <div className="expense-right">
          <div className="expense-amount" style={{ color: isIncome ? 'var(--color-success)' : undefined }}>
            {isIncome ? '+' : '−'}{formatINR(expense.amount)}
          </div>
          <div className="expense-actions">
            <button className="btn-icon" onClick={() => onEdit(expense)} title="Edit">✏️</button>
            <button className="btn-icon" onClick={() => onDelete(expense.id)} title="Delete">🗑️</button>
          </div>
        </div>
      </div>
      {/* Swipe delete reveal */}
      {swiped && (
        <button className="swipe-delete-btn" onClick={() => { onDelete(expense.id); setSwiped(false); }}>
          🗑️ Delete
        </button>
      )}
    </div>
  );
}
