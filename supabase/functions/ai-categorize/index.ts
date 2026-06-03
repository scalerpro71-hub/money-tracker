import { createClient } from 'npm:@supabase/supabase-js@2';

const OPENAI_MODEL = 'gpt-5-nano';

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

function openAiKey() {
  const key = Deno.env.get('OPENAI_API_KEY');
  if (!key) throw new Error('OPENAI_API_KEY is not configured');
  return key;
}

function extractText(data: Record<string, unknown>) {
  if (typeof data.output_text === 'string') return data.output_text.trim();
  const output = Array.isArray(data.output) ? data.output : [];
  for (const item of output) {
    const content = Array.isArray(item?.content) ? item.content : [];
    for (const part of content) {
      if (part?.type === 'output_text' && typeof part.text === 'string') return part.text.trim();
      if (part?.type === 'text' && typeof part.text === 'string') return part.text.trim();
    }
  }
  return '';
}

async function callOpenAI(prompt: string) {
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${openAiKey()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      instructions: 'Return only valid JSON. Do not include markdown, prose, or code fences.',
      input: [{ role: 'user', content: prompt }],
      max_output_tokens: 1024,
    }),
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = result?.error?.message || `OpenAI request failed with ${response.status}`;
    throw new Error(message);
  }

  const text = extractText(result);
  if (!text) throw new Error('OpenAI returned an empty response');
  return text;
}

function parseCategoryResults(text: string, validTransactionIds: Set<string>, validCategoryIds: Set<string>) {
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error('AI categorization returned invalid JSON');

  const parsed = JSON.parse(jsonMatch[0]);
  if (!Array.isArray(parsed)) throw new Error('AI categorization returned invalid JSON');

  return parsed
    .filter((item) =>
      item &&
      typeof item.id === 'string' &&
      typeof item.category_id === 'string' &&
      validTransactionIds.has(item.id) &&
      validCategoryIds.has(item.category_id)
    )
    .map((item) => ({ id: item.id, category_id: item.category_id }));
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const auth = await requireUser(req);
    if (auth.error) return new Response(JSON.stringify({ error: auth.error }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const { transactions, categories } = await req.json();
    if (!transactions?.length || !categories?.length) {
      return new Response(JSON.stringify({ results: [] }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const validTransactionIds = new Set(transactions.map((t: { id: string }) => String(t.id)));
    const validCategoryIds = new Set(categories.map((c: { id: string }) => String(c.id)));
    const prompt = `You are categorizing Indian financial transactions. Given transactions and available categories, assign the best category to each transaction.

Available categories: ${categories.map((c: { id: string; name: string }) => `${c.id}:${c.name}`).join(', ')}

Transactions to categorize (id: description):
${transactions.map((t: { id: string; description: string }) => `${t.id}: ${t.description}`).join('\n')}

Return only a JSON array like [{"id":"transaction-id","category_id":"category-id"}].
Match each transaction id to one provided category_id. If unsure, pick the closest match.`;

    const text = await callOpenAI(prompt);
    const results = parseCategoryResults(text, validTransactionIds, validCategoryIds);

    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
