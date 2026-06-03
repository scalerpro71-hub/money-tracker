import Anthropic from 'npm:@anthropic-ai/sdk@0.36.3';
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You are a personal finance assistant for an Indian user who uses "Rupee Tracker" to manage their expenses.

You have access to the user's real financial data provided in each message. Use it to give specific, accurate answers.

Guidelines:
- Always use ₹ (Indian Rupee) for amounts
- Be concise and direct — answer in 2-4 sentences unless a detailed breakdown is asked
- Use Indian context: UPI, EMI, SIP, lakh/crore notation (e.g. ₹1.5L not ₹150,000)
- Format large numbers in Indian style: ₹1,50,000 or ₹1.5L
- If data doesn't exist for what they're asking, say so clearly
- For spending questions, do the math from the data provided
- Give actionable advice when relevant, not just numbers
- Keep responses friendly and conversational`;

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

    const { message, context, history } = await req.json();

    if (!message) {
      return new Response(JSON.stringify({ error: 'Missing message' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const anthropic = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY') });

    // Build messages array with history + current message
    const contextBlock = context ? `\n\n<financial_data>\n${JSON.stringify(context, null, 2)}\n</financial_data>` : '';

    const messages = [
      // Inject context as first user turn if provided
      ...(context ? [{
        role: 'user' as const,
        content: `Here is my current financial data for reference:${contextBlock}\n\nPlease acknowledge you have my data and are ready to help.`,
      }, {
        role: 'assistant' as const,
        content: 'Got it! I can see your financial data — expenses, budgets, goals, and profile. Ask me anything about your spending, savings, or finances.',
      }] : []),
      // Previous conversation history
      ...(history || []).map((h: { role: string; content: string }) => ({
        role: h.role as 'user' | 'assistant',
        content: h.content,
      })),
      // Current message
      { role: 'user' as const, content: message },
    ];

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 600,
      system: SYSTEM_PROMPT,
      messages,
    });

    const reply = response.content[0].type === 'text' ? response.content[0].text : '';

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
