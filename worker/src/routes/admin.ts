import { Hono } from 'hono';
import type { Env } from '../types';
import {
  requireAuth,
  signJWT,
  hashPassword,
  json,
  jsonError,
  corsHeaders,
  getAllowedOrigins,
} from '../lib/shared';

const admin = new Hono<{ Bindings: Env }>();

// ── Helper ────────────────────────────────────────────────────────────────

function getCors(
  req: Request,
  env: Env,
  methods = 'GET, POST, PUT, DELETE, OPTIONS'
): Record<string, string> {
  const origin = req.headers.get('origin') ?? '';
  return corsHeaders(origin, getAllowedOrigins(env), methods);
}

async function guardAuth(
  req: Request,
  env: Env
): Promise<Record<string, unknown> | null> {
  return requireAuth(req, env);
}

// ── Auth ──────────────────────────────────────────────────────────────────

admin.post('/login', async (c) => {
  const cors = getCors(c.req.raw, c.env, 'POST, OPTIONS');
  let body: { email?: string; password?: string };
  try {
    body = (await c.req.raw.json()) as { email?: string; password?: string };
  } catch {
    return jsonError('Invalid JSON', 400, cors);
  }

  const { email, password } = body;
  if (!email || !password) return jsonError('email and password required', 400, cors);

  const row = await c.env.DB.prepare(
    'SELECT id, email, password_hash FROM admin_users WHERE email = ?1 LIMIT 1'
  )
    .bind(email)
    .first<{ id: number; email: string; password_hash: string }>();

  if (!row) return jsonError('Invalid credentials', 401, cors);

  const hashed = await hashPassword(password);
  if (hashed !== row.password_hash) return jsonError('Invalid credentials', 401, cors);

  const token = await signJWT(
    { sub: String(row.id), email: row.email, exp: Date.now() + 24 * 60 * 60 * 1000 },
    c.env.JWT_SECRET
  );

  const headers: Record<string, string> = {
    ...cors,
    'Set-Cookie': `sl_admin_jwt=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=86400`,
  };
  return json({ token }, 200, headers);
});

admin.post('/logout', async (c) => {
  const cors = getCors(c.req.raw, c.env, 'POST, OPTIONS');
  const headers: Record<string, string> = {
    ...cors,
    'Set-Cookie': 'sl_admin_jwt=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0',
  };
  return json({ ok: true }, 200, headers);
});

// ── Generic CRUD factory ──────────────────────────────────────────────────

