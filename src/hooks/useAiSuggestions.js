import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { callAiSuggest } from '../lib/claudeApi';

const FEATURES = ['spending_patterns', 'budget_advice', 'anomaly_alerts', 'savings_plan'];
const TTL_HOURS = 24;

export function useAiSuggestions(userId) {
  const [suggestions, setSuggestions] = useState({});
  const [loading, setLoading] = useState({});
  const [error, setError] = useState({});

  const fetchCached = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase
      .from('ai_suggestions')
      .select('*')
      .eq('user_id', userId)
      .in('feature', FEATURES);

    const map = {};
    for (const row of data ?? []) {
      const ageHours = (Date.now() - new Date(row.generated_at).getTime()) / 3600000;
      if (ageHours < TTL_HOURS) {
        map[row.feature] = row.response;
      }
    }
    setSuggestions(map);
  }, [userId]);

  useEffect(() => { fetchCached(); }, [fetchCached]);

  async function generate(feature, payload) {
    setLoading(l => ({ ...l, [feature]: true }));
    setError(e => ({ ...e, [feature]: null }));
    try {
      const suggestion = await callAiSuggest(feature, payload);
      await supabase.from('ai_suggestions').upsert({
        user_id: userId,
        feature,
        response: suggestion,
        generated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,feature' });
      setSuggestions(s => ({ ...s, [feature]: suggestion }));
    } catch (err) {
      setError(e => ({ ...e, [feature]: err.message }));
    } finally {
      setLoading(l => ({ ...l, [feature]: false }));
    }
  }

  return { suggestions, loading, error, generate };
}
