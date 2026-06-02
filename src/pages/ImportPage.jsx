import { useState, useRef } from 'react';
import { useToast } from '../components/layout/Toast';
import { formatINR } from '../lib/dateUtils';
import { callAiCategorize } from '../lib/claudeApi';

const AMOUNT_COLS = ['debit amt', 'withdrawal amt (inr)', 'withdrawal amount', 'debit', 'amount', 'dr amount', 'debit amount'];
const DATE_COLS = ['date', 'txn date', 'transaction date', 'value date', 'posting date'];
const NOTE_COLS = ['narration', 'description', 'particulars', 'remarks', 'transaction remarks'];

function parseCSV(text) {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim().toLowerCase());
  return lines.slice(1).map(line => {
    const vals = line.split(',').map(v => v.replace(/"/g, '').trim());
    const obj = {};
    headers.forEach((h, i) => { obj[h] = vals[i] || ''; });
    return obj;
  });
}

function findCol(headers, candidates) {
  return candidates.find(c => headers.includes(c)) || null;
}

function parseAmount(str) {
  const clean = (str || '').replace(/[₹,\s]/g, '');
  const n = parseFloat(clean);
  return isNaN(n) ? null : n;
}

function parseDate(str) {
  if (!str) return null;
  const parts = str.split(/[\/\-]/);
  if (parts.length === 3) {
    if (parts[0].length === 4) return `${parts[0]}-${parts[1].padStart(2,'0')}-${parts[2].padStart(2,'0')}`;
    return `${parts[2]}-${parts[1].padStart(2,'0')}-${parts[0].padStart(2,'0')}`;
  }
  return null;
}

export function ImportPage({ categories, onAdd }) {
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState([]);
  const [catAssign, setCatAssign] = useState({});
  const [importing, setImporting] = useState(false);
  const [categorizing, setCategorizing] = useState(false);
  const [done, setDone] = useState(0);
  const toast = useToast();
  const fileRef = useRef();

  function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const parsed = parseCSV(ev.target.result);
      const headers = parsed.length ? Object.keys(parsed[0]) : [];
      const amtCol = findCol(headers, AMOUNT_COLS);
      const dateCol = findCol(headers, DATE_COLS);
      const noteCol = findCol(headers, NOTE_COLS);
      const valid = parsed.filter(row => {
        const amt = amtCol ? parseAmount(row[amtCol]) : null;
        return amt && amt > 0;
      }).map((row, i) => ({
        _id: i,
        amount: parseAmount(row[amtCol]),
        date: dateCol ? parseDate(row[dateCol]) : null,
        note: noteCol ? row[noteCol]?.slice(0, 100) : '',
        raw: row,
      })).filter(r => r.amount && r.date);
      setRows(valid);
      setSelected(valid.map(r => r._id));
      setDone(0);
    };
    reader.readAsText(file);
  }

  async function handleImport() {
    const toImport = rows.filter(r => selected.includes(r._id));
    setImporting(true);
    let count = 0;
    for (const row of toImport) {
      try {
        await onAdd({ amount: row.amount, category_id: catAssign[row._id] || null, date: row.date, note: row.note || null, payment_mode: 'netbanking' });
        count++;
      } catch {}
    }
    setImporting(false);
    setDone(count);
    setRows([]);
    setSelected([]);
    toast(`${count} expenses imported!`);
  }

  async function handleAutoCategorize() {
    if (!rows.length || !categories.length) return;
    setCategorizing(true);
    try {
      const transactions = rows.map(r => ({ id: r._id, description: r.note || r.date }));
      const results = await callAiCategorize(transactions, categories.map(c => ({ id: c.id, name: c.name })));
      const newAssign = { ...catAssign };
      for (const r of results) newAssign[r.id] = r.category_id;
      setCatAssign(newAssign);
      toast(`Auto-categorized ${results.length} transactions`);
    } catch (err) {
      toast('Auto-categorize failed: ' + err.message, 'error');
    } finally {
      setCategorizing(false);
    }
  }

  function toggleRow(id) {
    setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  }

  return (
    <div className="page">
      <div className="page-header">
        <h2>Import from Bank CSV</h2>
        <p className="page-sub">Download your bank statement as CSV and upload here</p>
      </div>

      <div className="section-card">
        <h4>How to get your bank CSV</h4>
        <ul className="import-steps">
          <li>Open your bank’s mobile app or website</li>
          <li>Go to Account Statement / Transaction History</li>
          <li>Select date range and download as CSV/Excel</li>
          <li>Upload the file below</li>
        </ul>
        <p className="import-note">Works with HDFC, SBI, ICICI, Axis, Kotak and most Indian banks.</p>
      </div>

      <div className="import-upload" onClick={() => fileRef.current.click()}>
        <input ref={fileRef} type="file" accept=".csv" onChange={handleFile} hidden />
        <div className="empty-icon">📂</div>
        <p>Click to upload CSV file</p>
        <p className="empty-sub">or drag and drop</p>
      </div>

      {rows.length > 0 && (
        <>
          <div className="import-header">
            <p>{rows.length} transactions found · {selected.length} selected</p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn-secondary btn-sm" onClick={handleAutoCategorize} disabled={categorizing}>
                {categorizing ? '✨ Categorizing...' : '✨ Auto-Categorize'}
              </button>
              <button className="btn-primary" onClick={handleImport} disabled={importing || selected.length === 0}>
                {importing ? 'Importing...' : `Import ${selected.length}`}
              </button>
            </div>
          </div>
          <div className="import-table">
            {rows.map(row => (
              <div key={row._id} className={`import-row ${selected.includes(row._id) ? 'selected' : 'deselected'}`}>
                <input type="checkbox" checked={selected.includes(row._id)} onChange={() => toggleRow(row._id)} />
                <div className="import-row-info">
                  <span className="import-note-text">{row.note || '—'}</span>
                  <span className="import-date">{row.date}</span>
                </div>
                <span className="import-amount">{formatINR(row.amount)}</span>
                <select className="import-cat-select" value={catAssign[row._id] || ''}
                  onChange={e => setCatAssign(c => ({ ...c, [row._id]: e.target.value }))}>
                  <option value="">Select category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                </select>
              </div>
            ))}
          </div>
        </>
      )}

      {done > 0 && rows.length === 0 && (
        <div className="import-success">✅ Successfully imported {done} expenses!</div>
      )}
    </div>
  );
}
