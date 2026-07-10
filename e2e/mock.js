/* Mocked Supabase backend for e2e: fake session in localStorage + routed
   REST/auth/functions responses, so tests run with zero real credentials. */

export const USER_ID = '11111111-1111-4111-8111-111111111111';

const today = new Date();
const d = (offset) => {
  const x = new Date(today);
  x.setDate(x.getDate() - offset);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
};
const monthFirst = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`;

// Indian FY (April-March), matching TaxTab's currentFY()
const currentFY = () => {
  const y = today.getMonth() >= 3 ? today.getFullYear() : today.getFullYear() - 1;
  return `${y}-${String((y + 1) % 100).padStart(2, '0')}`;
};

const cats = [
  { id: 'c1', name: 'Food', icon: '🍔', color: '#F59E0B' },
  { id: 'c2', name: 'Transport', icon: '🚗', color: '#3B82F6' },
  { id: 'c3', name: 'Shopping', icon: '🛍️', color: '#EC4899' },
  { id: 'c4', name: 'Rent', icon: '🏠', color: '#EF4444' },
].map(c => ({ ...c, user_id: USER_ID, is_default: true, created_at: d(30) }));

const catById = Object.fromEntries(cats.map(c => [c.id, { id: c.id, name: c.name, icon: c.icon, color: c.color }]));

let eid = 0;
const exp = (offset, amount, catId, note, extra = {}) => ({
  id: `e${++eid}`, user_id: USER_ID, amount, note, date: d(offset),
  category_id: catId, category: catId ? catById[catId] : null,
  payment_mode: 'upi', type: 'expense', cashback_amount: 0,
  created_at: d(offset) + 'T10:00:00Z', ...extra,
});

export function buildFixtures({ onboarded = true } = {}) {
  return {
    profiles: [{
      id: USER_ID, full_name: 'Test User', currency: 'INR', monthly_income: 60000,
      payday_day: 1, current_streak: 3, longest_streak: 5, last_streak_date: d(0),
      investing_experience: 'beginner', risk_tolerance: 'medium',
      investing_goal: 'build_safety_net', safety_net: 'none',
      onboarded_at: onboarded ? d(10) + 'T09:00:00Z' : null,
    }],
    categories: cats,
    expenses: [
      exp(0, 180, 'c1', 'Swiggy lunch'),
      exp(1, 520, 'c1', 'Zomato dinner'),
      exp(2, 1250, 'c3', 'Amazon order'),
      exp(5, 15000, 'c4', 'Rent'),
      exp(2, 60000, null, 'Salary', { type: 'income', category_id: null, category: null }),
    ],
    budgets: [
      { id: 'b1', user_id: USER_ID, category_id: 'c1', month: monthFirst, limit_amount: 6000 },
    ],
    goals: [
      { id: 'g1', user_id: USER_ID, name: 'Emergency Fund', kind: 'emergency_fund', target_amount: 120000, current_amount: 30000, created_at: d(9) },
    ],
    investments: [],
    emis: [
      { id: 'em1', user_id: USER_ID, name: 'Bike loan', principal: 80000, emi_amount: 3000, interest_rate: 11, start_date: d(95), tenure_months: 24, category_id: null, created_at: d(95) },
    ],
    bills: [],
    recurring_expenses: [],
    assets: [],
    liabilities: [],
    wishlist_items: [
      { id: 'w1', user_id: USER_ID, name: 'Noise-cancelling headphones', amount: 24000, note: 'For focus at work', decided_at: null, decision: null, created_at: d(31) + 'T10:00:00Z' },
    ],
    tax_declarations: [
      { id: 't1', user_id: USER_ID, name: 'PPF deposit', section: '80C', amount: 50000, financial_year: currentFY(), created_at: d(20) },
    ],
    user_journey_state: [{
      user_id: USER_ID, content_version: 1, current_level_id: 'l1',
      unlocked_level_ids: ['l1'], completed_level_ids: [], criteria_snapshot: {}, xp: 0, updated_at: d(0),
    }],
    user_lesson_progress: [],
    weekly_reviews: [],
    ai_suggestions: [],
  };
}

export async function mockBackend(page, { onboarded = true } = {}) {
  const fixtures = buildFixtures({ onboarded });
  const session = {
    access_token: 'fake.jwt.token',
    token_type: 'bearer',
    expires_in: 86400,
    expires_at: Math.floor(Date.now() / 1000) + 86400,
    refresh_token: 'fake-refresh',
    user: {
      id: USER_ID, aud: 'authenticated', role: 'authenticated',
      email: 'test@example.com', user_metadata: { full_name: 'Test User' },
      app_metadata: { provider: 'email' }, created_at: d(30),
    },
  };

  await page.route('**/auth/v1/**', (r) => {
    const url = r.request().url();
    if (url.includes('/user')) return r.fulfill({ json: session.user });
    if (url.includes('/token')) return r.fulfill({ json: session });
    return r.fulfill({ json: {} });
  });

  await page.route('**/rest/v1/**', (r) => {
    const url = new URL(r.request().url());
    const table = url.pathname.split('/rest/v1/')[1];
    const rows = fixtures[table] ?? [];
    const accept = r.request().headers()['accept'] || '';
    const method = r.request().method();
    if (method === 'HEAD') return r.fulfill({ status: 200, headers: { 'content-range': `0-${rows.length}/${rows.length}` } });
    if (method !== 'GET') {
      let body = {};
      try { body = JSON.parse(r.request().postData() || '{}'); } catch { /* empty */ }
      const row = Array.isArray(body) ? body[0] : body;
      return r.fulfill({ json: accept.includes('vnd.pgrst.object') ? { id: 'new', ...row } : [{ id: 'new', ...row }] });
    }
    if (accept.includes('vnd.pgrst.object')) {
      return r.fulfill(rows.length ? { json: rows[0] } : { status: 406, json: { message: 'no rows' } });
    }
    return r.fulfill({ json: rows });
  });

  await page.route('**/functions/v1/**', (r) => r.fulfill({ json: { reply: 'Mock coach reply', suggestion: 'Mock suggestion', review: null } }));
  await page.route('**/realtime/**', (r) => r.abort());

  await page.addInitScript(([key, value]) => {
    window.localStorage.setItem(key, value);
    window.localStorage.setItem('rupee-auth-reset-2026-07-07', 'true');
    window.localStorage.setItem('rt-theme', 'light');
  }, ['rupee-auth-token-v2', JSON.stringify(session)]);
}
