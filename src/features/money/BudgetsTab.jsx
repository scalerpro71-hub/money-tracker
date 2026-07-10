import { useState, useMemo } from 'react';
import { useCategories, useBudgets, useBudgetMutations, useExpenses } from '../../lib/queries';
import { useToast } from '../../components/layout/Toast';
import { cur, fmtK } from '../../lib/formatUtils';
import { firstDayOfCurrentMonth, startOfMonthStr } from '../../lib/dateUtils';

/* Lifestyle creep is invisible day to day: this month's pace per category vs
   the average of the two months before. Needs a week of the current month
   and at least one prior month of history before it says anything. */
function detectCreep(expenses, categories) {
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysPassed = now.getDate();
  if (daysPassed < 7) return [];

  const monthKey = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  const thisKey = monthKey(now);
  const prevKeys = [1, 2].map(i => {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    return monthKey(d);
  });

  const byCat = {};
  for (const e of expenses) {
    if (e.type === 'income' || !e.category_id) continue;
    const key = e.date?.slice(0, 7);
    if (key !== thisKey && !prevKeys.includes(key)) continue;
    const slot = (byCat[e.category_id] ||= { current: 0, prev: {} });
    if (key === thisKey) slot.current += Number(e.amount);
    else slot.prev[key] = (slot.prev[key] || 0) + Number(e.amount);
  }

  const catById = Object.fromEntries(categories.map(c => [c.id, c]));
  const flagged = [];
  for (const [catId, { current, prev }] of Object.entries(byCat)) {
    const prevMonths = Object.values(prev);
    if (prevMonths.length === 0) continue;
    const avg = prevMonths.reduce((a, v) => a + v, 0) / prevMonths.length;
    const projected = (current / daysPassed) * daysInMonth;
    if (avg >= 500 && projected >= avg * 1.3) {
      flagged.push({
        category: catById[catId],
        avg: Math.round(avg),
        projected: Math.round(projected),
        pct: Math.round(((projected - avg) / avg) * 100),
      });
    }
  }
  return flagged.filter(f => f.category).sort((a, b) => b.pct - a.pct).slice(0, 3);
}

