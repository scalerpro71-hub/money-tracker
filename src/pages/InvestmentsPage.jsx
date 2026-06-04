import { useState } from 'react';
import { Modal } from '../components/layout/Modal';
import { useToast } from '../components/layout/Toast';
import { Icon } from '../components/layout/Icon';
import { fmtK } from '../lib/formatUtils';

const TYPES = [
  { id: 'sip', icon: '📈', label: 'SIP (Mutual Fund)' },
  { id: 'mf', icon: '🏦', label: 'Mutual Fund (Lumpsum)' },
  { id: 'fd', icon: '📋', label: 'Fixed Deposit' },
  { id: 'stock', icon: '📊', label: 'Stocks / Shares' },
  { id: 'ppf', icon: '🏛️', label: 'PPF' },
  { id: 'nps', icon: '👴', label: 'NPS' },
  { id: 'gold', icon: '🥇', label: 'Gold ETF / SGB' },
  { id: 'other', icon: '💼', label: 'Other' },
];

export function InvestmentsPage({ investments, onAdd, onUpdate, onDelete }) {
  const toast = useToast();
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');

  const totalInvested = investments.reduce((a, i) => a + Number(i.invested_amount), 0);
  const totalCurrent = investments.reduce((a, i) => a + Number(i.current_value || i.invested_amount), 0);
  const gain = totalCurrent - totalInvested;
  const gainPct = totalInvested > 0 ? ((gain / totalInvested) * 100).toFixed(1) : 0;
  const sipMonthly = investments.filter(i => i.type === 'sip').reduce((a, i) => a + Number(i.monthly_amount || 0), 0);

  function saveCurrentValue(inv) {
    onUpdate(inv.id, { current_value: Number(editValue) });
    setEditingId(null);
    toast('Value updated');
  }

  async function handleDelete(inv) {
    if (!confirm(`Delete ${inv.name} investment? This cannot be undone.`)) return;
    await onDelete(inv.id);
    toast('Investment deleted');
  }

  return (
    <div>
      {/* Hero */}
      <div className="invest-hero rise" style={{ '--d': '0ms' }}>
        <div className="eyebrow" style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 10 }}>PORTFOLIO VALUE</div>
        <div className="invest-hero-amt num">{fmtK(totalCurrent)}</div>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: 'var(--r-pill)', padding: '5px 12px', fontSize: 12, fontWeight: 700, color: gain >= 0 ? '#6ff0c4' : '#ffb4a6' }}>
          {gain >= 0 ? '▲' : '▼'} {gain >= 0 ? '+' : ''}{gainPct}% all-time
        </span>
        <div className="invest-splits">
          <div className="invest-split">
            <div className="is-label">Invested</div>
            <div className="is-val num">{fmtK(totalInvested)}</div>
          </div>
          <div className="invest-split">
            <div className="is-label">Returns</div>
            <div className="is-val num" style={{ color: gain >= 0 ? '#6ff0c4' : '#ffb4a6' }}>{gain >= 0 ? '+' : ''}{fmtK(gain)}</div>
          </div>
          {sipMonthly > 0 && (
            <div className="invest-split">
              <div className="is-label">SIP/month</div>
              <div className="is-val num">{fmtK(sipMonthly)}</div>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button className="btn-accent" onClick={() => setShowAdd(true)}>
          <Icon name="plus" size={15} />Add investment
        </button>
      </div>

      {investments.length === 0 && (
        <div className="card pad" style={{ color: 'var(--ink-3)', fontSize: 13, fontWeight: 600 }}>
          Track your SIPs, FDs, and stocks here. Tap "Add investment" to start.
        </div>
      )}

      {TYPES.map(type => {
        const group = investments.filter(i => i.type === type.id);
        if (!group.length) return null;
        const groupTotal = group.reduce((a, i) => a + Number(i.current_value || i.invested_amount), 0);
        return (
          <div key={type.id} className="card pad rise" style={{ marginBottom: 14, '--d': '60ms' }}>
            <div className="inv-type-head">
              <div className="inv-type-label">{type.icon} {type.label}</div>
              <span className="chip">{fmtK(groupTotal)}</span>
            </div>
            {group.map(inv => {
              const current = Number(inv.current_value || inv.invested_amount);
              const invGain = current - Number(inv.invested_amount);
              const gainP = Number(inv.invested_amount) > 0 ? ((invGain / Number(inv.invested_amount)) * 100).toFixed(1) : '0';
              return (
                <div key={inv.id} className="inv-row">
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="inv-name">{inv.name}</div>
                    {inv.type === 'sip' && inv.monthly_amount && (
                      <div className="inv-sub">{fmtK(inv.monthly_amount)}/mo · auto-debit</div>
                    )}
                    <div className={`inv-pl ${invGain >= 0 ? 'pos' : 'neg'}`}>
                      {invGain >= 0 ? '+' : ''}{fmtK(invGain)} · {invGain >= 0 ? '+' : ''}{gainP}%
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 600, marginBottom: 2 }}>Invested</div>
                    <div className="num" style={{ fontSize: 14, fontWeight: 700 }}>{fmtK(inv.invested_amount)}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 14 }}>
                    <div style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 600, marginBottom: 2 }}>Current</div>
                    {editingId === inv.id ? (
                      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                        <input type="number" value={editValue} onChange={e => setEditValue(e.target.value)} style={{ width: 80, fontSize: 13, padding: '4px 8px', borderRadius: 'var(--r-sm)', border: '1px solid var(--hair-2)', background: 'var(--surface-2)', color: 'var(--ink)' }} autoFocus />
                        <button className="btn-accent" style={{ padding: '5px 10px', fontSize: 12 }} onClick={() => saveCurrentValue(inv)}>Save</button>
                      </div>
                    ) : (
                      <div className="num" style={{ fontSize: 14, fontWeight: 700, color: invGain >= 0 ? 'var(--pos)' : 'var(--neg)', cursor: 'pointer' }}
                        onClick={() => { setEditingId(inv.id); setEditValue(current.toString()); }}>
                        {fmtK(current)} ✏️
                      </div>
                    )}
                  </div>
                  <button className="icon-btn" style={{ width: 30, height: 30, marginLeft: 10, color: 'var(--neg)' }} onClick={() => handleDelete(inv)}>×</button>
                </div>
              );
            })}
          </div>
        );
      })}

      {showAdd && (
        <Modal title="Add Investment" onClose={() => setShowAdd(false)}>
          <InvForm onSave={async d => { await onAdd(d); toast('Investment added'); setShowAdd(false); }} />
        </Modal>
      )}
    </div>
  );
}

