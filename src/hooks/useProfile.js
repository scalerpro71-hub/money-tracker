import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useProfile(userId) {
  const [profile, setProfile] = useState(null);

  const fetch = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    setProfile(data);
  }, [userId]);

  useEffect(() => { fetch(); }, [fetch]);

  async function updateProfile(updates) {
    const { error } = await supabase.from('profiles').update(updates).eq('id', userId);
    if (error) throw error;
    await fetch();
  }

  return { profile, updateProfile };
}
