import { useState, useRef } from 'react';
import { useToast } from '../components/layout/Toast';
import { formatINR } from '../lib/dateUtils';
import * as XLSX from 'xlsx';

const AMOUNT_COLS = ['withdrawal amount(inr)', 'debit', 'debit amt', 'withdrawal amt (inr)', 'withdrawal amount', 'dr amount', 'debit amount', 'amount', 'transaction amount'];
const INCOME_COLS = ['deposit amount(inr)', 'credit', 'credit amt', 'deposit amount', 'cr amount', 'credit amount'];
const DATE_COLS = ['transaction date', 'value date', 'date', 'txn date', 'posting date', 'trans date'];
const NOTE_COLS = ['transaction remarks', 'description', 'narration', 'particulars', 'remarks', 'ref no./cheque no.'];

// Rule-based categorization — keyword → category name
const CAT_RULES = [
  { keywords: ['swiggy', 'zomato', 'hotel', 'restaurant', 'cafe', 'coffee', 'biryani', 'food', 'bakery', 'dhaba', 'haldiram', 'domino', 'pizza', 'burger', 'kfc', 'mcdo', 'subway', 'juice', 'tea', 'tiffin', 'mess', 'canteen', 'grocer', 'bigbasket', 'blinkit', 'zepto', 'dunzo', 'instamart', 'milk', 'dairy', 'vegetable', 'fruit'], cat: 'Food' },
  { keywords: ['uber', 'ola', 'rapido', 'tsrtc', 'apsrtc', 'bus', 'train', 'irctc', 'petrol', 'fuel', 'parking', 'fastag', 'toll', 'metro', 'auto', 'cab', 'namma', 'bmtc', 'redbus'], cat: 'Transport' },
  { keywords: ['rent', 'electricity', 'bescom', 'tsspdcl', 'apspdcl', 'msedcl', 'water', 'maintenance', 'society', 'housing', 'owner', 'landlord'], cat: 'Housing' },
  { keywords: ['airtel', 'jio', 'vodafone', 'vi ', 'bsnl', 'recharge', 'netflix', 'prime', 'hotstar', 'spotify', 'youtube', 'zee5', 'sonyliv', 'internet', 'broadband', 'wifi', 'subscription'], cat: 'Utilities' },
  { keywords: ['amazon', 'flipkart', 'myntra', 'meesho', 'ajio', 'nykaa', 'shopping', 'mall', 'reliance', 'dmart', 'big bazaar', 'more super', 'lifestyle', 'westside', 'trends'], cat: 'Shopping' },
  { keywords: ['apollo', 'medplus', 'pharma', 'medical', 'hospital', 'clinic', 'doctor', 'lab', 'diagnostic', 'health', 'medicine', 'thyrocare', 'lal path', 'gym', 'fitness', 'cult.fit'], cat: 'Health' },
  { keywords: ['salon', 'haircut', 'spa', 'grooming', 'beauty', 'lakme', 'wella', 'loreal', 'cosmetic', 'personal care'], cat: 'Personal Care' },
  { keywords: ['school', 'college', 'university', 'tuition', 'coaching', 'course', 'udemy', 'coursera', 'byju', 'unacademy', 'fee', 'stationery', 'book', 'pen'], cat: 'Education' },
  { keywords: ['movie', 'cinema', 'pvr', 'inox', 'bookmyshow', 'gaming', 'game', 'pub', 'bar', 'club', 'party', 'event', 'concert', 'theatre'], cat: 'Entertainment' },
  { keywords: ['flight', 'airline', 'indigo', 'spicejet', 'airindia', 'goair', 'vistara', 'makemytrip', 'goibibo', 'cleartrip', 'yatra', 'hotel booking', 'oyo', 'airbnb', 'trip', 'tour'], cat: 'Travel' },
  { keywords: ['emi', 'loan', 'insurance', 'lic', 'sip', 'mutual fund', 'zerodha', 'groww', 'coin', 'ppf', 'nps', 'fd', 'fixed deposit', 'rd', 'recurring deposit', 'hdfc life', 'icici pru', 'max life'], cat: 'Finance' },
  { keywords: ['neft', 'salary', 'payroll', 'mtx', 'consulting', 'payment received', 'credit'], cat: 'Income' },
];

