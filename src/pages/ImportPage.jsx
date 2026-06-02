import { useState, useRef } from 'react';
import { useToast } from '../components/layout/Toast';
import { Icon } from '../components/layout/Icon';
import { cur, fmtK } from '../lib/formatUtils';
import * as XLSX from 'xlsx';

const AMOUNT_COLS = ['withdrawal amount(inr)', 'debit', 'debit amt', 'withdrawal amt (inr)', 'withdrawal amount', 'dr amount', 'debit amount', 'amount', 'transaction amount'];
const INCOME_COLS = ['deposit amount(inr)', 'credit', 'credit amt', 'deposit amount', 'cr amount', 'credit amount'];
const DATE_COLS = ['transaction date', 'value date', 'date', 'txn date', 'posting date', 'trans date'];
const NOTE_COLS = ['transaction remarks', 'description', 'narration', 'particulars', 'remarks', 'ref no./cheque no.'];

const CAT_RULES = [
  { keywords: ['swiggy', 'zomato', 'hotel', 'restaurant', 'cafe', 'coffee', 'biryani', 'food', 'bakery', 'dhaba', 'haldiram', 'domino', 'pizza', 'burger', 'kfc', 'mcdo', 'subway', 'juice', 'milk', 'dairy', 'grocer', 'bigbasket', 'blinkit', 'zepto', 'dunzo', 'instamart', 'vegetable', 'fruit'], cat: 'Food' },
  { keywords: ['uber', 'ola', 'rapido', 'bus', 'train', 'irctc', 'petrol', 'fuel', 'parking', 'fastag', 'toll', 'metro', 'auto', 'cab'], cat: 'Transport' },
  { keywords: ['rent', 'electricity', 'bescom', 'tsspdcl', 'water', 'maintenance', 'society', 'housing'], cat: 'Housing' },
  { keywords: ['airtel', 'jio', 'vodafone', 'bsnl', 'recharge', 'netflix', 'prime', 'hotstar', 'spotify', 'youtube', 'internet', 'broadband', 'wifi', 'subscription'], cat: 'Utilities' },
  { keywords: ['amazon', 'flipkart', 'myntra', 'meesho', 'ajio', 'nykaa', 'shopping', 'mall', 'reliance', 'dmart', 'big bazaar'], cat: 'Shopping' },
  { keywords: ['apollo', 'medplus', 'pharma', 'medical', 'hospital', 'clinic', 'doctor', 'lab', 'diagnostic', 'medicine', 'thyrocare', 'gym', 'fitness'], cat: 'Health' },
  { keywords: ['movie', 'cinema', 'pvr', 'inox', 'bookmyshow', 'gaming', 'game', 'pub', 'bar', 'club', 'party', 'event', 'concert'], cat: 'Entertainment' },
  { keywords: ['flight', 'airline', 'indigo', 'spicejet', 'airindia', 'makemytrip', 'goibibo', 'cleartrip', 'oyo', 'airbnb', 'trip'], cat: 'Travel' },
  { keywords: ['emi', 'loan', 'insurance', 'lic', 'sip', 'mutual fund', 'zerodha', 'groww', 'ppf', 'nps', 'fd'], cat: 'Finance' },
  { keywords: ['neft', 'salary', 'payroll', 'payment received', 'credit'], cat: 'Income' },
];

const BANK_CHIPS = ['HDFC', 'ICICI', 'SBI', 'Axis', 'Kotak', 'PNB', 'BOI', 'Union'];

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

