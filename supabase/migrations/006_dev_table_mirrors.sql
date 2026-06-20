-- Dev/prod table separation: dev_-prefixed mirrors of every user-data table.
-- Schema must stay in sync with 001-005 whenever a real table changes.
-- auth.users stays shared (one QA test user); default_categories_seed stays
-- shared (global reference data, not user data) - everything else is mirrored
-- so dev/QA traffic never touches real user rows.

CREATE TABLE IF NOT EXISTS dev_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  currency text DEFAULT 'INR',
  monthly_income numeric(12,2),
  created_at timestamptz DEFAULT now(),
  payday_day int CHECK (payday_day BETWEEN 1 AND 31),
  current_streak int DEFAULT 0,
  longest_streak int DEFAULT 0,
  last_streak_date date,
  investing_experience text DEFAULT 'beginner',
  risk_tolerance text CHECK (risk_tolerance IN ('low', 'medium', 'high')),
  investing_goal text,
  safety_net text CHECK (safety_net IN ('family_support', 'own_emergency_fund', 'none'))
);
ALTER TABLE dev_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_dev_profiles" ON dev_profiles USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE TABLE IF NOT EXISTS dev_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  icon text NOT NULL DEFAULT '💰',
  color text NOT NULL DEFAULT '#6B7280',
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE dev_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_dev_categories" ON dev_categories USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS dev_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  budget numeric(12,2) NOT NULL,
  start_date date,
  end_date date,
  icon text DEFAULT '🎉',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE dev_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_dev_events" ON dev_events USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS dev_expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category_id uuid REFERENCES dev_categories(id) ON DELETE SET NULL,
  amount numeric(12,2) NOT NULL CHECK (amount > 0),
  note text,
  date date NOT NULL DEFAULT CURRENT_DATE,
  payment_mode text NOT NULL DEFAULT 'upi' CHECK (payment_mode IN ('upi', 'cash', 'card', 'netbanking')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  event_id uuid REFERENCES dev_events(id),
  cashback_amount numeric(10,2) DEFAULT 0,
  type text DEFAULT 'expense'
);
CREATE INDEX IF NOT EXISTS dev_expenses_user_date_idx ON dev_expenses (user_id, date DESC);
ALTER TABLE dev_expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_dev_expenses" ON dev_expenses USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS dev_budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category_id uuid REFERENCES dev_categories(id) ON DELETE CASCADE NOT NULL,
  month date NOT NULL,
  limit_amount numeric(12,2) NOT NULL CHECK (limit_amount > 0),
  UNIQUE(user_id, category_id, month)
);
ALTER TABLE dev_budgets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_dev_budgets" ON dev_budgets USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS dev_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  target_amount numeric(12,2) NOT NULL CHECK (target_amount > 0),
  current_amount numeric(12,2) DEFAULT 0,
  target_date date,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE dev_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_dev_goals" ON dev_goals USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS dev_recurring_expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category_id uuid REFERENCES dev_categories(id) ON DELETE SET NULL,
  name text NOT NULL,
  amount numeric(12,2) NOT NULL CHECK (amount > 0),
  frequency text NOT NULL DEFAULT 'monthly' CHECK (frequency IN ('monthly', 'weekly')),
  day_of_month int CHECK (day_of_month BETWEEN 1 AND 28),
  day_of_week int CHECK (day_of_week BETWEEN 0 AND 6),
  payment_mode text NOT NULL DEFAULT 'upi' CHECK (payment_mode IN ('upi', 'cash', 'card', 'netbanking')),
  is_active boolean DEFAULT true,
  last_logged_at date,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE dev_recurring_expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_dev_recurring" ON dev_recurring_expenses USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS dev_ai_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  feature text NOT NULL CHECK (feature IN ('spending_patterns', 'budget_advice', 'anomaly_alerts', 'savings_plan')),
  prompt_hash text,
  response text NOT NULL,
  generated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, feature)
);
ALTER TABLE dev_ai_suggestions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_dev_ai_suggestions" ON dev_ai_suggestions USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS dev_emis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  principal numeric(12,2) NOT NULL,
  emi_amount numeric(12,2) NOT NULL,
  interest_rate numeric(5,2) DEFAULT 0,
  start_date date NOT NULL,
  tenure_months int NOT NULL,
  category_id uuid REFERENCES dev_categories(id),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE dev_emis ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_dev_emis" ON dev_emis USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS dev_bills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  amount numeric(12,2) NOT NULL,
  due_day int NOT NULL CHECK (due_day BETWEEN 1 AND 31),
  category_id uuid REFERENCES dev_categories(id),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE dev_bills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_dev_bills" ON dev_bills USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS dev_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  category text NOT NULL DEFAULT 'other',
  value numeric(14,2) NOT NULL DEFAULT 0,
  updated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE dev_assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_dev_assets" ON dev_assets USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS dev_liabilities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  category text NOT NULL DEFAULT 'other',
  amount numeric(14,2) NOT NULL DEFAULT 0,
  updated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE dev_liabilities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_dev_liabilities" ON dev_liabilities USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS dev_investments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL DEFAULT 'mf',
  invested_amount numeric(14,2) NOT NULL DEFAULT 0,
  current_value numeric(14,2),
  monthly_amount numeric(12,2),
  start_date date,
  maturity_date date,
  notes text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE dev_investments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_dev_investments" ON dev_investments USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS dev_tax_declarations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  section text NOT NULL DEFAULT '80C',
  amount numeric(12,2) NOT NULL DEFAULT 0,
  financial_year text NOT NULL DEFAULT '2024-25',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE dev_tax_declarations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_dev_tax" ON dev_tax_declarations USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
