import { useState } from 'react';
import { useAssets, useAssetMutations, useLiabilities, useLiabilityMutations, useInvestments } from '../../lib/queries';
import { useToast } from '../../components/layout/Toast';
import { Modal } from '../../components/layout/Modal';
import { Icon } from '../../components/layout/Icon';
import { cur, fmtK } from '../../lib/formatUtils';
import { currentValue } from './investMeta';

const ASSET_CATS = { bank: '🏦 Bank', fd: '📜 FD', gold: '🪙 Gold', property: '🏠 Property', other: '📦 Other' };
const LIABILITY_CATS = { homeloan: '🏠 Home loan', carloan: '🚗 Vehicle loan', creditcard: '💳 Credit card', other: '📦 Other' };

function AddRowModal({ kind, initial, onClose, onSave }) {
  const cats = kind === 'asset' ? ASSET_CATS : LIABILITY_CATS;
  const editing = !!initial;
  const valueField = kind === 'asset' ? 'value' : 'amount';
  const [name, setName] = useState(initial?.name || '');
  const [category, setCategory] = useState(initial?.category || Object.keys(cats)[0]);
  const [amount, setAmount] = useState(initial?.[valueField] ?? '');
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      await onSave({ name: name.trim(), category, [valueField]: Number(amount) });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  const title = editing
    ? (kind === 'asset' ? 'Edit asset' : 'Edit liability')
    : (kind === 'asset' ? 'Add asset' : 'Add liability');
  return (
    <Modal title={title} onClose={onClose}>
      <div className="form-group">
        <label>Name</label>
        <input autoFocus value={name} onChange={e => setName(e.target.value)} placeholder={kind === 'asset' ? 'e.g. Savings account' : 'e.g. Bike loan balance'} />
      </div>
      <div className="form-group">
        <label>Category</label>
        <select value={category} onChange={e => setCategory(e.target.value)}>
          {Object.entries(cats).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>
      <div className="form-group">
        <label>{kind === 'asset' ? 'Current value' : 'Amount owed'}</label>
        <input type="number" inputMode="numeric" min="0" value={amount} onChange={e => setAmount(e.target.value)} placeholder="₹" />
      </div>
      <button className="btn-primary" onClick={save} disabled={saving || !name.trim() || !(Number(amount) > 0)}>
        {saving ? 'Saving…' : editing ? 'Save changes' : 'Save'}
      </button>
    </Modal>
  );
}

function Column({ title, rows, cats, valueField, onAdd, onEdit, onDelete, negative }) {
  return (
    <div className="card pad">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <div style={{ fontSize: 15, fontWeight: 800 }}>{title}</div>
        <button className="filter-chip" onClick={onAdd}>+ Add</button>
      </div>
      {rows.length === 0 && <div style={{ fontSize: 13, color: 'var(--ink-3)', fontWeight: 600, padding: '10px 0' }}>Nothing here yet.</div>}
      {rows.map(row => (
        <div key={row.id} className="nw-row">
          <div className="nw-ico">{(cats[row.category] || '📦').split(' ')[0]}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="nw-name">{row.name}</div>
            <div className="nw-sub">{(cats[row.category] || 'Other').split(' ').slice(1).join(' ')}</div>
          </div>
          <div className={`nw-amt num${negative ? ' neg' : ''}`}>{negative ? '−' : ''}{cur(Math.round(row[valueField]))}</div>
          <button className="icon-btn" style={{ width: 28, height: 28, marginLeft: 8 }} aria-label="Edit" onClick={() => onEdit(row)}>
            <Icon name="edit" size={12} />
          </button>
          <button className="icon-btn" style={{ width: 28, height: 28 }} aria-label="Delete" onClick={() => onDelete(row.id)}>×</button>
        </div>
      ))}
    </div>
  );
}

export function NetWorthTab({ snapshot }) {
  const { data: assets = [] } = useAssets();
  const { data: liabilities = [] } = useLiabilities();
  const { data: investments = [] } = useInvestments();
  const assetMut = useAssetMutations();
  const liabilityMut = useLiabilityMutations();
  const toast = useToast();
  const [modal, setModal] = useState(null); // { kind: 'asset' | 'liability', initial? }

  const assetsTotal = assets.reduce((a, x) => a + Number(x.value || 0), 0);
  const portfolioTotal = investments.reduce((a, i) => a + currentValue(i), 0);
  const liabilitiesTotal = liabilities.reduce((a, x) => a + Number(x.amount || 0), 0);
  const netWorth = assetsTotal + portfolioTotal - liabilitiesTotal;

  async function handleSave(row) {
    const mut = modal.kind === 'asset' ? assetMut : liabilityMut;
    try {
      if (modal.initial) {
        await mut.update.mutateAsync({ id: modal.initial.id, ...row });
        toast('Updated');
      } else {
        await mut.add.mutateAsync(row);
        toast('Added');
      }
    } catch (err) { toast(err.message, 'error'); throw err; }
  }

  async function handleDelete(kind, id) {
    if (!confirm('Remove this entry?')) return;
    const mut = kind === 'asset' ? assetMut : liabilityMut;
    try { await mut.remove.mutateAsync(id); toast('Removed'); }
    catch (err) { toast(err.message, 'error'); }
  }

  return (
    <div>
      <div className="nw-hero rise">
        <div className="hero-label">Net worth</div>
        <div className="nw-hero-amt">{netWorth < 0 ? '−' : ''}{fmtK(Math.abs(Math.round(netWorth)))}</div>
        <div className="hero-sub" style={{ color: 'rgba(255,255,255,0.68)' }}>
          Everything you own minus everything you owe — the number the whole journey moves.
        </div>
        <div className="nw-splits">
          <div className="nw-split"><div className="ns-label">Assets</div><div className="ns-val">{fmtK(Math.round(assetsTotal))}</div></div>
          <div className="nw-split"><div className="ns-label">Investments</div><div className="ns-val">{fmtK(Math.round(portfolioTotal))}</div></div>
          <div className="nw-split"><div className="ns-label">Owed</div><div className="ns-val">{liabilitiesTotal > 0 ? `−${fmtK(Math.round(liabilitiesTotal))}` : '0'}</div></div>
          {snapshot?.monthlyExpenseBaseline > 0 && (
            <div className="nw-split">
              <div className="ns-label">Runway</div>
              <div className="ns-val">{snapshot.runwayMonths.toFixed(1).replace(/\.0$/, '')} mo</div>
            </div>
          )}
        </div>
      </div>

      <div className="nw-cols" style={{ marginTop: 18 }}>
        <Column
          title="Assets" rows={assets} cats={ASSET_CATS} valueField="value"
          onAdd={() => setModal({ kind: 'asset' })} onEdit={(row) => setModal({ kind: 'asset', initial: row })}
          onDelete={(id) => handleDelete('asset', id)}
        />
        <Column
          title="Liabilities" rows={liabilities} cats={LIABILITY_CATS} valueField="amount" negative
          onAdd={() => setModal({ kind: 'liability' })} onEdit={(row) => setModal({ kind: 'liability', initial: row })}
          onDelete={(id) => handleDelete('liability', id)}
        />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14, fontSize: 12.5, color: 'var(--ink-3)', fontWeight: 600 }}>
        <Icon name="info" size={14} style={{ flexShrink: 0 }} />
        Your investment portfolio is counted automatically — no need to add it as an asset.
      </div>

      {modal && <AddRowModal kind={modal.kind} initial={modal.initial} onClose={() => setModal(null)} onSave={handleSave} />}
    </div>
  );
}
