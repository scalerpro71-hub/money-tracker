import { useState } from 'react';
import { formatINR } from '../lib/dateUtils';
import { Modal } from '../components/layout/Modal';
import { useToast } from '../components/layout/Toast';

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

  const bySip = investments.filter(i => i.type === 'sip');
  const sipMonthly = bySip.reduce((a, i) => a + Number(i.monthly_amount || 0), 0);

  function saveCurrentValue(inv) {
    onUpdate(inv.id, { current_value: Number(editValue) });
    setEditingId(null);
    toast('Value updated');
  }

  return (
    <div className="page">
      <div className="page-header">
        <h2>Investments</h2>
        <p className="page-sub">SIP, MF, FD, Stocks — all in one place</p>
      </div>

      {/* Summary card */}
      <div className="section-card">
        <div className="inv-summary">
          <div className="inv-summary-item">
            <div className="inv-summary-val">{formatINR(totalInvested)}</div>
            <div className="inv-summary-label">Total Invested</div>
          </div>
          <div className="inv-summary-item">
            <div className="inv-summary-val" style={{ color: gain >= 0 ? '#10b981' : '#ef4444' }}>{formatINR(totalCurrent)}</div>
            <div className="inv-summary-label">Current Value</div>
          </div>
          <div className="inv-summary-item">
            <div className="inv-summary-val" style={{ color: gain >= 0 ? '#10b981' : '#ef4444' }}>
              {gain >= 0 ? '+' : ''}{formatINR(gain)}
            </div>
            <div className="inv-summary-label">{gain >= 0 ? '+' : ''}{gainPct}% Returns</div>
          </div>
        </div>
        {sipMonthly > 0 && (
          <div className="inv-sip-banner">
            <span>📈 Monthly SIP commitment: <strong>{formatINR(sipMonthly)}</strong></span>
          </div>
        )}
      </div>

      {/* Group by type */}
      {TYPES.map(type => {
        const group = investments.filter(i => i.type === type.id);
        if (!group.length) return null;
        const groupTotal = group.reduce((a, i) => a + Number(i.invested_amount), 0);
        return (
          <div key={type.id} className="section-card">
            <div className="section-header">
              <h4>{type.icon} {type.label}</h4>
              <span className="section-badge">{formatINR(groupTotal)}</span>
            </div>
            {group.map(inv => {
              const current = Number(inv.current_value || inv.invested_amount);
              const invGain = current - Number(inv.invested_amount);
              return (
                <div key={inv.id} className="inv-row">
                  <div className="inv-row-header">
                    <span className="inv-name">{inv.name}</span>
                    <button className="btn-icon" onClick={() => onDelete(inv.id)}>🗑️</button>
                  </div>
                  <div className="inv-row-nums">
                    <div>
                      <div className="inv-num-val">{formatINR(inv.invested_amount)}</div>
                      <div className="inv-num-label">Invested</div>
                    </div>
                    {editingId === inv.id ? (
                      <div className="inv-edit-val">
                        <input type="number" value={editValue} onChange={e => setEditValue(e.target.value)} style={{ width: 90, fontSize: 13 }} autoFocus />
                        <button className="btn-primary btn-sm" onClick={() => saveCurrentValue(inv)}>Save</button>
                      </div>
                    ) : (
                      <div onClick={() => { setEditingId(inv.id); setEditValue(current.toString()); }} style={{ cursor: 'pointer' }}>
                        <div className="inv-num-val" style={{ color: invGain >= 0 ? '#10b981' : '#ef4444' }}>{formatINR(current)}</div>
                        <div className="inv-num-label">Current ✏️</div>
                      </div>
                    )}
                    <div>
                      <div className="inv-num-val" style={{ color: invGain >= 0 ? '#10b981' : '#ef4444' }}>
                        {invGain >= 0 ? '+' : ''}{formatINR(invGain)}
                      </div>
                      <div className="inv-num-label">P&L</div>
                    </div>
                  </div>
                  {inv.type === 'sip' && inv.monthly_amount && (
                    <div className="inv-sip-row">📅 SIP: {formatINR(inv.monthly_amount)}/mo</div>
                  )}
                  {inv.notes && <div className="inv-notes">{inv.notes}</div>}
                </div>
              );
            })}
          </div>
        );
      })}

      {investments.length === 0 && (
        <div className="empty-hint">💡 Track your SIPs, FDs, and stocks here. Tap + Add to start.</div>
      )}

      <button className="btn-primary" style={{ width: '100%', marginBottom: 16 }} onClick={() => setShowAdd(true)}>+ Add Investment</button>

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
      <div className="form-group">
        <label>Name</label>
        <input type="text" placeholder="e.g. Parag Parikh Flexi Cap, Reliance" value={name} onChange={e => setName(e.target.value)} required />
      </div>
      <div className="form-group">
        <label>Type</label>
        <select value={type} onChange={e => setType(e.target.value)}>
          {TYPES.map(t => <option key={t.id} value={t.id}>{t.icon} {t.label}</option>)}
        </select>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Amount Invested (₹)</label>
          <input type="number" inputMode="decimal" value={invested} onChange={e => setInvested(e.target.value)} min="0" required />
        </div>
        <div className="form-group">
          <label>Current Value (₹)</label>
          <input type="number" inputMode="decimal" value={current} onChange={e => setCurrent(e.target.value)} min="0" placeholder="Same as invested" />
        </div>
      </div>
      {(type === 'sip') && (
        <div className="form-group">
          <label>Monthly SIP Amount (₹)</label>
          <input type="number" inputMode="decimal" value={monthly} onChange={e => setMonthly(e.target.value)} min="0" />
        </div>
      )}
      <div className="form-row">
        <div className="form-group">
          <label>Start Date</label>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
        </div>
      </div>
      <div className="form-group">
        <label>Notes (optional)</label>
        <input type="text" placeholder="e.g. HDFC Bank Demat" value={notes} onChange={e => setNotes(e.target.value)} />
      </div>
      <button type="submit" className="btn-primary">Add Investment</button>
    </form>
  );
}
