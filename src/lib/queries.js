import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from './supabase';
import { useUserId } from '../app/auth-context';

/* ============================================================
   Data layer - every table gets a query hook + a mutations hook.
   All caches are keyed [table, userId] and invalidated together
   after any mutation on that table.
   ============================================================ */

function useListQuery(table, { select = '*', order = [['created_at', { ascending: false }]] } = {}) {
  const userId = useUserId();
  return useQuery({
    queryKey: [table, userId],
    enabled: !!userId,
    queryFn: async () => {
      let q = supabase.from(table).select(select).eq('user_id', userId);
      for (const [col, opts] of order) q = q.order(col, opts);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useTableMutations(table) {
  const userId = useUserId();
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: [table] });

  const add = useMutation({
    mutationFn: async (row) => {
      const { data, error } = await supabase.from(table).insert({ ...row, user_id: userId }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: invalidate,
  });
  const update = useMutation({
    mutationFn: async ({ id, ...updates }) => {
      const { error } = await supabase.from(table).update(updates).eq('id', id).eq('user_id', userId);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from(table).delete().eq('id', id).eq('user_id', userId);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });
  return { add, update, remove };
}

/* ---------- profile ---------- */

export function useProfile() {
  const userId = useUserId();
  return useQuery({
    queryKey: ['profiles', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
      if (error) throw error;
      if (data) return data;
      const { data: created, error: createError } = await supabase
        .from('profiles')
        .upsert({ id: userId }, { onConflict: 'id' })
        .select('*')
        .single();
      if (createError) throw createError;
      return created;
    },
  });
}

export function useUpdateProfile() {
  const userId = useUserId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (updates) => {
      const { error } = await supabase.from('profiles').upsert({ id: userId, ...updates }, { onConflict: 'id' });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['profiles'] }),
  });
}

/* ---------- expenses (with category embed + realtime) ---------- */

const EXPENSE_SELECT = '*, category:categories(id,name,icon,color)';

export function useExpenses() {
  const userId = useUserId();
  return useQuery({
    queryKey: ['expenses', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expenses')
        .select(EXPENSE_SELECT)
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useExpenseMutations() {
  return useTableMutations('expenses');
}

/** Mount once (in the shell): realtime changes just invalidate the cache. */
export function useExpensesRealtime() {
  const userId = useUserId();
  const qc = useQueryClient();
  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel('expenses-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'expenses', filter: `user_id=eq.${userId}` },
        () => qc.invalidateQueries({ queryKey: ['expenses'] })
      )
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [userId, qc]);
}

/* ---------- categories (client-side seed fallback for pre-trigger users) ---------- */

const DEFAULT_CATEGORIES = [
  { name: 'Food', icon: '🍔', color: '#F59E0B' },
  { name: 'Transport', icon: '🚗', color: '#3B82F6' },
  { name: 'Shopping', icon: '🛍️', color: '#EC4899' },
  { name: 'Entertainment', icon: '🎬', color: '#8B5CF6' },
  { name: 'Health', icon: '💊', color: '#10B981' },
  { name: 'Utilities', icon: '💡', color: '#6366F1' },
  { name: 'Rent', icon: '🏠', color: '#EF4444' },
  { name: 'Education', icon: '📚', color: '#14B8A6' },
  { name: 'Other', icon: '📦', color: '#6B7280' },
];

function dedupByName(rows) {
  const seen = new Set();
  return rows.filter(r => {
    const key = r.name.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function useCategories() {
  const userId = useUserId();
  return useQuery({
    queryKey: ['categories', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase.from('categories').select('*').eq('user_id', userId).order('name');
      if (error) throw error;
      if (data?.length) return dedupByName(data);
      await supabase.from('categories').insert(
        DEFAULT_CATEGORIES.map(c => ({ ...c, user_id: userId, is_default: true }))
      );
      const { data: seeded } = await supabase.from('categories').select('*').eq('user_id', userId).order('name');
      return dedupByName(seeded ?? []);
    },
  });
}

export function useCategoryMutations() {
  return useTableMutations('categories');
}

/* ---------- simple domains ---------- */

export function useBudgets() {
  return useListQuery('budgets', { order: [['month', { ascending: false }]] });
}
export function useBudgetMutations() {
  const userId = useUserId();
  const qc = useQueryClient();
  const upsert = useMutation({
    mutationFn: async (row) => {
      const { error } = await supabase
        .from('budgets')
        .upsert({ ...row, user_id: userId }, { onConflict: 'user_id,category_id,month' });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['budgets'] }),
  });
  const { remove } = useTableMutations('budgets');
  return { upsert, remove };
}

export function useGoals() {
  return useListQuery('goals');
}
export function useGoalMutations() {
  return useTableMutations('goals');
}

export function useBills() {
  return useListQuery('bills', { order: [['due_day', { ascending: true }]] });
}
export function useBillMutations() {
  return useTableMutations('bills');
}

export function useEmis() {
  return useListQuery('emis', { order: [['start_date', { ascending: false }]] });
}
export function useEmiMutations() {
  return useTableMutations('emis');
}

export function useRecurring() {
  return useListQuery('recurring_expenses');
}
export function useRecurringMutations() {
  return useTableMutations('recurring_expenses');
}

export function useInvestments() {
  return useListQuery('investments');
}
export function useInvestmentMutations() {
  return useTableMutations('investments');
}

export function useAssets() {
  return useListQuery('assets');
}
export function useAssetMutations() {
  return useTableMutations('assets');
}

export function useLiabilities() {
  return useListQuery('liabilities');
}
export function useLiabilityMutations() {
  return useTableMutations('liabilities');
}

/* ---------- journey ---------- */

export function useJourneyState() {
  const userId = useUserId();
  return useQuery({
    queryKey: ['user_journey_state', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase.from('user_journey_state').select('*').eq('user_id', userId).maybeSingle();
      if (error) throw error;
      if (data) return data;
      const { data: created, error: createError } = await supabase
        .from('user_journey_state')
        .upsert({ user_id: userId }, { onConflict: 'user_id' })
        .select('*')
        .single();
      if (createError) throw createError;
      return created;
    },
  });
}

export function useUpdateJourneyState() {
  const userId = useUserId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (updates) => {
      const { error } = await supabase
        .from('user_journey_state')
        .upsert({ user_id: userId, ...updates, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['user_journey_state'] }),
  });
}

export function useLessonProgress() {
  return useListQuery('user_lesson_progress', { order: [['created_at', { ascending: true }]] });
}

export function useUpsertLessonProgress() {
  const userId = useUserId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ lessonId, ...fields }) => {
      const { error } = await supabase
        .from('user_lesson_progress')
        .upsert({ user_id: userId, lesson_id: lessonId, ...fields }, { onConflict: 'user_id,lesson_id' });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['user_lesson_progress'] }),
  });
}

export function useWeeklyReviews() {
  return useListQuery('weekly_reviews', { order: [['period_start', { ascending: false }]] });
}

export function useMarkReviewRead() {
  const userId = useUserId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from('weekly_reviews')
        .update({ read_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', userId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['weekly_reviews'] }),
  });
}
