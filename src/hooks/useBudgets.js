import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { firstDayOfCurrentMonth } from '../lib/dateUtils';

export function useBudgets(userId) {
  const [budgets, setBudgets] = useState([]);

  const fetch = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase
      .from('budgets')
      .select('*, category:categories(id,name,icon,color)')
      .eq('user_id', userId)
      .eq('month', firstDayOfCurrentMonth());
    setBudgets(data ?? []);
  }, [userId]);

  useEffect(() => { fetch(); }, [fetch]);

  async function upsertBudget(categoryId, limitAmount) {
    const { error } = await supabase.from('budgets').upsert({
      user_id: userId,
      category_id: categoryId,
      month: firstDayOfCurrentMonth(),
      limit_amount: limitAmount,
    }, { onConflict: 'user_id,category_id,month' });
    if (error) throw error;
    await fetch();
  }

  async function deleteBudget(id) {
    const { error } = await supabase.from('budgets').delete().eq('id', id).eq('user_id', userId);
    if (error) throw error;
    await fetch();
  }

  return { budgets, upsertBudget, deleteBudget, refetch: fetch };
}
