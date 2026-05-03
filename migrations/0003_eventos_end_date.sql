-- 0003 — Add optional `event_end_date` to eventos.
--
-- Enables multi-day events (festivals, residencies, exhibitions). The
-- existing `event_date` becomes the start date. When `event_end_date`
-- is empty, the event is single-day and renders as before.
--
-- The /news upcoming/past filter switches to COALESCE(end, start) so
-- a multi-day event stays "upcoming" until its end date passes.
--
-- How to apply:
--
--   wrangler d1 execute sergioluque-db \
--     --file=migrations/0003_eventos_end_date.sql --remote
--
-- Drop --remote to apply against the local D1 dev database first.

ALTER TABLE eventos ADD COLUMN event_end_date TEXT DEFAULT '';
