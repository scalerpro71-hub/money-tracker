import { useState } from 'react';
import { formatINR } from '../lib/dateUtils';
import { Modal } from '../components/layout/Modal';
import { useToast } from '../components/layout/Toast';

const SECTIONS = [
  {
    id: '80C',
    label: '80C — Investments & Insurance',
    limit: 150000,
    color: '#6366f1',
    examples: 'PPF, ELSS, LIC, NSC, Home Loan Principal, Tuition Fees, ULIP',
    items: ['PPF', 'ELSS Mutual Fund', 'LIC Premium', 'NSC', 'Home Loan Principal', 'Tuition Fees', 'ULIP', '5-yr FD', 'NPS (employee)', 'SCSS'],
  },
  {
    id: '80CCD(1B)',
    label: '80CCD(1B) — NPS Extra',
    limit: 50000,
    color: '#0ea5e9',
    examples: 'Additional NPS contribution over 80C limit',
    items: ['NPS (self)'],
  },
  {
    id: '80D',
    label: '80D — Health Insurance',
    limit: 25000,
    color: '#10b981',
    examples: 'Health insurance premium for self + family. ₹50,000 for senior citizens.',
    items: ['Self Health Insurance', 'Family Health Insurance', 'Parent Health Insurance', 'Preventive Health Checkup'],
  },
  {
    id: '80G',
    label: '80G — Donations',
    limit: null,
    color: '#f59e0b',
    examples: 'Donations to approved charities. 50% or 100% deduction depending on charity.',
    items: ['PM CARES', 'National Relief Fund', 'Charity Donation'],
  },
  {
    id: 'HRA',
    label: 'HRA — House Rent Allowance',
    limit: null,
    color: '#ec4899',
    examples: 'Rent paid if you are salaried and living in rented accommodation',
    items: ['Rent Paid'],
  },
];

function SectionProgress({ section, total }) {
  if (!section.limit) return null;
  const pct = Math.min(100, Math.round((total / section.limit) * 100));
  const remaining = section.limit - total;
  const over = total > section.limit;

  return (
    <div className="tax-progress">
      <div className="tax-bar-bg">
        <div className="tax-bar-fill" style={{ width: `${pct}%`, background: over ? '#ef4444' : section.color }} />
      </div>
      <div className="tax-bar-meta">
        <span>{formatINR(total)} declared</span>
        <span style={{ color: over ? '#ef4444' : 'var(--color-success)', fontWeight: 600 }}>
          {over ? `₹${formatINR(Math.abs(remaining))} over limit` : `₹${formatINR(remaining)} remaining`}
        </span>
      </div>
    </div>
  );
}

