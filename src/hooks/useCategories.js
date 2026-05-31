import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useCategories(userId) {
  const [categories, setCategories] = useState([]);

  const fetch = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', userId)
      .order('name');
    setCategories(data ?? []);
  }, [userId]);

  useEffect(() => { fetch(); }, [fetch]);

  async function addCategory(cat) {
    const { error } = await supabase.from('categories').insert({ ...cat, user_id: userId });
    if (error) throw error;
    await fetch();
  }

  async function updateCategory(id, updates) {
    const { error } = await supabase.from('categories').update(updates).eq('id', id).eq('user_id', userId);
    if (error) throw error;
    await fetch();
  }

  async function deleteCategory(id) {
    const { error } = await supabase.from('categories').delete().eq('id', id).eq('user_id', userId);
    if (error) throw error;
    await fetch();
  }

  return { categories, addCategory, updateCategory, deleteCategory, refetch: fetch };
}
