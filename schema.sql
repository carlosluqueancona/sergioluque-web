-- Sergio Luque CMS — D1 Schema
-- Run: npx wrangler d1 execute sergioluque-db --file=schema.sql

-- Settings (singleton)
CREATE TABLE IF NOT EXISTS settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT ''
);

-- Obras
CREATE TABLE IF NOT EXISTS obras (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  title_es         TEXT NOT NULL,
  title_en         TEXT NOT NULL DEFAULT '',
  slug_es          TEXT NOT NULL UNIQUE,
  slug_en          TEXT NOT NULL DEFAULT '',
  year             INTEGER,
  instrumentation_es TEXT DEFAULT '',
  instrumentation_en TEXT DEFAULT '',
  duration         TEXT DEFAULT '',
  description_es   TEXT DEFAULT '',
  description_en   TEXT DEFAULT '',
  audio_url        TEXT DEFAULT '',
  audio_duration   INTEGER DEFAULT 0,
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
CREATE TABLE IF NOT EXISTS posts (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  title_es     TEXT NOT NULL,
  title_en     TEXT NOT NULL DEFAULT '',
  slug_es      TEXT NOT NULL UNIQUE,
  slug_en      TEXT NOT NULL DEFAULT '',
  body_es      TEXT DEFAULT '',
  body_en      TEXT DEFAULT '',
  excerpt_es   TEXT DEFAULT '',
  excerpt_en   TEXT DEFAULT '',
  tags         TEXT DEFAULT '',
  status       TEXT DEFAULT 'draft',
  published_at TEXT DEFAULT NULL,
  created_at   TEXT DEFAULT (datetime('now')),
  updated_at   TEXT DEFAULT (datetime('now'))
);

-- Proyectos
CREATE TABLE IF NOT EXISTS proyectos (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  title_es       TEXT NOT NULL,
  title_en       TEXT NOT NULL DEFAULT '',
  slug_es        TEXT NOT NULL UNIQUE,
  slug_en        TEXT NOT NULL DEFAULT '',
  year           INTEGER,
  description_es TEXT DEFAULT '',
  description_en TEXT DEFAULT '',
  images         TEXT DEFAULT '[]',
  links          TEXT DEFAULT '[]',
  is_featured    INTEGER DEFAULT 0,
  created_at     TEXT DEFAULT (datetime('now')),
  updated_at     TEXT DEFAULT (datetime('now'))
);

-- Eventos / Conciertos
CREATE TABLE IF NOT EXISTS eventos (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  title_es       TEXT NOT NULL,
  title_en       TEXT NOT NULL DEFAULT '',
  event_date     TEXT NOT NULL,
  venue          TEXT DEFAULT '',
  city           TEXT DEFAULT '',
  country        TEXT DEFAULT '',
  description_es TEXT DEFAULT '',
  description_en TEXT DEFAULT '',
  external_link  TEXT DEFAULT '',
  created_at     TEXT DEFAULT (datetime('now')),
  updated_at     TEXT DEFAULT (datetime('now'))
);

-- Publicaciones académicas
CREATE TABLE IF NOT EXISTS publicaciones (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  title_es    TEXT NOT NULL,
  title_en    TEXT NOT NULL DEFAULT '',
  journal     TEXT DEFAULT '',
  year        INTEGER,
  abstract_es TEXT DEFAULT '',
  abstract_en TEXT DEFAULT '',
  pdf_url     TEXT DEFAULT '',
  doi         TEXT DEFAULT '',
  created_at  TEXT DEFAULT (datetime('now')),
  updated_at  TEXT DEFAULT (datetime('now'))
);

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
