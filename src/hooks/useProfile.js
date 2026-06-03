import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useProfile(userId) {
  const [profile, setProfile] = useState(null);

  const fetch = useCallback(async () => {
    if (!userId) return;
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
    if (error) {
      setProfile(null);
      return;
    }
    if (data) {
      setProfile(data);
      return;
    }
    const { data: created, error: createError } = await supabase
      .from('profiles')
      .upsert({ id: userId }, { onConflict: 'id' })
      .select('*')
      .single();
    if (!createError) setProfile(created);
  }, [userId]);

  useEffect(() => { fetch(); }, [fetch]);

  async function updateProfile(updates) {
    const { error } = await supabase.from('profiles').upsert({ id: userId, ...updates }, { onConflict: 'id' });
    if (error) throw error;
    await fetch();
  }

  return { profile, updateProfile };
}
