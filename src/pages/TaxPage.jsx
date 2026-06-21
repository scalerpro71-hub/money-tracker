import { useState } from 'react';
import { Modal } from '../components/layout/Modal';
import { useToast } from '../components/layout/Toast';
import { Icon } from '../components/layout/Icon';
import { fmtK } from '../lib/formatUtils';

const SECTIONS = [
  { id: '80C', label: '80C — Investments & Insurance', limit: 150000, examples: 'PPF, ELSS, LIC, NSC, Home Loan Principal, Tuition Fees', items: ['PPF', 'ELSS Mutual Fund', 'LIC Premium', 'NSC', 'Home Loan Principal', 'Tuition Fees', 'ULIP', '5-yr FD', 'NPS (employee)', 'SCSS'] },
  { id: '80CCD(1B)', label: '80CCD(1B) — NPS Extra', limit: 50000, examples: 'Additional NPS contribution over 80C limit', items: ['NPS (self)'] },
  { id: '80D', label: '80D — Health Insurance', limit: 25000, examples: 'Health insurance premium for self + family (₹50k for senior citizens)', items: ['Self Health Insurance', 'Family Health Insurance', 'Parent Health Insurance', 'Preventive Health Checkup'] },
  { id: '80G', label: '80G — Donations', limit: null, examples: 'Donations to approved charities. 50% or 100% deduction.', items: ['PM CARES', 'National Relief Fund', 'Charity Donation'] },
  { id: 'HRA', label: 'HRA — House Rent Allowance', limit: null, examples: 'Rent paid if you are salaried and in rented accommodation', items: ['Rent Paid'] },
];

function currentFinancialYear() {
  const today = new Date();
  const startYear = today.getMonth() >= 3 ? today.getFullYear() : today.getFullYear() - 1;
  return `${startYear}-${String((startYear + 1) % 100).padStart(2, '0')}`;
}

function fyOptions() {
  const start = Number(currentFinancialYear().slice(0, 4));
  return [start, start - 1, start - 2].map(y => `${y}-${String((y + 1) % 100).padStart(2, '0')}`);
}

