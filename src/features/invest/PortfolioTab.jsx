import { useMemo, useState } from 'react';
import { useInvestments, useInvestmentMutations } from '../../lib/queries';
import { useToast } from '../../components/layout/Toast';
import { Modal } from '../../components/layout/Modal';
import { Icon } from '../../components/layout/Icon';
import { Donut } from '../../components/charts/Donut';
import { cur, fmtK } from '../../lib/formatUtils';
import { todayStr } from '../../lib/dateUtils';
import { TYPE_GLOSSARY } from '../../content/journey/glossary';
import { TYPE_META, GROUPS, groupOf, currentValue } from './investMeta';

function AddInvestmentModal({ initial, onClose }) {
  const { add, update } = useInvestmentMutations();
  const toast = useToast();
  const editing = !!initial;
  const [name, setName] = useState(initial?.name || '');
  const [type, setType] = useState(initial?.type || 'sip');
  const [invested, setInvested] = useState(initial?.invested_amount || '');
  const [value, setValue] = useState(initial?.current_value || '');
  const [monthly, setMonthly] = useState(initial?.monthly_amount || '');
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

export function PortfolioTab({ snapshot }) {
  const { data: investments = [] } = useInvestments();
  const { remove } = useInvestmentMutations();
  const toast = useToast();
  const [modal, setModal] = useState(null); // 'new' | investment row

  const totals = useMemo(() => {
    const invested = investments.reduce((a, i) => a + Number(i.invested_amount || 0), 0);
    const value = investments.reduce((a, i) => a + currentValue(i), 0);
    return { invested, value, pl: value - invested, plPct: invested > 0 ? ((value - invested) / invested) * 100 : 0 };
  }, [investments]);

  const segments = useMemo(() => {
    const byGroup = {};
    for (const inv of investments) {
      const g = groupOf(inv.type);
      byGroup[g] = (byGroup[g] || 0) + currentValue(inv);
    }
    return GROUPS.filter(g => byGroup[g.id] > 0).map(g => ({ label: g.label, color: g.color, value: byGroup[g.id] }));
  }, [investments]);

  const byType = useMemo(() => {
    const map = {};
    for (const inv of investments) {
      (map[inv.type] ||= []).push(inv);
    }
    return Object.entries(map).sort(([a], [b]) => Object.keys(TYPE_META).indexOf(a) - Object.keys(TYPE_META).indexOf(b));
  }, [investments]);

  async function handleDelete(inv) {
    if (!confirm(`Remove ${inv.name} from your portfolio?`)) return;
    try { await remove.mutateAsync(inv.id); toast('Removed'); }
    catch (err) { toast(err.message, 'error'); }
  }

  if (investments.length === 0) {
    return (
      <div className="card pad" style={{ textAlign: 'center', padding: '44px 24px' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🌱</div>
        <div style={{ fontWeight: 800, fontSize: 16 }}>Nothing logged yet</div>
        <div style={{ fontSize: 13.5, color: 'var(--ink-3)', fontWeight: 600, margin: '6px auto 18px', maxWidth: 400, lineHeight: 1.55 }}>
          When your first SIP goes through in your broker app, log it here — the journey
          completes Level 5 the moment it lands.
        </div>
        <button className="btn-accent" onClick={() => setModal('new')}>
          <Icon name="plus" size={16} />Log your first investment
        </button>
        {modal === 'new' && <AddInvestmentModal onClose={() => setModal(null)} />}
      </div>
    );
  }

  return (
    <div>
      <div className="invest-hero rise">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
          <div>
            <div className="hero-label">Portfolio value</div>
            <div className="invest-hero-amt">{fmtK(Math.round(totals.value))}</div>
          </div>
          <button className="hero-pill" style={{ cursor: 'pointer' }} onClick={() => setModal('new')}>
            <Icon name="plus" size={14} />Log
          </button>
        </div>
        <div className="invest-splits">
          <div className="invest-split">
            <div className="is-label">Invested</div>
            <div className="is-val">{fmtK(Math.round(totals.invested))}</div>
          </div>
          <div className="invest-split">
            <div className="is-label">Returns</div>
            <div className="is-val" style={{ color: totals.pl >= 0 ? '#6ff0c4' : '#ffb4a6' }}>
              {totals.pl >= 0 ? '+' : ''}{fmtK(Math.round(totals.pl))} ({totals.plPct.toFixed(1)}%)
            </div>
          </div>
          {snapshot.sipMonthly > 0 && (
            <div className="invest-split">
              <div className="is-label">SIPs / month</div>
              <div className="is-val">{fmtK(snapshot.sipMonthly)}</div>
            </div>
          )}
        </div>
      </div>

      {segments.length > 0 && (
        <div className="card pad rise" style={{ marginTop: 18, display: 'flex', gap: 22, alignItems: 'center', flexWrap: 'wrap' }}>
          <Donut segments={segments} />
          <div style={{ flex: 1, minWidth: 200 }}>
            <div className="eyebrow" style={{ marginBottom: 10 }}>Allocation</div>
            {segments.map(s => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '5px 0' }}>
                <span style={{ width: 10, height: 10, borderRadius: 3, background: s.color, flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: 13.5, fontWeight: 700 }}>{s.label}</span>
                <span className="num" style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-2)' }}>
                  {cur(Math.round(s.value))} · {Math.round((s.value / totals.value) * 100)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {byType.map(([type, list]) => (
        <div key={type} className="inv-type-group" style={{ marginTop: 14 }}>
          <div className="inv-type-head">
            <div className="inv-type-label">{TYPE_META[type]?.label ?? type}</div>
            <div className="num" style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-3)' }}>
              {cur(Math.round(list.reduce((a, i) => a + currentValue(i), 0)))}
            </div>
          </div>
          <div className="card" style={{ padding: '4px 18px' }}>
            {list.map(inv => {
              const pl = currentValue(inv) - Number(inv.invested_amount || 0);
              return (
                <div key={inv.id} className="inv-row">
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="inv-name">{inv.name}</div>
                    <div className="inv-sub">
                      {inv.monthly_amount ? `${cur(inv.monthly_amount)}/mo · ` : ''}invested {cur(Math.round(inv.invested_amount))}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="num" style={{ fontSize: 14.5, fontWeight: 700 }}>{cur(Math.round(currentValue(inv)))}</div>
                    <div className={`inv-pl ${pl >= 0 ? 'pos' : 'neg'}`}>{pl >= 0 ? '+' : ''}{cur(Math.round(pl))}</div>
                  </div>
                  <button className="icon-btn" style={{ width: 30, height: 30 }} aria-label="Edit" onClick={() => setModal(inv)}>
                    <Icon name="edit" size={13} />
                  </button>
                  <button className="icon-btn" style={{ width: 30, height: 30 }} aria-label="Delete" onClick={() => handleDelete(inv)}>×</button>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <div className="lp-disclaimer" style={{ marginTop: 18 }}>
        Values update only when you edit them — PaisaCoach doesn't fetch live prices, execute
        trades, or recommend specific funds. Education, not SEBI-registered advice.
      </div>

      {modal && (
        <AddInvestmentModal initial={modal === 'new' ? null : modal} onClose={() => setModal(null)} />
      )}
    </div>
  );
}
