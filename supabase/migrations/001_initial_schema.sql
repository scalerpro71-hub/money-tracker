-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Default categories seed table
CREATE TABLE IF NOT EXISTS default_categories_seed (
  name text NOT NULL,
  icon text NOT NULL,
  color text NOT NULL
);

INSERT INTO default_categories_seed (name, icon, color) VALUES
  ('Food', '🍛', '#F97316'),
  ('Transport', '🚗', '#3B82F6'),
  ('Shopping', '🛍️', '#A855F7'),
  ('Entertainment', '🎬', '#EC4899'),
  ('Health', '💊', '#10B981'),
  ('Utilities', '💡', '#F59E0B'),
  ('Rent', '🏠', '#6366F1'),
  ('Education', '📚', '#14B8A6'),
  ('Other', '💰', '#6B7280');

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  currency text DEFAULT 'INR',
  monthly_income numeric(12,2),
  created_at timestamptz DEFAULT now()
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  icon text NOT NULL DEFAULT '💰',
  color text NOT NULL DEFAULT '#6B7280',
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  amount numeric(12,2) NOT NULL CHECK (amount > 0),
  note text,
  date date NOT NULL DEFAULT CURRENT_DATE,
  payment_mode text NOT NULL DEFAULT 'upi' CHECK (payment_mode IN ('upi', 'cash', 'card', 'netbanking')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS expenses_user_date_idx ON expenses (user_id, date DESC);

-- Budgets table
CREATE TABLE IF NOT EXISTS budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category_id uuid REFERENCES categories(id) ON DELETE CASCADE NOT NULL,
  month date NOT NULL,
  limit_amount numeric(12,2) NOT NULL CHECK (limit_amount > 0),
  UNIQUE(user_id, category_id, month)
);

-- Goals table
CREATE TABLE IF NOT EXISTS goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  target_amount numeric(12,2) NOT NULL CHECK (target_amount > 0),
  current_amount numeric(12,2) DEFAULT 0,
  target_date date,
  created_at timestamptz DEFAULT now()
);

-- Recurring expenses table
CREATE TABLE IF NOT EXISTS recurring_expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
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

-- AI suggestions cache
CREATE TABLE IF NOT EXISTS ai_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  feature text NOT NULL CHECK (feature IN ('spending_patterns', 'budget_advice', 'anomaly_alerts', 'savings_plan')),
  prompt_hash text,
  response text NOT NULL,
  generated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, feature)
);

-- Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_profiles" ON profiles USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "users_own_categories" ON categories USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users_own_expenses" ON expenses USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users_own_budgets" ON budgets USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users_own_goals" ON goals USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users_own_recurring" ON recurring_expenses USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users_own_ai_suggestions" ON ai_suggestions USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Signup trigger: create profile + seed categories
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles(id) VALUES (NEW.id);
  INSERT INTO categories(user_id, name, icon, color, is_default)
  SELECT NEW.id, name, icon, color, true
  FROM default_categories_seed;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Updated_at trigger for expenses
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER expenses_updated_at
  BEFORE UPDATE ON expenses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
