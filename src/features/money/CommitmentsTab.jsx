import { useState } from 'react';
import { Modal } from '../../components/layout/Modal';
import {
  useBills, useBillMutations,
  useEmis, useEmiMutations,
  useRecurring, useRecurringMutations,
} from '../../lib/queries';
import { useToast } from '../../components/layout/Toast';
import { cur, fmtK } from '../../lib/formatUtils';
import { todayStr } from '../../lib/dateUtils';

function monthsLeft(emi) {
  const start = new Date(emi.start_date + 'T00:00:00');
  const now = new Date();
  const elapsed = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
  return Math.max(0, emi.tenure_months - elapsed);
}

function AddCommitmentModal({ kind, onClose, onSave }) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [day, setDay] = useState(1);
  const [frequency, setFrequency] = useState('monthly');
  const [principal, setPrincipal] = useState('');
  const [tenure, setTenure] = useState('');
  const [startDate, setStartDate] = useState(todayStr());
  const [saving, setSaving] = useState(false);

  const valid = name.trim() && Number(amount) > 0 &&
    (kind !== 'emi' || (Number(principal) > 0 && Number(tenure) > 0));

  async function save() {
    setSaving(true);
    try {
      if (kind === 'bill') {
        await onSave({ name: name.trim(), amount: Number(amount), due_day: Number(day), is_active: true });
      } else if (kind === 'emi') {
        await onSave({ name: name.trim(), emi_amount: Number(amount), principal: Number(principal), tenure_months: Number(tenure), start_date: startDate });
      } else {
        await onSave({
          name: name.trim(), amount: Number(amount), frequency,
          day_of_month: frequency === 'monthly' ? Math.min(28, Number(day)) : null,
          day_of_week: frequency === 'weekly' ? Number(day) % 7 : null,
          is_active: true,
        });
      }
      onClose();
    } finally {
      setSaving(false);
    }
  }

  const titles = { bill: 'Add bill', emi: 'Add EMI', recurring: 'Add recurring expense' };
  return (
    <Modal title={titles[kind]} onClose={onClose}>
      <div className="form-group">
        <label>Name</label>
        <input autoFocus value={name} onChange={e => setName(e.target.value)} placeholder={kind === 'emi' ? 'e.g. Bike loan' : kind === 'bill' ? 'e.g. Electricity' : 'e.g. Netflix'} />
      </div>
      <div className="form-group">
        <label>{kind === 'emi' ? 'EMI amount (monthly)' : 'Amount'}</label>
        <input type="number" inputMode="numeric" min="0" value={amount} onChange={e => setAmount(e.target.value)} placeholder="₹" />
      </div>
      {kind === 'emi' && (
        <>
          <div className="form-row">
            <div className="form-group">
              <label>Total loan amount</label>
              <input type="number" inputMode="numeric" min="0" value={principal} onChange={e => setPrincipal(e.target.value)} placeholder="₹" />
            </div>
            <div className="form-group">
              <label>Tenure (months)</label>
              <input type="number" inputMode="numeric" min="1" value={tenure} onChange={e => setTenure(e.target.value)} placeholder="24" />
            </div>
          </div>
          <div className="form-group">
            <label>Started on</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>
        </>
      )}
      {kind === 'recurring' && (
        <div className="form-group">
          <label>Repeats</label>
          <select value={frequency} onChange={e => setFrequency(e.target.value)}>
            <option value="monthly">Monthly</option>
            <option value="weekly">Weekly</option>
          </select>
        </div>
      )}
      {kind !== 'emi' && (
        <div className="form-group">
          <label>{frequency === 'weekly' && kind === 'recurring' ? 'Day of week (0 = Sunday)' : 'Day of month'}</label>
          <input type="number" inputMode="numeric" min="0" max={kind === 'recurring' && frequency === 'weekly' ? 6 : 31} value={day} onChange={e => setDay(e.target.value)} />
        </div>
      )}
      <button className="btn-primary" onClick={save} disabled={!valid || saving}>
        {saving ? 'Saving…' : 'Save'}
      </button>
    </Modal>
  );
}

function Section({ title, sub, items, onAdd, onDelete, renderRow, addLabel }) {
  return (
    <div className="card pad" style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: items.length ? 6 : 0 }}>
        <div>
          <div style={{ fontSize: 15.5, fontWeight: 800 }}>{title}</div>
          <div style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 600, marginTop: 2 }}>{sub}</div>
        </div>
        <button className="filter-chip" onClick={onAdd}>+ {addLabel}</button>
      </div>
      {items.map(item => (
        <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', borderTop: '1px solid var(--hair)' }}>
          {renderRow(item)}
          <button className="icon-btn" style={{ width: 26, height: 26, flexShrink: 0 }} aria-label="Delete" onClick={() => onDelete(item.id)}>×</button>
        </div>
      ))}
    </div>
  );
}

