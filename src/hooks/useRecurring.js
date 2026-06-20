import { useState, useEffect, useCallback } from 'react';
import { supabase, tbl } from '../lib/supabase';

export function useRecurring(userId) {
  const [recurring, setRecurring] = useState([]);

  const fetch = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase
      .from('recurring_expenses')
      .select(`*, category:${tbl('categories')}(id,name,icon,color)`)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    setRecurring(data ?? []);
  }, [userId]);

  useEffect(() => { fetch(); }, [fetch]);

  async function addRecurring(item) {
    const { error } = await supabase.from('recurring_expenses').insert({ ...item, user_id: userId });
    if (error) throw error;
    await fetch();
  }

  async function toggleRecurring(id, isActive) {
    const { error } = await supabase.from('recurring_expenses').update({ is_active: isActive }).eq('id', id).eq('user_id', userId);
    if (error) throw error;
    await fetch();
  }

  async function deleteRecurring(id) {
    const { error } = await supabase.from('recurring_expenses').delete().eq('id', id).eq('user_id', userId);
    if (error) throw error;
    await fetch();
  }

  return { recurring, addRecurring, toggleRecurring, deleteRecurring };
}
