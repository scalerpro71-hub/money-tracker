import { createClient } from 'npm:@supabase/supabase-js@2';

function localDateStr(date = new Date(), timeZone = 'Asia/Kolkata') {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const get = (type: string) => parts.find(p => p.type === type)?.value;
  return `${get('year')}-${get('month')}-${get('day')}`;
}

Deno.serve(async () => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const todayDate = localDateStr();
  const [y, m, d] = todayDate.split('-').map(Number);
  const dayOfMonth = d;
  const dayOfWeek = new Date(todayDate + 'T00:00:00').getDay();
  const lastDayOfMonth = new Date(y, m, 0).getDate();
  // Bills/EMIs due on the 29th-31st log on the last day of shorter months
  const monthlyDue = (day: number) => Math.min(Number(day), lastDayOfMonth) === dayOfMonth;

  const [{ data: recurring, error }, { data: bills }, { data: emis }] = await Promise.all([
    supabase.from('recurring_expenses').select('*').eq('is_active', true),
    supabase.from('bills').select('*').eq('is_active', true),
    supabase.from('emis').select('*'),
  ]);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  type Due = {
    user_id: string; name: string; amount: number;
    category_id: string | null; payment_mode?: string;
    markLogged?: () => PromiseLike<unknown>;
  };
  const due: Due[] = [];

  for (const r of recurring ?? []) {
    const isDue =
      (r.frequency === 'monthly' && r.day_of_month === dayOfMonth) ||
      (r.frequency === 'weekly' && r.day_of_week === dayOfWeek);
    if (!isDue || r.last_logged_at === todayDate) continue;
    due.push({
      user_id: r.user_id, name: r.name, amount: r.amount,
      category_id: r.category_id, payment_mode: r.payment_mode,
      markLogged: () => supabase
        .from('recurring_expenses')
        .update({ last_logged_at: todayDate })
        .eq('id', r.id)
        .eq('user_id', r.user_id),
    });
  }

  for (const b of bills ?? []) {
    if (!monthlyDue(b.due_day)) continue;
    due.push({ user_id: b.user_id, name: b.name, amount: b.amount, category_id: b.category_id });
  }

  for (const e of emis ?? []) {
    const start = new Date(e.start_date + 'T00:00:00');
    const now = new Date(todayDate + 'T00:00:00');
    const elapsed = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
    const active = elapsed >= 0 && elapsed < e.tenure_months && start <= now;
    if (!active || !monthlyDue(start.getDate())) continue;
    due.push({ user_id: e.user_id, name: e.name, amount: e.emi_amount, category_id: e.category_id });
  }

  let logged = 0;

  for (const item of due) {
    let existingExpenseQuery = supabase
      .from('expenses')
      .select('id')
      .eq('user_id', item.user_id)
      .eq('date', todayDate)
      .eq('amount', item.amount)
      .in('note', [item.name, `${item.name} (auto)`]);

    existingExpenseQuery = item.category_id
      ? existingExpenseQuery.eq('category_id', item.category_id)
      : existingExpenseQuery.is('category_id', null);

    const { data: existingExpense } = await existingExpenseQuery.maybeSingle();
    if (existingExpense) continue;

    await supabase.from('expenses').insert({
      user_id: item.user_id,
      category_id: item.category_id,
      amount: item.amount,
      note: `${item.name} (auto)`,
      date: todayDate,
      payment_mode: item.payment_mode ?? 'netbanking',
    });

    if (item.markLogged) await item.markLogged();
    logged++;
  }

  return new Response(JSON.stringify({ logged }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
