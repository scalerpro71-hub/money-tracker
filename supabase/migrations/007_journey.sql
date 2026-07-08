-- Journey engine: coach state, lesson progress, weekly reviews

-- Onboarding completion marker (the wizard writes this when finished)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarded_at timestamptz;

-- One row per user: where they are on the journey
CREATE TABLE IF NOT EXISTS user_journey_state (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  content_version int NOT NULL DEFAULT 1,
  current_level_id text NOT NULL DEFAULT 'l1',
  unlocked_level_ids text[] NOT NULL DEFAULT '{l1}',
  completed_level_ids text[] NOT NULL DEFAULT '{}',
  criteria_snapshot jsonb NOT NULL DEFAULT '{}',
  xp int NOT NULL DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

-- Per-lesson progress (lesson ids live in src/content/journey, not the DB)
CREATE TABLE IF NOT EXISTS user_lesson_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  lesson_id text NOT NULL,
  status text NOT NULL DEFAULT 'started' CHECK (status IN ('started', 'quiz_passed', 'completed')),
  quiz_score int,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

-- AI-generated weekly/monthly reviews
CREATE TABLE IF NOT EXISTS weekly_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  period_start date NOT NULL,
  period_type text NOT NULL DEFAULT 'week' CHECK (period_type IN ('week', 'month')),
  metrics jsonb NOT NULL DEFAULT '{}',
  ai_summary text,
  read_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, period_start, period_type)
);

CREATE INDEX IF NOT EXISTS idx_lesson_progress_user ON user_lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_weekly_reviews_user ON weekly_reviews(user_id, period_start DESC);

ALTER TABLE user_journey_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_journey_state" ON user_journey_state USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users_own_lesson_progress" ON user_lesson_progress USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users_own_weekly_reviews" ON weekly_reviews USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
