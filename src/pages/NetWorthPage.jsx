import { useState } from 'react';
import { formatINR } from '../lib/dateUtils';
import { Modal } from '../components/layout/Modal';
import { useToast } from '../components/layout/Toast';

const ASSET_CATS = [
  { id: 'bank', icon: '🏦', label: 'Bank / Savings' },
  { id: 'fd', icon: '📋', label: 'Fixed Deposit' },
  { id: 'gold', icon: '🥇', label: 'Gold / Jewellery' },
  { id: 'property', icon: '🏠', label: 'Property' },
  { id: 'vehicle', icon: '🚗', label: 'Vehicle' },
  { id: 'other', icon: '💼', label: 'Other Asset' },
];
const LIAB_CATS = [
  { id: 'homeloan', icon: '🏠', label: 'Home Loan' },
  { id: 'carloan', icon: '🚗', label: 'Car Loan' },
  { id: 'creditcard', icon: '💳', label: 'Credit Card' },
  { id: 'personalloan', icon: '🧾', label: 'Personal Loan' },
  { id: 'other', icon: '💸', label: 'Other Liability' },
];

function NetWorthRing({ netWorth, totalAssets, totalLiabilities }) {
  const pct = totalAssets > 0 ? Math.max(0, Math.min(100, (netWorth / totalAssets) * 100)) : 0;
  const R = 52, CX = 64, CY = 64, SW = 10;
  const CIRC = 2 * Math.PI * R;
  const dash = (pct / 100) * CIRC;
  const color = netWorth >= 0 ? '#10b981' : '#ef4444';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 0 8px' }}>
      <svg width={128} height={128} viewBox="0 0 128 128">
        <circle cx={CX} cy={CY} r={R} fill="none" stroke="var(--color-surface-2)" strokeWidth={SW} />
        <circle cx={CX} cy={CY} r={R} fill="none" stroke={color} strokeWidth={SW}
          strokeDasharray={`${dash} ${CIRC}`} strokeLinecap="round"
          transform={`rotate(-90 ${CX} ${CY})`} style={{ transition: 'stroke-dasharray 0.8s ease' }} />
        <text x={CX} y={CY - 6} textAnchor="middle" fill="var(--color-text)" fontSize="11" fontWeight="600">Net Worth</text>
        <text x={CX} y={CY + 10} textAnchor="middle" fill={color} fontSize="13" fontWeight="800">
          {netWorth >= 0 ? '' : '−'}₹{Math.abs(netWorth / 100000).toFixed(1)}L
        </text>
      </svg>
      <div style={{ display: 'flex', gap: 24, fontSize: 13 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#10b981', fontWeight: 700 }}>{formatINR(totalAssets)}</div>
          <div style={{ color: 'var(--color-text-muted)' }}>Assets</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#ef4444', fontWeight: 700 }}>{formatINR(totalLiabilities)}</div>
          <div style={{ color: 'var(--color-text-muted)' }}>Liabilities</div>
        </div>
      </div>
    </div>
  );
}

export function NetWorthPage({ assets, liabilities, onAddAsset, onUpdateAsset, onDeleteAsset, onAddLiability, onUpdateLiability, onDeleteLiability }) {
  const toast = useToast();
  const [showAddAsset, setShowAddAsset] = useState(false);
  const [showAddLiab, setShowAddLiab] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [editingLiab, setEditingLiab] = useState(null);

  const totalAssets = assets.reduce((a, x) => a + Number(x.value), 0);
  const totalLiabilities = liabilities.reduce((a, x) => a + Number(x.amount), 0);
  const netWorth = totalAssets - totalLiabilities;

  return (
    <div className="page">
      <div className="page-header">
        <h2>Net Worth</h2>
        <p className="page-sub">Assets − Liabilities = Your financial position</p>
      </div>

      <div className="section-card">
        <NetWorthRing netWorth={netWorth} totalAssets={totalAssets} totalLiabilities={totalLiabilities} />
        <div className="nw-summary-row">
          <div className={`nw-total ${netWorth >= 0 ? 'nw-total--pos' : 'nw-total--neg'}`}>
            {netWorth >= 0 ? '✅' : '⚠️'} Net Worth: <strong>{formatINR(netWorth)}</strong>
          </div>
        </div>
      </div>

      {/* Assets */}
      <div className="section-card">
        <div className="section-header">
          <h4>Assets <span className="section-badge" style={{ background: '#10b981' }}>{formatINR(totalAssets)}</span></h4>
          <button className="btn-secondary btn-sm" onClick={() => setShowAddAsset(true)}>+ Add</button>
        </div>
        {assets.length === 0 ? <p className="empty-hint">Add your bank balances, FDs, property etc.</p> : (
          <div className="nw-list">
            {assets.map(a => {
              const cat = ASSET_CATS.find(c => c.id === a.category) || ASSET_CATS[5];
              return (
                <div key={a.id} className="nw-row">
                  <span className="nw-icon">{cat.icon}</span>
                  <div className="nw-info">
                    <span className="nw-name">{a.name}</span>
                    <span className="nw-cat">{cat.label}</span>
                  </div>
                  <div className="nw-right">
                    <span className="nw-amt nw-amt--asset">{formatINR(a.value)}</span>
                    <button className="btn-icon" onClick={() => onDeleteAsset(a.id)}>🗑️</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Liabilities */}
      <div className="section-card">
        <div className="section-header">
          <h4>Liabilities <span className="section-badge" style={{ background: '#ef4444' }}>{formatINR(totalLiabilities)}</span></h4>
          <button className="btn-secondary btn-sm" onClick={() => setShowAddLiab(true)}>+ Add</button>
        </div>
        {liabilities.length === 0 ? <p className="empty-hint">Add loans, credit card balances etc.</p> : (
          <div className="nw-list">
            {liabilities.map(l => {
              const cat = LIAB_CATS.find(c => c.id === l.category) || LIAB_CATS[4];
              return (
                <div key={l.id} className="nw-row">
                  <span className="nw-icon">{cat.icon}</span>
                  <div className="nw-info">
                    <span className="nw-name">{l.name}</span>
                    <span className="nw-cat">{cat.label}</span>
                  </div>
                  <div className="nw-right">
                    <span className="nw-amt nw-amt--liab">{formatINR(l.amount)}</span>
                    <button className="btn-icon" onClick={() => onDeleteLiability(l.id)}>🗑️</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showAddAsset && (
        <Modal title="Add Asset" onClose={() => setShowAddAsset(false)}>
          <AssetForm cats={ASSET_CATS} onSave={async d => { await onAddAsset(d); toast('Asset added'); setShowAddAsset(false); }} />
        </Modal>
      )}
      {showAddLiab && (
        <Modal title="Add Liability" onClose={() => setShowAddLiab(false)}>
          <LiabForm cats={LIAB_CATS} onSave={async d => { await onAddLiability(d); toast('Liability added'); setShowAddLiab(false); }} />
        </Modal>
      )}
    </div>
  );
}

function AssetForm({ cats, onSave }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('bank');
  const [value, setValue] = useState('');
  return (
    <form onSubmit={e => { e.preventDefault(); onSave({ name, category, value: Number(value) }); }} className="expense-form">
      <div className="form-group">
        <label>Asset Name</label>
        <input type="text" placeholder="e.g. SBI Savings, Gold Ring" value={name} onChange={e => setName(e.target.value)} required />
      </div>
      <div className="form-group">
        <label>Type</label>
        <select value={category} onChange={e => setCategory(e.target.value)}>
          {cats.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
        </select>
      </div>
      <div className="form-group">
        <label>Current Value (₹)</label>
        <input type="number" inputMode="decimal" value={value} onChange={e => setValue(e.target.value)} min="0" required />
      </div>
      <button type="submit" className="btn-primary">Add Asset</button>
    </form>
  );
}

function LiabForm({ cats, onSave }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('homeloan');
  const [amount, setAmount] = useState('');
  return (
    <form onSubmit={e => { e.preventDefault(); onSave({ name, category, amount: Number(amount) }); }} className="expense-form">
      <div className="form-group">
        <label>Liability Name</label>
        <input type="text" placeholder="e.g. Home Loan Outstanding" value={name} onChange={e => setName(e.target.value)} required />
      </div>
      <div className="form-group">
        <label>Type</label>
        <select value={category} onChange={e => setCategory(e.target.value)}>
          {cats.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
        </select>
      </div>
      <div className="form-group">
        <label>Outstanding Amount (₹)</label>
        <input type="number" inputMode="decimal" value={amount} onChange={e => setAmount(e.target.value)} min="0" required />
      </div>
      <button type="submit" className="btn-primary">Add Liability</button>
    </form>
  );
}
