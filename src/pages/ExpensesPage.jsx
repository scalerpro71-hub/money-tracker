import { useState, useMemo } from 'react';
import { AddExpenseModal } from '../components/expenses/AddExpenseModal';
import { useToast } from '../components/layout/Toast';
import { Icon } from '../components/layout/Icon';
import { Area } from '../components/charts/Area';
import { cur, fmtK } from '../lib/formatUtils';
import { startOfMonthStr, todayStr } from '../lib/dateUtils';

const DATE_PRESETS = [
  { label: 'This month', value: 'month' },
  { label: 'Last 7 days', value: '7d' },
  { label: 'Last 30 days', value: '30d' },
  { label: 'All time', value: 'all' },
];

function getPresetDates(preset) {
  const today = todayStr();
  if (preset === 'month') return { from: startOfMonthStr(), to: today };
  if (preset === '7d') { const d = new Date(); d.setDate(d.getDate() - 7); return { from: d.toISOString().split('T')[0], to: today }; }
  if (preset === '30d') { const d = new Date(); d.setDate(d.getDate() - 30); return { from: d.toISOString().split('T')[0], to: today }; }
  return { from: null, to: null };
}

function groupByDate(expenses) {
  const groups = {};
  for (const e of expenses) {
    const key = e.date;
    if (!groups[key]) groups[key] = [];
    groups[key].push(e);
  }
  return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
}

function dateLabel(dateStr) {
  const today = todayStr();
  const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
  const yStr = yesterday.toISOString().split('T')[0];
  if (dateStr === today) return 'Today';
  if (dateStr === yStr) return 'Yesterday';
  return new Date(dateStr).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
}

