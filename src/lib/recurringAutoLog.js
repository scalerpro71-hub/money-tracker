import { supabase } from './supabase';

export async function autoLogRecurring(userId) {
  if (!userId) return 0;

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const dayOfMonth = today.getDate();
  const dayOfWeek = today.getDay();

  // Get active recurring expenses
  const { data: recurring } = await supabase
    .from('recurring_expenses')
    .select('*, category:categories(id,name,icon,color)')
    .eq('user_id', userId)
    .eq('is_active', true);

  if (!recurring?.length) return 0;

  // Get today's already-logged expenses to avoid duplicates
  const { data: todayExpenses } = await supabase
    .from('expenses')
    .select('note, category_id, amount')
    .eq('user_id', userId)
    .eq('date', todayStr);

  let logged = 0;
  for (const r of recurring) {
    const isDue =
      (r.frequency === 'monthly' && r.day_of_month === dayOfMonth) ||
      (r.frequency === 'weekly' && r.day_of_week === dayOfWeek);

    if (!isDue) continue;

    // Check if already logged today (same name + amount + category)
    const alreadyLogged = todayExpenses?.some(
      e => e.note === r.name && Number(e.amount) === Number(r.amount) && e.category_id === r.category_id
    );
    if (alreadyLogged) continue;

    await supabase.from('expenses').insert({
      user_id: userId,
      amount: r.amount,
      category_id: r.category_id,
      date: todayStr,
      note: r.name,
      payment_mode: 'netbanking',
      type: 'expense',
    });
    logged++;
  }

  return logged;
}
