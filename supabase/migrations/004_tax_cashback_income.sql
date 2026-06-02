-- Tax / 80C declarations
CREATE TABLE IF NOT EXISTS tax_declarations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  section text NOT NULL DEFAULT '80C', -- 80C, 80D, 80G, HRA, other
  amount numeric(12,2) NOT NULL DEFAULT 0,
  financial_year text NOT NULL DEFAULT '2024-25',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE tax_declarations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_tax" ON tax_declarations USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Cashback and income fields on expenses
ALTER TABLE expenses
  ADD COLUMN IF NOT EXISTS cashback_amount numeric(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS type text DEFAULT 'expense'; -- 'expense' | 'income'
