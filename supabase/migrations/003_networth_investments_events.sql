-- Net Worth: assets and liabilities
CREATE TABLE IF NOT EXISTS assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  category text NOT NULL DEFAULT 'other', -- bank, fd, gold, property, other
  value numeric(14,2) NOT NULL DEFAULT 0,
  updated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_assets" ON assets USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS liabilities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  category text NOT NULL DEFAULT 'other', -- homeloan, carloan, creditcard, other
  amount numeric(14,2) NOT NULL DEFAULT 0,
  updated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE liabilities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_liabilities" ON liabilities USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Investments: SIP, MF, FD, stocks
CREATE TABLE IF NOT EXISTS investments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL DEFAULT 'mf', -- mf, sip, fd, stock, ppf, nps, other
  invested_amount numeric(14,2) NOT NULL DEFAULT 0,
  current_value numeric(14,2),
  monthly_amount numeric(12,2), -- for SIP
  start_date date,
  maturity_date date,
  notes text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_investments" ON investments USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Events / festival budgets
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  budget numeric(12,2) NOT NULL,
  start_date date,
  end_date date,
  icon text DEFAULT '🎉',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_events" ON events USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Link expenses to events
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS event_id uuid REFERENCES events(id);
