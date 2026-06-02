import { useState } from 'react';
import { useToast } from '../components/layout/Toast';
import { Modal } from '../components/layout/Modal';
import { useRecurring } from '../hooks/useRecurring';
import { formatINR } from '../lib/dateUtils';
import { exportMonthlyReportCSV, exportExpensesCSV } from '../lib/reportExport';

const COLORS = ['#F97316','#3B82F6','#A855F7','#EC4899','#10B981','#F59E0B','#6366F1','#14B8A6','#6B7280','#EF4444'];

const SUGGESTED_CATEGORIES = [
  { name: 'Rent', icon: '🏠', color: '#F97316' },
  { name: 'Groceries', icon: '🛒', color: '#10B981' },
  { name: 'Food & Dining', icon: '🍽️', color: '#F59E0B' },
  { name: 'Transport', icon: '🚗', color: '#3B82F6' },
  { name: 'Auto / Cab', icon: '🛺', color: '#0EA5E9' },
  { name: 'Petrol', icon: '⛽', color: '#EF4444' },
  { name: 'Mobile Recharge', icon: '📱', color: '#6366F1' },
  { name: 'Electricity', icon: '💡', color: '#F59E0B' },
  { name: 'Internet / WiFi', icon: '🌐', color: '#14B8A6' },
  { name: 'OTT / Streaming', icon: '🎬', color: '#A855F7' },
  { name: 'Shopping', icon: '🛍️', color: '#EC4899' },
  { name: 'Clothing', icon: '👗', color: '#EC4899' },
  { name: 'Health / Medical', icon: '💊', color: '#EF4444' },
  { name: 'Gym / Fitness', icon: '🏋️', color: '#10B981' },
  { name: 'Personal Care', icon: '💇', color: '#A855F7' },
  { name: 'Education', icon: '🎓', color: '#3B82F6' },
  { name: 'EMI', icon: '🏦', color: '#6B7280' },
  { name: 'Insurance', icon: '🛡️', color: '#14B8A6' },
  { name: 'Investment / SIP', icon: '📈', color: '#10B981' },
  { name: 'Entertainment', icon: '🎉', color: '#F97316' },
  { name: 'Travel', icon: '✈️', color: '#0EA5E9' },
  { name: 'Hotels', icon: '🏨', color: '#6366F1' },
  { name: 'Gifts', icon: '🎁', color: '#EC4899' },
  { name: 'Family', icon: '👨‍👩‍👧', color: '#F59E0B' },
  { name: 'Kids', icon: '👶', color: '#F97316' },
  { name: 'Pet', icon: '🐶', color: '#F59E0B' },
  { name: 'Pooja / Religious', icon: '🙏', color: '#F97316' },
  { name: 'Alcohol', icon: '🍺', color: '#6B7280' },
  { name: 'Tobacco', icon: '🚬', color: '#6B7280' },
  { name: 'Subscriptions', icon: '🔄', color: '#A855F7' },
  { name: 'Home Maintenance', icon: '🔧', color: '#6B7280' },
  { name: 'Vegetables', icon: '🥦', color: '#10B981' },
  { name: 'Milk / Dairy', icon: '🥛', color: '#14B8A6' },
  { name: 'Swiggy / Zomato', icon: '📦', color: '#F97316' },
  { name: 'Salon', icon: '💈', color: '#EC4899' },
  { name: 'Charity / Donation', icon: '❤️', color: '#EF4444' },
  { name: 'Stationery', icon: '📝', color: '#6366F1' },
  { name: 'Books', icon: '📚', color: '#3B82F6' },
  { name: 'Games', icon: '🎮', color: '#A855F7' },
  { name: 'Parking / Toll', icon: '🅿️', color: '#6B7280' },
];

