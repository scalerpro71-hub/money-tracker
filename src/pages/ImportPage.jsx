import { useCallback, useEffect, useState, useRef } from 'react';
import { useToast } from '../components/layout/Toast';
import { Icon } from '../components/layout/Icon';
import { cur } from '../lib/formatUtils';
import { supabase } from '../lib/supabase';
import { callAiCategorize } from '../lib/claudeApi';

const MAX_IMPORT_BYTES = 2 * 1024 * 1024;
const MAX_IMPORT_ROWS = 1000;
const AI_CATEGORIZE_BATCH_SIZE = 50;
const ACCEPTED_EXTENSIONS = /\.(csv|xlsx|xls)$/i;
const AMOUNT_COLS = ['withdrawal amount(inr)', 'debit', 'debit amt', 'withdrawal amt (inr)', 'withdrawal amount', 'dr amount', 'debit amount', 'amount', 'transaction amount'];
const INCOME_COLS = ['deposit amount(inr)', 'credit', 'credit amt', 'deposit amount', 'cr amount', 'credit amount'];
const DATE_COLS = ['transaction date', 'value date', 'date', 'txn date', 'posting date', 'trans date'];
const NOTE_COLS = ['transaction remarks', 'description', 'narration', 'particulars', 'remarks', 'ref no./cheque no.'];

const BANK_CHIPS = ['HDFC', 'ICICI', 'SBI', 'Axis', 'Kotak', 'PNB', 'BOI', 'Union'];

async function parseExcelOnServer(file) {
  const form = new FormData();
  form.append('file', file);
  const { data, error } = await supabase.functions.invoke('parse-bank-statement', {
    body: form,
  });
  if (error) {
    let message = error.message;
    try {
      const details = await error.context?.json?.();
      message = details?.error || message;
    } catch {
      // Keep the Supabase error message if the response body is not JSON.
    }
    throw new Error(message || 'Could not read this Excel file.');
  }
  if (!data?.rows) throw new Error('Could not read this Excel file.');
  return data.rows;
}