function registerCrud(
  router: Hono<{ Bindings: Env }>,
  table: string,
  columns: string[]
): void {
  const colList = columns.join(', ');
  const placeholders = columns.map((_, i) => `?${i + 1}`).join(', ');
  const updateSet = columns.map((col, i) => `${col} = ?${i + 1}`).join(', ');

  // LIST
  router.get(`/${table}`, async (c) => {
    const cors = getCors(c.req.raw, c.env);
    const payload = await guardAuth(c.req.raw, c.env);
    if (!payload) return jsonError('Unauthorized', 401, cors);

    try {
      const { results } = await c.env.DB.prepare(`SELECT * FROM ${table} ORDER BY id DESC`).all<
        Record<string, unknown>
      >();
      return json(results ?? [], 200, cors);
    } catch (err) {
      console.error(`${table} list`, err);
      return jsonError('Internal server error', 500, cors);
    }
  });

  // CREATE
  router.post(`/${table}`, async (c) => {
    const cors = getCors(c.req.raw, c.env);
    const payload = await guardAuth(c.req.raw, c.env);
    if (!payload) return jsonError('Unauthorized', 401, cors);

    let body: Record<string, unknown>;
    try {
      body = (await c.req.raw.json()) as Record<string, unknown>;
    } catch {
      return jsonError('Invalid JSON', 400, cors);
    }

    const values = columns.map((col) => body[col] ?? null);
    try {
      const result = await c.env.DB.prepare(
        `INSERT INTO ${table} (${colList}) VALUES (${placeholders})`
      )
        .bind(...values)
        .run();
      return json({ id: result.meta.last_row_id }, 201, cors);
    } catch (err) {
      console.error(`${table} create`, err);
      return jsonError('Internal server error', 500, cors);
    }
  });

  // UPDATE
  router.put(`/${table}/:id`, async (c) => {
    const cors = getCors(c.req.raw, c.env);
    const payload = await guardAuth(c.req.raw, c.env);
    if (!payload) return jsonError('Unauthorized', 401, cors);

    const id = Number(c.req.param('id'));
    let body: Record<string, unknown>;
    try {
      body = (await c.req.raw.json()) as Record<string, unknown>;
    } catch {
      return jsonError('Invalid JSON', 400, cors);
    }

    const values = columns.map((col) => body[col] ?? null);
    try {
      await c.env.DB.prepare(
        `UPDATE ${table} SET ${updateSet}, updated_at = datetime('now') WHERE id = ?${columns.length + 1}`
      )
        .bind(...values, id)
        .run();
      return json({ ok: true }, 200, cors);
    } catch (err) {
      console.error(`${table} update`, err);
      return jsonError('Internal server error', 500, cors);
    }
  });

  // DELETE
  router.delete(`/${table}/:id`, async (c) => {
    const cors = getCors(c.req.raw, c.env);
    const payload = await guardAuth(c.req.raw, c.env);
    if (!payload) return jsonError('Unauthorized', 401, cors);

    const id = Number(c.req.param('id'));
    try {
      await c.env.DB.prepare(`DELETE FROM ${table} WHERE id = ?1`).bind(id).run();
      return json({ ok: true }, 200, cors);
    } catch (err) {
      console.error(`${table} delete`, err);
      return jsonError('Internal server error', 500, cors);
    }
  });
}

// ── Register CRUD for each content table ─────────────────────────────────

// Monolingual schema after the /_migrate-monolingual run. Until that
// migration is executed, INSERT/UPDATE on these tables will fail because
// the flat columns don't exist yet.
registerCrud(admin, 'obras', [
  'title', 'slug', 'year',
  'instrumentation', 'duration',
  'description', 'audio_url',
  'image_url', 'premiere_date', 'premiere_venue', 'premiere_city',
  'commissions', 'ensembles', 'is_featured', 'sort_order',
]);

registerCrud(admin, 'posts', [
  'title', 'slug',
  'body', 'excerpt',
  'tags', 'status', 'published_at', 'image_url',
]);

registerCrud(admin, 'proyectos', [
  'title', 'slug', 'year',
  'description', 'images', 'links', 'is_featured',
]);

registerCrud(admin, 'eventos', [
  'title', 'event_date', 'venue', 'city', 'country',
  'description', 'external_link', 'image_url',
]);

registerCrud(admin, 'publicaciones', [
  'title', 'journal', 'year',
  'abstract', 'pdf_url', 'doi', 'image_url',
]);

// ── Media library — list R2 objects under a kind prefix ─────────────────
//
// GET /admin/media?kind=image|audio|pdf
// Returns the objects under images/ , audio/ , or files/ as a flat list:
//   { items: [{ key, url, size, uploadedAt, contentType }] }
// Used by the admin MediaPicker modal so creators can pick already-uploaded
// files instead of re-uploading.

const KIND_PREFIX: Record<string, string> = {
  image: 'images/',
  audio: 'audio/',
  pdf: 'files/',
};

