import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
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
  supabaseAnonKey || 'placeholder'
);

// Dev/prod table separation: in dev, every .from('x') call transparently
// becomes .from(`${prefix}x`) so dev never reads/writes real user data.
// Auth, edge functions, and storage are untouched - only data tables are scoped.
const TABLE_PREFIX = import.meta.env.VITE_TABLE_PREFIX || '';

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
