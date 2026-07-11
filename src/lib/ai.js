import { supabase } from './supabase';

/* Thin wrappers over the Supabase edge functions. supabase-js attaches the
   session JWT automatically; the functions do their own auth. */

export async function callAiChat(message, context, history) {
  const { data, error } = await supabase.functions.invoke('ai-chat', {
    body: { message, context, history },
  });
  if (error) throw new Error(error.message || 'AI request failed');
  if (data?.error) throw new Error(data.error);
  return data?.reply ?? '';
}

export async function generateWeeklyReview(periodStart, metrics) {
  const { data, error } = await supabase.functions.invoke('weekly-review', {
    body: { period_start: periodStart, metrics },
  });
  if (error) throw new Error(error.message || 'Review generation failed');
  if (data?.error) throw new Error(data.error);
  return data?.review ?? null;
}