admin.get('/media', async (c) => {
  const cors = getCors(c.req.raw, c.env);
  const payload = await guardAuth(c.req.raw, c.env);
  if (!payload) return jsonError('Unauthorized', 401, cors);

  const kind = c.req.query('kind') ?? 'image';
  const prefix = KIND_PREFIX[kind];
  if (!prefix) return jsonError('Invalid kind', 400, cors);

  // Walk all pages — R2 returns up to 1000 per page. Personal site, so
  // small total counts; just paginate until truncated=false.
  type Item = { key: string; url: string; size: number; uploadedAt: string; contentType: string };
  const items: Item[] = [];
  const baseUrl =
    c.env.MEDIA_PUBLIC_URL ??
    `https://${c.req.raw.headers.get('host') ?? 'sergioluque-cms.carlosluque-095.workers.dev'}/media`;

  let cursor: string | undefined;
  for (let i = 0; i < 10; i++) {
    const page: R2Objects = await c.env.MEDIA.list({ prefix, cursor, limit: 1000 });
    for (const obj of page.objects) {
      items.push({
        key: obj.key,
        url: `${baseUrl}/${obj.key}`,
        size: obj.size,
        uploadedAt: obj.uploaded.toISOString(),
        contentType: obj.httpMetadata?.contentType ?? '',
      });
    }
    if (!page.truncated) break;
    cursor = page.cursor;
  }

  // Newest first.
  items.sort((a, b) => (a.uploadedAt < b.uploadedAt ? 1 : -1));

  return json({ items }, 200, cors);
});

// ── One-off DB migrations ────────────────────────────────────────────────

/** Adds image_url columns to posts/eventos/publicaciones. Idempotent. */
admin.post('/_migrate-images', async (c) => {
  const cors = getCors(c.req.raw, c.env);
  const payload = await guardAuth(c.req.raw, c.env);
  if (!payload) return jsonError('Unauthorized', 401, cors);

  const tables = ['posts', 'eventos', 'publicaciones'];
  const results: Record<string, string> = {};
  for (const t of tables) {
    try {
      await c.env.DB.prepare(`ALTER TABLE ${t} ADD COLUMN image_url TEXT DEFAULT ''`).run();
      results[t] = 'added';
    } catch (err) {
      results[t] = `skipped (${(err as Error).message})`;
    }
  }
  return json({ ok: true, results }, 200, cors);
});

/**
 * Collapses every *_es / *_en column pair into a single English-only flat
 * column across the content tables. Idempotent at the ALTER level (each step
 * is wrapped in try/catch). Order: ADD flat → COPY (prefer _en, fallback _es)
 * → DROP _es and _en.
 *
 * For the settings key/value table, renames bio_long_en → bio and
 * bio_short_en → bio_short, then deletes the corresponding _es rows.
 */
admin.post('/_migrate-monolingual', async (c) => {
  const cors = getCors(c.req.raw, c.env);
  const payload = await guardAuth(c.req.raw, c.env);
  if (!payload) return jsonError('Unauthorized', 401, cors);

  // Per-table column collapse map: { table: [[base, isUnique]] }
  // base 'title' will collapse title_es + title_en into 'title'.
  const plan: Record<string, Array<{ base: string; unique?: boolean }>> = {
    obras: [
      { base: 'title' },
      { base: 'slug', unique: true },
      { base: 'instrumentation' },
      { base: 'description' },
    ],
    posts: [
      { base: 'title' },
      { base: 'slug', unique: true },
      { base: 'body' },
      { base: 'excerpt' },
    ],
    proyectos: [
      { base: 'title' },
      { base: 'slug', unique: true },
      { base: 'description' },
    ],
    eventos: [{ base: 'title' }, { base: 'description' }],
    publicaciones: [{ base: 'title' }, { base: 'abstract' }],
  };

  const log: Record<string, string[]> = {};

  for (const [table, fields] of Object.entries(plan)) {
    log[table] = [];
    for (const { base } of fields) {
      // 1. ADD flat column (NOT NULL constraint relaxed to TEXT DEFAULT '').
      try {
        await c.env.DB.prepare(`ALTER TABLE ${table} ADD COLUMN ${base} TEXT DEFAULT ''`).run();
        log[table].push(`added ${base}`);
      } catch (err) {
        log[table].push(`add ${base} skipped: ${(err as Error).message}`);
      }
      // 2. COPY: prefer _en, fall back to _es.
      try {
        await c.env.DB.prepare(
          `UPDATE ${table} SET ${base} = COALESCE(NULLIF(${base}_en, ''), ${base}_es) WHERE ${base} IS NULL OR ${base} = ''`
        ).run();
        log[table].push(`copied ${base}`);
      } catch (err) {
        log[table].push(`copy ${base} skipped: ${(err as Error).message}`);
      }
      // 3. DROP _es and _en.
      for (const lang of ['_es', '_en']) {
        try {
          await c.env.DB.prepare(`ALTER TABLE ${table} DROP COLUMN ${base}${lang}`).run();
          log[table].push(`dropped ${base}${lang}`);
        } catch (err) {
          log[table].push(`drop ${base}${lang} skipped: ${(err as Error).message}`);
        }
      }
    }
  }

    // Settings: rename bio_long_en → bio, bio_short_en → bio_short, drop _es rows.
  const settingsLog: string[] = [];
  try {
    await c.env.DB.prepare(
      `INSERT OR REPLACE INTO settings (key, value)
       SELECT 'bio', value FROM settings WHERE key = 'bio_long_en'`
    ).run();
    await c.env.DB.prepare(
      `INSERT OR REPLACE INTO settings (key, value)
       SELECT 'bio_short', value FROM settings WHERE key = 'bio_short_en'`
    ).run();
    await c.env.DB.prepare(
      `DELETE FROM settings WHERE key IN ('bio_long_es','bio_long_en','bio_short_es','bio_short_en','bio_es','bio_en')`
    ).run();
    settingsLog.push('migrated bio + bio_short keys');
  } catch (err) {
    settingsLog.push(`settings migration error: ${(err as Error).message}`);
  }

  return json({ ok: true, log, settings: settingsLog }, 200, cors);
});