export function TaxPage({ declarations, onAdd, onUpdate, onDelete }) {
  const toast = useToast();
  const [showAdd, setShowAdd] = useState(null);
  const [editingDecl, setEditingDecl] = useState(null);
  const [fy, setFy] = useState(currentFinancialYear);

  const filtered = declarations.filter(d => d.financial_year === fy);
  const totalSaved = SECTIONS.reduce((acc, s) => {
    if (!s.limit) return acc;
    const sTotal = filtered.filter(d => d.section === s.id).reduce((a, d) => a + Number(d.amount), 0);
    return acc + Math.min(sTotal, s.limit);
  }, 0);
  const taxSaved = Math.round(totalSaved * 0.3);
  const roomLeft = Math.max(0, 150000 - (filtered.filter(d => d.section === '80C').reduce((a, d) => a + Number(d.amount), 0)));

  async function handleDelete(declaration) {
    if (!confirm(`Delete ${declaration.name} declaration? This cannot be undone.`)) return;
    await onDelete(declaration.id);
    toast('Removed');
  }

  return (
    <div>
      {/* Summary card */}
      <div className="card pad rise" style={{ '--d': '0ms', marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ fontSize: 17, fontWeight: 800, letterSpacing: '-0.015em' }}>Tax Planner</h3>
          <select value={fy} onChange={e => setFy(e.target.value)} className="mini-select">
            {fyOptions().map(option => <option key={option} value={option}>FY {option}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: 6 }}>Deductions declared</div>
            <div className="num" style={{ fontSize: 26, fontWeight: 700 }}>{fmtK(totalSaved)}</div>
          </div>
          <div>
            <div className="eyebrow" style={{ marginBottom: 6 }}>Est. tax saved · 30% slab</div>
            <div className="num" style={{ fontSize: 26, fontWeight: 700, color: 'var(--pos)' }}>{fmtK(taxSaved)}</div>
          </div>
        </div>
        {roomLeft > 0 && (
          <div style={{ marginTop: 14, padding: '10px 14px', background: 'var(--warn-soft)', borderRadius: 'var(--r-sm)', fontSize: 13, fontWeight: 600, color: 'var(--warn)' }}>
            💡 80C room available — <span className="num">{fmtK(roomLeft)}</span> more can be declared
          </div>
        )}
        <div style={{ marginTop: 10, fontSize: 11, color: 'var(--ink-3)' }}>Consult a CA for actual filing. Estimates only.</div>
      </div>

      {SECTIONS.map((section, si) => {
        const sectionDecls = filtered.filter(d => d.section === section.id);
        const total = sectionDecls.reduce((a, d) => a + Number(d.amount), 0);
        const pct = section.limit ? Math.min(100, Math.round((total / section.limit) * 100)) : 0;
        const over = section.limit && total > section.limit;
        const remaining = section.limit ? section.limit - total : null;
        return (
          <div key={section.id} className="tax-section-card rise" style={{ '--d': `${(si + 1) * 60}ms` }}>
            <div className="tax-section-head">
              <div>
                <div className="tax-section-title">{section.label}</div>
                <div className="tax-section-sub">{section.examples}</div>
              </div>
              <button className="btn-ghost" style={{ padding: '7px 12px', fontSize: 13, whiteSpace: 'nowrap' }} onClick={() => setShowAdd(section.id)}>
                <Icon name="plus" size={13} />Add
              </button>
            </div>
            {section.limit && (
              <>
                <div className="tax-limit-bar">
                  <div className={`tax-limit-fill${over ? ' over' : ''}`} style={{ width: pct + '%' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 20px 14px', fontSize: 12, fontWeight: 700 }}>
                  <span className="num" style={{ color: 'var(--ink-2)' }}>{fmtK(total)} declared</span>
                  <span style={{ color: over ? 'var(--neg)' : 'var(--pos)' }}>
                    {over ? `${fmtK(Math.abs(remaining))} over` : `${fmtK(remaining)} left`}
                  </span>
                </div>
              </>
            )}
            {sectionDecls.length === 0 ? (
              <div style={{ padding: '0 20px 16px', fontSize: 13, color: 'var(--ink-3)', fontWeight: 600 }}>Nothing declared yet</div>
            ) : sectionDecls.map(d => (
              <div key={d.id} className="tax-item">
                <div className="tax-item-name">{d.name}</div>
                <div className="tax-item-amt num">{fmtK(d.amount)}</div>
                <button className="icon-btn" style={{ width: 28, height: 28, marginLeft: 8 }} onClick={() => setEditingDecl(d)}><Icon name="gear" size={13} /></button>
                <button className="icon-btn" style={{ width: 28, height: 28, color: 'var(--neg)' }} onClick={() => handleDelete(d)}>×</button>
              </div>
            ))}
          </div>
        );
      })}

      {showAdd && (
        <Modal title={`Add ${showAdd} Declaration`} onClose={() => setShowAdd(null)}>
          <TaxForm section={showAdd} fy={fy} items={SECTIONS.find(s => s.id === showAdd)?.items || []}
            onSave={async d => { await onAdd(d); toast('Declaration added'); setShowAdd(null); }} />
        </Modal>
      )}
      {editingDecl && (
        <Modal title="Edit Declaration" onClose={() => setEditingDecl(null)}>
          <TaxForm section={editingDecl.section} fy={editingDecl.financial_year}
            items={SECTIONS.find(s => s.id === editingDecl.section)?.items || []}
            initial={editingDecl} submitLabel="Save Changes"
            onSave={async d => { await onUpdate(editingDecl.id, { name: d.name, amount: d.amount }); toast('Updated'); setEditingDecl(null); }} />
        </Modal>
      )}
    </div>
  );
}

function TaxForm({ section, fy, items, onSave, initial, submitLabel = 'Add Declaration' }) {
  const [name, setName] = useState(initial?.name || items[0] || '');
  const [customName, setCustomName] = useState('');
  const [amount, setAmount] = useState(initial?.amount?.toString() || '');
  const finalName = name === 'custom' ? customName : name;
  return (
    <form onSubmit={e => { e.preventDefault(); onSave({ name: finalName, section, amount: Number(amount), financial_year: fy }); }} className="expense-form">
      <div className="form-group"><label>Type</label><select value={name} onChange={e => setName(e.target.value)}>{items.map(i => <option key={i} value={i}>{i}</option>)}<option value="custom">Other (custom)</option></select></div>
      {name === 'custom' && <div className="form-group"><label>Custom Name</label><input type="text" value={customName} onChange={e => setCustomName(e.target.value)} placeholder="e.g. Sukanya Samriddhi" required /></div>}
      <div className="form-group"><label>Amount Declared (₹)</label><input type="number" inputMode="decimal" value={amount} onChange={e => setAmount(e.target.value)} min="1" required /></div>
      <div style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 12 }}>Financial Year: {fy}</div>
      <button type="submit" className="btn-primary">{submitLabel}</button>
    </form>
  );
}
