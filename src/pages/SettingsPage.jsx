import { useState } from 'react';
import { useToast } from '../components/layout/Toast';
import { Modal } from '../components/layout/Modal';
import { useRecurring } from '../hooks/useRecurring';
import { formatINR } from '../lib/dateUtils';
import { exportMonthlyReportCSV, exportExpensesCSV } from '../lib/reportExport';

const COLORS = ['#F97316','#3B82F6','#A855F7','#EC4899','#10B981','#F59E0B','#6366F1','#14B8A6','#6B7280','#EF4444'];

const SUGGESTED_CATEGORIES = [
  { name: 'Food', icon: '🍽️', color: '#F59E0B', desc: 'Groceries, restaurants, Swiggy/Zomato, tea/coffee, vegetables, dairy' },
  { name: 'Transport', icon: '🚗', color: '#3B82F6', desc: 'Cab, auto, Ola/Uber, petrol, bus/train, parking, toll' },
  { name: 'Housing', icon: '🏠', color: '#F97316', desc: 'Rent, electricity, water bill, maintenance, household items' },
  { name: 'Utilities', icon: '📱', color: '#6366F1', desc: 'Mobile recharge, internet/WiFi, OTT (Netflix/Prime), subscriptions' },
  { name: 'Shopping', icon: '🛍️', color: '#EC4899', desc: 'Clothes, Amazon/Flipkart, electronics, footwear, accessories' },
  { name: 'Health', icon: '💊', color: '#EF4444', desc: 'Doctor, medicines, hospital, gym, lab tests, health checkup' },
  { name: 'Personal Care', icon: '💆', color: '#A855F7', desc: 'Salon, haircut, skincare, toiletries, grooming products' },
  { name: 'Education', icon: '🎓', color: '#3B82F6', desc: 'School/college fees, books, online courses, stationery, coaching' },
  { name: 'Entertainment', icon: '🎉', color: '#F97316', desc: 'Movies, events, gaming, night out, bars, hobbies' },
  { name: 'Travel', icon: '✈️', color: '#0EA5E9', desc: 'Flights, trains, hotels, vacation packages, sightseeing' },
  { name: 'Finance', icon: '💸', color: '#10B981', desc: 'EMI, insurance premium, SIP/investments, loan payments, credit card' },
  { name: 'Family', icon: '👨‍👩‍👧', color: '#F59E0B', desc: 'Kids expenses, gifts, family outings, relatives, celebrations' },
  { name: 'Other', icon: '🙏', color: '#6B7280', desc: 'Pooja/religious, donations, charity, pet, anything that doesn\'t fit above' },
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
              <button className="btn-icon" onClick={() => onDeleteCategory(c.id)}>🗑️</button>
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

  const total = Object.values(values).reduce((a, v) => a + (Number(v) || 0), 0);

  return (
    <Modal title="Monthly Budgets" onClose={onClose}>
      <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 14 }}>
        Set a monthly spending limit per category. Leave blank for no limit.
      </p>
      <div className="budget-edit-list">
        {categories.map(c => {
          const val = values[c.id] || '';
          const filled = Number(val) > 0;
          return (
            <div key={c.id} className={`budget-edit-row ${filled ? 'budget-edit-row--filled' : ''}`}
              style={filled ? { borderColor: c.color + '66', background: c.color + '0d' } : {}}>
              <div className="budget-edit-left">
                <span className="budget-edit-icon" style={{ background: c.color + '22', color: c.color }}>
                  {c.icon}
                </span>
                <span className="budget-edit-name">{c.name}</span>
              </div>
              <div className="budget-edit-right">
                <span className="budget-edit-rupee" style={filled ? { color: c.color } : {}}>₹</span>
                <input
                  type="number"
                  inputMode="decimal"
                  placeholder="No limit"
                  value={val}
                  onChange={e => setValues(v => ({ ...v, [c.id]: e.target.value }))}
                  min="1"
                  className="budget-edit-input"
                  style={filled ? { color: c.color, fontWeight: 700 } : {}}
                />
              </div>
            </div>
          );
        })}
      </div>
      {total > 0 && (
        <div className="budget-edit-total">
          Total budget: <strong>₹{total.toLocaleString('en-IN')}/mo</strong>
        </div>
      )}
      <button className="btn-primary" style={{ width: '100%', marginTop: 16 }} onClick={handleSave}>
        Save Budgets
      </button>
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
    let count = 0;
    for (const cat of toAdd) {
      try {
        const { desc: _desc, ...catData } = cat;
        await onAdd(catData);
        count++;
      } catch (err) {
        toast(`Failed to add ${cat.name}: ${err.message}`, 'error');
      }
    }
    if (count > 0) toast(`${count} categories added!`);
    setAdding(false);
    onClose();
  }

  return (
    <Modal title="Pick Categories" onClose={onClose}>
      <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 12 }}>
        Tap to select. Already added ones are greyed out.
      </p>
      <div className="suggested-cats-list">
        {SUGGESTED_CATEGORIES.map(cat => {
          const already = existingNames.has(cat.name.toLowerCase());
          const picked = selected.has(cat.name);
          return (
            <button
              key={cat.name}
              type="button"
              className={`suggested-cat-row ${picked ? 'selected' : ''} ${already ? 'disabled' : ''}`}
              style={picked ? { background: cat.color + '18', borderColor: cat.color } : {}}
              onClick={() => { if (!already) toggle(cat.name); }}
              disabled={already}
            >
              <span className="suggested-cat-icon" style={{ background: cat.color + '22', color: cat.color }}>
                {cat.icon}
              </span>
              <div className="suggested-cat-info">
                <div className="suggested-cat-name" style={picked ? { color: cat.color } : {}}>
                  {cat.name}
                  {already && <span className="suggested-cat-added">✓ added</span>}
                </div>
                <div className="suggested-cat-desc">{cat.desc}</div>
              </div>
              {picked && <span className="suggested-cat-check" style={{ color: cat.color }}>✓</span>}
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
