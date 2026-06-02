import { useState, useMemo } from 'react';
import { ExpenseItem } from '../components/expenses/ExpenseItem';
import { AddExpenseModal } from '../components/expenses/AddExpenseModal';
import { useToast } from '../components/layout/Toast';
import { formatINR, startOfMonthStr, todayStr } from '../lib/dateUtils';

const DATE_PRESETS = [
  { label: 'This Month', value: 'month' },
  { label: 'Last 7 Days', value: '7d' },
  { label: 'Last 30 Days', value: '30d' },
  { label: 'All Time', value: 'all' },
];

function getPresetDates(preset) {
  const today = todayStr();
  if (preset === 'month') return { from: startOfMonthStr(), to: today };
  if (preset === '7d') {
    const d = new Date(); d.setDate(d.getDate() - 7);
    return { from: d.toISOString().split('T')[0], to: today };
  }
  if (preset === '30d') {
    const d = new Date(); d.setDate(d.getDate() - 30);
    return { from: d.toISOString().split('T')[0], to: today };
  }
  return { from: null, to: null };
}

export function ExpensesPage({ expenses, categories, onAdd, onUpdate, onDelete }) {
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [datePreset, setDatePreset] = useState('month');
  const [showType, setShowType] = useState('all'); // all | expense | income
  const [editingExpense, setEditingExpense] = useState(null);
  const toast = useToast();

  const { from, to } = getPresetDates(datePreset);

  const filtered = useMemo(() => {
    return expenses.filter(e => {
      const matchSearch = !search || (e.note || '').toLowerCase().includes(search.toLowerCase())
        || (e.category?.name || '').toLowerCase().includes(search.toLowerCase());
      const matchCat = !filterCat || e.category_id === filterCat;
      const matchDate = (!from || e.date >= from) && (!to || e.date <= to);
      const matchType = showType === 'all' || (e.type || 'expense') === showType;
      return matchSearch && matchCat && matchDate && matchType;
    });
  }, [expenses, search, filterCat, from, to, showType]);

  const expenseEntries = filtered.filter(e => (e.type || 'expense') === 'expense');
  const totalExpenses = expenseEntries.reduce((a, e) => a + Number(e.amount), 0);
  const totalIncome = filtered.filter(e => e.type === 'income').reduce((a, e) => a + Number(e.amount), 0);
  const totalCashback = expenseEntries.reduce((a, e) => a + Number(e.cashback_amount || 0), 0);

  // Insights
  const avgPerTx = expenseEntries.length > 0 ? Math.round(totalExpenses / expenseEntries.length) : 0;
  const topMerchant = useMemo(() => {
    const merchants = {};
    for (const e of expenseEntries) {
      const note = e.note || 'Unknown';
      merchants[note] = (merchants[note] || 0) + Number(e.amount);
    }
    return Object.entries(merchants).sort((a, b) => b[1] - a[1])[0];
  }, [expenseEntries]);

  async function handleDelete(id) {
    try {
      await onDelete(id);
      toast('Deleted');
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  async function handleUpdate(data) {
    await onUpdate(editingExpense.id, data);
    toast('Updated');
  }

  return (
    <div className="page">
      <div className="page-header">
        <h2>Transactions</h2>
      </div>

      {/* Summary strip */}
      <div className="exp-summary-strip">
        <div className="exp-summary-item">
          <div className="exp-summary-val exp-summary-val--out">{formatINR(totalExpenses)}</div>
          <div className="exp-summary-label">Spent</div>
        </div>
        {totalIncome > 0 && (
          <div className="exp-summary-item">
            <div className="exp-summary-val exp-summary-val--in">{formatINR(totalIncome)}</div>
            <div className="exp-summary-label">Income</div>
          </div>
        )}
        {totalCashback > 0 && (
          <div className="exp-summary-item">
            <div className="exp-summary-val" style={{ color: '#f59e0b' }}>{formatINR(totalCashback)}</div>
            <div className="exp-summary-label">Cashback</div>
          </div>
        )}
        <div className="exp-summary-item">
          <div className="exp-summary-val">{filtered.length}</div>
          <div className="exp-summary-label">Entries</div>
        </div>
      </div>

      {/* Quick insights */}
      {expenseEntries.length > 0 && (
        <div className="section-card" style={{ padding: '10px 12px' }}>
          <div style={{ display: 'flex', gap: 12, fontSize: 12 }}>
            <div><span style={{ fontWeight: 600 }}>Avg per tx:</span> <span style={{ color: 'var(--color-text-muted)' }}>₹{avgPerTx.toLocaleString('en-IN')}</span></div>
            {topMerchant && (
              <div><span style={{ fontWeight: 600 }}>Top:</span> <span style={{ color: 'var(--color-text-muted)' }}>{topMerchant[0].slice(0, 20)} (₹{Math.round(topMerchant[1]).toLocaleString('en-IN')})</span></div>
            )}
          </div>
        </div>
      )}

      {/* Date preset tabs */}
      <div className="range-toggle" style={{ marginBottom: 10 }}>
        {DATE_PRESETS.map(p => (
          <button key={p.value} className={datePreset === p.value ? 'active' : ''} onClick={() => setDatePreset(p.value)}>
            {p.label}
          </button>
        ))}
      </div>

      {/* Search + category filter */}
      <div className="filter-row">
        <input className="search-input" type="search" placeholder="🔍 Search..." value={search} onChange={e => setSearch(e.target.value)} />
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)} className="filter-select">
          <option value="">All</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
        </select>
      </div>

      {/* Type filter */}
      <div className="range-toggle" style={{ marginBottom: 12 }}>
        {[['all', 'All'], ['expense', '📤 Expenses'], ['income', '📥 Income']].map(([v, l]) => (
          <button key={v} className={showType === v ? 'active' : ''} onClick={() => setShowType(v)}>{l}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📝</div>
          <p>No transactions found</p>
          <p className="empty-sub">Use the + button to add your first entry</p>
        </div>
      ) : (
        <div className="expense-list">
          {filtered.map(e => (
            <ExpenseItem key={e.id} expense={e} onEdit={setEditingExpense} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {editingExpense && (
        <AddExpenseModal categories={categories} initialData={editingExpense} onAdd={handleUpdate} onClose={() => setEditingExpense(null)} />
      )}
    </div>
  );
}