export function ExpensesPage({ expenses, categories, onUpdate, onDelete }) {
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [datePreset, setDatePreset] = useState('month');
  const [showType, setShowType] = useState('all');
  const [editingExpense, setEditingExpense] = useState(null);
  const toast = useToast();

  const { from, to } = getPresetDates(datePreset);

  const filtered = useMemo(() => {
    return [...expenses].sort((a, b) => b.date.localeCompare(a.date)).filter(e => {
      const matchSearch = !search || (e.note || '').toLowerCase().includes(search.toLowerCase())
        || (e.category?.name || '').toLowerCase().includes(search.toLowerCase());
      const matchCat = !filterCat || e.category_id === filterCat;
      const matchDate = (!from || e.date >= from) && (!to || e.date <= to);
      const matchType = showType === 'all' || (e.type || 'expense') === showType;
      return matchSearch && matchCat && matchDate && matchType;
    });
  }, [expenses, search, filterCat, from, to, showType]);

  const monthStart = startOfMonthStr();
  const monthExpenses = expenses.filter(e => e.date >= monthStart && e.type !== 'income');
  const monthIncome = expenses.filter(e => e.date >= monthStart && e.type === 'income')
    .reduce((a, e) => a + Number(e.amount), 0);
  const monthTotal = monthExpenses.reduce((a, e) => a + Number(e.amount), 0);

  const spentData = monthExpenses.map(e => Number(e.amount));

  const grouped = useMemo(() => groupByDate(filtered), [filtered]);

  async function handleDelete(id) {
    if (!confirm('Delete this transaction? This cannot be undone.')) return;
    try { await onDelete(id); toast('Deleted'); } catch (err) { toast(err.message, 'error'); }
  }

  async function handleUpdate(data) {
    await onUpdate(editingExpense.id, data);
    toast('Updated');
    setEditingExpense(null);
  }

  return (
    <div>
      {/* Summary cards */}
      <div className="activity-summary">
        <div className="activity-summary-card rise" style={{ '--d': '0ms', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="eyebrow">Spent this month</div>
            <div className="summary-amt num">{fmtK(monthTotal)}</div>
            <div style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 600, marginTop: 4 }}>{monthExpenses.length} transactions</div>
          </div>
          {spentData.length >= 2 && (
            <div style={{ width: 100, flexShrink: 0 }}>
              <Area data={spentData} h={50} />
            </div>
          )}
        </div>
        <div className="activity-summary-card rise" style={{ '--d': '60ms', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="eyebrow">Income this month</div>
            <div className="summary-amt pos num">{fmtK(monthIncome)}</div>
            <div style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 600, marginTop: 4 }}>
              {monthIncome > 0 ? `Savings: ${Math.round(((monthIncome - monthTotal) / monthIncome) * 100)}%` : 'No income logged'}
            </div>
          </div>
          <div className="txn-ico" style={{ width: 48, height: 48, fontSize: 22, flexShrink: 0 }}>💸</div>
        </div>
      </div>

      {/* Date preset chips */}
      <div className="filter-chips" style={{ marginBottom: 12 }}>
        {DATE_PRESETS.map(p => (
          <button key={p.value} className={`filter-chip${datePreset === p.value ? ' on' : ''}`} onClick={() => setDatePreset(p.value)}>
            {p.label}
          </button>
        ))}
      </div>

      {/* Search + category filter row */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 160 }}>
          <Icon name="search" size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-3)' }} />
          <input
            type="search" placeholder="Search transactions…" value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: 'var(--r-pill)', border: '1px solid var(--hair)', background: 'var(--surface)', color: 'var(--ink)', fontSize: 13.5, fontFamily: 'var(--font-body)', outline: 'none' }}
          />
        </div>
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)} className="mini-select">
          <option value="">All categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
        </select>
      </div>

      {/* Type chips */}
      <div className="filter-chips" style={{ marginBottom: 16 }}>
        {[['all', 'All'], ['expense', 'Expenses'], ['income', 'Income']].map(([v, l]) => (
          <button key={v} className={`filter-chip${showType === v ? ' on' : ''}`} onClick={() => setShowType(v)}>{l}</button>
        ))}
      </div>

      {/* Transaction list */}
      {filtered.length === 0 ? (
        <div className="card pad" style={{ textAlign: 'center', color: 'var(--ink-3)', padding: '40px 20px' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>📝</div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>No transactions found</div>
          <div style={{ fontSize: 13, marginTop: 4 }}>Use the + button to add your first entry</div>
        </div>
      ) : grouped.map(([date, txns]) => {
        const groupTotal = txns.filter(e => e.type !== 'income').reduce((a, e) => a + Number(e.amount), 0);
        return (
          <div key={date} className="txn-group">
            <div className="txn-group-header">
              <div className="txn-group-date">{dateLabel(date)}</div>
              {groupTotal > 0 && <div className="txn-group-total num">{cur(groupTotal)}</div>}
            </div>
            <div className="card">
              <div className="txn-list">
                {txns.map(txn => (
                  <div key={txn.id} className="txn" onClick={() => setEditingExpense(txn)}>
                    <div className="txn-ico">{txn.category?.icon || '💰'}</div>
                    <div className="txn-mid">
                      <div className="txn-name">{txn.note || txn.category?.name || 'Expense'}</div>
                      <div className="txn-meta">
                        {txn.category?.name && <span>{txn.category.name}</span>}
                        {txn.payment_mode && <><span>·</span><span>{txn.payment_mode}</span></>}
                      </div>
                    </div>
                    <div className={`txn-amt${txn.type === 'income' ? ' income' : ''}`}>
                      {txn.type === 'income' ? '+' : '–'}<span className="num">{cur(txn.amount)}</span>
                    </div>
                    <button
                      className="icon-btn" style={{ width: 28, height: 28, marginLeft: 6, flexShrink: 0 }}
                      onClick={e => { e.stopPropagation(); handleDelete(txn.id); }}
                    >×</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}

      {editingExpense && (
        <AddExpenseModal categories={categories} initialData={editingExpense} onAdd={handleUpdate} onClose={() => setEditingExpense(null)} />
      )}
    </div>
  );
}
