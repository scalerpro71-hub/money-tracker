import { useState, useEffect } from 'react';
import { todayStr } from '../../lib/dateUtils';

const PAYMENT_MODES = [
  { value: 'upi', label: 'UPI' },
  { value: 'card', label: 'Card' },
  { value: 'cash', label: 'Cash' },
  { value: 'netbanking', label: 'Bank' },
];

export function AddExpenseModal({ categories, onAdd, onClose, initialData = null, initialType = 'expense' }) {
  const editing = !!initialData;
  const [type, setType] = useState(initialData?.type || initialType);
  const [amountStr, setAmountStr] = useState(initialData?.amount?.toString() || '');
  const [categoryId, setCategoryId] = useState(initialData?.category_id || '');
  const [date, setDate] = useState(initialData?.date || todayStr());
  const [note, setNote] = useState(initialData?.note || '');
  const [paymentMode, setPaymentMode] = useState(initialData?.payment_mode || 'upi');
  const [cashback] = useState(initialData?.cashback_amount?.toString() || '');
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => { requestAnimationFrame(() => setVisible(true)); }, []);

  function handleClose() {
    setVisible(false);
    setTimeout(onClose, 280);
  }

  function pressKey(k) {
    if (k === '⌫') { setAmountStr(s => s.slice(0, -1)); return; }
    if (k === '.' && amountStr.includes('.')) return;
    if (amountStr.length >= 10) return;
    setAmountStr(s => s + k);
  }

  async function handleSubmit() {
    const amount = Number(amountStr);
    if (!amount || amount <= 0) return;
    setLoading(true);
    try {
      await onAdd({
        type,
        amount,
        category_id: categoryId || null,
        date,
        note: note.trim() || null,
        payment_mode: paymentMode,
        cashback_amount: Number(cashback) || 0,
      });
      handleClose();
    } finally {
      setLoading(false);
    }
  }

  const displayAmt = amountStr ? `₹${Number(amountStr).toLocaleString('en-IN', { maximumFractionDigits: 2 })}` : '₹0';

  return (
    <>
      <div className="sheet-backdrop" style={{ opacity: visible ? 1 : 0, transition: 'opacity .28s' }} onClick={handleClose} />
      <div className="sheet" style={{ transform: visible ? 'translateY(0)' : 'translateY(100%)', transition: 'transform .28s cubic-bezier(.4,0,.2,1)' }}>
        {/* Grip */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 4px' }}>
          <div style={{ width: 36, height: 4, borderRadius: 99, background: 'var(--hair-2)' }} />
        </div>

        {/* Title + type toggle */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 20px 12px' }}>
          <div style={{ fontWeight: 800, fontSize: 16 }}>{editing ? 'Edit Entry' : 'Add Entry'}</div>
          <div className="seg" style={{ padding: 3 }}>
            <button className={type === 'expense' ? 'on' : ''} onClick={() => setType('expense')}>Expense</button>
            <button className={type === 'income' ? 'on' : ''} onClick={() => setType('income')}>Income</button>
          </div>
        </div>

        {/* Big amount display */}
        <div className="sheet-amt" style={{ fontFamily: 'var(--font-num)', fontSize: 42, fontWeight: 700, letterSpacing: '-0.03em', textAlign: 'center', padding: '4px 20px 16px', color: type === 'income' ? 'var(--pos)' : 'var(--ink)' }}>
          {displayAmt}
        </div>

        {/* Payment mode segmented row */}
        {type === 'expense' && (
          <div style={{ display: 'flex', gap: 6, padding: '0 20px 14px', overflowX: 'auto' }}>
            {PAYMENT_MODES.map(m => (
              <button key={m.value}
                style={{ flex: 1, padding: '7px 0', borderRadius: 'var(--r-sm)', border: `1px solid ${paymentMode === m.value ? 'var(--accent)' : 'var(--hair)'}`, background: paymentMode === m.value ? 'var(--accent-soft)' : 'var(--surface-2)', color: paymentMode === m.value ? 'var(--accent)' : 'var(--ink-2)', fontWeight: 700, fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-body)', whiteSpace: 'nowrap' }}
                onClick={() => setPaymentMode(m.value)}>
                {m.label}
              </button>
            ))}
          </div>
        )}

        {/* Category chips */}
        {type === 'expense' && (
          <div style={{ display: 'flex', gap: 6, padding: '0 20px 14px', overflowX: 'auto', flexWrap: 'nowrap' }}>
            {categories.map(cat => (
              <button key={cat.id}
                className="cat-choice"
                style={{ background: categoryId === cat.id ? cat.color + '22' : 'var(--surface-2)', border: `1px solid ${categoryId === cat.id ? cat.color : 'var(--hair)'}`, color: categoryId === cat.id ? cat.color : 'var(--ink-2)', fontWeight: 700 }}
                onClick={() => setCategoryId(id => id === cat.id ? '' : cat.id)}>
                {cat.icon} {cat.name}
              </button>
            ))}
          </div>
        )}

        {/* Note / Source input */}
        <div style={{ padding: '0 20px 12px' }}>
          <input
            type="text"
            placeholder={type === 'income' ? 'Source (e.g. Salary, Freelance)' : 'Note (e.g. Zomato dinner)'}
            value={note}
            onChange={e => setNote(e.target.value)}
            maxLength={100}
            style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--r-md)', border: '1px solid var(--hair)', background: 'var(--surface-2)', color: 'var(--ink)', fontSize: 14, fontFamily: 'var(--font-body)', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>

        {/* Date row */}
        <div style={{ padding: '0 20px 14px' }}>
          <input
            type="date" value={date} onChange={e => setDate(e.target.value)}
            style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--r-md)', border: '1px solid var(--hair)', background: 'var(--surface-2)', color: 'var(--ink)', fontSize: 14, fontFamily: 'var(--font-body)', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>

        {/* Numeric keypad */}
        <div className="keypad" style={{ padding: '0 20px 14px' }}>
          {['1','2','3','4','5','6','7','8','9','.','0','⌫'].map(k => (
            <button key={k} className="key" onClick={() => pressKey(k)}>{k}</button>
          ))}
        </div>

        {/* CTA */}
        <div style={{ padding: '0 20px 24px' }}>
          <button
            className="btn-accent"
            style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: 16, fontWeight: 800 }}
            onClick={handleSubmit}
            disabled={loading || !amountStr || amountStr === '0'}
          >
            {loading ? 'Saving…' : editing ? 'Save Changes' : `${type === 'income' ? 'Log' : 'Add'} ${displayAmt}`}
          </button>
        </div>
      </div>
    </>
  );
}
