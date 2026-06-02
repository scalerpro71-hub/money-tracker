import { useState, useRef } from 'react';
import { useToast } from '../components/layout/Toast';
import { formatINR } from '../lib/dateUtils';
import { callAiCategorize } from '../lib/claudeApi';
import * as XLSX from 'xlsx';

const AMOUNT_COLS = ['withdrawal amount(inr)', 'debit', 'debit amt', 'withdrawal amt (inr)', 'withdrawal amount', 'dr amount', 'debit amount', 'amount', 'transaction amount'];
const DATE_COLS = ['transaction date', 'value date', 'date', 'txn date', 'posting date', 'trans date'];
const NOTE_COLS = ['transaction remarks', 'description', 'narration', 'particulars', 'remarks', 'ref no./cheque no.'];

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

const MONTHS = { jan:1,feb:2,mar:3,apr:4,may:5,jun:6,jul:7,aug:8,sep:9,oct:10,nov:11,dec:12 };
function parseDate(str) {
  if (!str) return null;
  // Already a JS Date object (from xlsx cellDates)
  if (str instanceof Date) {
    return str.toISOString().split('T')[0];
  }
  const s = String(str).trim();
  // DD-MMM-YYYY or DD/MMM/YYYY e.g. 15-May-2025
  const mmmMatch = s.match(/^(\d{1,2})[-\/]([A-Za-z]{3})[-\/](\d{4})$/);
  if (mmmMatch) {
    const [, d, mon, y] = mmmMatch;
    const m = MONTHS[mon.toLowerCase()];
    if (m) return `${y}-${String(m).padStart(2,'0')}-${d.padStart(2,'0')}`;
  }
  const parts = s.split(/[\/\-]/);
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

  function cleanNote(str) {
    if (!str) return '';
    // ICICI UPI format: UPI/MERCHANT NAME/upiid/bank/ref → extract merchant name
    const upiMatch = str.match(/^UPI\/([^\/]+)/i);
    if (upiMatch) return upiMatch[1].replace(/_/g, ' ').trim();
    return str.slice(0, 80);
  }

  function processRows(parsed) {
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
      note: noteCol ? cleanNote(row[noteCol]) : '',
      raw: row,
    })).filter(r => r.amount && r.date);
    setRows(valid);
    setSelected(valid.map(r => r._id));
    setDone(0);
    if (valid.length === 0) toast('No valid transactions found. Check your file format.', 'error');
  }

  function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    const isExcel = /\.(xlsx|xls)$/i.test(file.name);

    const reader = new FileReader();
    if (isExcel) {
      reader.onload = (ev) => {
        const wb = XLSX.read(ev.target.result, { type: 'array', cellDates: true });
        const ws = wb.Sheets[wb.SheetNames[0]];
        // Use sheet_to_json with header:1 to get raw rows, then find the actual header row
        const rawRows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
        // Find the row index that looks like a header (contains date/debit/amount keywords)
        const headerKeywords = ['date', 'debit', 'credit', 'amount', 'description', 'narration', 'particulars', 'transaction', 'withdrawal', 'remarks'];
        let headerIdx = 0;
        for (let i = 0; i < Math.min(rawRows.length, 20); i++) {
          const rowStr = rawRows[i].join(' ').toLowerCase();
          const matches = headerKeywords.filter(k => rowStr.includes(k)).length;
          if (matches >= 2) { headerIdx = i; break; }
        }
        const headers = rawRows[headerIdx].map(h => String(h).toLowerCase().trim());
        const parsed = rawRows.slice(headerIdx + 1)
          .filter(row => row.some(cell => cell !== ''))
          .map(row => {
            const out = {};
            headers.forEach((h, i) => { out[h] = String(row[i] ?? '').trim(); });
            return out;
          });
        processRows(parsed);
      };
      reader.readAsArrayBuffer(file);
    } else {
      reader.onload = (ev) => {
        processRows(parseCSV(ev.target.result));
      };
      reader.readAsText(file);
    }
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
        <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" onChange={handleFile} hidden />
        <div className="empty-icon">📂</div>
        <p>Click to upload CSV or Excel file</p>
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
