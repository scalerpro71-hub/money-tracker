import { useState } from 'react';
import { Modal } from '../layout/Modal';

export function AddGoalModal({ onAdd, onClose, initialData = null }) {
  const editing = !!initialData;
  const [name, setName] = useState(initialData?.name || '');
  const [target, setTarget] = useState(initialData?.target_amount?.toString() || '');
  const [current, setCurrent] = useState(initialData?.current_amount?.toString() || '0');
  const [targetDate, setTargetDate] = useState(initialData?.target_date || '');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await onAdd({
        name,
        target_amount: Number(target),
        current_amount: Number(current),
        target_date: targetDate || null,
      });
      onClose();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal title={editing ? 'Edit Goal' : 'Add Goal'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="expense-form">
        <div className="form-group">
          <label>Goal Name</label>
          <input type="text" placeholder="e.g. New iPhone, Emergency Fund" value={name} onChange={e => setName(e.target.value)} required />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Target Amount (₹)</label>
            <input type="number" inputMode="decimal" placeholder="60000" value={target} onChange={e => setTarget(e.target.value)} min="1" required />
          </div>
          <div className="form-group">
            <label>Already Saved (₹)</label>
            <input type="number" inputMode="decimal" placeholder="0" value={current} onChange={e => setCurrent(e.target.value)} min="0" />
          </div>
        </div>
        <div className="form-group">
          <label>Target Date (optional)</label>
          <input type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)} />
        </div>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Saving...' : editing ? 'Save Changes' : 'Add Goal'}
        </button>
      </form>
    </Modal>
  );
}
