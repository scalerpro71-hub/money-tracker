import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useGoals(userId) {
  const [goals, setGoals] = useState([]);

  const fetch = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    setGoals(data ?? []);
  }, [userId]);

  useEffect(() => { fetch(); }, [fetch]);

  async function addGoal(goal) {
    const { error } = await supabase.from('goals').insert({ ...goal, user_id: userId });
    if (error) throw error;
    await fetch();
  }

  async function updateGoal(id, updates) {
    const { error } = await supabase.from('goals').update(updates).eq('id', id).eq('user_id', userId);
    if (error) throw error;
    await fetch();
  }

  async function deleteGoal(id) {
    const { error } = await supabase.from('goals').delete().eq('id', id).eq('user_id', userId);
    if (error) throw error;
    await fetch();
  }

  return { goals, addGoal, updateGoal, deleteGoal };
}
