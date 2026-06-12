import { supabase } from './supabase';

export async function callAiChat(message, context, history) {
  const { data, error } = await supabase.functions.invoke('ai-chat', {
    body: { message, context, history },
  });
  if (error) throw new Error(error.message || 'AI request failed');
  return data?.reply ?? '';
}

export async function callAiSuggest(feature, data) {
  const { data: result, error } = await supabase.functions.invoke('ai-suggest', {
    body: { feature, data },
  });
  if (error) throw new Error(error.message || 'AI request failed');
  return result?.suggestion ?? '';
}