/**
 * Drops the lingering NOT NULL UNIQUE legacy slug_es column (and any other
 * stragglers) by recreating the affected tables. The earlier monolingual
 * migration could not DROP slug_es directly because SQLite/D1 refuses to
 * drop a column that participates in a UNIQUE or PRIMARY KEY constraint.
 */
admin.post('/_migrate-finalize', async (c) => {
  const cors = getCors(c.req.raw, c.env);
  const payload = await guardAuth(c.req.raw, c.env);
  if (!payload) return jsonError('Unauthorized', 401, cors);

  type Recreate = { table: string; createSql: string; copyCols: string };
  const recreations: Recreate[] = [
    {
      table: 'obras',
      createSql: `CREATE TABLE obras_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL DEFAULT '',
        slug TEXT NOT NULL DEFAULT '' UNIQUE,
        year INTEGER,
        instrumentation TEXT DEFAULT '',
        duration TEXT DEFAULT '',
        description TEXT DEFAULT '',
        audio_url TEXT DEFAULT '',
        audio_duration INTEGER DEFAULT 0,
        image_url TEXT DEFAULT '',
        premiere_date TEXT DEFAULT '',
        premiere_venue TEXT DEFAULT '',
        premiere_city TEXT DEFAULT '',
        commissions TEXT DEFAULT '',
        ensembles TEXT DEFAULT '',
        is_featured INTEGER DEFAULT 0,
        sort_order INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      )`,
      copyCols: 'id, title, slug, year, instrumentation, duration, description, audio_url, audio_duration, image_url, premiere_date, premiere_venue, premiere_city, commissions, ensembles, is_featured, sort_order, created_at, updated_at',
    },
    {
      table: 'posts',
      createSql: `CREATE TABLE posts_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL DEFAULT '',
        slug TEXT NOT NULL DEFAULT '' UNIQUE,
        body TEXT DEFAULT '',
        excerpt TEXT DEFAULT '',
        image_url TEXT DEFAULT '',
        tags TEXT DEFAULT '',
        status TEXT DEFAULT 'draft',
        published_at TEXT DEFAULT NULL,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      )`,
      copyCols: 'id, title, slug, body, excerpt, image_url, tags, status, published_at, created_at, updated_at',
    },
    {
      table: 'proyectos',
      createSql: `CREATE TABLE proyectos_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL DEFAULT '',
        slug TEXT NOT NULL DEFAULT '' UNIQUE,
        year INTEGER,
        description TEXT DEFAULT '',
        images TEXT DEFAULT '[]',
        links TEXT DEFAULT '[]',
        is_featured INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      )`,
      copyCols: 'id, title, slug, year, description, images, links, is_featured, created_at, updated_at',
    },
  ];

  const log: Record<string, string[]> = {};

  for (const r of recreations) {
    log[r.table] = [];
    try {
      // 1. Create the new table with the desired schema.
      await c.env.DB.prepare(r.createSql).run();
      log[r.table].push('created _new');

      // 2. Copy rows. NULL slugs/titles get coerced to '' to satisfy NOT NULL.
      await c.env.DB.prepare(
        `INSERT INTO ${r.table}_new (${r.copyCols}) SELECT ${r.copyCols} FROM ${r.table}`
      ).run();
      log[r.table].push('copied rows');

      // 3. Drop original, rename new.
      await c.env.DB.prepare(`DROP TABLE ${r.table}`).run();
      log[r.table].push('dropped old');
      await c.env.DB.prepare(`ALTER TABLE ${r.table}_new RENAME TO ${r.table}`).run();
      log[r.table].push('renamed _new');
    } catch (err) {
      log[r.table].push(`error: ${(err as Error).message}`);
      // Try cleanup: drop _new if it exists so the next run can retry.
      try {
        await c.env.DB.prepare(`DROP TABLE ${r.table}_new`).run();
      } catch {
        // ignore
      }
    }
  }

  // Recreate indexes
  const indexes = [
    `CREATE INDEX IF NOT EXISTS idx_obras_featured ON obras(is_featured)`,
    `CREATE INDEX IF NOT EXISTS idx_obras_year ON obras(year DESC)`,
    `CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status, published_at DESC)`,
  ];
  const indexLog: string[] = [];
  for (const ix of indexes) {
    try {
      await c.env.DB.prepare(ix).run();
      indexLog.push(ix.split(' ON ')[1] ?? ix);
    } catch (err) {
      indexLog.push(`error: ${(err as Error).message}`);
    }
  }

  return json({ ok: true, log, indexes: indexLog }, 200, cors);
});

