import { createClient } from 'npm:@supabase/supabase-js@2';

const OPENAI_MODEL = 'gpt-5-mini';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PROMPTS: Record<string, { system: string; buildUser: (data: unknown) => string }> = {
  spending_patterns: {
    system: 'You are a personal finance advisor for an Indian user. Analyze spending patterns and provide 3-4 specific, actionable insights. Use Indian context such as UPI, EMIs, festivals, and salary cycles. Use INR amounts. Be concise and direct.',
    buildUser: (data) => `Here is my spending data for the last 30 days:\n${JSON.stringify(data, null, 2)}\n\nIdentify where my money is going and what patterns you notice.`,
  },
  budget_advice: {
    system: 'You are a budget advisor for an Indian user. For each over-budget category, suggest a specific actionable cut. Recommend realistic budget limits for next month based on actual spending. Use INR amounts. Be practical and concise.',
    buildUser: (data) => `Here is my current month spending vs budgets:\n${JSON.stringify(data, null, 2)}\n\nTell me which categories I overspent and give specific advice to fix next month.`,
  },
  anomaly_alerts: {
    system: 'You are a spending anomaly detector for an Indian user. Flag any expense over 3x the category average, or any day over 2x the usual daily average. Explain why it is unusual and whether it looks one-time or recurring. Keep it brief, max 5 alerts.',
    buildUser: (data) => `Here is my last 7 days of spending and my 30-day averages:\n${JSON.stringify(data, null, 2)}\n\nFlag any unusual spending.`,
  },
  savings_plan: {
    system: 'You are a savings goal planner for an Indian user. Calculate required monthly savings per goal, identify which spending categories to cut, and give a realistic timeline. Be specific with INR amounts. If goals are achievable, say so clearly.',
    buildUser: (data) => `Here are my savings goals and current financial situation:\n${JSON.stringify(data, null, 2)}\n\nBuild a practical monthly savings plan to reach these goals.`,
  },
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

async function callOpenAI(system: string, user: string) {
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${openAiKey()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      instructions: system,
      input: [{ role: 'user', content: user }],
      max_output_tokens: 800,
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

    const { feature, data } = await req.json();

    if (!feature || !PROMPTS[feature]) {
      return new Response(JSON.stringify({ error: 'Invalid feature' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const prompt = PROMPTS[feature];
    const suggestion = await callOpenAI(prompt.system, prompt.buildUser(data));

    return new Response(JSON.stringify({ suggestion }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
