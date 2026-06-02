import { useState } from 'react';
import { Modal } from '../layout/Modal';
import { todayStr } from '../../lib/dateUtils';
import { hexWithAlpha } from '../../lib/colorUtils';

const PAYMENT_MODES = [
  { value: 'upi', label: '📱 UPI' },
  { value: 'cash', label: '💵 Cash' },
  { value: 'card', label: '💳 Card' },
  { value: 'netbanking', label: '🏦 Net Banking' },
];

export function AddExpenseModal({ categories, onAdd, onClose, initialData = null }) {
  const editing = !!initialData;
  const [type, setType] = useState(initialData?.type || 'expense');
  const [amount, setAmount] = useState(initialData?.amount?.toString() || '');
  const [categoryId, setCategoryId] = useState(initialData?.category_id || '');
  const [date, setDate] = useState(initialData?.date || todayStr());
  const [note, setNote] = useState(initialData?.note || '');
  const [paymentMode, setPaymentMode] = useState(initialData?.payment_mode || 'upi');
  const [cashback, setCashback] = useState(initialData?.cashback_amount?.toString() || '');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!amount || isNaN(amount) || Number(amount) <= 0) return;
    setLoading(true);
    try {
      await onAdd({
        type,
        amount: Number(amount),
        category_id: categoryId || null,
        date,
        note: note.trim() || null,
        payment_mode: paymentMode,
        cashback_amount: Number(cashback) || 0,
      });
      onClose();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal title={editing ? 'Edit Entry' : 'Add Entry'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="expense-form">

        {/* Type toggle */}
        <div className="type-toggle">
          <button type="button" className={`type-btn ${type === 'expense' ? 'type-btn--expense active' : ''}`} onClick={() => setType('expense')}>
            📤 Expense
          </button>
          <button type="button" className={`type-btn ${type === 'income' ? 'type-btn--income active' : ''}`} onClick={() => setType('income')}>
            📥 Income
          </button>
        </div>

        <div className="form-group">
          <label>Amount (₹)</label>
          <input
            type="number"
            inputMode="decimal"
            placeholder="0"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            className="amount-input"
            min="1"
            step="0.01"
            required
            autoFocus
          />
        </div>

        {type === 'expense' && (
          <>
            <div className="form-group">
              <label>Category</label>
              <div className="category-grid">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    className={`cat-btn ${categoryId === cat.id ? 'selected' : ''}`}
                    style={categoryId === cat.id ? { background: hexWithAlpha(cat.color, '33'), borderColor: cat.color } : {}}
                    onClick={() => setCategoryId(cat.id)}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Payment Mode</label>
              <div className="payment-modes">
                {PAYMENT_MODES.map(m => (
                  <button
                    key={m.value}
                    type="button"
                    className={`mode-btn ${paymentMode === m.value ? 'selected' : ''}`}
                    onClick={() => setPaymentMode(m.value)}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Cashback Earned (₹) <span style={{ fontWeight: 400, color: 'var(--color-text-muted)' }}>— optional</span></label>
              <input
                type="number"
                inputMode="decimal"
                placeholder="0"
                value={cashback}
                onChange={e => setCashback(e.target.value)}
                min="0"
                step="0.01"
              />
            </div>
          </>
        )}

        {type === 'income' && (
          <div className="form-group">
            <label>Source (optional)</label>
            <input type="text" placeholder="e.g. Salary, Freelance, Dividend" value={note} onChange={e => setNote(e.target.value)} maxLength={100} />
          </div>
        )}

        <div className="form-row">
          <div className="form-group">
            <label>Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} required />
          </div>
          {type === 'expense' && (
            <div className="form-group">
              <label>Note (optional)</label>
              <input type="text" placeholder="e.g. Zomato dinner" value={note} onChange={e => setNote(e.target.value)} maxLength={100} />
            </div>
          )}
        </div>

        <button type="submit" className="btn-primary" disabled={loading || !amount}>
          {loading ? 'Saving...' : editing ? 'Save Changes' : type === 'income' ? `Log ₹${amount || 0} Income` : `Add ₹${amount || 0}`}
        </button>
      </form>
    </Modal>
  );
}
