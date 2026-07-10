import { useState } from 'react';
import { useWishlist, useWishlistMutations } from '../../lib/queries';
import { useToast } from '../../components/layout/Toast';
import { Modal } from '../../components/layout/Modal';
import { Icon } from '../../components/layout/Icon';
import { cur, fmtK } from '../../lib/formatUtils';

const WAIT_DAYS = 30;

function daysWaited(item) {
  return Math.floor((Date.now() - new Date(item.created_at).getTime()) / 86400000);
}

function AddWishModal({ onClose, onSave }) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      await onSave({ name: name.trim(), amount: Number(amount), note: note.trim() || null });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title="Park it for 30 days" onClose={onClose}>
      <div className="form-group">
        <label>What do you want to buy?</label>
        <input autoFocus value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Noise-cancelling headphones" />
      </div>
      <div className="form-group">
        <label>Price</label>
        <input type="number" inputMode="numeric" min="0" value={amount} onChange={e => setAmount(e.target.value)} placeholder="₹" />
      </div>
      <div className="form-group">
        <label>Why do you want it? (optional)</label>
        <input value={note} onChange={e => setNote(e.target.value)} placeholder="Future you will read this in 30 days" />
      </div>
      <button className="btn-primary" onClick={save} disabled={saving || !name.trim() || !(Number(amount) > 0)}>
        {saving ? 'Saving…' : 'Start the 30-day clock'}
      </button>
    </Modal>
  );
}

export function WishlistTab() {
  const { data: items = [] } = useWishlist();
  const { add, update, remove } = useWishlistMutations();
  const toast = useToast();
  const [modal, setModal] = useState(false);

  const pending = items.filter(i => !i.decision);
  const decided = items.filter(i => i.decision);
  const saved = decided.filter(i => i.decision === 'skipped').reduce((a, i) => a + Number(i.amount), 0);

  async function decide(item, decision) {
    try {
      await update.mutateAsync({ id: item.id, decision, decided_at: new Date().toISOString() });
      toast(decision === 'skipped' ? `${cur(Math.round(item.amount))} saved by waiting 🎉` : 'Enjoy it guilt-free — you waited');
    } catch (err) { toast(err.message, 'error'); }
  }

  async function handleDelete(id) {
    if (!confirm('Remove this item?')) return;
    try { await remove.mutateAsync(id); toast('Removed'); }
    catch (err) { toast(err.message, 'error'); }
  }

  return (
    <div>
      <div className="card pad rise" style={{ marginBottom: 18 }}>
        <div className="eyebrow">Saved by waiting</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 8 }}>
          <span className="num" style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em' }}>{fmtK(Math.round(saved))}</span>
          <span style={{ fontSize: 13.5, color: 'var(--ink-3)', fontWeight: 600 }}>
            from wants that faded before day {WAIT_DAYS}
          </span>
        </div>
        <div style={{ fontSize: 12.5, color: 'var(--ink-3)', fontWeight: 600, marginTop: 6 }}>
          Want something big? Park it here instead of buying. If you still want it in {WAIT_DAYS} days,
          buy it guilt-free — most wants don't survive the wait.
        </div>
        <button className="btn-accent" style={{ marginTop: 14, padding: '10px 16px', fontSize: 13.5 }} onClick={() => setModal(true)}>
          <Icon name="plus" size={15} />Park a purchase
        </button>
      </div>

      {pending.length > 0 && (
        <div className="card pad" style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 6 }}>Waiting</div>
          {pending.map(item => {
            const waited = daysWaited(item);
            const ready = waited >= WAIT_DAYS;
            return (
              <div key={item.id} style={{ padding: '12px 0', borderTop: '1px solid var(--hair)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 750 }}>{item.name}</div>
                    {item.note && (
                      <div style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 600, fontStyle: 'italic', marginTop: 1 }}>“{item.note}”</div>
                    )}
                  </div>
                  <div className="num" style={{ fontSize: 14.5, fontWeight: 700 }}>{cur(Math.round(item.amount))}</div>
                  <button className="icon-btn" style={{ width: 26, height: 26 }} aria-label="Delete" onClick={() => handleDelete(item.id)}>×</button>
                </div>
                <div className="catbar-track" style={{ marginTop: 9 }}>
                  <div className="catbar-fill anim-barGrow" style={{ width: `${Math.min(100, Math.round((waited / WAIT_DAYS) * 100))}%`, background: ready ? 'var(--accent)' : '#d97706' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 7, gap: 8, flexWrap: 'wrap' }}>
                  {ready ? (
                    <>
                      <span style={{ fontSize: 12.5, fontWeight: 800 }}>{WAIT_DAYS} days up — still want it?</span>
                      <span style={{ display: 'flex', gap: 8 }}>
                        <button className="filter-chip" onClick={() => decide(item, 'bought')}>Buy it 🎁</button>
                        <button className="filter-chip" onClick={() => decide(item, 'skipped')}>Let it go 💸</button>
                      </span>
                    </>
                  ) : (
                    <>
                      <span style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 650 }}>
                        day {waited} of {WAIT_DAYS} · {WAIT_DAYS - waited} to go
                      </span>
                      <span style={{ display: 'flex', gap: 10 }}>
                        <button className="more-link" style={{ padding: 0 }} onClick={() => decide(item, 'bought')}>can't wait</button>
                        <button className="more-link" style={{ padding: 0 }} onClick={() => decide(item, 'skipped')}>over it already</button>
                      </span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {pending.length === 0 && decided.length === 0 && (
        <div className="card pad" style={{ textAlign: 'center', padding: '36px 24px' }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>⏳</div>
          <div style={{ fontWeight: 800, fontSize: 15 }}>Nothing cooling off</div>
          <div style={{ fontSize: 13, color: 'var(--ink-3)', fontWeight: 600, margin: '4px auto 0', maxWidth: 380, lineHeight: 1.55 }}>
            Next time your finger hovers over "Buy now", park it here instead. The want usually
            costs nothing to keep waiting.
          </div>
        </div>
      )}

      {decided.length > 0 && (
        <div className="card pad">
          <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 6 }}>Decided</div>
          {decided.map(item => (
            <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderTop: '1px solid var(--hair)' }}>
              <span style={{ fontSize: 16 }}>{item.decision === 'skipped' ? '💸' : '🎁'}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 750 }}>{item.name}</div>
                <div style={{ fontSize: 12, color: item.decision === 'skipped' ? 'var(--pos)' : 'var(--ink-3)', fontWeight: 650 }}>
                  {item.decision === 'skipped' ? 'let go — money kept' : 'bought after waiting'}
                </div>
              </div>
              <div className="num" style={{ fontSize: 13.5, fontWeight: 700 }}>{cur(Math.round(item.amount))}</div>
              <button className="icon-btn" style={{ width: 26, height: 26 }} aria-label="Delete" onClick={() => handleDelete(item.id)}>×</button>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <AddWishModal
          onClose={() => setModal(false)}
          onSave={async (row) => {
            try { await add.mutateAsync(row); toast('Parked. See you in 30 days ⏳'); }
            catch (err) { toast(err.message, 'error'); throw err; }
          }}
        />
      )}
    </div>
  );
}
