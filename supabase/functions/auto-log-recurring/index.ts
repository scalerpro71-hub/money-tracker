import { createClient } from 'npm:@supabase/supabase-js@2';

Deno.serve(async () => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const today = new Date();
  const todayDate = today.toISOString().split('T')[0];
  const dayOfMonth = today.getDate();
  const dayOfWeek = today.getDay();

  const { data: recurring, error } = await supabase
    .from('recurring_expenses')
    .select('*')
    .eq('is_active', true);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  let logged = 0;

  for (const r of recurring ?? []) {
    const isDue =
      (r.frequency === 'monthly' && r.day_of_month === dayOfMonth) ||
      (r.frequency === 'weekly' && r.day_of_week === dayOfWeek);

    const alreadyLogged = r.last_logged_at === todayDate;

    if (isDue && !alreadyLogged) {
      await supabase.from('expenses').insert({
        user_id: r.user_id,
        category_id: r.category_id,
        amount: r.amount,
        note: `${r.name} (auto)`,
        date: todayDate,
        payment_mode: r.payment_mode,
      });

      await supabase
        .from('recurring_expenses')
        .update({ last_logged_at: todayDate })
        .eq('id', r.id);

      logged++;
    }
  }

  return new Response(JSON.stringify({ logged }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
