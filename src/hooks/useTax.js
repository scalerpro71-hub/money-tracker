import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useTax(userId) {
  const [declarations, setDeclarations] = useState([]);

  const fetch = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase.from('tax_declarations').select('*').eq('user_id', userId).order('section').order('created_at');
    setDeclarations(data || []);
  }, [userId]);

  useEffect(() => { fetch(); }, [fetch]);

  async function addDeclaration(item) {
    const { error } = await supabase.from('tax_declarations').insert({ ...item, user_id: userId });
    if (error) throw error;
    await fetch();
  }

  async function deleteDeclaration(id) {
    await supabase.from('tax_declarations').delete().eq('id', id);
    await fetch();
  }

  return { declarations, addDeclaration, deleteDeclaration };
}
