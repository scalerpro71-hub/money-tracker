import { supabase } from './supabase';
import { todayStr } from './dateUtils';

/* Auto-logs every due commitment as an expense: subscriptions/recurring,
   bills, and active EMIs. Bills and EMIs due on the 29th-31st log on the
   last day of shorter months. */

function emiMonthsElapsed(emi, now) {
  const start = new Date(emi.start_date + 'T00:00:00');
  return (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
}

export async function autoLogRecurring(userId) {
  if (!userId) return 0;

  const today = new Date();
  const todayDate = todayStr();
  const dayOfMonth = today.getDate();
  const dayOfWeek = today.getDay();
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const monthlyDue = day => Math.min(Number(day), lastDayOfMonth) === dayOfMonth;

  const [{ data: recurring }, { data: bills }, { data: emis }] = await Promise.all([
    supabase.from('recurring_expenses')
      .select('*, category:categories(id,name,icon,color)')
      .eq('user_id', userId).eq('is_active', true),
    supabase.from('bills')
      .select('*').eq('user_id', userId).eq('is_active', true),
    supabase.from('emis')
      .select('*').eq('user_id', userId),
  ]);

  const due = [];
  for (const r of recurring ?? []) {
    const isDue =
      (r.frequency === 'monthly' && r.day_of_month === dayOfMonth) ||
      (r.frequency === 'weekly' && r.day_of_week === dayOfWeek);
    if (isDue) due.push({ name: r.name, amount: r.amount, category_id: r.category_id });
  }
  for (const b of bills ?? []) {
    if (monthlyDue(b.due_day)) due.push({ name: b.name, amount: b.amount, category_id: b.category_id });
  }
  for (const e of emis ?? []) {
    const start = new Date(e.start_date + 'T00:00:00');
    const elapsed = emiMonthsElapsed(e, today);
    const active = elapsed >= 0 && elapsed < e.tenure_months && start <= today;
    if (active && monthlyDue(start.getDate())) {
      due.push({ name: e.name, amount: e.emi_amount, category_id: e.category_id });
    }
  }

  if (!due.length) return 0;

  // Today's already-logged expenses, to avoid duplicates
  const { data: todayExpenses } = await supabase
    .from('expenses')
    .select('note, category_id, amount')
    .eq('user_id', userId)
    .eq('date', todayDate);

  let logged = 0;
  for (const item of due) {
    const alreadyLogged = todayExpenses?.some(
      x => (x.note === item.name || x.note === `${item.name} (auto)`) &&
        Number(x.amount) === Number(item.amount) && x.category_id === (item.category_id ?? null)
    );
    if (alreadyLogged) continue;

    await supabase.from('expenses').insert({
      user_id: userId,
      amount: item.amount,
      category_id: item.category_id ?? null,
      date: todayDate,
      note: `${item.name} (auto)`,
      payment_mode: 'netbanking',
      type: 'expense',
    });
    logged++;
  }

  return logged;
}
