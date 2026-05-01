-- 0002 — Add `body` to the eventos table.
--
-- Long-form free text rendered below the existing `description` on
-- /news via PostBody. Empty default so existing rows stay valid.
--
-- How to apply (from a developer workstation, not via the admin
-- routes — those were removed in CN-004):
--
--   wrangler d1 execute sergioluque-db \
--     --file=migrations/0002_eventos_body.sql --remote
--
-- Drop --remote to apply against the local D1 dev database first.

ALTER TABLE eventos ADD COLUMN body TEXT DEFAULT '';