export function CommitmentsTab() {
  const { data: bills = [] } = useBills();
  const { data: emis = [] } = useEmis();
  const { data: recurring = [] } = useRecurring();
  const billMut = useBillMutations();
  const emiMut = useEmiMutations();
  const recurringMut = useRecurringMutations();
  const [adding, setAdding] = useState(null); // 'bill' | 'emi' | 'recurring'
  const toast = useToast();

  const activeEmis = emis.filter(e => monthsLeft(e) > 0);
  const monthlyTotal =
    bills.filter(b => b.is_active).reduce((a, b) => a + Number(b.amount), 0) +
    activeEmis.reduce((a, e) => a + Number(e.emi_amount), 0) +
    recurring.filter(r => r.is_active).reduce((a, r) => a + Number(r.amount) * (r.frequency === 'weekly' ? 4.33 : 1), 0);

  const mutations = { bill: billMut, emi: emiMut, recurring: recurringMut };

  async function handleDelete(kind, id) {
    if (!confirm('Remove this commitment?')) return;
    try { await mutations[kind].remove.mutateAsync(id); toast('Removed'); }
    catch (err) { toast(err.message, 'error'); }
  }

  async function handleAdd(row) {
    try { await mutations[adding].add.mutateAsync(row); toast('Added'); }
    catch (err) { toast(err.message, 'error'); throw err; }
  }

  return (
    <div>
      <div className="card pad rise" style={{ marginBottom: 18 }}>
        <div className="eyebrow">Fixed commitments per month</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 8 }}>
          <span className="num" style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em' }}>{fmtK(Math.round(monthlyTotal))}</span>
          <span style={{ fontSize: 13.5, color: 'var(--ink-3)', fontWeight: 600 }}>
            bills + EMIs + subscriptions
          </span>
        </div>
        <div style={{ fontSize: 12.5, color: 'var(--ink-3)', fontWeight: 600, marginTop: 6 }}>
          This leaves your spendable money after the fixed stuff. Keeping it under ~50% of income is the goal.
        </div>
      </div>

      <Section
        title="Bills" sub="Rent, electricity, phone — due on a fixed day" addLabel="Bill"
        items={bills}
        onAdd={() => setAdding('bill')}
        onDelete={(id) => handleDelete('bill', id)}
        renderRow={(b) => (
          <>
            <div className="bill-date">
              <div className="bd-day num">{b.due_day}</div>
              <div className="bd-mon">every mo</div>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 750 }}>{b.name}</div>
              {!b.is_active && <div style={{ fontSize: 11.5, color: 'var(--ink-4)', fontWeight: 700 }}>Paused</div>}
            </div>
            <div className="num" style={{ fontSize: 14.5, fontWeight: 700 }}>{cur(b.amount)}</div>
          </>
        )}
      />

      <Section
        title="EMIs" sub="Loan payments — the coach wants these under 30% of income" addLabel="EMI"
        items={emis}
        onAdd={() => setAdding('emi')}
        onDelete={(id) => handleDelete('emi', id)}
        renderRow={(e) => {
          const left = monthsLeft(e);
          return (
            <>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 750 }}>{e.name}</div>
                <div style={{ fontSize: 12, color: left > 0 ? 'var(--ink-3)' : 'var(--pos)', fontWeight: 650, marginTop: 1 }}>
                  {left > 0 ? `${left} months to go` : 'Paid off 🎉'}
                </div>
              </div>
              <div className="num" style={{ fontSize: 14.5, fontWeight: 700 }}>{cur(e.emi_amount)}<span style={{ fontSize: 11, color: 'var(--ink-3)' }}>/mo</span></div>
            </>
          );
        }}
      />

      <Section
        title="Subscriptions & recurring" sub="Auto-logged as expenses when due" addLabel="Recurring"
        items={recurring}
        onAdd={() => setAdding('recurring')}
        onDelete={(id) => handleDelete('recurring', id)}
        renderRow={(r) => (
          <>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 750 }}>{r.name}</div>
              <div style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 650, marginTop: 1 }}>
                {r.frequency === 'weekly' ? 'Weekly' : `Monthly · day ${r.day_of_month}`}{!r.is_active && ' · paused'}
              </div>
            </div>
            <div className="num" style={{ fontSize: 14.5, fontWeight: 700 }}>{cur(r.amount)}</div>
          </>
        )}
      />

      {adding && (
        <AddCommitmentModal kind={adding} onClose={() => setAdding(null)} onSave={handleAdd} />
      )}
    </div>
  );
}
