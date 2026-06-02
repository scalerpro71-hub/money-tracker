import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useEmis(userId) {
  const [emis, setEmis] = useState([]);

  const fetch = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase.from('emis').select('*').eq('user_id', userId).order('created_at');
    setEmis(data || []);
  }, [userId]);

  useEffect(() => { fetch(); }, [fetch]);

  async function addEmi(emi) {
    const { error } = await supabase.from('emis').insert({ ...emi, user_id: userId });
    if (error) throw error;
    await fetch();
  }

  async function deleteEmi(id) {
    const { error } = await supabase.from('emis').delete().eq('id', id);
    if (error) throw error;
    await fetch();
  }

  return { emis, addEmi, deleteEmi };
}