function smartCategorize(note, categories) {
  if (!note) return null;
  const n = note.toLowerCase();
  for (const rule of CAT_RULES) {
    if (rule.keywords.some(k => n.includes(k))) {
      const cat = categories.find(c => c.name.toLowerCase() === rule.cat.toLowerCase());
      if (cat) return cat.id;
    }
  }
  return null;
}

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
  if (str instanceof Date) return str.toISOString().split('T')[0];
  const s = String(str).trim();
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

function cleanNote(str) {
  if (!str) return '';
  const upiMatch = str.match(/^UPI\/([^\/]+)/i);
  if (upiMatch) return upiMatch[1].replace(/_/g, ' ').trim();
  return str.slice(0, 80);
}

export function ImportPage({ categories, onAdd }) {
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState([]);
  const [catAssign, setCatAssign] = useState({});
  const [importing, setImporting] = useState(false);
  const [done, setDone] = useState(0);
  const toast = useToast();
  const fileRef = useRef();

  function processRows(parsed) {
    const headers = parsed.length ? Object.keys(parsed[0]) : [];
    const amtCol = findCol(headers, AMOUNT_COLS);
    const incomeCol = findCol(headers, INCOME_COLS);
    const dateCol = findCol(headers, DATE_COLS);
    const noteCol = findCol(headers, NOTE_COLS);
    const valid = parsed.map((row, i) => {
      const withdrawal = amtCol ? parseAmount(row[amtCol]) : null;
      const deposit = incomeCol ? parseAmount(row[incomeCol]) : null;
      const isIncome = (!withdrawal || withdrawal === 0) && deposit && deposit > 0;
      const amount = isIncome ? deposit : withdrawal;
      if (!amount || amount <= 0) return null;
      const note = noteCol ? cleanNote(row[noteCol]) : '';
      return { _id: i, amount, type: isIncome ? 'income' : 'expense', date: dateCol ? parseDate(row[dateCol]) : null, note, raw: row };
    }).filter(r => r && r.amount && r.date);

    // Auto-categorize using rules
    const autoAssign = {};
    for (const r of valid) {
      const catId = smartCategorize(r.note, categories);
      if (catId) autoAssign[r._id] = catId;
    }

    setRows(valid);
    setSelected(valid.map(r => r._id));
    setCatAssign(autoAssign);
    setDone(0);

    if (valid.length === 0) {
      const sampleKeys = parsed.length ? Object.keys(parsed[0]).join(', ') : 'none';
      toast(`No valid transactions found. Columns: ${sampleKeys}. Amount col: ${amtCol}, Date col: ${dateCol}`, 'error');
    } else {
      const autoCatCount = Object.keys(autoAssign).length;
      toast(`${valid.length} transactions loaded · ${autoCatCount} auto-categorized`);
    }
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
        const rawRows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
        const mustHaveOne = ['withdrawal', 'debit', 'credit', 'amount(inr)', 'dr amount', 'debit amt'];
        const mustHaveDate = ['value date', 'transaction date', 'txn date', 'posting date'];
        let headerIdx = 0;
        for (let i = 0; i < Math.min(rawRows.length, 25); i++) {
          const rowStr = rawRows[i].join(' ').toLowerCase();
          if (mustHaveOne.some(k => rowStr.includes(k)) && mustHaveDate.some(k => rowStr.includes(k))) { headerIdx = i; break; }
        }
        const headers = rawRows[headerIdx].map(h => String(h).toLowerCase().trim());
        const parsed = rawRows.slice(headerIdx + 1)
          .filter(row => row.some(cell => String(cell).trim() !== ''))
          .map(row => { const out = {}; headers.forEach((h, i) => { if (h) out[h] = String(row[i] ?? '').trim(); }); return out; });
        processRows(parsed);
      };
      reader.readAsArrayBuffer(file);
    } else {
      reader.onload = (ev) => { processRows(parseCSV(ev.target.result)); };
      reader.readAsText(file);
    }
  }

  function handleCancel() {
    setRows([]);
    setSelected([]);
    setCatAssign({});
    setDone(0);
    if (fileRef.current) fileRef.current.value = '';
  }

  async function handleImport() {
    const toImport = rows.filter(r => selected.includes(r._id));
    setImporting(true);
    let count = 0;
    for (const row of toImport) {
      try {
        await onAdd({ amount: row.amount, type: row.type || 'expense', category_id: catAssign[row._id] || null, date: row.date, note: row.note || null, payment_mode: 'netbanking' });
        count++;
      } catch {}
    }
    setImporting(false);
    setDone(count);
    setRows([]);
    setSelected([]);
    setCatAssign({});
    toast(`${count} transactions imported!`);
  }

  function toggleRow(id) {
    setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  }

  function toggleAll() {
    setSelected(s => s.length === rows.length ? [] : rows.map(r => r._id));
  }

  const categorizedCount = rows.filter(r => catAssign[r._id]).length;

  return (
    <div className="page">
      <div className="page-header">
        <h2>Import Transactions</h2>
        <p className="page-sub">Upload your bank statement (CSV or Excel)</p>
      </div>

      {rows.length === 0 ? (
        <>
          <div className="section-card">
            <h4>How to download your statement</h4>
            <ul className="import-steps">
              <li>Open your bank app or website</li>
              <li>Go to Account Statement / Transaction History</li>
              <li>Select date range → Download as Excel or CSV</li>
              <li>Upload the file below</li>
            </ul>
            <p className="import-note">Works with ICICI, HDFC, SBI, Axis, Kotak and most Indian banks.</p>
          </div>
          <div className="import-upload" onClick={() => fileRef.current.click()}>
            <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" onChange={handleFile} hidden />
            <div className="empty-icon">📂</div>
            <p>Tap to upload CSV or Excel file</p>
            <p className="empty-sub">.csv · .xlsx · .xls</p>
          </div>
        </>
      ) : (
        <>
          <div className="import-header">
            <div>
              <p style={{ fontWeight: 600, fontSize: 14 }}>{rows.length} transactions · {selected.length} selected</p>
              <p style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{categorizedCount} auto-categorized · {rows.length - categorizedCount} need category</p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn-secondary btn-sm" onClick={handleCancel}>✕ Cancel</button>
              <button className="btn-primary btn-sm" onClick={handleImport} disabled={importing || selected.length === 0}>
                {importing ? 'Importing...' : `Import ${selected.length}`}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0 8px' }}>
            <input type="checkbox" checked={selected.length === rows.length} onChange={toggleAll} id="select-all" />
            <label htmlFor="select-all" style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Select all</label>
          </div>

          <div className="import-table">
            {rows.map(row => (
              <div key={row._id} className={`import-row ${selected.includes(row._id) ? 'selected' : 'deselected'}`}>
                <input type="checkbox" checked={selected.includes(row._id)} onChange={() => toggleRow(row._id)} />
                <div className="import-row-info">
                  <span className="import-note-text">{row.note || '—'}</span>
                  <span className="import-date">{row.date}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, minWidth: 90 }}>
                  <span className="import-amount" style={{ color: row.type === 'income' ? 'var(--color-success)' : undefined }}>
                    {row.type === 'income' ? '+' : ''}{formatINR(row.amount)}
                  </span>
                  <select className="import-cat-select" value={catAssign[row._id] || ''}
                    onChange={e => setCatAssign(c => ({ ...c, [row._id]: e.target.value }))}>
                    <option value="">Category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                  </select>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <button className="btn-secondary" style={{ flex: 1 }} onClick={handleCancel}>✕ Cancel</button>
            <button className="btn-primary" style={{ flex: 2 }} onClick={handleImport} disabled={importing || selected.length === 0}>
              {importing ? 'Importing...' : `Import ${selected.length} Transactions`}
            </button>
          </div>
        </>
      )}

      {done > 0 && rows.length === 0 && (
        <div className="import-success">✅ Successfully imported {done} transactions!</div>
      )}
    </div>
  );
}
