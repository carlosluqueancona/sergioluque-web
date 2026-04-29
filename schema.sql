-- Sergio Luque CMS — D1 Schema (English-only, post-monolingual collapse)
-- Run: npx wrangler d1 execute sergioluque-db --file=schema.sql

-- Settings (singleton — key/value)
-- Recognised keys after migration:
--   bio, bio_short, profile_image_url, cv_pdf_url, email,
--   social_twitter, social_instagram, social_youtube, social_soundcloud,
--   social_bandcamp, social_facebook, social_linkedin
CREATE TABLE IF NOT EXISTS settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT ''
);

-- Obras
-- Note: `duration` is the composer's authored length string ("12'30"). A
-- previous numeric `audio_duration` column was removed — the AudioPlayer
-- reads the file's real length from `<audio>.duration` on metadata load,
-- so storing it manually only added friction. Drop it on existing DBs:
--   wrangler d1 execute sergioluque-db --remote \
--     --command "ALTER TABLE obras DROP COLUMN audio_duration"
CREATE TABLE IF NOT EXISTS obras (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  title            TEXT NOT NULL DEFAULT '',
  slug             TEXT NOT NULL DEFAULT '' UNIQUE,
  year             INTEGER,
  instrumentation  TEXT DEFAULT '',
  duration         TEXT DEFAULT '',
  description      TEXT DEFAULT '',
  audio_url        TEXT DEFAULT '',
  image_url        TEXT DEFAULT '',
  premiere_date    TEXT DEFAULT '',
  premiere_venue   TEXT DEFAULT '',
  premiere_city    TEXT DEFAULT '',
  commissions      TEXT DEFAULT '',
  ensembles        TEXT DEFAULT '',
  is_featured      INTEGER DEFAULT 0,
  sort_order       INTEGER DEFAULT 0,
  created_at       TEXT DEFAULT (datetime('now')),
  updated_at       TEXT DEFAULT (datetime('now'))
);

-- Blog posts
-- `is_featured` drives the "Selected writing" section on the home page.
-- Migration for existing databases:
--   wrangler d1 execute sergioluque-db --remote \
--     --command "ALTER TABLE posts ADD COLUMN is_featured INTEGER DEFAULT 0"
CREATE TABLE IF NOT EXISTS posts (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  title        TEXT NOT NULL DEFAULT '',
  slug         TEXT NOT NULL DEFAULT '' UNIQUE,
  body         TEXT DEFAULT '',
  excerpt      TEXT DEFAULT '',
  image_url    TEXT DEFAULT '',
  tags         TEXT DEFAULT '',
  status       TEXT DEFAULT 'draft',
  is_featured  INTEGER DEFAULT 0,
  published_at TEXT DEFAULT NULL,
  created_at   TEXT DEFAULT (datetime('now')),
  updated_at   TEXT DEFAULT (datetime('now'))
);

-- Proyectos
CREATE TABLE IF NOT EXISTS proyectos (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  title        TEXT NOT NULL DEFAULT '',
  slug         TEXT NOT NULL DEFAULT '' UNIQUE,
  year         INTEGER,
  description  TEXT DEFAULT '',
  images       TEXT DEFAULT '[]',
  links        TEXT DEFAULT '[]',
  is_featured  INTEGER DEFAULT 0,
  created_at   TEXT DEFAULT (datetime('now')),
  updated_at   TEXT DEFAULT (datetime('now'))
);

-- Eventos / Concerts
CREATE TABLE IF NOT EXISTS eventos (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  title          TEXT NOT NULL DEFAULT '',
  event_date     TEXT NOT NULL,
  venue          TEXT DEFAULT '',
  city           TEXT DEFAULT '',
  country        TEXT DEFAULT '',
  description    TEXT DEFAULT '',
  external_link  TEXT DEFAULT '',
  image_url      TEXT DEFAULT '',
  created_at     TEXT DEFAULT (datetime('now')),
  updated_at     TEXT DEFAULT (datetime('now'))
);

-- Publications
CREATE TABLE IF NOT EXISTS publicaciones (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  title       TEXT NOT NULL DEFAULT '',
  journal     TEXT DEFAULT '',
  year        INTEGER,
  abstract    TEXT DEFAULT '',
  pdf_url     TEXT DEFAULT '',
  doi         TEXT DEFAULT '',
  image_url   TEXT DEFAULT '',
  created_at  TEXT DEFAULT (datetime('now')),
  updated_at  TEXT DEFAULT (datetime('now'))
);

-- Catalogue — flat list of works (separate from `obras` which carries
-- richer per-work pages). Two categories: 'vocal_instrumental_mixed'
-- and 'electroacoustic'. year_text keeps the operator's original
-- string ("2020 – 2021", "2014, rev. 2019"); year_sort holds the
-- numeric end-year used for ordering.
-- Migration for existing databases:
--   wrangler d1 execute sergioluque-db --remote --file schema.sql
-- (or copy just the CREATE TABLE block for catalogue.)
CREATE TABLE IF NOT EXISTS catalogue (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  category        TEXT NOT NULL DEFAULT 'vocal_instrumental_mixed',
  title           TEXT NOT NULL DEFAULT '',
  year_text       TEXT DEFAULT '',
  year_sort       INTEGER DEFAULT 0,
  instrumentation TEXT DEFAULT '',
  notes           TEXT DEFAULT '',
  description     TEXT DEFAULT '',
  image_url       TEXT DEFAULT '',
  score_url       TEXT DEFAULT '',
  listen_url      TEXT DEFAULT '',
  patch_url       TEXT DEFAULT '',
  video_url       TEXT DEFAULT '',
  lossless_url    TEXT DEFAULT '',
  is_featured     INTEGER DEFAULT 0,
  sort_order      INTEGER DEFAULT 0,
  created_at      TEXT DEFAULT (datetime('now')),
  updated_at      TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_catalogue_category ON catalogue(category, year_sort DESC);
CREATE INDEX IF NOT EXISTS idx_catalogue_featured ON catalogue(is_featured);

-- Admin users
CREATE TABLE IF NOT EXISTS admin_users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at    TEXT DEFAULT (datetime('now'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_obras_featured ON obras(is_featured);
CREATE INDEX IF NOT EXISTS idx_obras_year ON obras(year DESC);
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_eventos_date ON eventos(event_date);
