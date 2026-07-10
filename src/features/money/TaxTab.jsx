import { useState } from 'react';
import { useTaxDeclarations, useTaxDeclarationMutations } from '../../lib/queries';
import { useToast } from '../../components/layout/Toast';
import { Modal } from '../../components/layout/Modal';
import { Icon } from '../../components/layout/Icon';
import { cur, fmtK } from '../../lib/formatUtils';

/* Indian FY runs April-March: July 2026 sits in FY 2026-27. */
function currentFY() {
  const now = new Date();
  const y = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
  return `${y}-${String((y + 1) % 100).padStart(2, '0')}`;
}

const SECTIONS = {
  '80C': { label: '80C — investments & premiums', cap: 150000, hint: 'ELSS funds, PPF, EPF, life-insurance premium, home-loan principal, kids\' tuition' },
  '80D': { label: '80D — health insurance', cap: 25000, hint: 'Health premiums for you & family (₹50k more for parents 60+)' },
  '80G': { label: '80G — donations', cap: null, hint: 'Donations to registered charities' },
  HRA: { label: 'HRA — house rent', cap: null, hint: 'Rent receipts if your salary has an HRA component' },
  other: { label: 'Other', cap: null, hint: 'NPS (80CCD), education-loan interest (80E), etc.' },
};

function AddDeclarationModal({ fy, onClose, onSave }) {
  const [name, setName] = useState('');
  const [section, setSection] = useState('80C');
  const [amount, setAmount] = useState('');
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      await onSave({ name: name.trim(), section, amount: Number(amount), financial_year: fy });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={`Add tax saving — FY ${fy}`} onClose={onClose}>
      <div className="form-group">
        <label>Section</label>
        <select value={section} onChange={e => setSection(e.target.value)}>
          {Object.entries(SECTIONS).map(([v, s]) => <option key={v} value={v}>{s.label}</option>)}
        </select>
        <div style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 600, lineHeight: 1.5, marginTop: 4 }}>
          {SECTIONS[section].hint}
        </div>
      </div>
      <div className="form-group">
        <label>What is it?</label>
        <input autoFocus value={name} onChange={e => setName(e.target.value)} placeholder="e.g. PPF deposit, LIC premium" />
      </div>
      <div className="form-group">
        <label>Amount this financial year</label>
        <input type="number" inputMode="numeric" min="0" value={amount} onChange={e => setAmount(e.target.value)} placeholder="₹" />
      </div>
      <button className="btn-primary" onClick={save} disabled={saving || !name.trim() || !(Number(amount) > 0)}>
        {saving ? 'Saving…' : 'Add'}
      </button>
    </Modal>
  );
}

export function TaxTab() {
  const { data: declarations = [] } = useTaxDeclarations();
  const { add, remove } = useTaxDeclarationMutations();
  const toast = useToast();
  const [modal, setModal] = useState(false);

  const fy = currentFY();
  const thisFY = declarations.filter(d => d.financial_year === fy);
  const total80C = thisFY.filter(d => d.section === '80C').reduce((a, d) => a + Number(d.amount), 0);
  const total80D = thisFY.filter(d => d.section === '80D').reduce((a, d) => a + Number(d.amount), 0);
  const pct80C = Math.min(100, Math.round((total80C / 150000) * 100));
  const month = new Date().getMonth(); // 0-11
  const proofSeason = month === 0 || month === 1 || month === 2; // Jan-Mar

  async function handleDelete(id) {
    if (!confirm('Remove this entry?')) return;
    try { await remove.mutateAsync(id); toast('Removed'); }
    catch (err) { toast(err.message, 'error'); }
  }

  return (
    <div>
      {proofSeason && (
        <div className="card pad" style={{ marginBottom: 16, borderLeft: '3px solid #d97706' }}>
          <div style={{ fontSize: 14, fontWeight: 800 }}>🗓️ Proof season is here</div>
          <div style={{ fontSize: 12.5, color: 'var(--ink-2)', fontWeight: 600, marginTop: 3, lineHeight: 1.55 }}>
            January–March is when people panic-buy bad insurance to save tax. If your 80C has a gap,
            fill it with something you'd want anyway — an ELSS SIP or PPF — never a rushed policy.
          </div>
        </div>
      )}

      <div className="card pad rise" style={{ marginBottom: 16 }}>
        <div className="eyebrow">Section 80C · FY {fy}</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 8 }}>
          <span className="num" style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em' }}>{fmtK(total80C)}</span>
          <span style={{ fontSize: 13.5, color: 'var(--ink-3)', fontWeight: 600 }}>of ₹1.5L limit used</span>
        </div>
        <div className="catbar-track" style={{ marginTop: 10 }}>
          <div className="catbar-fill anim-barGrow" style={{ width: `${pct80C}%`, background: 'var(--accent-grad)' }} />
        </div>
        <div style={{ fontSize: 12.5, color: 'var(--ink-3)', fontWeight: 600, marginTop: 8, lineHeight: 1.55 }}>
          {total80C >= 150000
            ? 'Limit maxed — nothing more to chase under 80C this year. 🎉'
            : `${cur(150000 - total80C)} of room left — worth filling only if you're on the old tax regime.`}
          {total80D > 0 && ` 80D (health): ${cur(total80D)} of ₹25k.`}
        </div>
        <button className="btn-accent" style={{ marginTop: 14, padding: '10px 16px', fontSize: 13.5 }} onClick={() => setModal(true)}>
          <Icon name="plus" size={15} />Add tax saving
        </button>
      </div>

      {thisFY.length > 0 && (
        <div className="card pad" style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 6 }}>Declared this year</div>
          {thisFY.map(d => (
            <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderTop: '1px solid var(--hair)' }}>
              <span className="chip" style={{ fontSize: 11, flexShrink: 0 }}>{d.section}</span>
              <div style={{ flex: 1, minWidth: 0, fontSize: 13.5, fontWeight: 750 }}>{d.name}</div>
              <div className="num" style={{ fontSize: 13.5, fontWeight: 700 }}>{cur(Math.round(d.amount))}</div>
              <button className="icon-btn" style={{ width: 26, height: 26 }} aria-label="Delete" onClick={() => handleDelete(d.id)}>×</button>
            </div>
          ))}
        </div>
      )}

      <div className="lp-disclaimer">
        The new tax regime (the default) ignores most of these deductions — this tracker mainly
        matters if you've opted for the old regime. Rough guide, not tax advice; a CA knows your
        situation.
      </div>

      {modal && (
        <AddDeclarationModal
          fy={fy}
          onClose={() => setModal(false)}
          onSave={async (row) => {
            try { await add.mutateAsync(row); toast('Added'); }
            catch (err) { toast(err.message, 'error'); throw err; }
          }}
        />
      )}
    </div>
  );
}
