import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useBills(userId) {
  const [bills, setBills] = useState([]);

  const fetch = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase.from('bills').select('*, category:categories(name,icon,color)')
      .eq('user_id', userId).eq('is_active', true).order('due_day');
    setBills(data || []);
  }, [userId]);

  useEffect(() => { fetch(); }, [fetch]);

  async function addBill(bill) {
    const { error } = await supabase.from('bills').insert({ ...bill, user_id: userId });
    if (error) throw error;
    await fetch();
  }

  async function updateBill(id, updates) {
    const { error } = await supabase.from('bills').update(updates).eq('id', id).eq('user_id', userId);
    if (error) throw error;
    await fetch();
  }

  async function deleteBill(id) {
    const { error } = await supabase.from('bills').delete().eq('id', id).eq('user_id', userId);
    if (error) throw error;
    await fetch();
  }

  return { bills, addBill, updateBill, deleteBill };
}
