import { Hono } from 'hono';
import type { Env } from '../types';
import {
  requireAuth,
  signJWT,
  hashPassword,
  verifyPassword,
  json,
  jsonError,
  corsHeaders,
  getAllowedOrigins,
} from '../lib/shared';

// JWT lifetime in seconds (RFC 7519). 24h matches the cookie Max-Age
// below and the previous deployed behavior; tightening to e.g. 8h is a
// follow-up, not a breaking change in this PR.
const JWT_TTL_SECONDS = 24 * 60 * 60;
// Minimum end-to-end response time for /login. Flattens any timing
// difference between unknown-email (no DB row → no hash work) and
// bad-password (full PBKDF2 work) so an attacker cannot use response
// time to enumerate which emails exist.
const LOGIN_MIN_RESPONSE_MS = 250;

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
  const startedAt = Date.now();

  // Pad every response to at least LOGIN_MIN_RESPONSE_MS before sending.
  // Wrap the whole handler so success and failure both flatten timing.
  const respond = async (resp: Response): Promise<Response> => {
    const elapsed = Date.now() - startedAt;
    if (elapsed < LOGIN_MIN_RESPONSE_MS) {
      await new Promise((r) => setTimeout(r, LOGIN_MIN_RESPONSE_MS - elapsed));
    }
    return resp;
  };

  let body: { email?: string; password?: string };
  try {
    body = (await c.req.raw.json()) as { email?: string; password?: string };
  } catch {
    return respond(jsonError('Invalid JSON', 400, cors));
  }

  const { email, password } = body;
  if (!email || !password) {
    return respond(jsonError('email and password required', 400, cors));
  }

  // Rate limit on IP+email composite key. Falls through cleanly when
  // the binding isn't provisioned yet (free tier / first-deploy of this
  // PR before wrangler.toml's [[unsafe.bindings]] block lands).
  const ip = c.req.header('cf-connecting-ip') ?? 'unknown';
  if (c.env.LOGIN_LIMITER) {
    try {
      const { success } = await c.env.LOGIN_LIMITER.limit({
        key: `login:${ip}:${email.toLowerCase()}`,
      });
      if (!success) {
        return respond(
          jsonError('Too many attempts. Try again in a minute.', 429, cors)
        );
      }
    } catch {
      // If the rate limiter itself errors, fail open — the in-handler
      // delay still mitigates rapid brute-force, and locking out the
      // legitimate admin on a Cloudflare blip would be worse than
      // accepting one extra attempt.
    }
  }

  const row = await c.env.DB.prepare(
    'SELECT id, email, password_hash FROM admin_users WHERE email = ?1 LIMIT 1'
  )
    .bind(email)
    .first<{ id: number; email: string; password_hash: string }>();

  if (!row) {
    // Generic message + delay (LOGIN_MIN_RESPONSE_MS) prevents email
    // enumeration via response timing.
    console.log(
      JSON.stringify({ ev: 'admin_login', ok: false, reason: 'no_user', ip })
    );
    return respond(jsonError('Invalid credentials', 401, cors));
  }

  const result = await verifyPassword(password, row.password_hash);
  if (!result.ok) {
    console.log(
      JSON.stringify({ ev: 'admin_login', ok: false, reason: 'bad_password', ip, sub: row.id })
    );
    return respond(jsonError('Invalid credentials', 401, cors));
  }

  // Transparent legacy → PBKDF2 migration: the row's stored hash was
  // either a legacy unsalted SHA-256 or PBKDF2 with fewer iterations
  // than the current target. Either way, rehash and persist on this
  // successful login. A DB write failure is logged but does NOT block
  // the login — better to let the admin in than to lock them out on a
  // transient D1 blip.
  if (result.needsRehash) {
    try {
      const upgraded = await hashPassword(password);
      await c.env.DB.prepare(
        'UPDATE admin_users SET password_hash = ?1 WHERE id = ?2'
      )
        .bind(upgraded, row.id)
        .run();
    } catch (err) {
      console.error(
        'admin_login: rehash failed',
        err instanceof Error ? err.message : 'unknown'
      );
    }
  }

  const nowSec = Math.floor(Date.now() / 1000);
  const token = await signJWT(
    {
      sub: String(row.id),
      email: row.email,
      iat: nowSec,
      exp: nowSec + JWT_TTL_SECONDS,
    },
    c.env.JWT_SECRET
  );

  console.log(
    JSON.stringify({ ev: 'admin_login', ok: true, ip, sub: row.id, rehashed: result.needsRehash })
  );

  const headers: Record<string, string> = {
    ...cors,
    'Set-Cookie': `sl_admin_jwt=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${JWT_TTL_SECONDS}`,
  };
  return respond(json({ token }, 200, headers));
});

admin.post('/logout', async (c) => {
  const cors = getCors(c.req.raw, c.env, 'POST, OPTIONS');
  const headers: Record<string, string> = {
    ...cors,
    'Set-Cookie': 'sl_admin_jwt=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0',
  };
  return json({ ok: true }, 200, headers);
});

