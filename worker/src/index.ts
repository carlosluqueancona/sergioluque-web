import { Hono } from 'hono';
import type { Env } from './types';
import { content } from './routes/content';
import { admin } from './routes/admin';
import { upload } from './routes/upload';
import { getAllowedOrigins, corsHeaders } from './lib/shared';

const app = new Hono<{ Bindings: Env }>();

// ── CORS preflight for all routes ─────────────────────────────────────────

app.options('*', (c) => {
  const origin = c.req.raw.headers.get('origin') ?? '';
  const allowed = getAllowedOrigins(c.env);
  const cors = corsHeaders(origin, allowed, 'GET, POST, PUT, DELETE, OPTIONS');
  return new Response(null, { status: 204, headers: cors });
});

// ── Health ────────────────────────────────────────────────────────────────

app.get('/health', (c) => {
  const origin = c.req.raw.headers.get('origin') ?? '';
  const cors = corsHeaders(origin, getAllowedOrigins(c.env), 'GET');
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json', ...cors },
  });
});

// ── Content routes (public) ───────────────────────────────────────────────

app.route('/content', content);

// ── Admin CRUD routes (JWT protected) ────────────────────────────────────

app.route('/admin', admin);

// ── R2 upload (JWT protected) ─────────────────────────────────────────────

app.route('/admin/upload', upload);

// ── R2 public media serving ──────────────────────────────────────────────

app.get('/media/*', async (c) => {
  const path = c.req.path.replace(/^\/media\//, '');
  if (!path) return new Response('Not found', { status: 404 });

  const obj = await c.env.MEDIA.get(path);
  if (!obj) return new Response('Not found', { status: 404 });

  const headers = new Headers();
  obj.writeHttpMetadata(headers);
  headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  headers.set('Access-Control-Allow-Origin', '*');
  return new Response(obj.body, { status: 200, headers });
});

// ── 404 fallback ─────────────────────────────────────────────────────────

app.notFound((c) => {
  const origin = c.req.raw.headers.get('origin') ?? '';
  const cors = corsHeaders(origin, getAllowedOrigins(c.env), 'GET');
  return new Response(JSON.stringify({ error: 'Not found' }), {
    status: 404,
    headers: { 'Content-Type': 'application/json', ...cors },
  });
});

export default app;
