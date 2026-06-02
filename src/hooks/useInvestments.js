import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useInvestments(userId) {
  const [investments, setInvestments] = useState([]);

  const fetch = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase.from('investments').select('*').eq('user_id', userId).order('created_at');
    setInvestments(data || []);
  }, [userId]);

  useEffect(() => { fetch(); }, [fetch]);

  async function addInvestment(inv) {
    const { error } = await supabase.from('investments').insert({ ...inv, user_id: userId });
    if (error) throw error;
    await fetch();
  }
  async function updateInvestment(id, updates) {
    await supabase.from('investments').update(updates).eq('id', id);
    await fetch();
  }
  async function deleteInvestment(id) {
    await supabase.from('investments').delete().eq('id', id);
    await fetch();
  }

  return { investments, addInvestment, updateInvestment, deleteInvestment };
}
