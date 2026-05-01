-- 0001 — Add `recorded_at` to the obras table.
--
-- Free-text field shown on /listen/[slug] as "Recorded at" (after
-- "Performed by", before "Premiere"). Empty default so existing rows
-- stay valid. Idempotent on a fresh schema, but D1 returns an error
-- if the column already exists — re-run after dropping the column or
-- skip if it already landed.
--
-- How to apply (from a developer workstation, not via the admin
-- routes — those were removed in CN-004):
--
--   wrangler d1 execute sergioluque-db \
--     --file=migrations/0001_obras_recorded_at.sql --remote
--
-- Drop --remote to apply against the local D1 dev database first.

ALTER TABLE obras ADD COLUMN recorded_at TEXT DEFAULT '';