export function TaxPage({ declarations, onAdd, onUpdate, onDelete }) {
  const toast = useToast();
  const [showAdd, setShowAdd] = useState(null); // section id
  const [editingDecl, setEditingDecl] = useState(null);
  const [fy, setFy] = useState('2024-25');

  const filtered = declarations.filter(d => d.financial_year === fy);

  const totalSaved = SECTIONS.reduce((acc, s) => {
    if (!s.limit) return acc;
    const sTotal = filtered.filter(d => d.section === s.id).reduce((a, d) => a + Number(d.amount), 0);
    return acc + Math.min(sTotal, s.limit);
  }, 0);

  // Assumed tax bracket (30%)
  const taxSaved = Math.round(totalSaved * 0.3);

  return (
    <div className="page">
      <div className="page-header">
        <h2>Tax Planner</h2>
        <p className="page-sub">Track 80C, 80D, HRA deductions</p>
      </div>

      <div className="section-card">
        <div className="section-header">
          <h4>Financial Year</h4>
          <select value={fy} onChange={e => setFy(e.target.value)} style={{ fontSize: 13, padding: '4px 8px', borderRadius: 8, border: '1.5px solid var(--color-border)', background: 'var(--color-surface-2)', color: 'var(--color-text)' }}>
            <option value="2024-25">2024–25</option>
            <option value="2025-26">2025–26</option>
            <option value="2023-24">2023–24</option>
          </select>
        </div>
        <div className="tax-summary">
          <div className="tax-summary-item">
            <div className="tax-summary-val">{formatINR(totalSaved)}</div>
            <div className="tax-summary-label">Total Deductions Declared</div>
          </div>
          <div className="tax-summary-item">
            <div className="tax-summary-val" style={{ color: '#10b981' }}>{formatINR(taxSaved)}</div>
            <div className="tax-summary-label">Est. Tax Saved (30% slab)</div>
          </div>
        </div>
        <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 8, textAlign: 'center' }}>
          Actual savings depend on your income slab. Consult a CA for filing.
        </div>

        {/* Deduction insight */}
        {(() => {
          const totalLimit = SECTIONS.filter(s => s.limit).reduce((a, s) => a + s.limit, 0);
          const remaining = totalLimit - totalSaved;
          if (totalLimit > 0) {
            const utilisationPct = Math.round((totalSaved / totalLimit) * 100);
            return (
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--color-border)', fontSize: 12, color: 'var(--color-text-muted)' }}>
                {utilisationPct < 30 && <div>💡 You've used only {utilisationPct}% of available deductions. Explore more ways to maximize savings.</div>}
                {utilisationPct >= 30 && utilisationPct < 80 && <div>🎯 {utilisationPct}% utilised. {remaining > 0 && `₹${remaining.toLocaleString('en-IN')} room left.`}</div>}
                {utilisationPct >= 80 && <div>🔥 Excellent! {utilisationPct}% utilised.</div>}
              </div>
            );
          }
          return null;
        })()}
      </div>

      {SECTIONS.map(section => {
        const sectionDecls = filtered.filter(d => d.section === section.id);
        const total = sectionDecls.reduce((a, d) => a + Number(d.amount), 0);
        return (
          <div key={section.id} className="section-card">
            <div className="section-header">
              <div>
                <h4 style={{ color: section.color }}>{section.label}</h4>
                {section.limit && <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Limit: {formatINR(section.limit)}/year</div>}
              </div>
              <button className="btn-secondary btn-sm" onClick={() => setShowAdd(section.id)}>+ Add</button>
            </div>

            <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 10 }}>{section.examples}</div>

            <SectionProgress section={section} total={total} />

            {sectionDecls.length === 0 ? (
              <p className="empty-hint" style={{ margin: '8px 0 0' }}>Nothing declared yet</p>
            ) : (
              <div className="tax-list">
                {sectionDecls.map(d => (
                  <div key={d.id} className="tax-row">
                    <span className="tax-name">{d.name}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="tax-amt">{formatINR(d.amount)}</span>
                      <button className="btn-icon" onClick={() => setEditingDecl(d)}>✏️</button>
                      <button className="btn-icon" onClick={() => { onDelete(d.id); toast('Removed'); }}>🗑️</button>
                    </div>
                  </div>
                ))}
                <div className="tax-row tax-row--total">
                  <span>Total</span>
                  <span style={{ color: section.color, fontWeight: 800 }}>{formatINR(total)}</span>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {showAdd && (
        <Modal title={`Add ${showAdd} Declaration`} onClose={() => setShowAdd(null)}>
          <TaxForm
            section={showAdd}
            fy={fy}
            items={SECTIONS.find(s => s.id === showAdd)?.items || []}
            onSave={async d => { await onAdd(d); toast('Declaration added'); setShowAdd(null); }}
          />
        </Modal>
      )}
      {editingDecl && (
        <Modal title="Edit Declaration" onClose={() => setEditingDecl(null)}>
          <TaxForm
            section={editingDecl.section}
            fy={editingDecl.financial_year}
            items={SECTIONS.find(s => s.id === editingDecl.section)?.items || []}
            initial={editingDecl}
            submitLabel="Save Changes"
            onSave={async d => { await onUpdate(editingDecl.id, { name: d.name, amount: d.amount }); toast('Updated'); setEditingDecl(null); }}
          />
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
      <div className="form-group">
        <label>Investment / Expense Type</label>
        <select value={name} onChange={e => setName(e.target.value)}>
          {items.map(i => <option key={i} value={i}>{i}</option>)}
          <option value="custom">Other (type below)</option>
        </select>
      </div>
      {name === 'custom' && (
        <div className="form-group">
          <label>Custom Name</label>
          <input type="text" value={customName} onChange={e => setCustomName(e.target.value)} placeholder="e.g. Sukanya Samriddhi" required />
        </div>
      )}
      <div className="form-group">
        <label>Amount Declared (₹)</label>
        <input type="number" inputMode="decimal" value={amount} onChange={e => setAmount(e.target.value)} min="1" required />
      </div>
      <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 12 }}>Financial Year: {fy}</div>
      <button type="submit" className="btn-primary">{submitLabel}</button>
    </form>
  );
}
