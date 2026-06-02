-- EMI tracker
CREATE TABLE IF NOT EXISTS emis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  principal numeric(12,2) NOT NULL,
  emi_amount numeric(12,2) NOT NULL,
  interest_rate numeric(5,2) DEFAULT 0,
  start_date date NOT NULL,
  tenure_months int NOT NULL,
  category_id uuid REFERENCES categories(id),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE emis ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_emis" ON emis USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Bill reminders
CREATE TABLE IF NOT EXISTS bills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  amount numeric(12,2) NOT NULL,
  due_day int NOT NULL CHECK (due_day BETWEEN 1 AND 31),
  category_id uuid REFERENCES categories(id),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_bills" ON bills USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Extend profiles: payday, streak
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS payday_day int CHECK (payday_day BETWEEN 1 AND 31),
  ADD COLUMN IF NOT EXISTS current_streak int DEFAULT 0,
  ADD COLUMN IF NOT EXISTS longest_streak int DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_streak_date date;
