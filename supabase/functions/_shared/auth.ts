import { createClient, SupabaseClient } from 'npm:@supabase/supabase-js@2';

/** Validates the caller's JWT and returns both the user and an RLS-scoped client. */
export async function requireUser(req: Request): Promise<
  { user: { id: string }; supabase: SupabaseClient; error?: never } | { error: string }
> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return { error: 'Missing authorization' };

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } }
  );
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return { error: 'Invalid authorization' };
  return { user: data.user, supabase };
}
