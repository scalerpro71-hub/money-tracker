import Anthropic from 'npm:@anthropic-ai/sdk@0.36.3';
import { createClient } from 'npm:@supabase/supabase-js@2';

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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const auth = await requireUser(req);
    if (auth.error) return new Response(JSON.stringify({ error: auth.error }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const { transactions, categories } = await req.json();
    if (!transactions?.length || !categories?.length) {
      return new Response(JSON.stringify({ results: [] }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const anthropic = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY') });

    const prompt = `You are categorizing Indian financial transactions. Given a list of transactions and available categories, assign the best category to each transaction.

Available categories: ${categories.map((c: { id: string; name: string }) => `${c.id}:${c.name}`).join(', ')}

Transactions to categorize (id: description):
${transactions.map((t: { id: string; description: string }) => `${t.id}: ${t.description}`).join('\n')}

Respond with ONLY a JSON array like: [{"id":"...","category_id":"..."}]
Match each transaction id to the most appropriate category_id. If unsure, pick the closest match.`;

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '[]';
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    const results = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
