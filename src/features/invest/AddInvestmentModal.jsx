import { useState } from 'react';
import { useInvestmentMutations } from '../../lib/queries';
import { useToast } from '../../components/layout/Toast';
import { Modal } from '../../components/layout/Modal';
import { todayStr } from '../../lib/dateUtils';
import { TYPE_GLOSSARY } from '../../content/journey/glossary';
import { TYPE_META } from './investMeta';

/* `initial` = edit an existing row; `preset` = prefill a fresh log (type/name/monthly). */
export function AddInvestmentModal({ initial, preset, onClose }) {
  const { add, update } = useInvestmentMutations();
  const toast = useToast();
  const editing = !!initial;
  const [name, setName] = useState(initial?.name || preset?.name || '');
  const [type, setType] = useState(initial?.type || preset?.type || 'sip');
  const [invested, setInvested] = useState(initial?.invested_amount || '');
  const [value, setValue] = useState(initial?.current_value || '');
  const [monthly, setMonthly] = useState(initial?.monthly_amount || preset?.monthly_amount || '');
  const [startDate, setStartDate] = useState(initial?.start_date || todayStr());
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      const row = {
        name: name.trim(),
        type,
        invested_amount: Number(invested),
        current_value: Number(value) || Number(invested),
        monthly_amount: type === 'sip' ? Number(monthly) || null : null,
        start_date: startDate,
      };
      if (editing) {
        await update.mutateAsync({ id: initial.id, ...row });
        toast('Investment updated');
      } else {
        await add.mutateAsync(row);
        toast('Investment logged 🎉');
      }
      onClose();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={editing ? 'Edit investment' : 'Log an investment'} onClose={onClose}>
      <div className="form-group">
        <label>Type</label>
        <select value={type} onChange={e => setType(e.target.value)}>
          {Object.entries(TYPE_META).map(([value, meta]) => (
            <option key={value} value={value}>{meta.label}</option>
          ))}
        </select>
        <div style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 600, lineHeight: 1.5, marginTop: 4 }}>
          {TYPE_GLOSSARY[type]}
        </div>
      </div>
      <div className="form-group">
        <label>Name</label>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Nifty 50 Index Fund" autoFocus={!editing} />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Amount invested so far</label>
          <input type="number" inputMode="numeric" min="0" value={invested} onChange={e => setInvested(e.target.value)} placeholder="₹" />
        </div>
        <div className="form-group">
          <label>Current value</label>
          <input type="number" inputMode="numeric" min="0" value={value} onChange={e => setValue(e.target.value)} placeholder="same if unsure" />
        </div>
      </div>
      {type === 'sip' && (
        <div className="form-group">
          <label>Monthly SIP amount</label>
          <input type="number" inputMode="numeric" min="0" value={monthly} onChange={e => setMonthly(e.target.value)} placeholder="₹ per month" />
        </div>
      )}
      <div className="form-group">
        <label>Started on</label>
        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
      </div>
      <button className="btn-primary" onClick={save} disabled={saving || !name.trim() || !(Number(invested) > 0)}>
        {saving ? 'Saving…' : editing ? 'Save changes' : 'Log investment'}
      </button>
    </Modal>
  );
}
