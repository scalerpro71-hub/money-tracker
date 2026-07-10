-- Coach features: decision journal, cooling-off wishlist, insurance cover

-- Decision journal: why the user bought each investment
ALTER TABLE investments ADD COLUMN IF NOT EXISTS reason text;

-- 30-day cooling-off wishlist
CREATE TABLE IF NOT EXISTS wishlist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  amount numeric(12,2) NOT NULL CHECK (amount > 0),
  note text,
  decided_at timestamptz,
  decision text CHECK (decision IN ('bought', 'skipped')),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_wishlist" ON wishlist_items USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Insurance cover for the protection gap check
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS term_cover numeric(14,2),
  ADD COLUMN IF NOT EXISTS health_cover numeric(14,2);
