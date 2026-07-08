-- The ai-suggest edge function serves more features than the original four,
-- and the coach adds more still - the whitelist CHECK only blocks caching.
ALTER TABLE ai_suggestions DROP CONSTRAINT IF EXISTS ai_suggestions_feature_check;
ALTER TABLE ai_suggestions ADD CONSTRAINT ai_suggestions_feature_check CHECK (feature <> '');
