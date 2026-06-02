import { useState } from 'react';
import { formatINR, formatShortDate } from '../lib/dateUtils';
import { Modal } from '../components/layout/Modal';
import { useToast } from '../components/layout/Toast';

const EVENT_ICONS = ['🎉', '🪔', '💍', '🎂', '✈️', '🎓', '🏠', '🎊', '🛍️', '⭐'];

export function EventsPage({ events, onAdd, onUpdate, onDelete, expenses }) {
  const toast = useToast();
  const [showAdd, setShowAdd] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  function getEventSpend(event) {
    if (!event.start_date && !event.end_date) return 0;
    return expenses
      .filter(e => {
        if (event.start_date && e.date < event.start_date) return false;
        if (event.end_date && e.date > event.end_date) return false;
        return true;
      })
      .reduce((a, e) => a + Number(e.amount), 0);
  }

  return (
    <div className="page">
      <div className="page-header">
        <h2>Event Budgets</h2>
        <p className="page-sub">Diwali, weddings, trips — dedicated budget envelopes</p>
      </div>

      <button className="btn-primary" style={{ width: '100%', marginBottom: 16 }} onClick={() => setShowAdd(true)}>
        + Create Event Budget
      </button>

      {events.length === 0 && (
        <div className="empty-hint">
          🪔 Create budget envelopes for Diwali, weddings, vacations, or any special occasion.<br /><br />
          Set a budget and track spending for that date range.
        </div>
      )}

      {events.map(ev => {
        const spent = getEventSpend(ev);
        const pct = ev.budget > 0 ? Math.min(100, Math.round((spent / ev.budget) * 100)) : 0;
        const remaining = ev.budget - spent;
        const over = spent > ev.budget;
        const today = new Date().toISOString().split('T')[0];
        const active = (!ev.start_date || ev.start_date <= today) && (!ev.end_date || ev.end_date >= today);

        return (
          <div key={ev.id} className="section-card">
            <div className="event-header">
              <div className="event-title">
                <span className="event-icon">{ev.icon}</span>
                <div>
                  <div className="event-name">{ev.name}</div>
                  {(ev.start_date || ev.end_date) && (
                    <div className="event-dates">
                      {ev.start_date && formatShortDate(ev.start_date)}
                      {ev.start_date && ev.end_date && ' → '}
                      {ev.end_date && formatShortDate(ev.end_date)}
                      {active && <span className="event-live"> · Active</span>}
                    </div>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                <button className="btn-icon" onClick={() => setEditingEvent(ev)}>✏️</button>
                <button className="btn-icon" onClick={() => onDelete(ev.id)}>🗑️</button>
              </div>
            </div>

            <div className="event-amounts">
              <span style={{ color: over ? 'var(--color-danger)' : 'var(--color-text)', fontWeight: 700, fontSize: 18 }}>
                {formatINR(spent)}
              </span>
              <span style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>/ {formatINR(ev.budget)}</span>
            </div>

            <div className="emi-bar-bg" style={{ marginBottom: 6 }}>
              <div className="emi-bar-fill" style={{ width: `${pct}%`, background: over ? 'var(--color-danger)' : undefined }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--color-text-muted)' }}>
              <span>{pct}% used</span>
              <span style={{ color: over ? 'var(--color-danger)' : 'var(--color-success)', fontWeight: 600 }}>
                {over ? `Over by ${formatINR(Math.abs(remaining))}` : `${formatINR(remaining)} left`}
              </span>
            </div>
          </div>
        );
      })}

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
      <div className="form-group">
        <label>Event Name</label>
        <input type="text" placeholder="e.g. Diwali 2025, Europe Trip" value={name} onChange={e => setName(e.target.value)} required />
      </div>
      <div className="form-group">
        <label>Pick Icon</label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {EVENT_ICONS.map(ic => (
            <button key={ic} type="button" onClick={() => setIcon(ic)}
              style={{ fontSize: 24, background: icon === ic ? 'var(--color-brand)' : 'var(--color-surface-2)', border: 'none', borderRadius: 10, padding: '4px 8px', cursor: 'pointer' }}>
              {ic}
            </button>
          ))}
        </div>
      </div>
      <div className="form-group">
        <label>Total Budget (₹)</label>
        <input type="number" inputMode="decimal" value={budget} onChange={e => setBudget(e.target.value)} min="1" required />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Start Date</label>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
        </div>
        <div className="form-group">
          <label>End Date</label>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
        </div>
      </div>
      <button type="submit" className="btn-primary">{submitLabel}</button>
    </form>
  );
}
