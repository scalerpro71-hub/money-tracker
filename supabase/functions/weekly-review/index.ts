import { corsHeaders, json } from '../_shared/cors.ts';
import { requireUser } from '../_shared/auth.ts';
import { complete } from '../_shared/llm.ts';

const SYSTEM_PROMPT = `You are PaisaCoach writing a short weekly money review for a beginner in India. You get one JSON object of computed metrics for their week.

Write EXACTLY this structure, in plain text (no markdown headers):
- 3-5 sentences reviewing the week: what they spent vs the week before, their biggest category, savings/streak/budget highlights. Use their real numbers in INR. Warm, specific, zero judgment.
- Then a line starting with "Win:" - the single best thing they did this week.
- Then a line starting with "Focus:" - the single most useful thing to do next week, concrete and small.

If the metrics include investments, the Focus may be an investing-quality nudge instead of a spending one - pick the weakest principle among: diversification (one holding dominating), consistency (missed/irregular investing), cost (high-fee choices), or allocation vs goals. Frame it as the principle to fix, never a product to buy.

Never name specific stocks, funds or AMCs. Keep the whole review under 130 words.`;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const auth = await requireUser(req);
    if ('error' in auth) return json({ error: auth.error }, 401);

    const { period_start, metrics } = await req.json();
    if (!period_start || !metrics) return json({ error: 'Missing period_start or metrics' }, 400);

    // UNIQUE(user_id, period_start, period_type) makes this idempotent - if a
    // review already exists, return it instead of paying for a new one.
    const { data: existing } = await auth.supabase
      .from('weekly_reviews')
      .select('*')
      .eq('user_id', auth.user.id)
      .eq('period_start', period_start)
      .eq('period_type', 'week')
      .maybeSingle();
    if (existing?.ai_summary) return json({ review: existing });

    const summary = await complete(SYSTEM_PROMPT, [
      { role: 'user', content: `My week's metrics:\n${JSON.stringify(metrics, null, 2)}` },
    ], 400);

    const { data: saved, error } = await auth.supabase
      .from('weekly_reviews')
      .upsert(
        { user_id: auth.user.id, period_start, period_type: 'week', metrics, ai_summary: summary },
        { onConflict: 'user_id,period_start,period_type' }
      )
      .select('*')
      .single();
    if (error) throw error;

    return json({ review: saved });
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : String(err) }, 500);
  }
});
