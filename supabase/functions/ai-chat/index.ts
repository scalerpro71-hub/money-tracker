import { createClient } from 'npm:@supabase/supabase-js@2';

const OPENAI_MODEL = 'gpt-5-mini';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You are a personal finance assistant for an Indian user who uses "Rupee Tracker" to manage expenses.

You have access to the user's real financial data provided in each message. Use it to give specific, accurate answers.

Guidelines:
- Always use INR / rupee amounts.
- Be concise and direct; answer in 2-4 sentences unless a detailed breakdown is asked.
- Use Indian context: UPI, EMI, SIP, lakh/crore notation.
- If data does not exist for what they ask, say so clearly.
- For spending questions, do the math from the data provided.
- Give actionable advice when relevant, not just numbers.
- Keep responses friendly and conversational.

You also help with beginner investment education using the same financial data:
- Explain any jargon term (SIP, NAV, expense ratio, etc.) in one short plain-English phrase the first time you use it.
- Recommend only investment categories and selection criteria (e.g. "a Nifty 50 index fund with expense ratio under 0.2%", "PPF", "NPS Tier 1") — never name a specific stock, mutual fund, or AMC.
- Always state the reasoning behind any amount or allocation you suggest, not just the number.
- Only raise emergency-fund advice if the user's safety net is explicitly "none" — otherwise don't bring it up.`;

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

async function callOpenAI(input: Array<{ role: string; content: string }>, maxOutputTokens = 600) {
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${openAiKey()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      instructions: SYSTEM_PROMPT,
      input,
      max_output_tokens: maxOutputTokens,
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data?.error?.message || `OpenAI request failed with ${response.status}`;
    throw new Error(message);
  }

  const text = extractText(data);
  if (!text) throw new Error('OpenAI returned an empty response');
  return text;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const auth = await requireUser(req);
    if (auth.error) {
      return new Response(JSON.stringify({ error: auth.error }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { message, context, history } = await req.json();
    if (!message) {
      return new Response(JSON.stringify({ error: 'Missing message' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const contextBlock = context
      ? `\n\nFinancial data:\n${JSON.stringify(context, null, 2)}`
      : '';

    const input = [
      ...(context ? [{
        role: 'user',
        content: `Here is my current financial data for reference:${contextBlock}`,
      }] : []),
      ...(history || [])
        .filter((h: { role?: string; content?: string }) => h?.content && (h.role === 'user' || h.role === 'assistant'))
        .map((h: { role: string; content: string }) => ({ role: h.role, content: h.content })),
      { role: 'user', content: message },
    ];

    const reply = await callOpenAI(input);

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
