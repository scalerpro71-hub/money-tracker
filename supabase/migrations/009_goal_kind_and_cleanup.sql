-- Emergency fund becomes a first-class goal kind for the journey engine
ALTER TABLE goals ADD COLUMN IF NOT EXISTS kind text NOT NULL DEFAULT 'custom'
  CHECK (kind IN ('custom', 'emergency_fund'));

-- Drop the dev_ table mirrors (migration 006): the VITE_TABLE_PREFIX proxy is
-- being removed with the coach rebuild - one schema, no manual sync burden.
DROP TABLE IF EXISTS dev_tax_declarations;
DROP TABLE IF EXISTS dev_investments;
DROP TABLE IF EXISTS dev_liabilities;
DROP TABLE IF EXISTS dev_assets;
DROP TABLE IF EXISTS dev_bills;
DROP TABLE IF EXISTS dev_emis;
DROP TABLE IF EXISTS dev_ai_suggestions;
DROP TABLE IF EXISTS dev_recurring_expenses;
DROP TABLE IF EXISTS dev_budgets;
DROP TABLE IF EXISTS dev_goals;
DROP TABLE IF EXISTS dev_expenses;
DROP TABLE IF EXISTS dev_events;
DROP TABLE IF EXISTS dev_categories;
DROP TABLE IF EXISTS dev_profiles;
