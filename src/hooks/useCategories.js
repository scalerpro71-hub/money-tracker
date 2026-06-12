import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';

const DEFAULT_CATEGORIES = [
  { name: 'Food', icon: '🍛', color: '#F97316', is_default: true },
  { name: 'Transport', icon: '🚗', color: '#3B82F6', is_default: true },
  { name: 'Shopping', icon: '🛍️', color: '#A855F7', is_default: true },
  { name: 'Entertainment', icon: '🎬', color: '#EC4899', is_default: true },
  { name: 'Health', icon: '💊', color: '#10B981', is_default: true },
  { name: 'Utilities', icon: '💡', color: '#F59E0B', is_default: true },
  { name: 'Rent', icon: '🏠', color: '#6366F1', is_default: true },
  { name: 'Education', icon: '📚', color: '#14B8A6', is_default: true },
  { name: 'Other', icon: '💰', color: '#6B7280', is_default: true },
];

function dedup(cats) {
  const seen = new Set();
  return cats.filter(c => seen.has(c.name) ? false : seen.add(c.name));
}

export function useCategories(userId) {
  const [categories, setCategories] = useState([]);
  const seeding = useRef(false);

  const fetch = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', userId)
      .order('name');
    if (data?.length) {
      setCategories(dedup(data));
      return;
    }
    if (seeding.current) return;
    seeding.current = true;
    const { data: seeded, error } = await supabase
      .from('categories')
      .insert(DEFAULT_CATEGORIES.map(cat => ({ ...cat, user_id: userId })))
      .select('*')
      .order('name');
    seeding.current = false;
    if (!error) setCategories(seeded ?? []);
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
