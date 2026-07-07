import { useState, useEffect } from 'react';
import { clearLegacyAuthStateOnce, clearSavedAuthState, isSupabaseConfigured, supabase } from '../lib/supabase';

const CONFIG_ERROR = 'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, then restart the app.';

function requireSupabase() {
  if (!isSupabaseConfigured) throw new Error(CONFIG_ERROR);
}

function isFetchFailure(error) {
  return error?.message?.toLowerCase().includes('failed to fetch');
}

export function useAuth() {
  const [session, setSession] = useState(undefined);
  const [user, setUser] = useState(null);

  useEffect(() => {
    clearLegacyAuthStateOnce();

    if (!isSupabaseConfigured) {
      setSession(null);
      setUser(null);
      return;
    }

    supabase.auth.getSession()
      .then(({ data: { session }, error }) => {
        if (error) throw error;
        setSession(session);
        setUser(session?.user ?? null);
      })
      .catch(err => {
        console.error('[Rupee] Failed to restore auth session:', err);
        if (isFetchFailure(err)) clearSavedAuthState({ includeCurrent: true });
        setSession(null);
        setUser(null);
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function signIn(email, password) {
    requireSupabase();
    clearSavedAuthState({ includeCurrent: true });
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) throw error;
  }

  async function signUp(email, password, fullName) {
    requireSupabase();
    clearSavedAuthState({ includeCurrent: true });
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { full_name: fullName.trim() } },
    });
    if (error) throw error;
  }

  async function signInWithMagicLink(email) {
    requireSupabase();
    clearSavedAuthState({ includeCurrent: true });
    const { error } = await supabase.auth.signInWithOtp({ email: email.trim() });
    if (error) throw error;
  }

  async function signOut() {
    await supabase.auth.signOut();
    clearSavedAuthState({ includeCurrent: true });
  }

  return { session, user, signIn, signUp, signInWithMagicLink, signOut };
}