// ── Settings (key-value upsert) ───────────────────────────────────────────

admin.get('/settings', async (c) => {
  const cors = getCors(c.req.raw, c.env);
  const payload = await guardAuth(c.req.raw, c.env);
  if (!payload) return jsonError('Unauthorized', 401, cors);

  try {
    const { results } = await c.env.DB.prepare(
      'SELECT key, value FROM settings'
    ).all<{ key: string; value: string }>();
    const map: Record<string, string> = Object.fromEntries(
      (results ?? []).map((r) => [r.key, r.value])
    );
    return json(map, 200, cors);
  } catch (err) {
    console.error('settings get', err);
    return jsonError('Internal server error', 500, cors);
  }
});

admin.put('/settings', async (c) => {
  const cors = getCors(c.req.raw, c.env);
  const payload = await guardAuth(c.req.raw, c.env);
  if (!payload) return jsonError('Unauthorized', 401, cors);

  let body: Record<string, string>;
  try {
    body = (await c.req.raw.json()) as Record<string, string>;
  } catch {
    return jsonError('Invalid JSON', 400, cors);
  }

  const entries = Object.entries(body);
  if (!entries.length) return jsonError('No settings provided', 400, cors);

  try {
    // Batch upsert
    const stmts = entries.map(([k, v]) =>
      c.env.DB.prepare(
        "INSERT INTO settings (key, value) VALUES (?1, ?2) ON CONFLICT(key) DO UPDATE SET value = ?2"
      ).bind(k, v)
    );
    await c.env.DB.batch(stmts);
    return json({ ok: true }, 200, cors);
  } catch (err) {
    console.error('settings put', err);
    return jsonError('Internal server error', 500, cors);
  }
});

export { admin };
