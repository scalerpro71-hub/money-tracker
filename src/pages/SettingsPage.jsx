import { useState } from 'react';
import { useToast } from '../components/layout/Toast';
import { Modal } from '../components/layout/Modal';
import { useRecurring } from '../hooks/useRecurring';
import { formatINR } from '../lib/dateUtils';

const COLORS = ['#F97316','#3B82F6','#A855F7','#EC4899','#10B981','#F59E0B','#6366F1','#14B8A6','#6B7280','#EF4444'];

export function SettingsPage({ profile, onUpdateProfile, categories, onAddCategory, onDeleteCategory, budgets, onUpsertBudget, userId, onSignOut }) {
  const toast = useToast();
  const { recurring, addRecurring, toggleRecurring, deleteRecurring } = useRecurring(userId);
  const [income, setIncome] = useState(profile?.monthly_income?.toString() || '');
  const [showAddCat, setShowAddCat] = useState(false);
  const [catName, setCatName] = useState('');
  const [catIcon, setCatIcon] = useState('💰');
  const [catColor, setCatColor] = useState('#6366F1');
  const [showAddRec, setShowAddRec] = useState(false);
  const [showBudgets, setShowBudgets] = useState(false);

  async function saveIncome(e) {
    e.preventDefault();
    await onUpdateProfile({ monthly_income: Number(income) || null });
    toast('Income saved');
  }

  async function handleAddCat(e) {
    e.preventDefault();
    await onAddCategory({ name: catName, icon: catIcon, color: catColor });
    toast('Category added');
    setShowAddCat(false);
    setCatName(''); setCatIcon('💰'); setCatColor('#6366F1');
  }

  return (
    <div className="page">
      <div className="page-header"><h2>Settings</h2></div>

      <div className="section-card">
        <h4>Monthly Income</h4>
        <p className="section-desc">Used by AI to calculate savings rate and advice</p>
        <form onSubmit={saveIncome} className="inline-form">
          <input type="number" inputMode="decimal" placeholder="e.g. 50000" value={income} onChange={e => setIncome(e.target.value)} min="1" />
          <button type="submit" className="btn-primary btn-sm">Save</button>
        </form>
      </div>

      <div className="section-card">
        <div className="section-header">
          <h4>Monthly Budgets</h4>
          <button className="btn-secondary btn-sm" onClick={() => setShowBudgets(true)}>Edit Budgets</button>
        </div>
        <p className="section-desc">Set spending limits per category for budget progress bars</p>
        {budgets.length === 0 ? <p className="empty-hint">No budgets set</p> : (
          <div className="budget-summary">
            {budgets.map(b => (
              <div key={b.id} className="budget-summary-row">
                <span>{b.category?.icon} {b.category?.name}</span>
                <span>{formatINR(b.limit_amount)}/mo</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="section-card">
        <div className="section-header">
          <h4>Recurring Expenses</h4>
          <button className="btn-secondary btn-sm" onClick={() => setShowAddRec(true)}>+ Add</button>
        </div>
        <p className="section-desc">Auto-logged on their scheduled day each month/week</p>
        {recurring.length === 0 ? <p className="empty-hint">No recurring expenses</p> : (
          <div className="recurring-list">
            {recurring.map(r => (
              <div key={r.id} className="recurring-item">
                <div>
                  <span>{r.category?.icon} <strong>{r.name}</strong></span>
                  <span className="recurring-meta">
                    {formatINR(r.amount)} · {r.frequency === 'monthly' ? `${r.day_of_month}th of month` : `Every ${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][r.day_of_week]}`}
                  </span>
                </div>
                <div className="recurring-actions">
                  <label className="toggle">
                    <input type="checkbox" checked={r.is_active} onChange={e => toggleRecurring(r.id, e.target.checked)} />
                    <span className="toggle-slider" />
                  </label>
                  <button className="btn-icon" onClick={() => deleteRecurring(r.id)}>🗑️</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="section-card">
        <div className="section-header">
          <h4>Categories</h4>
          <button className="btn-secondary btn-sm" onClick={() => setShowAddCat(true)}>+ Add</button>
        </div>
        <div className="cat-list">
          {categories.map(c => (
            <div key={c.id} className="cat-item">
              <span style={{ color: c.color }}>{c.icon} {c.name}</span>
              {!c.is_default && (
                <button className="btn-icon" onClick={() => onDeleteCategory(c.id)}>🗑️</button>
              )}
            </div>
          ))}
        </div>
      </div>

      <button className="btn-danger" onClick={onSignOut}>Sign Out</button>

      {showAddCat && (
        <Modal title="Add Category" onClose={() => setShowAddCat(false)}>
          <form onSubmit={handleAddCat} className="expense-form">
            <div className="form-group">
              <label>Name</label>
              <input type="text" placeholder="e.g. Gym" value={catName} onChange={e => setCatName(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Icon (emoji)</label>
              <input type="text" placeholder="💪" value={catIcon} onChange={e => setCatIcon(e.target.value)} maxLength={2} />
            </div>
            <div className="form-group">
              <label>Color</label>
              <div className="color-picker">
                {COLORS.map(c => (
                  <button key={c} type="button" className={`color-dot ${catColor === c ? 'selected' : ''}`}
                    style={{ background: c }} onClick={() => setCatColor(c)} />
                ))}
              </div>
            </div>
            <button type="submit" className="btn-primary">Add Category</button>
          </form>
        </Modal>
      )}

      {showAddRec && (
        <AddRecurringModal categories={categories} onAdd={async (d) => { await addRecurring(d); toast('Recurring expense added'); setShowAddRec(false); }} onClose={() => setShowAddRec(false)} />
      )}

      {showBudgets && (
        <BudgetEditModal categories={categories} budgets={budgets} onUpsert={onUpsertBudget} onClose={() => setShowBudgets(false)} />
      )}
    </div>
  );
}

function AddRecurringModal({ categories, onAdd, onClose }) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [catId, setCatId] = useState('');
  const [freq, setFreq] = useState('monthly');
  const [dayOfMonth, setDayOfMonth] = useState('1');
  const [dayOfWeek, setDayOfWeek] = useState('1');

  async function handleSubmit(e) {
    e.preventDefault();
    await onAdd({
      name, amount: Number(amount), category_id: catId || null,
      frequency: freq,
      day_of_month: freq === 'monthly' ? Number(dayOfMonth) : null,
      day_of_week: freq === 'weekly' ? Number(dayOfWeek) : null,
      payment_mode: 'upi',
    });
  }

  return (
    <Modal title="Add Recurring Expense" onClose={onClose}>
      <form onSubmit={handleSubmit} className="expense-form">
        <div className="form-group">
          <label>Name</label>
          <input type="text" placeholder="e.g. Rent, Netflix" value={name} onChange={e => setName(e.target.value)} required />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Amount (₹)</label>
            <input type="number" inputMode="decimal" value={amount} onChange={e => setAmount(e.target.value)} min="1" required />
          </div>
          <div className="form-group">
            <label>Category</label>
            <select value={catId} onChange={e => setCatId(e.target.value)}>
              <option value="">None</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Frequency</label>
            <select value={freq} onChange={e => setFreq(e.target.value)}>
              <option value="monthly">Monthly</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>
          {freq === 'monthly' && (
            <div className="form-group">
              <label>Day of Month</label>
              <input type="number" value={dayOfMonth} onChange={e => setDayOfMonth(e.target.value)} min="1" max="28" required />
            </div>
          )}
          {freq === 'weekly' && (
            <div className="form-group">
              <label>Day of Week</label>
              <select value={dayOfWeek} onChange={e => setDayOfWeek(e.target.value)}>
                {['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'].map((d, i) => (
                  <option key={i} value={i}>{d}</option>
                ))}
              </select>
            </div>
          )}
        </div>
        <button type="submit" className="btn-primary">Add Recurring</button>
      </form>
    </Modal>
  );
}

function BudgetEditModal({ categories, budgets, onUpsert, onClose }) {
  const [values, setValues] = useState(() => {
    const m = {};
    for (const b of budgets) m[b.category_id] = b.limit_amount.toString();
    return m;
  });
  const toast = useToast();

  async function handleSave() {
    for (const [catId, val] of Object.entries(values)) {
      if (val && Number(val) > 0) await onUpsert(catId, Number(val));
    }
    toast('Budgets saved');
    onClose();
  }

  return (
    <Modal title="Edit Budgets" onClose={onClose}>
      <div className="expense-form">
        {categories.map(c => (
          <div key={c.id} className="form-row form-row--center">
            <label className="budget-label-col">{c.icon} {c.name}</label>
            <input type="number" inputMode="decimal" placeholder="No limit" value={values[c.id] || ''}
              onChange={e => setValues(v => ({ ...v, [c.id]: e.target.value }))} min="1" />
          </div>
        ))}
        <button className="btn-primary" onClick={handleSave}>Save All Budgets</button>
      </div>
    </Modal>
  );
}