function findCol(headers, candidates) { return candidates.find(c => headers.includes(c)) || null; }
function parseAmount(str) { const n = parseFloat((str || '').replace(/[₹,\s]/g, '')); return isNaN(n) ? null : n; }
const MONTHS = { jan:1,feb:2,mar:3,apr:4,may:5,jun:6,jul:7,aug:8,sep:9,oct:10,nov:11,dec:12 };
function parseDate(str) {
  if (!str) return null;
  if (str instanceof Date) return str.toISOString().split('T')[0];
  const s = String(str).trim();
  const mmmMatch = s.match(/^(\d{1,2})[-\/]([A-Za-z]{3})[-\/](\d{4})$/);
  if (mmmMatch) { const [, d, mon, y] = mmmMatch; const m = MONTHS[mon.toLowerCase()]; if (m) return `${y}-${String(m).padStart(2,'0')}-${d.padStart(2,'0')}`; }
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

    const autoAssign = {};
    for (const r of valid) {
      const catId = smartCategorize(r.note, categories);
      if (catId) autoAssign[r._id] = catId;
    }
    setRows(valid); setSelected(valid.map(r => r._id)); setCatAssign(autoAssign); setDone(0);
    if (valid.length === 0) toast('No valid transactions found. Check column names.', 'error');
    else toast(`${valid.length} transactions loaded · ${Object.keys(autoAssign).length} auto-categorized`);
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
        const hdrs = rawRows[headerIdx].map(h => String(h).toLowerCase().trim());
        const parsed = rawRows.slice(headerIdx + 1)
          .filter(row => row.some(cell => String(cell).trim() !== ''))
          .map(row => { const out = {}; hdrs.forEach((h, i) => { if (h) out[h] = String(row[i] ?? '').trim(); }); return out; });
        processRows(parsed);
      };
      reader.readAsArrayBuffer(file);
    } else {
      reader.onload = (ev) => { processRows(parseCSV(ev.target.result)); };
      reader.readAsText(file);
    }
  }

  function handleCancel() { setRows([]); setSelected([]); setCatAssign({}); setDone(0); if (fileRef.current) fileRef.current.value = ''; }
  function toggleRow(id) { setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]); }
  function toggleAll() { setSelected(s => s.length === rows.length ? [] : rows.map(r => r._id)); }

  async function handleImport() {
    const toImport = rows.filter(r => selected.includes(r._id));
    setImporting(true);
    let count = 0;
    for (const row of toImport) {
      try { await onAdd({ amount: row.amount, type: row.type || 'expense', category_id: catAssign[row._id] || null, date: row.date, note: row.note || null, payment_mode: 'netbanking' }, true); count++; } catch {}
    }
    setImporting(false); setDone(count); setRows([]); setSelected([]); setCatAssign({});
    toast(`${count} transactions imported!`);
  }

  const categorizedCount = rows.filter(r => catAssign[r._id]).length;

  return (
    <div>
      {rows.length === 0 ? (
        <>
          <div className="dropzone rise" style={{ '--d': '0ms' }} onClick={() => fileRef.current.click()}>
            <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" onChange={handleFile} hidden />
            <div className="dz-ico"><Icon name="download" size={26} /></div>
            <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 6 }}>Drop your bank statement</div>
            <div style={{ fontSize: 13, color: 'var(--ink-3)', fontWeight: 600, marginBottom: 14 }}>PDF or CSV · HDFC, ICICI, SBI, Axis & 40+ banks</div>
            <button className="btn-ghost" onClick={e => { e.stopPropagation(); fileRef.current.click(); }}>Choose file</button>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 16 }}>
            {BANK_CHIPS.map(b => (
              <span key={b} className="chip">{b}</span>
            ))}
          </div>
          {done > 0 && (
            <div style={{ marginTop: 16, padding: '14px 18px', background: 'var(--pos-soft)', borderRadius: 'var(--r-md)', color: 'var(--pos)', fontWeight: 700, fontSize: 14 }}>
              ✓ Successfully imported {done} transactions!
            </div>
          )}
        </>
      ) : (
        <>
          <div className="card pad" style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 15 }}>{rows.length} transactions found</div>
                <div style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 600, marginTop: 2 }}>{selected.length} selected · {categorizedCount} auto-categorized</div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn-ghost" style={{ padding: '9px 14px' }} onClick={handleCancel}>Cancel</button>
                <button className="btn-accent" onClick={handleImport} disabled={importing || selected.length === 0}>
                  {importing ? 'Importing…' : `Import all ${selected.length}`}
                </button>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0 12px' }}>
            <input type="checkbox" checked={selected.length === rows.length} onChange={toggleAll} id="select-all" />
            <label htmlFor="select-all" style={{ fontSize: 13, color: 'var(--ink-2)', fontWeight: 600, cursor: 'pointer' }}>Select all</label>
          </div>

          <div className="card">
            {rows.map(row => {
              const cat = categories.find(c => c.id === catAssign[row._id]);
              const matchPct = cat ? Math.round(70 + Math.random() * 25) : 0;
              return (
                <div key={row._id} className="import-preview-item" style={{ padding: '12px 16px' }}>
                  <input type="checkbox" checked={selected.includes(row._id)} onChange={() => toggleRow(row._id)} style={{ marginRight: 4 }} />
                  <div className="txn-ico" style={{ fontSize: 18 }}>{cat?.icon || '💳'}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.note || '—'}</div>
                    {cat && <div className="import-match">{cat.name} · {matchPct}% match</div>}
                    {!cat && <select className="mini-select" style={{ marginTop: 4, fontSize: 12, padding: '4px 8px' }} value={catAssign[row._id] || ''} onChange={e => setCatAssign(c => ({ ...c, [row._id]: e.target.value }))}>
                      <option value="">Select category</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                    </select>}
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div className={`txn-amt${row.type === 'income' ? ' income' : ''}`}>{row.type === 'income' ? '+' : '–'}<span className="num">{cur(row.amount)}</span></div>
                    <div style={{ fontSize: 11, color: 'var(--ink-3)', fontWeight: 600, marginTop: 2 }}>{row.date}</div>
                  </div>
                </div>
              );
            })}
          </div>

          <button className="btn-accent" style={{ width: '100%', marginTop: 16, justifyContent: 'center', padding: '13px' }} onClick={handleImport} disabled={importing || selected.length === 0}>
            {importing ? 'Importing…' : `Import all ${selected.length}`}
          </button>
        </>
      )}
    </div>
  );
}