// ── Generic CRUD factory ──────────────────────────────────────────────────

// CN-011 defense-in-depth: every table and column name passed to
// registerCrud is interpolated directly into SQL strings (D1 doesn't
// parametrise identifiers — only values). All current call sites pass
// hardcoded literals, so the call is safe today, but the factory used
// to expose a footgun: a future caller passing a request-derived
// string would yield trivial SQL injection. The allowlist below
// rejects anything that isn't a plain SQL identifier (lowercase ASCII
// letters, digits, underscores, leading non-digit) and throws at
// module load — so the deploy fails fast rather than shipping an
// exploitable factory.
const SQL_IDENT_RE = /^[a-z_][a-z0-9_]*$/;

// Per-column allowlist for ORDER BY clauses. Only plain identifiers,
// optional ASC/DESC keywords, comma-joined. Stricter than SQL_IDENT_RE
// because we need to match "col DESC, col2 ASC" patterns.
const SQL_ORDER_BY_RE = /^[a-z_][a-z0-9_]*(\s+(asc|desc))?(\s*,\s*[a-z_][a-z0-9_]*(\s+(asc|desc))?)*$/i;

interface RegisterCrudOptions {
  /**
   * Override the default `id DESC` ORDER BY on the LIST endpoint.
   * Validated against SQL_ORDER_BY_RE so a future caller can't smuggle
   * SQL into the clause. For obras the operator wants
   * `sort_order DESC, year DESC` so the admin list mirrors the public
   * /listen ordering.
   */
  listOrderBy?: string;
}

function registerCrud(
  router: Hono<{ Bindings: Env }>,
  table: string,
  columns: string[],
  options: RegisterCrudOptions = {}
): void {
  if (!SQL_IDENT_RE.test(table)) {
    throw new Error(`registerCrud: invalid table identifier ${JSON.stringify(table)}`);
  }
  for (const col of columns) {
    if (!SQL_IDENT_RE.test(col)) {
      throw new Error(`registerCrud: invalid column identifier ${JSON.stringify(col)}`);
    }
  }
  const listOrderBy = options.listOrderBy ?? 'id DESC';
  if (!SQL_ORDER_BY_RE.test(listOrderBy)) {
    throw new Error(`registerCrud: invalid listOrderBy ${JSON.stringify(listOrderBy)}`);
  }

  const colList = columns.join(', ');
  const placeholders = columns.map((_, i) => `?${i + 1}`).join(', ');
  const updateSet = columns.map((col, i) => `${col} = ?${i + 1}`).join(', ');

  // LIST
  router.get(`/${table}`, async (c) => {
    const cors = getCors(c.req.raw, c.env);
    const payload = await guardAuth(c.req.raw, c.env);
    if (!payload) return jsonError('Unauthorized', 401, cors);

    try {
      const { results } = await c.env.DB.prepare(
        `SELECT * FROM ${table} ORDER BY ${listOrderBy}`
      ).all<Record<string, unknown>>();
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
registerCrud(
  admin,
  'obras',
  [
    'title', 'slug', 'year',
    'instrumentation', 'duration',
    'description', 'audio_url',
    'image_url', 'premiere_date', 'premiere_venue', 'premiere_city',
    'commissions', 'ensembles', 'recorded_at',
    'is_featured', 'sort_order',
  ],
  // Admin list mirrors the public /listen ordering — operator curates
  // sort_order to control what surfaces first. Highest sort_order
  // first, year DESC tiebreaker.
  { listOrderBy: 'sort_order DESC, year DESC' }
);

registerCrud(admin, 'posts', [
  'title', 'slug',
  'body', 'excerpt',
  'tags', 'status', 'published_at', 'image_url',
  'is_featured',
]);

registerCrud(admin, 'catalogue', [
  'category', 'title', 'year_text', 'year_sort',
  'instrumentation', 'notes',
  'description', 'image_url',
  'score_url', 'listen_url', 'patch_url', 'video_url', 'lossless_url',
  'is_featured', 'sort_order',
]);

registerCrud(admin, 'proyectos', [
  'title', 'slug', 'year',
  'description', 'images', 'links', 'is_featured',
]);

registerCrud(admin, 'eventos', [
  'title', 'event_date', 'venue', 'city', 'country',
  'description', 'body', 'external_link', 'image_url',
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
//
// Removed in PR #46 (Cyber Neo CN-004). The earlier `/_migrate-images`,
// `/_migrate-monolingual`, and `/_migrate-finalize` routes have all run
// against production D1 and the schema is now stable. Keeping live HTTP
// routes that DROP TABLE on JWT auth alone was a destructive blast-radius
// risk: a stolen admin session could erase all content, and the cleanup
// path on partial failure could leave the DB half-migrated.
//
// If a future migration is needed, write a SQL file and run it with
// `wrangler d1 execute sergioluque-db --file=path/to/migration.sql` from
// a developer workstation. That keeps destructive DDL out of the
// public-internet attack surface.

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
