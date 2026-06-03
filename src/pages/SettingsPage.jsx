import { useState } from 'react';
import { useToast } from '../components/layout/Toast';
import { Modal } from '../components/layout/Modal';
import { Icon } from '../components/layout/Icon';
import { useTheme } from '../contexts/ThemeContext';
import { useRecurring } from '../hooks/useRecurring';
import { fmtK } from '../lib/formatUtils';
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

export function SettingsPage({ profile, onUpdateProfile, categories, onAddCategory, onDeleteCategory, budgets, onUpsertBudget, emis, onAddEmi, onUpdateEmi, onDeleteEmi, bills, onAddBill, onUpdateBill, onDeleteBill, expenses, userId, onSignOut }) {
  const toast = useToast();
  const { theme, toggle: toggleTheme } = useTheme();
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
  const [editingEmi, setEditingEmi] = useState(null);
  const [showAddBill, setShowAddBill] = useState(false);
  const [editingBill, setEditingBill] = useState(null);
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

  const initials = (profile?.full_name || profile?.email || 'U').slice(0, 2).toUpperCase();

  return (
    <div>
      {/* Profile card */}
      <div className="card pad rise" style={{ '--d': '0ms', marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div className="avatar" style={{ width: 56, height: 56, fontSize: 20, borderRadius: 18, flexShrink: 0 }}>{initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: 16, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {profile?.full_name || 'Your Name'}
            </div>
            <div style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 600, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {profile?.email || ''}
            </div>
          </div>
          <span className="chip" style={{ background: 'linear-gradient(135deg,#0a9d72,#0a8a86)', color: '#fff', fontSize: 11, fontWeight: 800, letterSpacing: '0.06em', padding: '4px 10px' }}>PRO</span>
        </div>
      </div>

      {/* Money setup */}
      <div className="card pad rise" style={{ '--d': '60ms', marginBottom: 18 }}>
        <div className="eyebrow" style={{ marginBottom: 14 }}>Money Setup</div>
        <form onSubmit={saveIncome}>
          <div className="set-row">
            <div className="set-ico"><Icon name="wallet" size={18} /></div>
            <div style={{ flex: 1 }}>
              <div className="set-label">Monthly income</div>
              <div className="set-sub">Used for savings-rate &amp; forecasts</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: 'var(--ink-3)', fontWeight: 600 }}>₹</span>
              <input
                type="number" inputMode="decimal" placeholder="50000" value={income}
                onChange={e => setIncome(e.target.value)} min="1"
                style={{ width: 110, padding: '6px 10px', border: '1px solid var(--hair-2)', borderRadius: 'var(--r-sm)', background: 'var(--surface-2)', color: 'var(--ink)', fontSize: 14, fontFamily: 'var(--font-num)', fontWeight: 700, outline: 'none', textAlign: 'right' }}
              />
            </div>
          </div>
          <div className="set-row">
            <div className="set-ico"><Icon name="calendar" size={18} /></div>
            <div style={{ flex: 1 }}>
              <div className="set-label">Salary date</div>
              <div className="set-sub">For pay-cycle countdown</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input
                type="number" inputMode="numeric" placeholder="1" value={payday}
                onChange={e => setPayday(e.target.value)} min="1" max="31"
                style={{ width: 54, padding: '6px 10px', border: '1px solid var(--hair-2)', borderRadius: 'var(--r-sm)', background: 'var(--surface-2)', color: 'var(--ink)', fontSize: 14, fontFamily: 'var(--font-num)', fontWeight: 700, outline: 'none', textAlign: 'center' }}
              />
              <span className="set-val">of month</span>
            </div>
          </div>
          <button type="submit" className="btn-accent" style={{ width: '100%', justifyContent: 'center', padding: '11px', marginTop: 8 }}>Save Setup</button>
        </form>
      </div>

      {/* Monthly Budgets */}
      <div className="card pad rise" style={{ '--d': '120ms', marginBottom: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div className="eyebrow">Monthly Budgets</div>
          <button className="btn-ghost" style={{ padding: '7px 12px', fontSize: 13 }} onClick={() => setShowBudgets(true)}>
            <Icon name="gear" size={13} />Edit
          </button>
        </div>
        {budgets.length === 0 ? (
          <div style={{ fontSize: 13, color: 'var(--ink-3)', fontWeight: 600 }}>No budgets set — tap Edit to add limits</div>
        ) : budgets.map(b => (
          <div key={b.id} className="set-row" style={{ borderTop: '1px solid var(--hair)' }}>
            <span style={{ fontWeight: 600, fontSize: 14 }}>{b.category?.icon} {b.category?.name}</span>
            <span className="num" style={{ fontWeight: 700, fontSize: 14, color: 'var(--pos)' }}>{fmtK(b.limit_amount)}/mo</span>
          </div>
        ))}
      </div>

      {/* Recurring Expenses */}
      <div className="card pad rise" style={{ '--d': '180ms', marginBottom: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div className="eyebrow">Recurring Expenses</div>
          <button className="btn-ghost" style={{ padding: '7px 12px', fontSize: 13 }} onClick={() => setShowAddRec(true)}>
            <Icon name="plus" size={13} />Add
          </button>
        </div>
        {recurring.length === 0 ? (
          <div style={{ fontSize: 13, color: 'var(--ink-3)', fontWeight: 600 }}>No recurring expenses — auto-logged monthly/weekly</div>
        ) : recurring.map(r => (
          <div key={r.id} className="set-row" style={{ borderTop: '1px solid var(--hair)' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{r.category?.icon} {r.name}</div>
              <div style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 600, marginTop: 2 }}>
                {fmtK(r.amount)} · {r.frequency === 'monthly' ? `${r.day_of_month}th of month` : `Every ${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][r.day_of_week]}`}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input type="checkbox" checked={r.is_active} onChange={e => toggleRecurring(r.id, e.target.checked)} style={{ width: 36, height: 20, accentColor: 'var(--accent)' }} />
              </label>
              <button className="icon-btn" style={{ width: 28, height: 28, color: 'var(--neg)' }} onClick={() => deleteRecurring(r.id)}>×</button>
            </div>
          </div>
        ))}
      </div>

      {/* Categories */}
      <div className="card pad rise" style={{ '--d': '240ms', marginBottom: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <div className="eyebrow">Categories</div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="btn-ghost" style={{ padding: '7px 12px', fontSize: 13 }} onClick={() => setShowSuggestedCats(true)}>+ From List</button>
            <button className="btn-ghost" style={{ padding: '7px 12px', fontSize: 13 }} onClick={() => setShowAddCat(true)}>
              <Icon name="plus" size={13} />Custom
            </button>
          </div>
        </div>
        <div style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 600, marginBottom: 12 }}>Tap "From List" for 13 preset categories</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {categories.map(c => (
            <div key={c.id} className="chip" style={{ background: c.color + '18', border: `1px solid ${c.color}44`, color: c.color, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
              {c.icon} {c.name}
              <button style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: '0 0 0 4px', fontSize: 13, opacity: 0.7 }} onClick={() => onDeleteCategory(c.id)}>×</button>
            </div>
          ))}
        </div>
      </div>

      {/* Bill Reminders */}
      <div className="card pad rise" style={{ '--d': '300ms', marginBottom: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div>
            <div className="eyebrow">Bill Reminders</div>
            <div style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 600, marginTop: 3 }}>Alerts on Dashboard when due within 7 days</div>
          </div>
          <button className="btn-ghost" style={{ padding: '7px 12px', fontSize: 13 }} onClick={() => setShowAddBill(true)}>
            <Icon name="plus" size={13} />Add
          </button>
        </div>
        {bills.length === 0 ? (
          <div style={{ fontSize: 13, color: 'var(--ink-3)', fontWeight: 600 }}>No bills set</div>
        ) : bills.map(b => (
          <div key={b.id} className="set-row" style={{ borderTop: '1px solid var(--hair)' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{b.category?.icon || '💳'} {b.name}</div>
              <div style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 600, marginTop: 2 }}>{fmtK(b.amount)} · Due {b.due_day}th of month</div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="icon-btn" style={{ width: 28, height: 28 }} onClick={() => setEditingBill(b)}><Icon name="gear" size={13} /></button>
              <button className="icon-btn" style={{ width: 28, height: 28, color: 'var(--neg)' }} onClick={() => onDeleteBill(b.id)}>×</button>
            </div>
          </div>
        ))}
      </div>

      {/* EMI Tracker */}
      <div className="card pad rise" style={{ '--d': '360ms', marginBottom: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div>
            <div className="eyebrow">EMI Tracker</div>
            <div style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 600, marginTop: 3 }}>Car loans, home loans, phone EMIs</div>
          </div>
          <button className="btn-ghost" style={{ padding: '7px 12px', fontSize: 13 }} onClick={() => setShowAddEmi(true)}>
            <Icon name="plus" size={13} />Add
          </button>
        </div>
        {emis.length === 0 ? (
          <div style={{ fontSize: 13, color: 'var(--ink-3)', fontWeight: 600 }}>No EMIs tracked</div>
        ) : emis.map(e => {
          const start = new Date(e.start_date + 'T00:00:00');
          const end = new Date(start);
          end.setMonth(end.getMonth() + e.tenure_months);
          return (
            <div key={e.id} className="set-row" style={{ borderTop: '1px solid var(--hair)' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{e.name}</div>
                <div style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 600, marginTop: 2 }}>
                  {fmtK(e.emi_amount)}/mo · {e.tenure_months} months · Ends {end.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button className="icon-btn" style={{ width: 28, height: 28 }} onClick={() => setEditingEmi(e)}><Icon name="gear" size={13} /></button>
                <button className="icon-btn" style={{ width: 28, height: 28, color: 'var(--neg)' }} onClick={() => onDeleteEmi(e.id)}>×</button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Preferences */}
      <div className="card pad rise" style={{ '--d': '390ms', marginBottom: 18 }}>
        <div className="eyebrow" style={{ marginBottom: 14 }}>Preferences</div>
        <div className="set-row" style={{ cursor: 'pointer' }} onClick={toggleTheme}>
          <div className="set-ico"><Icon name={theme === 'dark' ? 'sun' : 'moon'} size={18} /></div>
          <div style={{ flex: 1 }}>
            <div className="set-label">Appearance</div>
            <div className="set-sub">{theme === 'dark' ? 'Dark mode' : 'Light mode'}</div>
          </div>
          <span className="chip">{theme === 'dark' ? 'Dark' : 'Light'}</span>
        </div>
        <div className="set-row">
          <div className="set-ico"><Icon name="shield" size={18} /></div>
          <div style={{ flex: 1 }}>
            <div className="set-label">Currency &amp; region</div>
          </div>
          <span className="set-val">₹ INR · India</span>
        </div>
        <div className="set-row">
          <div className="set-ico"><Icon name="bell" size={18} /></div>
          <div style={{ flex: 1 }}>
            <div className="set-label">Notifications</div>
            <div className="set-sub">Budget alerts, bill reminders</div>
          </div>
          <span className="chip pos">On</span>
        </div>
      </div>

      {/* Export */}
      <div className="card pad rise" style={{ '--d': '450ms', marginBottom: 18 }}>
        <div className="eyebrow" style={{ marginBottom: 14 }}>Export Data</div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn-ghost" style={{ flex: 1 }} onClick={() => { exportMonthlyReportCSV(expenses, budgets, profile); toast('Report downloaded'); }}>
            📊 Monthly Report
          </button>
          <button className="btn-ghost" style={{ flex: 1 }} onClick={() => { exportExpensesCSV(expenses); toast('Expenses downloaded'); }}>
            📋 All Expenses
          </button>
        </div>
      </div>

      {/* Sign out */}
      <button
        className="rise" style={{ '--d': '510ms' }}
        onClick={onSignOut}
        style={{ width: '100%', padding: '13px', border: '1px solid var(--neg)', borderRadius: 'var(--r-md)', background: 'transparent', color: 'var(--neg)', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'var(--font-body)' }}
      >
        Sign Out
      </button>

      {/* Modals */}
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
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {COLORS.map(c => (
                  <button key={c} type="button"
                    style={{ width: 28, height: 28, borderRadius: '50%', background: c, border: catColor === c ? '3px solid var(--ink)' : '2px solid transparent', cursor: 'pointer' }}
                    onClick={() => setCatColor(c)} />
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
      {editingBill && (
        <AddBillModal categories={categories} initial={editingBill} onAdd={async (d) => { await onUpdateBill(editingBill.id, d); toast('Bill updated'); setEditingBill(null); }} onClose={() => setEditingBill(null)} submitLabel="Save Changes" />
      )}

      {showAddEmi && (
        <AddEmiModal onAdd={async (d) => { await onAddEmi(d); toast('EMI added'); setShowAddEmi(false); }} onClose={() => setShowAddEmi(false)} />
      )}
      {editingEmi && (
        <AddEmiModal initial={editingEmi} onAdd={async (d) => { await onUpdateEmi(editingEmi.id, d); toast('EMI updated'); setEditingEmi(null); }} onClose={() => setEditingEmi(null)} submitLabel="Save Changes" />
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
      <p style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 14 }}>
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
                <div className="budget-edit-name-wrap">
                  <span className="budget-edit-name">{c.name}</span>
                  {(() => { const meta = SUGGESTED_CATEGORIES.find(s => s.name === c.name); return meta ? <span className="budget-edit-hint">{meta.desc}</span> : null; })()}
                </div>
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

function AddBillModal({ categories, onAdd, onClose, initial, submitLabel = 'Add Bill' }) {
  const [name, setName] = useState(initial?.name || '');
  const [amount, setAmount] = useState(initial?.amount?.toString() || '');
  const [dueDay, setDueDay] = useState(initial?.due_day?.toString() || '');
  const [catId, setCatId] = useState(initial?.category_id || '');

  async function handleSubmit(e) {
    e.preventDefault();
    await onAdd({ name, amount: Number(amount), due_day: Number(dueDay), category_id: catId || null });
  }

  return (
    <Modal title={initial ? 'Edit Bill' : 'Add Bill Reminder'} onClose={onClose}>
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
        <button type="submit" className="btn-primary">{submitLabel}</button>
      </form>
    </Modal>
  );
}

function AddEmiModal({ onAdd, onClose, initial, submitLabel = 'Add EMI' }) {
  const [name, setName] = useState(initial?.name || '');
  const [principal, setPrincipal] = useState(initial?.principal?.toString() || '');
  const [emiAmt, setEmiAmt] = useState(initial?.emi_amount?.toString() || '');
  const [rate, setRate] = useState(initial?.interest_rate?.toString() || '');
  const [startDate, setStartDate] = useState(initial?.start_date || new Date().toISOString().split('T')[0]);
  const [tenure, setTenure] = useState(initial?.tenure_months?.toString() || '');

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
    <Modal title={initial ? 'Edit EMI' : 'Add EMI'} onClose={onClose}>
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
        <button type="submit" className="btn-primary">{submitLabel}</button>
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
        const catData = { name: cat.name, icon: cat.icon, color: cat.color };
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
      <p style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 12 }}>
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
        <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>{selected.size} selected</span>
        <button className="btn-primary" onClick={handleAdd} disabled={selected.size === 0 || adding}>
          {adding ? 'Adding...' : `Add ${selected.size} Categories`}
        </button>
      </div>
    </Modal>
  );
}
