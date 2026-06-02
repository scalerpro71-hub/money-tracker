import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useNetWorth(userId) {
  const [assets, setAssets] = useState([]);
  const [liabilities, setLiabilities] = useState([]);

  const fetch = useCallback(async () => {
    if (!userId) return;
    const [a, l] = await Promise.all([
      supabase.from('assets').select('*').eq('user_id', userId).order('created_at'),
      supabase.from('liabilities').select('*').eq('user_id', userId).order('created_at'),
    ]);
    setAssets(a.data || []);
    setLiabilities(l.data || []);
  }, [userId]);

  useEffect(() => { fetch(); }, [fetch]);

  async function addAsset(item) {
    const { error } = await supabase.from('assets').insert({ ...item, user_id: userId });
    if (error) throw error;
    await fetch();
  }
  async function updateAsset(id, updates) {
    await supabase.from('assets').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id);
    await fetch();
  }
  async function deleteAsset(id) {
    await supabase.from('assets').delete().eq('id', id);
    await fetch();
  }

  async function addLiability(item) {
    const { error } = await supabase.from('liabilities').insert({ ...item, user_id: userId });
    if (error) throw error;
    await fetch();
  }
  async function updateLiability(id, updates) {
    await supabase.from('liabilities').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id);
    await fetch();
  }
  async function deleteLiability(id) {
    await supabase.from('liabilities').delete().eq('id', id);
    await fetch();
  }

  return { assets, liabilities, addAsset, updateAsset, deleteAsset, addLiability, updateLiability, deleteLiability };
}
