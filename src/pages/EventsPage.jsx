import { useState } from 'react';
import { Modal } from '../components/layout/Modal';
import { useToast } from '../components/layout/Toast';
import { Icon } from '../components/layout/Icon';
import { fmtK } from '../lib/formatUtils';

const EVENT_ICONS = ['🎉', '🪔', '💍', '🎂', '✈️', '🎓', '🏠', '🎊', '🛍️', '⭐'];

function formatShortDate(d) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export function EventsPage({ events, onAdd, onUpdate, onDelete, expenses }) {
  const toast = useToast();
  const [showAdd, setShowAdd] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  function getEventSpend(event) {
    if (!event.start_date && !event.end_date) return 0;
    return expenses.filter(e => {
      if (e.type === 'income') return false;
      if (event.start_date && e.date < event.start_date) return false;
      if (event.end_date && e.date > event.end_date) return false;
      return true;
    }).reduce((a, e) => a + Number(e.amount), 0);
  }

  async function handleDelete(event) {
    if (!confirm(`Delete ${event.name} event budget? This cannot be undone.`)) return;
    await onDelete(event.id);
    toast('Event deleted');
  }

  return (
    <div>
      <div className="sec-head" style={{ marginTop: 0 }}>
        <h3>Event Budgets</h3>
        <button className="btn-accent" onClick={() => setShowAdd(true)}>
          <Icon name="plus" size={15} />New event
        </button>
      </div>

      <div className="events-grid">
        {events.map((ev, i) => {
          const spent = getEventSpend(ev);
          const pct = ev.budget > 0 ? Math.min(100, Math.round((spent / ev.budget) * 100)) : 0;
          const remaining = ev.budget - spent;
          const over = spent > ev.budget;
          const today = new Date().toISOString().split('T')[0];
          const active = (!ev.start_date || ev.start_date <= today) && (!ev.end_date || ev.end_date >= today);

          return (
            <div key={ev.id} className="event-card rise" style={{ '--d': `${i * 60}ms` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ width: 48, height: 48, borderRadius: 15, display: 'grid', placeItems: 'center', fontSize: 24, background: 'var(--surface-2)', border: '1px solid var(--hair)' }}>
                  {ev.icon}
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button className="icon-btn" style={{ width: 30, height: 30 }} onClick={() => setEditingEvent(ev)}><Icon name="gear" size={14} /></button>
                  <button className="icon-btn" style={{ width: 30, height: 30, color: 'var(--neg)' }} onClick={() => handleDelete(ev)}>×</button>
                </div>
              </div>
              <div style={{ fontWeight: 800, fontSize: 15 }}>{ev.name}</div>
              <div style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 600, marginTop: 3, display: 'flex', alignItems: 'center', gap: 6 }}>
                {ev.start_date && formatShortDate(ev.start_date)}
                {ev.start_date && ev.end_date && ' → '}
                {ev.end_date && formatShortDate(ev.end_date)}
                {active && <span className="chip" style={{ padding: '2px 8px', fontSize: 10 }}>Active</span>}
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, margin: '14px 0 10px' }}>
                <span className="num" style={{ fontSize: 20, fontWeight: 700, color: over ? 'var(--neg)' : 'var(--ink)' }}>{fmtK(spent)}</span>
                <span style={{ fontSize: 13, color: 'var(--ink-3)', fontWeight: 600 }}>/ {fmtK(ev.budget)}</span>
              </div>
              <div style={{ height: 7, borderRadius: 'var(--r-pill)', background: 'var(--surface-3)', overflow: 'hidden', marginBottom: 10 }}>
                <div style={{ height: '100%', width: pct + '%', borderRadius: 'var(--r-pill)', background: over ? 'var(--neg)' : 'linear-gradient(90deg, var(--accent), var(--accent-2))', transition: 'width .7s cubic-bezier(.4,0,.2,1)' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--ink-3)', fontWeight: 600 }}>
                <span>{pct}% used</span>
                <span style={{ color: over ? 'var(--neg)' : 'var(--pos)', fontWeight: 700 }}>
                  {over ? `Over by ${fmtK(Math.abs(remaining))}` : `${fmtK(remaining)} left`}
                </span>
              </div>
            </div>
          );
        })}
        <button className="event-new-card" onClick={() => setShowAdd(true)}>
          <Icon name="plus" size={24} />
          <span style={{ fontWeight: 700, fontSize: 14 }}>New event budget</span>
        </button>
      </div>

      {showAdd && (
        <Modal title="Create Event Budget" onClose={() => setShowAdd(false)}>
          <EventForm onSave={async d => { await onAdd(d); toast('Event created'); setShowAdd(false); }} />
        </Modal>
      )}
      {editingEvent && (
        <Modal title="Edit Event" onClose={() => setEditingEvent(null)}>
          <EventForm initial={editingEvent} submitLabel="Save Changes"
            onSave={async d => { await onUpdate(editingEvent.id, d); toast('Event updated'); setEditingEvent(null); }} />
        </Modal>
      )}
    </div>
  );
}

function EventForm({ onSave, initial, submitLabel = 'Create Event' }) {
  const [name, setName] = useState(initial?.name || '');
  const [budget, setBudget] = useState(initial?.budget?.toString() || '');
  const [icon, setIcon] = useState(initial?.icon || '🎉');
  const [startDate, setStartDate] = useState(initial?.start_date || '');
  const [endDate, setEndDate] = useState(initial?.end_date || '');
  return (
    <form onSubmit={e => { e.preventDefault(); onSave({ name, budget: Number(budget), icon, start_date: startDate || null, end_date: endDate || null }); }} className="expense-form">
      <div className="form-group"><label>Event Name</label><input type="text" placeholder="e.g. Diwali 2025, Europe Trip" value={name} onChange={e => setName(e.target.value)} required /></div>
      <div className="form-group">
        <label>Pick Icon</label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {EVENT_ICONS.map(ic => (
            <button key={ic} type="button" onClick={() => setIcon(ic)}
              style={{ fontSize: 22, background: icon === ic ? 'var(--accent-soft)' : 'var(--surface-2)', border: icon === ic ? '1px solid var(--accent)' : '1px solid var(--hair)', borderRadius: 10, padding: '4px 8px', cursor: 'pointer' }}>
              {ic}
            </button>
          ))}
        </div>
      </div>
      <div className="form-group"><label>Total Budget (₹)</label><input type="number" inputMode="decimal" value={budget} onChange={e => setBudget(e.target.value)} min="1" required /></div>
      <div className="form-row">
        <div className="form-group"><label>Start Date</label><input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} /></div>
        <div className="form-group"><label>End Date</label><input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} /></div>
      </div>
      <button type="submit" className="btn-primary">{submitLabel}</button>
    </form>
  );
}
