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

registerCrud(admin, 'obras', [
  'title_es', 'title_en', 'slug_es', 'slug_en', 'year',
  'instrumentation_es', 'instrumentation_en', 'duration',
  'description_es', 'description_en', 'audio_url', 'audio_duration',
  'image_url', 'premiere_date', 'premiere_venue', 'premiere_city',
  'commissions', 'ensembles', 'is_featured', 'sort_order',
]);

registerCrud(admin, 'posts', [
  'title_es', 'title_en', 'slug_es', 'slug_en',
  'body_es', 'body_en', 'excerpt_es', 'excerpt_en',
  'tags', 'status', 'published_at',
]);

registerCrud(admin, 'proyectos', [
  'title_es', 'title_en', 'slug_es', 'slug_en', 'year',
  'description_es', 'description_en', 'images', 'links', 'is_featured',
]);

registerCrud(admin, 'eventos', [
  'title_es', 'title_en', 'event_date', 'venue', 'city', 'country',
  'description_es', 'description_en', 'external_link',
]);

registerCrud(admin, 'publicaciones', [
  'title_es', 'title_en', 'journal', 'year',
  'abstract_es', 'abstract_en', 'pdf_url', 'doi',
]);

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
