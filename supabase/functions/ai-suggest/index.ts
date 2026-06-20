import { createClient } from 'npm:@supabase/supabase-js@2';

const OPENAI_MODEL = 'gpt-5.4-nano';

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
  weekly_money_story: {
    system: 'You are a plain-English money narrator for an Indian personal finance app. Explain what happened this week in 5-7 short bullets. Focus on things the user may not notice from numbers alone: shifts, repeated merchants, spending pace, category changes, and practical next steps. Use INR amounts. Do not shame the user.',
    buildUser: (data) => `Here is my weekly spending data:\n${JSON.stringify(data, null, 2)}\n\nTell the story of my week in plain English.`,
  },
  unusual_transactions: {
    system: 'You are a spending anomaly explainer. Identify unusual transactions, unusually high merchant/category spends, and repeated small leaks. Explain why each item stands out in plain English. Use INR amounts. If nothing is unusual, say that clearly and mention what looks normal.',
    buildUser: (data) => `Here are my recent transactions, category totals, and averages:\n${JSON.stringify(data, null, 2)}\n\nExplain unusual transactions and why they matter.`,
  },
  hidden_patterns: {
    system: 'You detect hidden spending patterns that are hard to see in tables. Look for repeated merchants, weekend/day patterns, category creep, many small payments, split spending, and changes versus the previous period. Use plain English and INR amounts.',
    buildUser: (data) => `Here is my spending data:\n${JSON.stringify(data, null, 2)}\n\nFind hidden patterns I might miss.`,
  },
  monthly_summary: {
    system: 'You write monthly finance summaries in simple words for an Indian user. Cover income, spend, savings, top categories, budget pressure, largest transactions, and one clear action for next month. Keep it concise and practical.',
    buildUser: (data) => `Here is my monthly finance data:\n${JSON.stringify(data, null, 2)}\n\nWrite my monthly money summary.`,
  },
  why_spend_more: {
    system: 'You answer why spending increased using evidence. Compare current period vs previous period, name the categories and merchants that caused the increase, and separate one-time spikes from repeated habits. Use INR amounts.',
    buildUser: (data) => `Here is my current vs previous spending data:\n${JSON.stringify(data, null, 2)}\n\nExplain why I spent more or less.`,
  },
  budget_explanation: {
    system: 'You explain budget warnings in words. For each over-budget or near-budget category, explain what caused it, which merchants contributed, whether it looks one-time or recurring, and the smallest practical correction. Use INR amounts.',
    buildUser: (data) => `Here is my budget and spending data:\n${JSON.stringify(data, null, 2)}\n\nExplain my budget warnings in plain English.`,
  },
  investment_starter_plan: {
    system: 'You are a beginner investing coach for an Indian user who has never invested before. Build a simple month-by-month starter plan using their real monthly surplus, income, and existing investments. Explain any jargon term (SIP, NAV, expense ratio, lock-in, etc.) in one short plain-English phrase the first time you use it. Recommend only investment categories with concrete selection criteria (e.g. "a Nifty 50 index fund with expense ratio under 0.2%", "PPF", "NPS Tier 1", "a short-duration debt fund") — never name a specific stock, mutual fund, or AMC. Only mention an emergency fund if their safety net is "none"; if it is "family_support" or "own_emergency_fund", skip that topic entirely. For every allocation or amount you suggest, state the reasoning behind it (their horizon, risk comfort, goal) — not just the number, since this is a beginner relying on the plan directly. Use concrete INR amounts and a simple percentage split of their surplus. Keep it to a short, scannable plan.',
    buildUser: (data) => `Here is my financial data and investing profile:\n${JSON.stringify(data, null, 2)}\n\nBuild me a starter investing plan for my monthly surplus.`,
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
      reasoning: { effort: 'minimal' },
      text: { verbosity: 'low' },
      max_output_tokens: 900,
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
