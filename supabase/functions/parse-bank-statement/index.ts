import { createClient } from 'npm:@supabase/supabase-js@2';
import * as XLSX from 'npm:xlsx@0.18.5';

const MAX_IMPORT_BYTES = 2 * 1024 * 1024;
const MAX_IMPORT_ROWS = 1000;
const ACCEPTED_EXTENSIONS = /\.(xlsx|xls)$/i;
const HEADER_SCAN_ROWS = 25;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function requireUser(req: Request) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return { error: 'Missing authorization' };

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } }
  );
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return { error: 'Invalid authorization' };
  return { user: data.user };
}

function cellToText(value: unknown) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  return String(value ?? '').trim();
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const auth = await requireUser(req);
    if (auth.error) {
      return new Response(JSON.stringify({ error: auth.error }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const form = await req.formData();
    const file = form.get('file');
    if (!(file instanceof File)) {
      return new Response(JSON.stringify({ error: 'Upload an Excel file.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (!ACCEPTED_EXTENSIONS.test(file.name)) {
      return new Response(JSON.stringify({ error: 'Use a XLS or XLSX bank statement.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (file.size > MAX_IMPORT_BYTES) {
      return new Response(JSON.stringify({ error: 'File too large. Import files up to 2 MB for now.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const bytes = await file.arrayBuffer();
    const wb = XLSX.read(bytes, { type: 'array', cellDates: true, sheetRows: MAX_IMPORT_ROWS + HEADER_SCAN_ROWS });
    const firstSheet = wb.SheetNames[0];
    if (!firstSheet) {
      return new Response(JSON.stringify({ error: 'No sheet found in this workbook.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const ws = wb.Sheets[firstSheet];
    const rawRows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '', blankrows: false })
      .slice(0, MAX_IMPORT_ROWS + HEADER_SCAN_ROWS) as unknown[][];
    if (rawRows.length < 2) {
      return new Response(JSON.stringify({ error: 'No transaction rows found in this workbook.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const mustHaveOne = ['withdrawal', 'debit', 'credit', 'amount(inr)', 'dr amount', 'debit amt'];
    const mustHaveDate = ['value date', 'transaction date', 'txn date', 'posting date'];
    let headerIdx = 0;
    for (let i = 0; i < Math.min(rawRows.length, HEADER_SCAN_ROWS); i++) {
      const rowStr = rawRows[i].map(cellToText).join(' ').toLowerCase();
      if (mustHaveOne.some(k => rowStr.includes(k)) && mustHaveDate.some(k => rowStr.includes(k))) {
        headerIdx = i;
        break;
      }
    }

    const headers = rawRows[headerIdx].map(h => cellToText(h).toLowerCase());
    const rows = rawRows.slice(headerIdx + 1)
      .slice(0, MAX_IMPORT_ROWS)
      .filter(row => row.some(cell => cellToText(cell) !== ''))
      .map(row => {
        const out: Record<string, string> = {};
        headers.forEach((h, i) => { if (h) out[h] = cellToText(row[i]); });
        return out;
      });

    return new Response(JSON.stringify({ rows }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Could not read this Excel file. Try exporting it as CSV.' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
