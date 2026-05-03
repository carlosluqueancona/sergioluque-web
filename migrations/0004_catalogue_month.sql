-- 0004 — Add internal `month` to catalogue.
--
-- Used only for ordering pieces composed in the same year. Not
-- rendered publicly on /catalogue — the visible year stays as
-- `year_text` (e.g. "2020 – 2021", "2014, rev. 2019").
--
-- Values: 1–12 (January–December). 0 means "unset" and sorts last
-- within its year under DESC, which keeps legacy rows untouched.
--
-- The /catalogue list query becomes:
--   ORDER BY year_sort DESC, month DESC, sort_order ASC, id ASC
--
-- How to apply:
--
--   wrangler d1 execute sergioluque-db \
--     --file=migrations/0004_catalogue_month.sql --remote
--
-- Drop --remote to apply against the local D1 dev database first.

ALTER TABLE catalogue ADD COLUMN month INTEGER DEFAULT 0;
