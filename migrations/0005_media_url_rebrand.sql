-- 0005 — Rebrand existing media URLs from the workers.dev hostname to
-- the new custom domain media.sergioluque.com.
--
-- The Worker now binds to both hostnames so legacy URLs keep working,
-- but every fresh upload writes the new domain via MEDIA_PUBLIC_URL.
-- This migration replaces the old hostname in every TEXT column that
-- can hold a media URL across all content tables, so the DB matches
-- what new uploads produce.
--
-- REPLACE is a no-op for rows that don't contain the substring, so
-- the WHERE clauses are omitted — they tripped SQLite's
-- "LIKE or GLOB pattern too complex" guard on the hyphenated host.
-- Idempotent: running this twice changes nothing on the second run.
--
-- How to apply:
--
--   wrangler d1 execute sergioluque-db \
--     --file=migrations/0005_media_url_rebrand.sql --remote

-- obras
UPDATE obras         SET audio_url    = REPLACE(audio_url,    'https://sergioluque-cms.carlosluque-095.workers.dev', 'https://media.sergioluque.com');
UPDATE obras         SET image_url    = REPLACE(image_url,    'https://sergioluque-cms.carlosluque-095.workers.dev', 'https://media.sergioluque.com');

-- posts
UPDATE posts         SET image_url    = REPLACE(image_url,    'https://sergioluque-cms.carlosluque-095.workers.dev', 'https://media.sergioluque.com');

-- proyectos (images stored as JSON array of {url})
UPDATE proyectos     SET images       = REPLACE(images,       'https://sergioluque-cms.carlosluque-095.workers.dev', 'https://media.sergioluque.com');

-- eventos
UPDATE eventos       SET image_url    = REPLACE(image_url,    'https://sergioluque-cms.carlosluque-095.workers.dev', 'https://media.sergioluque.com');

-- publicaciones
UPDATE publicaciones SET pdf_url      = REPLACE(pdf_url,      'https://sergioluque-cms.carlosluque-095.workers.dev', 'https://media.sergioluque.com');
UPDATE publicaciones SET image_url    = REPLACE(image_url,    'https://sergioluque-cms.carlosluque-095.workers.dev', 'https://media.sergioluque.com');

-- catalogue
UPDATE catalogue     SET image_url    = REPLACE(image_url,    'https://sergioluque-cms.carlosluque-095.workers.dev', 'https://media.sergioluque.com');
UPDATE catalogue     SET score_url    = REPLACE(score_url,    'https://sergioluque-cms.carlosluque-095.workers.dev', 'https://media.sergioluque.com');
UPDATE catalogue     SET listen_url   = REPLACE(listen_url,   'https://sergioluque-cms.carlosluque-095.workers.dev', 'https://media.sergioluque.com');
UPDATE catalogue     SET patch_url    = REPLACE(patch_url,    'https://sergioluque-cms.carlosluque-095.workers.dev', 'https://media.sergioluque.com');
UPDATE catalogue     SET video_url    = REPLACE(video_url,    'https://sergioluque-cms.carlosluque-095.workers.dev', 'https://media.sergioluque.com');
UPDATE catalogue     SET lossless_url = REPLACE(lossless_url, 'https://sergioluque-cms.carlosluque-095.workers.dev', 'https://media.sergioluque.com');

-- settings (single-row key/value table — free-text URLs live in `value`)
UPDATE settings      SET value        = REPLACE(value,        'https://sergioluque-cms.carlosluque-095.workers.dev', 'https://media.sergioluque.com');
