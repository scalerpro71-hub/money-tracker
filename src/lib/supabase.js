import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const AUTH_STORAGE_KEY = 'rupee-auth-token-v2';
const LEGACY_AUTH_RESET_KEY = 'rupee-auth-reset-2026-07-07';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  console.error(
    '[Rupee] Missing Supabase credentials.\n' +
    'Create a .env.local file in the project root with:\n' +
    '  VITE_SUPABASE_URL=https://your-project.supabase.co\n' +
    '  VITE_SUPABASE_ANON_KEY=your-anon-key\n' +
    'Find these in Supabase Dashboard → Project Settings → API.'
  );
}

const rawClient = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder',
  {
    auth: {
      storageKey: AUTH_STORAGE_KEY,
    },
  }
);

function removeAuthKeys(storage, includeCurrent) {
  if (!storage) return;
  for (let i = storage.length - 1; i >= 0; i -= 1) {
    const key = storage.key(i);
    const isSupabaseAuthKey = key === 'supabase.auth.token' || (key?.startsWith('sb-') && key.includes('auth-token'));
    const isLegacyRupeeAuthKey = key?.startsWith('rupee-auth-token') && key !== AUTH_STORAGE_KEY;
    if (isSupabaseAuthKey || isLegacyRupeeAuthKey || (includeCurrent && key === AUTH_STORAGE_KEY)) {
      storage.removeItem(key);
    }
  }
}

export function clearSavedAuthState({ includeCurrent = false } = {}) {
  if (typeof window === 'undefined') return;
  removeAuthKeys(window.localStorage, includeCurrent);
  removeAuthKeys(window.sessionStorage, includeCurrent);
}

export function clearLegacyAuthStateOnce() {
  if (typeof window === 'undefined') return;
  if (window.localStorage.getItem(LEGACY_AUTH_RESET_KEY) === 'true') return;
  clearSavedAuthState();
  window.localStorage.setItem(LEGACY_AUTH_RESET_KEY, 'true');
}

// Dev/prod table separation: in dev, every .from('x') call transparently
// becomes .from(`${prefix}x`) so dev never reads/writes real user data.
// Auth, edge functions, and storage are untouched - only data tables are scoped.
// PostgREST embedded-relationship hints inside .select() strings (e.g.
// 'category:categories(...)') are NOT rewritten by the .from() wrapper below -
// any call site embedding a foreign table must reference `tbl('categories')`
// itself so the hint points at the matching dev_/real sibling table.
export const TABLE_PREFIX = import.meta.env.VITE_TABLE_PREFIX || '';
export const tbl = (name) => `${TABLE_PREFIX}${name}`;

export const supabase = TABLE_PREFIX
  ? new Proxy(rawClient, {
      get(target, prop, receiver) {
        if (prop === 'from') {
          return (table) => target.from(`${TABLE_PREFIX}${table}`);
        }
        return Reflect.get(target, prop, receiver);
      },
    })
  : rawClient;
