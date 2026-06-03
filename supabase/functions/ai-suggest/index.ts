import Anthropic from 'npm:@anthropic-ai/sdk@0.36.3';
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PROMPTS: Record<string, { system: string; buildUser: (data: unknown) => string }> = {
  spending_patterns: {
    system: `You are a personal finance advisor for an Indian user. Analyze spending patterns and provide 3-4 specific, actionable insights. Use Indian context (UPI, EMIs, festivals like Diwali/Eid, Indian salary cycles). Format as bullet points with ₹ amounts. Be concise and direct.`,
    buildUser: (data) => `Here is my spending data for the last 30 days:\n${JSON.stringify(data, null, 2)}\n\nIdentify where my money is going and what patterns you notice.`,
  },
  budget_advice: {
    system: `You are a budget advisor for an Indian user. For each over-budget category, suggest a specific actionable cut. Recommend realistic budget limits for next month based on actual spending. Use INR amounts. Be practical and concise.`,
    buildUser: (data) => `Here is my current month spending vs budgets:\n${JSON.stringify(data, null, 2)}\n\nTell me which categories I overspent and give specific advice to fix next month.`,
  },
  anomaly_alerts: {
    system: `You are a spending anomaly detector for an Indian user. Flag any expense > 3x the category average, or any day > 2x the usual daily average. Explain why it's unusual and whether it looks like a one-time event or a growing pattern. Keep it brief — max 5 alerts.`,
    buildUser: (data) => `Here is my last 7 days of spending and my 30-day averages:\n${JSON.stringify(data, null, 2)}\n\nFlag any unusual spending.`,
  },
  savings_plan: {
    system: `You are a savings goal planner for an Indian user. Calculate required monthly savings per goal, identify which spending categories to cut, and give a realistic timeline. Be specific with ₹ amounts. If goals are achievable, say so clearly.`,
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
    const anthropic = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY') });

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 800,
      system: prompt.system,
      messages: [{ role: 'user', content: prompt.buildUser(data) }],
    });

    const suggestion = message.content[0].type === 'text' ? message.content[0].text : '';

    return new Response(JSON.stringify({ suggestion }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