export function SettingsPage({ profile, onUpdateProfile, categories, onAddCategory, onDeleteCategory, budgets, onUpsertBudget, emis, onAddEmi, onDeleteEmi, bills, onAddBill, onDeleteBill, expenses, userId, onSignOut }) {
  const toast = useToast();
  const { recurring, addRecurring, toggleRecurring, deleteRecurring } = useRecurring(userId);
  const [income, setIncome] = useState(profile?.monthly_income?.toString() || '');
  const [payday, setPayday] = useState(profile?.payday_day?.toString() || '');
  const [showAddCat, setShowAddCat] = useState(false);
  const [catName, setCatName] = useState('');
  const [catIcon, setCatIcon] = useState('💰');
  const [catColor, setCatColor] = useState('#6366F1');
  const [showAddRec, setShowAddRec] = useState(false);
  const [showBudgets, setShowBudgets] = useState(false);
  const [showAddEmi, setShowAddEmi] = useState(false);
  const [showAddBill, setShowAddBill] = useState(false);
  const [showSuggestedCats, setShowSuggestedCats] = useState(false);

  async function saveIncome(e) {
    e.preventDefault();
    await onUpdateProfile({ monthly_income: Number(income) || null, payday_day: Number(payday) || null });
    toast('Profile saved');
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
        <h4>Profile</h4>
        <p className="section-desc">Income is used for savings rate. Payday enables the salary countdown.</p>
        <form onSubmit={saveIncome} className="expense-form">
          <div className="form-row">
            <div className="form-group">
              <label>Monthly Income (₹)</label>
              <input type="number" inputMode="decimal" placeholder="e.g. 50000" value={income} onChange={e => setIncome(e.target.value)} min="1" />
            </div>
            <div className="form-group">
              <label>Salary Day (1–31)</label>
              <input type="number" inputMode="numeric" placeholder="e.g. 1" value={payday} onChange={e => setPayday(e.target.value)} min="1" max="31" />
            </div>
          </div>
          <button type="submit" className="btn-primary btn-sm">Save Profile</button>
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
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-secondary btn-sm" onClick={() => setShowSuggestedCats(true)}>+ From List</button>
            <button className="btn-secondary btn-sm" onClick={() => setShowAddCat(true)}>+ Custom</button>
          </div>
        </div>
        <p className="section-desc">Tap "From List" to pick from 40 preset categories</p>
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

      {/* Bills */}
      <div className="section-card">
        <div className="section-header">
          <h4>Bill Reminders</h4>
          <button className="btn-secondary btn-sm" onClick={() => setShowAddBill(true)}>+ Add</button>
        </div>
        <p className="section-desc">Get alerted on Dashboard when a bill is due within 7 days</p>
        {bills.length === 0 ? <p className="empty-hint">No bills set</p> : (
          <div className="recurring-list">
            {bills.map(b => (
              <div key={b.id} className="recurring-item">
                <div>
                  <span>{b.category?.icon || '💳'} <strong>{b.name}</strong></span>
                  <span className="recurring-meta">{formatINR(b.amount)} · Due {b.due_day}th of month</span>
                </div>
                <button className="btn-icon" onClick={() => onDeleteBill(b.id)}>🗑️</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* EMIs */}
      <div className="section-card">
        <div className="section-header">
          <h4>EMI Tracker</h4>
          <button className="btn-secondary btn-sm" onClick={() => setShowAddEmi(true)}>+ Add</button>
        </div>
        <p className="section-desc">Track car loans, home loans, phone EMIs — see progress and end dates</p>
        {emis.length === 0 ? <p className="empty-hint">No EMIs tracked</p> : (
          <div className="recurring-list">
            {emis.map(e => {
              const start = new Date(e.start_date + 'T00:00:00');
              const end = new Date(start);
              end.setMonth(end.getMonth() + e.tenure_months);
              return (
                <div key={e.id} className="recurring-item">
                  <div>
                    <span><strong>{e.name}</strong></span>
                    <span className="recurring-meta">
                      {formatINR(e.emi_amount)}/mo · {e.tenure_months} months · Ends {end.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <button className="btn-icon" onClick={() => onDeleteEmi(e.id)}>🗑️</button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Export */}
      <div className="section-card">
        <h4>Export Data</h4>
        <p className="section-desc">Download your expenses as CSV for use in Excel or Google Sheets</p>
        <div className="export-btns">
          <button className="btn-secondary" onClick={() => { exportMonthlyReportCSV(expenses, budgets, profile); toast('Report downloaded'); }}>
            📊 Monthly Report CSV
          </button>
          <button className="btn-secondary" onClick={() => { exportExpensesCSV(expenses); toast('Expenses downloaded'); }}>
            📋 All Expenses CSV
          </button>
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

      {showSuggestedCats && (
        <SuggestedCategoriesModal
          existing={categories}
          onAdd={async cat => { await onAddCategory(cat); }}
          onClose={() => setShowSuggestedCats(false)}
          toast={toast}
        />
      )}

      {showAddBill && (
        <AddBillModal categories={categories} onAdd={async (d) => { await onAddBill(d); toast('Bill added'); setShowAddBill(false); }} onClose={() => setShowAddBill(false)} />
      )}

      {showAddEmi && (
        <AddEmiModal onAdd={async (d) => { await onAddEmi(d); toast('EMI added'); setShowAddEmi(false); }} onClose={() => setShowAddEmi(false)} />
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

function AddBillModal({ categories, onAdd, onClose }) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDay, setDueDay] = useState('');
  const [catId, setCatId] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    await onAdd({ name, amount: Number(amount), due_day: Number(dueDay), category_id: catId || null });
  }

  return (
    <Modal title="Add Bill Reminder" onClose={onClose}>
      <form onSubmit={handleSubmit} className="expense-form">
        <div className="form-group">
          <label>Bill Name</label>
          <input type="text" placeholder="e.g. Electricity, Netflix" value={name} onChange={e => setName(e.target.value)} required />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Amount (₹)</label>
            <input type="number" inputMode="decimal" value={amount} onChange={e => setAmount(e.target.value)} min="1" required />
          </div>
          <div className="form-group">
            <label>Due Day (1–31)</label>
            <input type="number" inputMode="numeric" value={dueDay} onChange={e => setDueDay(e.target.value)} min="1" max="31" required />
          </div>
        </div>
        <div className="form-group">
          <label>Category (optional)</label>
          <select value={catId} onChange={e => setCatId(e.target.value)}>
            <option value="">None</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
          </select>
        </div>
        <button type="submit" className="btn-primary">Add Bill</button>
      </form>
    </Modal>
  );
}

function AddEmiModal({ onAdd, onClose }) {
  const [name, setName] = useState('');
  const [principal, setPrincipal] = useState('');
  const [emiAmt, setEmiAmt] = useState('');
  const [rate, setRate] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [tenure, setTenure] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    await onAdd({
      name,
      principal: Number(principal),
      emi_amount: Number(emiAmt),
      interest_rate: Number(rate) || 0,
      start_date: startDate,
      tenure_months: Number(tenure),
    });
  }

  return (
    <Modal title="Add EMI" onClose={onClose}>
      <form onSubmit={handleSubmit} className="expense-form">
        <div className="form-group">
          <label>EMI Name</label>
          <input type="text" placeholder="e.g. Home Loan, iPhone 15" value={name} onChange={e => setName(e.target.value)} required />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Loan Amount (₹)</label>
            <input type="number" inputMode="decimal" value={principal} onChange={e => setPrincipal(e.target.value)} min="1" required />
          </div>
          <div className="form-group">
            <label>Monthly EMI (₹)</label>
            <input type="number" inputMode="decimal" value={emiAmt} onChange={e => setEmiAmt(e.target.value)} min="1" required />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Tenure (months)</label>
            <input type="number" inputMode="numeric" value={tenure} onChange={e => setTenure(e.target.value)} min="1" required />
          </div>
          <div className="form-group">
            <label>Interest Rate (%)</label>
            <input type="number" inputMode="decimal" step="0.01" value={rate} onChange={e => setRate(e.target.value)} min="0" />
          </div>
        </div>
        <div className="form-group">
          <label>Start Date</label>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required />
        </div>
        <button type="submit" className="btn-primary">Add EMI</button>
      </form>
    </Modal>
  );
}

function SuggestedCategoriesModal({ existing, onAdd, onClose, toast }) {
  const existingNames = new Set(existing.map(c => c.name.toLowerCase()));
  const [selected, setSelected] = useState(new Set());
  const [adding, setAdding] = useState(false);

  function toggle(name) {
    setSelected(s => {
      const n = new Set(s);
      n.has(name) ? n.delete(name) : n.add(name);
      return n;
    });
  }

  async function handleAdd() {
    const toAdd = SUGGESTED_CATEGORIES.filter(c => selected.has(c.name));
    if (!toAdd.length) return;
    setAdding(true);
    for (const cat of toAdd) {
      await onAdd(cat);
    }
    toast(`${toAdd.length} categories added!`);
    setAdding(false);
    onClose();
  }

  return (
    <Modal title="Pick Categories" onClose={onClose}>
      <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 12 }}>
        Tap to select. Already added ones are greyed out.
      </p>
      <div className="suggested-cats-grid">
        {SUGGESTED_CATEGORIES.map(cat => {
          const already = existingNames.has(cat.name.toLowerCase());
          const picked = selected.has(cat.name);
          return (
            <button
              key={cat.name}
              type="button"
              className={`suggested-cat-btn ${picked ? 'selected' : ''} ${already ? 'disabled' : ''}`}
              style={picked ? { background: cat.color + '33', borderColor: cat.color, color: cat.color } : {}}
              onClick={() => { if (!already) toggle(cat.name); }}
              disabled={already}
            >
              <span style={{ fontSize: 18 }}>{cat.icon}</span>
              <span style={{ fontSize: 11, fontWeight: 600 }}>{cat.name}</span>
              {already && <span style={{ fontSize: 9, color: 'var(--color-text-muted)' }}>added</span>}
            </button>
          );
        })}
      </div>
      <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{selected.size} selected</span>
        <button className="btn-primary" onClick={handleAdd} disabled={selected.size === 0 || adding}>
          {adding ? 'Adding...' : `Add ${selected.size} Categories`}
        </button>
      </div>
    </Modal>
  );
}
