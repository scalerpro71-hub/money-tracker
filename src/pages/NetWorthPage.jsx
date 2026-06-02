import { useState } from 'react';
import { Modal } from '../components/layout/Modal';
import { useToast } from '../components/layout/Toast';
import { Icon } from '../components/layout/Icon';
import { cur, fmtK } from '../lib/formatUtils';

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
    <div>
      {/* Hero */}
      <div className="nw-hero rise" style={{ '--d': '0ms' }}>
        <div className="eyebrow" style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 10 }}>NET WORTH</div>
        <div className="nw-hero-amt num" style={{ color: netWorth >= 0 ? '#6ff0c4' : '#ffb4a6' }}>
          {netWorth >= 0 ? '' : '−'}{fmtK(Math.abs(netWorth))}
        </div>
        <div className="nw-splits">
          <div className="nw-split">
            <div className="ns-label">Total assets</div>
            <div className="ns-val num">{fmtK(totalAssets)}</div>
          </div>
          <div className="nw-split">
            <div className="ns-label">Total liabilities</div>
            <div className="ns-val num" style={{ color: '#ffb4a6' }}>{fmtK(totalLiabilities)}</div>
          </div>
        </div>
      </div>

      <div className="nw-cols" style={{ marginTop: 18 }}>
        {/* Assets */}
        <div className="rise" style={{ '--d': '60ms' }}>
          <div className="sec-head" style={{ marginTop: 0 }}>
            <h3>Assets</h3>
            <button className="btn-ghost" style={{ padding: '7px 14px', fontSize: 13 }} onClick={() => setShowAddAsset(true)}>
              <Icon name="plus" size={14} />Add
            </button>
          </div>
          <div className="card">
            {assets.length === 0 ? (
              <div className="pad" style={{ color: 'var(--ink-3)', fontSize: 13, fontWeight: 600 }}>Add banks, FDs, property…</div>
            ) : assets.map(a => {
              const cat = ASSET_CATS.find(c => c.id === a.category) || ASSET_CATS[5];
              return (
                <div key={a.id} className="nw-row pad" style={{ paddingTop: 12, paddingBottom: 12 }}>
                  <div className="nw-ico">{cat.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="nw-name">{a.name}</div>
                    <div className="nw-sub">{cat.label}</div>
                  </div>
                  <div className="nw-amt num">{fmtK(a.value)}</div>
                  <button className="icon-btn" style={{ width: 30, height: 30, marginLeft: 8 }} onClick={() => setEditingAsset(a)}>
                    <Icon name="gear" size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Liabilities */}
        <div className="rise" style={{ '--d': '120ms' }}>
          <div className="sec-head" style={{ marginTop: 0 }}>
            <h3>Liabilities</h3>
            <button className="btn-ghost" style={{ padding: '7px 14px', fontSize: 13 }} onClick={() => setShowAddLiab(true)}>
              <Icon name="plus" size={14} />Add
            </button>
          </div>
          <div className="card">
            {liabilities.length === 0 ? (
              <div className="pad" style={{ color: 'var(--ink-3)', fontSize: 13, fontWeight: 600 }}>Add loans, credit cards…</div>
            ) : liabilities.map(l => {
              const cat = LIAB_CATS.find(c => c.id === l.category) || LIAB_CATS[4];
              return (
                <div key={l.id} className="nw-row pad" style={{ paddingTop: 12, paddingBottom: 12 }}>
                  <div className="nw-ico">{cat.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="nw-name">{l.name}</div>
                    <div className="nw-sub">{cat.label}</div>
                  </div>
                  <div className="nw-amt neg num">{fmtK(l.amount)}</div>
                  <button className="icon-btn" style={{ width: 30, height: 30, marginLeft: 8 }} onClick={() => setEditingLiab(l)}>
                    <Icon name="gear" size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {showAddAsset && (
        <Modal title="Add Asset" onClose={() => setShowAddAsset(false)}>
          <AssetForm cats={ASSET_CATS} onSave={async d => { await onAddAsset(d); toast('Asset added'); setShowAddAsset(false); }} />
        </Modal>
      )}
      {editingAsset && (
        <Modal title="Edit Asset" onClose={() => setEditingAsset(null)}>
          <AssetForm cats={ASSET_CATS} initial={editingAsset} onSave={async d => { await onUpdateAsset(editingAsset.id, d); toast('Asset updated'); setEditingAsset(null); }} submitLabel="Save Changes" />
        </Modal>
      )}
      {showAddLiab && (
        <Modal title="Add Liability" onClose={() => setShowAddLiab(false)}>
          <LiabForm cats={LIAB_CATS} onSave={async d => { await onAddLiability(d); toast('Liability added'); setShowAddLiab(false); }} />
        </Modal>
      )}
      {editingLiab && (
        <Modal title="Edit Liability" onClose={() => setEditingLiab(null)}>
          <LiabForm cats={LIAB_CATS} initial={editingLiab} onSave={async d => { await onUpdateLiability(editingLiab.id, d); toast('Liability updated'); setEditingLiab(null); }} submitLabel="Save Changes" />
        </Modal>
      )}
    </div>
  );
}

function AssetForm({ cats, onSave, initial, submitLabel = 'Add Asset' }) {
  const [name, setName] = useState(initial?.name || '');
  const [category, setCategory] = useState(initial?.category || 'bank');
  const [value, setValue] = useState(initial?.value?.toString() || '');
  return (
    <form onSubmit={e => { e.preventDefault(); onSave({ name, category, value: Number(value) }); }} className="expense-form">
      <div className="form-group"><label>Asset Name</label><input type="text" placeholder="e.g. SBI Savings, Gold Ring" value={name} onChange={e => setName(e.target.value)} required /></div>
      <div className="form-group"><label>Type</label><select value={category} onChange={e => setCategory(e.target.value)}>{cats.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}</select></div>
      <div className="form-group"><label>Current Value (₹)</label><input type="number" inputMode="decimal" value={value} onChange={e => setValue(e.target.value)} min="0" required /></div>
      <button type="submit" className="btn-primary">{submitLabel}</button>
    </form>
  );
}

function LiabForm({ cats, onSave, initial, submitLabel = 'Add Liability' }) {
  const [name, setName] = useState(initial?.name || '');
  const [category, setCategory] = useState(initial?.category || 'homeloan');
  const [amount, setAmount] = useState(initial?.amount?.toString() || '');
  return (
    <form onSubmit={e => { e.preventDefault(); onSave({ name, category, amount: Number(amount) }); }} className="expense-form">
      <div className="form-group"><label>Liability Name</label><input type="text" placeholder="e.g. Home Loan Outstanding" value={name} onChange={e => setName(e.target.value)} required /></div>
      <div className="form-group"><label>Type</label><select value={category} onChange={e => setCategory(e.target.value)}>{cats.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}</select></div>
      <div className="form-group"><label>Outstanding Amount (₹)</label><input type="number" inputMode="decimal" value={amount} onChange={e => setAmount(e.target.value)} min="0" required /></div>
      <button type="submit" className="btn-primary">{submitLabel}</button>
    </form>
  );
}
