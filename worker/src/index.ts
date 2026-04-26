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