function InvForm({ onSave }) {
  const [name, setName] = useState('');
  const [type, setType] = useState('sip');
  const [invested, setInvested] = useState('');
  const [current, setCurrent] = useState('');
  const [monthly, setMonthly] = useState('');
  const [notes, setNotes] = useState('');
  const [startDate, setStartDate] = useState('');
  return (
    <form onSubmit={e => { e.preventDefault(); onSave({ name, type, invested_amount: Number(invested), current_value: Number(current) || null, monthly_amount: Number(monthly) || null, notes: notes || null, start_date: startDate || null }); }} className="expense-form">
      <div className="form-group"><label>Name</label><input type="text" placeholder="e.g. Parag Parikh Flexi Cap" value={name} onChange={e => setName(e.target.value)} required /></div>
      <div className="form-group"><label>Type</label><select value={type} onChange={e => setType(e.target.value)}>{TYPES.map(t => <option key={t.id} value={t.id}>{t.icon} {t.label}</option>)}</select></div>
      <div className="form-row">
        <div className="form-group"><label>Invested (₹)</label><input type="number" inputMode="decimal" value={invested} onChange={e => setInvested(e.target.value)} min="0" required /></div>
        <div className="form-group"><label>Current Value (₹)</label><input type="number" inputMode="decimal" value={current} onChange={e => setCurrent(e.target.value)} min="0" placeholder="Same as invested" /></div>
      </div>
      {type === 'sip' && (
        <div className="form-group"><label>Monthly SIP (₹)</label><input type="number" inputMode="decimal" value={monthly} onChange={e => setMonthly(e.target.value)} min="0" /></div>
      )}
      <div className="form-group"><label>Start Date</label><input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} /></div>
      <div className="form-group"><label>Notes</label><input type="text" placeholder="Optional" value={notes} onChange={e => setNotes(e.target.value)} /></div>
      <button type="submit" className="btn-primary">Add Investment</button>
    </form>
  );
}
