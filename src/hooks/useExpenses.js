import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { daysAgoStr } from '../lib/dateUtils';

export function useExpenses(userId) {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase
      .from('expenses')
      .select('*, category:categories(id,name,icon,color)')
      .eq('user_id', userId)
      .gte('date', daysAgoStr(90))
      .order('date', { ascending: false })
      .order('created_at', { ascending: false });
    setExpenses(data ?? []);
    setLoading(false);
  }, [userId]);

  useEffect(() => { fetch(); }, [fetch]);

  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel('expenses-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses', filter: `user_id=eq.${userId}` }, fetch)
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [userId, fetch]);

  async function addExpense(expense) {
    const { error } = await supabase.from('expenses').insert({ ...expense, user_id: userId });
    if (error) throw error;
    await fetch();
  }

  async function updateExpense(id, updates) {
    const { error } = await supabase.from('expenses').update(updates).eq('id', id).eq('user_id', userId);
    if (error) throw error;
    await fetch();
  }

  async function deleteExpense(id) {
    const { error } = await supabase.from('expenses').delete().eq('id', id).eq('user_id', userId);
    if (error) throw error;
    await fetch();
  }

  return { expenses, loading, addExpense, updateExpense, deleteExpense, refetch: fetch };
}