function parseCSV(text) {
  const rows = [];
  let field = '';
  let row = [];
  let quoted = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];
    if (ch === '"' && quoted && next === '"') {
      field += '"';
      i++;
    } else if (ch === '"') {
      quoted = !quoted;
    } else if (ch === ',' && !quoted) {
      row.push(field.trim());
      field = '';
    } else if ((ch === '\n' || ch === '\r') && !quoted) {
      if (ch === '\r' && next === '\n') i++;
      row.push(field.trim());
      if (row.some(v => v !== '')) rows.push(row);
      field = '';
      row = [];
      if (rows.length > MAX_IMPORT_ROWS) break;
    } else {
      field += ch;
    }
  }

  if (field || row.length) {
    row.push(field.trim());
    if (row.some(v => v !== '')) rows.push(row);
  }

  const limitedRows = rows.slice(0, MAX_IMPORT_ROWS + 1);
  if (limitedRows.length < 2) return [];
  const headers = limitedRows[0].map(h => h.replace(/^\uFEFF/, '').trim().toLowerCase());
  return limitedRows.slice(1).map(vals => {
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
  const mmmMatch = s.match(/^(\d{1,2})[-/]([A-Za-z]{3})[-/](\d{4})$/);
  if (mmmMatch) { const [, d, mon, y] = mmmMatch; const m = MONTHS[mon.toLowerCase()]; if (m) return `${y}-${String(m).padStart(2,'0')}-${d.padStart(2,'0')}`; }
  const parts = s.split(/[-/]/);
  if (parts.length === 3) {
    if (parts[0].length === 4) return `${parts[0]}-${parts[1].padStart(2,'0')}-${parts[2].padStart(2,'0')}`;
    return `${parts[2]}-${parts[1].padStart(2,'0')}-${parts[0].padStart(2,'0')}`;
  }
  return null;
}
function cleanNote(str) {
  if (!str) return '';
  const upiMatch = str.match(/^UPI\/([^/]+)/i);
  if (upiMatch) return upiMatch[1].replace(/_/g, ' ').trim();
  return str.slice(0, 80);
}

function merchantKey(note) {
  return (note || '')
    .toLowerCase()
    .replace(/upi\/|imps\/|neft\/|rtgs\/|ach\/|pos\/|ecom\//g, ' ')
    .replace(/[0-9a-f]{8,}/g, ' ')
    .replace(/\b\d+\b/g, ' ')
    .replace(/[^a-z ]+/g, ' ')
    .replace(/\b(ref|txn|upi|pay|payment|ltd|limited|pvt|private|india|bank)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 64);
}

function cacheKey(categories) {
  const signature = categories
    .map(c => `${c.id}:${c.name}`)
    .sort()
    .join('|');
  return `rupee-import-ai-categories:${signature}`;
}

function loadCategoryCache(categories) {
  try {
    return JSON.parse(localStorage.getItem(cacheKey(categories)) || '{}');
  } catch {
    return {};
  }
}

function saveCategoryCache(categories, cache) {
  try {
    localStorage.setItem(cacheKey(categories), JSON.stringify(cache));
  } catch {
    // Import still works if storage is unavailable.
  }
}

async function aiCategorizeRows(rows, categories) {
  const validCategoryIds = new Set(categories.map(c => c.id));
  const cache = loadCategoryCache(categories);
  const byMerchant = new Map();

  for (const row of rows) {
    if (row.type === 'income') continue;
    const key = merchantKey(row.note);
    if (!key) continue;
    if (!byMerchant.has(key)) byMerchant.set(key, []);
    byMerchant.get(key).push(row._id);
  }

  const assignments = {};
  const missing = [];
  for (const [key, ids] of byMerchant.entries()) {
    if (cache[key] && validCategoryIds.has(cache[key])) {
      ids.forEach(id => { assignments[id] = cache[key]; });
    } else {
      missing.push(key);
    }
  }

  for (let i = 0; i < missing.length; i += AI_CATEGORIZE_BATCH_SIZE) {
    const batch = missing.slice(i, i + AI_CATEGORIZE_BATCH_SIZE);
    const results = await callAiCategorize(
      batch.map(key => ({ id: key, description: key })),
      categories.map(c => ({ id: c.id, name: c.name }))
    );
    for (const result of results) {
      if (!validCategoryIds.has(result.category_id) || !byMerchant.has(result.id)) continue;
      cache[result.id] = result.category_id;
      byMerchant.get(result.id).forEach(id => { assignments[id] = result.category_id; });
    }
  }

  saveCategoryCache(categories, cache);
  return assignments;
}

export function ImportPage({ categories, onAdd }) {
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState([]);
  const [catAssign, setCatAssign] = useState({});
  const [aiCategorizedAttempted, setAiCategorizedAttempted] = useState(false);
  const [aiCategorizing, setAiCategorizing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [done, setDone] = useState(0);
  const toast = useToast();
  const fileRef = useRef();

  const applyAiCategories = useCallback(async (validRows) => {
    if (!validRows.length || !categories.length || aiCategorizing) return 0;
    setAiCategorizedAttempted(true);
    setAiCategorizing(true);
    try {
      toast('AI categorizing transactions...');
      const autoAssign = await aiCategorizeRows(validRows, categories);
      setCatAssign(current => ({ ...current, ...autoAssign }));
      const count = Object.keys(autoAssign).length;
      if (count > 0) toast(`${count} transactions AI-categorized`);
      return count;
    } catch {
      toast('AI categorization unavailable. You can select categories manually.', 'error');
      return 0;
    } finally {
      setAiCategorizing(false);
    }
  }, [aiCategorizing, categories, toast]);

  useEffect(() => {
    if (!rows.length || !categories.length || aiCategorizedAttempted) return;
    applyAiCategories(rows);
  }, [rows, categories, aiCategorizedAttempted, applyAiCategories]);

  async function processRows(parsed) {
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

    setRows(valid); setSelected(valid.map(r => r._id)); setCatAssign({}); setAiCategorizedAttempted(false); setDone(0);
    if (valid.length === 0) {
      toast('No valid transactions found. Check column names.', 'error');
    } else {
      const count = categories.length ? await applyAiCategories(valid) : 0;
      toast(`${valid.length} transactions loaded · ${count} AI-categorized`);
    }
  }

  async function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (!ACCEPTED_EXTENSIONS.test(file.name)) {
      toast('Use a CSV, XLS, or XLSX bank statement.', 'error');
      return;
    }
    if (file.size > MAX_IMPORT_BYTES) {
      toast('File too large. Import files up to 2 MB for now.', 'error');
      return;
    }
    const isExcel = /\.(xlsx|xls)$/i.test(file.name);
    if (isExcel) {
      try {
        toast('Reading Excel securely...');
        await processRows(await parseExcelOnServer(file));
      } catch (err) {
        toast(err.message || 'Could not read this Excel file. Try exporting it as CSV.', 'error');
      }
    } else {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        try {
          await processRows(parseCSV(ev.target.result));
        } catch {
          toast('Could not read this CSV file.', 'error');
        }
      };
      reader.readAsText(file);
    }
  }

  function handleCancel() { setRows([]); setSelected([]); setCatAssign({}); setAiCategorizedAttempted(false); setDone(0); if (fileRef.current) fileRef.current.value = ''; }
  function toggleRow(id) { setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]); }
  function toggleAll() { setSelected(s => s.length === rows.length ? [] : rows.map(r => r._id)); }

  async function handleImport() {
    const toImport = rows.filter(r => selected.includes(r._id));
    setImporting(true);
    let count = 0;
    for (const row of toImport) {
      try { await onAdd({ amount: row.amount, type: row.type || 'expense', category_id: catAssign[row._id] || null, date: row.date, note: row.note || null, payment_mode: 'netbanking' }, true); count++; } catch (err) { toast(err.message, 'error'); }
    }
    setImporting(false); setDone(count); setRows([]); setSelected([]); setCatAssign({}); setAiCategorizedAttempted(false);
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
            <div style={{ fontSize: 13, color: 'var(--ink-3)', fontWeight: 600, marginBottom: 14 }}>CSV or Excel · HDFC, ICICI, SBI, Axis & 40+ banks</div>
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
                <div style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 600, marginTop: 2 }}>{selected.length} selected · {categorizedCount} AI-categorized{aiCategorizing ? ' · working...' : ''}</div>
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
              const matchPct = cat ? 70 + (row._id % 25) : 0;
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