function BudgetRow({ category, budget, spent, onSave, onRemove }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(budget?.limit_amount || '');
  const limit = budget?.limit_amount || 0;
  const pct = limit > 0 ? Math.min(100, Math.round((spent / limit) * 100)) : 0;
  const over = limit > 0 && spent > limit;

  async function save() {
    const amount = Number(value);
    if (!amount || amount <= 0) { setEditing(false); return; }
    await onSave(amount);
    setEditing(false);
  }

  return (
    <div style={{ padding: '14px 0', borderTop: '1px solid var(--hair)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: limit > 0 ? 8 : 0 }}>
        <span style={{ fontSize: 18 }}>{category.icon}</span>
        <span style={{ fontSize: 14, fontWeight: 750, flex: 1 }}>{category.name}</span>
        {editing ? (
          <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <input
              type="number" inputMode="numeric" min="0" autoFocus
              value={value} onChange={e => setValue(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && save()}
              placeholder="Limit"
              className="focus-ring"
              style={{ width: 110, padding: '8px 10px', borderRadius: 'var(--r-xs)', border: '1.5px solid var(--accent)', background: 'var(--surface)', color: 'var(--ink)', fontSize: 14, fontFamily: 'var(--font-num)', outline: 'none' }}
            />
            <button className="btn-accent" style={{ padding: '8px 14px', fontSize: 13 }} onClick={save}>Save</button>
          </span>
        ) : limit > 0 ? (
          <button className="chip" style={{ cursor: 'pointer', border: 'none', fontFamily: 'var(--font-body)' }} onClick={() => { setValue(limit); setEditing(true); }}>
            <span className="num">{cur(limit)}</span> ✎
          </button>
        ) : (
          <button className="filter-chip" onClick={() => { setValue(''); setEditing(true); }}>Set budget</button>
        )}
        {limit > 0 && !editing && (
          <button className="icon-btn" style={{ width: 26, height: 26 }} aria-label="Remove budget" onClick={onRemove}>×</button>
        )}
      </div>
      {limit > 0 && (
        <>
          <div className="catbar-track">
            <div className="catbar-fill anim-barGrow" style={{ width: `${pct}%`, background: over ? 'var(--neg)' : 'var(--accent-grad)' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5, fontSize: 12, fontWeight: 700, color: over ? 'var(--neg)' : 'var(--ink-3)' }}>
            <span className="num">{cur(spent)} spent</span>
            <span className="num">{over ? `${cur(spent - limit)} over` : `${cur(limit - spent)} left`}</span>
          </div>
        </>
      )}
    </div>
  );
}

export function BudgetsTab() {
  const { data: categories = [] } = useCategories();
  const { data: budgets = [] } = useBudgets();
  const { data: expenses = [] } = useExpenses();
  const { upsert, remove } = useBudgetMutations();
  const toast = useToast();

  const month = firstDayOfCurrentMonth();
  const monthStart = startOfMonthStr();

  const monthBudgets = useMemo(
    () => Object.fromEntries(budgets.filter(b => b.month === month).map(b => [b.category_id, b])),
    [budgets, month]
  );
  const spentByCat = useMemo(() => {
    const map = {};
    for (const e of expenses) {
      if (e.type === 'income' || e.date < monthStart) continue;
      map[e.category_id] = (map[e.category_id] || 0) + Number(e.amount);
    }
    return map;
  }, [expenses, monthStart]);

  const totalLimit = Object.values(monthBudgets).reduce((a, b) => a + Number(b.limit_amount), 0);
  const totalSpent = Object.entries(spentByCat)
    .filter(([catId]) => monthBudgets[catId])
    .reduce((a, [, v]) => a + v, 0);
  const budgetedCount = Object.keys(monthBudgets).length;

  // Categories with the most spending first - those need budgets most
  const ordered = useMemo(
    () => [...categories].sort((a, b) => (spentByCat[b.id] || 0) - (spentByCat[a.id] || 0)),
    [categories, spentByCat]
  );

  const creep = useMemo(() => detectCreep(expenses, categories), [expenses, categories]);

  async function save(categoryId, amount) {
    try {
      await upsert.mutateAsync({ category_id: categoryId, month, limit_amount: amount });
      toast('Budget saved');
    } catch (err) { toast(err.message, 'error'); }
  }

  async function removeBudget(budget) {
    try { await remove.mutateAsync(budget.id); toast('Budget removed'); }
    catch (err) { toast(err.message, 'error'); }
  }

  return (
    <div>
      <div className="card pad rise" style={{ marginBottom: 18 }}>
        <div className="eyebrow">This month's budgets</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 8 }}>
          <span className="num" style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em' }}>{fmtK(totalSpent)}</span>
          <span style={{ fontSize: 14, color: 'var(--ink-3)', fontWeight: 600 }}>of {fmtK(totalLimit)} budgeted</span>
        </div>
        <div style={{ fontSize: 12.5, color: 'var(--ink-3)', fontWeight: 600, marginTop: 6 }}>
          {budgetedCount === 0
            ? 'No budgets yet — set limits on the categories you spend most in.'
            : `${budgetedCount} ${budgetedCount === 1 ? 'category' : 'categories'} budgeted`}
        </div>
      </div>

      {creep.length > 0 && (
        <div className="card pad" style={{ marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 18 }}>🐌</span>
            <div>
              <div style={{ fontSize: 14.5, fontWeight: 800 }}>Lifestyle creep check</div>
              <div style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 600 }}>
                This month's pace vs your last two months — creep hides in the day-to-day
              </div>
            </div>
          </div>
          {creep.map(f => (
            <div key={f.category.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderTop: '1px solid var(--hair)' }}>
              <span style={{ fontSize: 17 }}>{f.category.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 750 }}>{f.category.name}</div>
                <div style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 650 }}>
                  on pace for {cur(f.projected)} vs your usual {cur(f.avg)}
                </div>
              </div>
              <span className="num" style={{ fontSize: 13.5, fontWeight: 800, color: '#d97706', whiteSpace: 'nowrap' }}>+{f.pct}%</span>
            </div>
          ))}
        </div>
      )}

      <div className="card pad">
        {ordered.map(cat => (
          <BudgetRow
            key={cat.id}
            category={cat}
            budget={monthBudgets[cat.id]}
            spent={spentByCat[cat.id] || 0}
            onSave={(amount) => save(cat.id, amount)}
            onRemove={() => removeBudget(monthBudgets[cat.id])}
          />
        ))}
      </div>
    </div>
  );
}
