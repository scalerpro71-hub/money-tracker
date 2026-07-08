import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { todayStr, localDateStr } from '../../lib/dateUtils';
import { autoCategory } from '../../lib/categorize';
import { useCategories, useExpenses, useExpenseMutations, useBudgets, useProfile, useUpdateProfile } from '../../lib/queries';
import { useToast } from '../../components/layout/Toast';

const PAYMENT_MODES = [
  { value: 'upi', label: 'UPI' },
  { value: 'card', label: 'Card' },
  { value: 'cash', label: 'Cash' },
  { value: 'netbanking', label: 'Bank' },
];

const SHEET_SPRING = { type: 'spring', stiffness: 360, damping: 32, mass: 0.8 };

export function AddEntrySheet({ initialType = 'expense', initialData = null, onClose }) {
  const editing = !!initialData;
  const { data: categories = [] } = useCategories();
  const { data: expenses = [] } = useExpenses();
  const { data: budgets = [] } = useBudgets();
  const { data: profile } = useProfile();
  const { add, update } = useExpenseMutations();
  const updateProfile = useUpdateProfile();
  const toast = useToast();

  const [type, setType] = useState(initialData?.type || initialType);
  const [amountStr, setAmountStr] = useState(initialData?.amount?.toString() || '');
  const [categoryId, setCategoryId] = useState(initialData?.category_id || '');
  const [date, setDate] = useState(initialData?.date || todayStr());
  const [note, setNote] = useState(initialData?.note || '');
  const [paymentMode, setPaymentMode] = useState(initialData?.payment_mode || 'upi');
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(true);
  const [suggested, setSuggested] = useState(false);
  const manuallySet = useRef(false);

  useEffect(() => {
    if (editing || manuallySet.current || type !== 'expense') return;
    const id = autoCategory(note, categories, expenses);
    if (id) { setCategoryId(id); setSuggested(true); }
    else { setSuggested(false); }
  }, [note, categories, expenses, editing, type]);

  function handleClose() {
    setVisible(false);
  }

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') setVisible(false); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  function pressKey(k) {
    if (k === '⌫') { setAmountStr(s => s.slice(0, -1)); return; }
    if (k === '.' && amountStr.includes('.')) return;
    if (amountStr.length >= 10) return;
    setAmountStr(s => s + k);
  }

  function pickCategory(id) {
    manuallySet.current = true;
    setSuggested(false);
    setCategoryId(prev => prev === id ? '' : id);
  }

  // "Under daily budget today" streak, carried over from the old tracker.
  async function updateStreakIfNeeded(addedAmount) {
    if (!profile || !budgets.length) return;
    const today = todayStr();
    if (profile.last_streak_date === today) return;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = localDateStr(yesterday);
    const totalBudget = budgets.reduce((a, b) => a + b.limit_amount, 0);
    const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
    const dailyBudget = totalBudget / daysInMonth;
    const todaySpend = expenses
      .filter(e => e.date === today && e.type !== 'income')
      .reduce((a, e) => a + Number(e.amount), 0) + addedAmount;
    if (todaySpend <= dailyBudget) {
      const wasStreakContinued = profile.last_streak_date === yesterdayStr;
      const newStreak = wasStreakContinued ? (profile.current_streak || 0) + 1 : 1;
      await updateProfile.mutateAsync({
        current_streak: newStreak,
        longest_streak: Math.max(newStreak, profile.longest_streak || 0),
        last_streak_date: today,
      });
    }
  }

  async function handleSubmit() {
    const amount = Number(amountStr);
    if (!amount || amount <= 0) return;
    setLoading(true);
    try {
      const row = {
        type,
        amount,
        category_id: type === 'expense' ? categoryId || null : null,
        date,
        note: note.trim() || null,
        payment_mode: paymentMode,
      };
      if (editing) {
        await update.mutateAsync({ id: initialData.id, ...row });
        toast('Entry updated');
      } else {
        await add.mutateAsync(row);
        toast(`₹${amount.toLocaleString('en-IN')} ${type === 'income' ? 'logged' : 'added'}!`);
        if (type === 'expense' && date === todayStr()) updateStreakIfNeeded(amount);
      }
      handleClose();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  const displayAmt = amountStr ? `₹${Number(amountStr).toLocaleString('en-IN', { maximumFractionDigits: 2 })}` : '₹0';

  return (
    <AnimatePresence onExitComplete={onClose}>
      {visible && (
      <>
      <motion.div
        className="sheet-backdrop"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={handleClose}
      />
      <motion.div
        className="sheet"
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%', transition: { duration: 0.22, ease: [0.4, 0, 1, 1] } }}
        transition={SHEET_SPRING}
      >
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 4px' }}>
          <div style={{ width: 36, height: 4, borderRadius: 99, background: 'var(--hair-2)' }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 20px 12px' }}>
          <div style={{ fontWeight: 800, fontSize: 16 }}>{editing ? 'Edit Entry' : 'Add Entry'}</div>
          <div className="seg" style={{ padding: 3 }}>
            <button className={type === 'expense' ? 'on' : ''} onClick={() => setType('expense')}>Expense</button>
            <button className={type === 'income' ? 'on' : ''} onClick={() => setType('income')}>Income</button>
          </div>
        </div>

        <div className="sheet-amt" style={{ fontFamily: 'var(--font-num)', fontSize: 42, fontWeight: 700, letterSpacing: '-0.03em', textAlign: 'center', padding: '4px 20px 16px', color: type === 'income' ? 'var(--pos)' : 'var(--ink)' }}>
          {displayAmt}
        </div>

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

        <div style={{ padding: '0 20px 12px' }}>
          <input
            type="text"
            placeholder={type === 'income' ? 'Source (e.g. Salary, Freelance)' : 'Note (e.g. Zomato dinner)'}
            value={note}
            onChange={e => { manuallySet.current = false; setNote(e.target.value); }}
            maxLength={100}
            className="focus-ring"
            style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--r-md)', border: '1px solid var(--hair)', background: 'var(--surface-2)', color: 'var(--ink)', fontSize: 14, fontFamily: 'var(--font-body)', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>

        {type === 'expense' && (
          <div style={{ padding: '0 20px 14px' }}>
            {suggested && categoryId && (
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', marginBottom: 6 }}>
                ✦ Auto-categorized — tap to change
              </div>
            )}
            <div className="cat-grid">
              {categories.map(cat => {
                const active = categoryId === cat.id;
                return (
                  <button key={cat.id}
                    onClick={() => pickCategory(cat.id)}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                      padding: '8px 4px', borderRadius: 'var(--r-md)',
                      border: `1.5px solid ${active ? cat.color : 'var(--hair)'}`,
                      background: active ? cat.color + '18' : 'var(--surface-2)',
                      color: active ? cat.color : 'var(--ink-2)',
                      fontWeight: 700, fontSize: 11, cursor: 'pointer',
                      fontFamily: 'var(--font-body)', transition: 'all .15s',
                    }}>
                    <span style={{ fontSize: 20 }}>{cat.icon}</span>
                    <span style={{ lineHeight: 1.2, textAlign: 'center' }}>{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div style={{ padding: '0 20px 14px' }}>
          <input
            type="date" value={date} onChange={e => setDate(e.target.value)}
            className="focus-ring"
            style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--r-md)', border: '1px solid var(--hair)', background: 'var(--surface-2)', color: 'var(--ink)', fontSize: 14, fontFamily: 'var(--font-body)', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>

        <div className="keypad" style={{ padding: '0 20px 14px' }}>
          {['1','2','3','4','5','6','7','8','9','.','0','⌫'].map(k => (
            <button key={k} className="key" onClick={() => pressKey(k)}>{k}</button>
          ))}
        </div>

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
      </motion.div>
      </>
      )}
    </AnimatePresence>
  );
}
