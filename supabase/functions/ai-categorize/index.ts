import { createClient } from 'npm:@supabase/supabase-js@2';

const OPENAI_MODEL = 'gpt-5-mini';

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
      reasoning: { effort: 'minimal' },
      text: { verbosity: 'low' },
      max_output_tokens: 1200,
      store: false,
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

function categoryGuide(name: string) {
  const key = name.toLowerCase();
  if (key.includes('food')) return 'restaurants, Swiggy, Zomato, groceries, vegetables, milk, cafes, tea, snacks';
  if (key.includes('transport')) return 'Uber, Ola, Rapido, auto, cab, metro, train, bus, petrol, diesel, fuel, parking, tolls';
  if (key.includes('shopping')) return 'Amazon, Flipkart, Myntra, Ajio, clothes, footwear, electronics, stores, online purchases';
  if (key.includes('entertainment')) return 'Netflix, Prime Video, Hotstar, Spotify, movies, games, events, bars, subscriptions';
  if (key.includes('health')) return 'hospital, doctor, pharmacy, medicines, lab tests, medical insurance';
  if (key.includes('util')) return 'electricity, water, gas, broadband, internet, mobile recharge, DTH, phone bills';
  if (key.includes('rent')) return 'house rent, flat rent, landlord, maintenance';
  if (key.includes('education')) return 'school, college, course, tuition, books, exam fees, learning apps';
  if (key.includes('other')) return 'only use when no provided category is a reasonable fit';
  return 'use when the merchant or description clearly matches this custom category';
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
    const prompt = `You are categorizing Indian bank statement transactions for a personal expense tracker.
Choose the most accurate category_id from the user's available categories.

Available categories:
${categories.map((c: { id: string; name: string }) => `- ${c.id}: ${c.name} (${categoryGuide(c.name)})`).join('\n')}

Indian merchant clues:
- SWIGGY, ZOMATO, restaurant, cafe, grocery, mart, milk, vegetable -> Food when Food exists.
- UBER, OLA, RAPIDO, metro, train, bus, fuel, petrol, parking, toll -> Transport when Transport exists.
- AMAZON, FLIPKART, MYNTRA, AJIO, retail stores -> Shopping when Shopping exists.
- NETFLIX, SPOTIFY, PRIME, HOTSTAR, cinema, movie, gaming -> Entertainment when Entertainment exists.
- APOLLO, PHARMEASY, hospital, clinic, doctor, pharmacy -> Health when Health exists.
- AIRTEL, JIO, VI, BESCOM, electricity, gas, broadband, recharge -> Utilities when Utilities exists.
- school, college, course, Udemy, Coursera, books -> Education when Education exists.
- rent, landlord, flat maintenance -> Rent when Rent exists.

Rules:
- Return one result for every transaction id.
- Use "Other" only when no specific available category reasonably fits.
- Ignore payment rails and bank words such as UPI, IMPS, NEFT, POS, ACH, ECOM, ref, txn, pay, bank.
- Do not invent category ids.

Transactions to categorize:
${transactions.map((t: { id: string; description: string; merchant?: string; amount?: number }) => `- id=${t.id}; merchant=${t.merchant || ''}; description=${t.description}; amount=${t.amount ?? ''}`).join('\n')}

Return only a JSON array like [{"id":"transaction-id","category_id":"category-id"}].
Match each transaction id to one provided category_id.`;

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
