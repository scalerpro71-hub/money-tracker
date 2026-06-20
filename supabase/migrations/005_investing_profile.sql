-- Extend profiles: investing coach onboarding answers
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS investing_experience text DEFAULT 'beginner',
  ADD COLUMN IF NOT EXISTS risk_tolerance text CHECK (risk_tolerance IN ('low', 'medium', 'high')),
  ADD COLUMN IF NOT EXISTS investing_goal text,
  ADD COLUMN IF NOT EXISTS safety_net text CHECK (safety_net IN ('family_support', 'own_emergency_fund', 'none'));
