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
//
// Honours `Range` requests so browsers can stream long audio files (FLAC
// in particular won't expose a finite duration in Safari without proper
// 206 Partial Content responses, which kills scrubbing). Always emits
// `Accept-Ranges: bytes` and a real `Content-Length` so the audio
// element can plan its buffering and report progress.

const RANGE_RE = /^bytes=(\d*)-(\d*)$/;

function parseRange(
  header: string | null,
  total: number
): { offset: number; length: number } | null {
  if (!header) return null;
  const m = RANGE_RE.exec(header.trim());
  if (!m) return null;
  const startStr = m[1];
  const endStr = m[2];
  // `bytes=-N` means the last N bytes
  if (!startStr && endStr) {
    const suffix = parseInt(endStr, 10);
    if (!Number.isFinite(suffix) || suffix <= 0) return null;
    const offset = Math.max(0, total - suffix);
    return { offset, length: total - offset };
  }
  if (!startStr) return null;
  const start = parseInt(startStr, 10);
  const end = endStr ? parseInt(endStr, 10) : total - 1;
  if (
    !Number.isFinite(start) ||
    !Number.isFinite(end) ||
    start < 0 ||
    start >= total ||
    end < start
  ) {
    return null;
  }
  const clampedEnd = Math.min(end, total - 1);
  return { offset: start, length: clampedEnd - start + 1 };
}

app.get('/media/*', async (c) => {
  const path = c.req.path.replace(/^\/media\//, '');
  if (!path) return new Response('Not found', { status: 404 });

  const rangeHeader = c.req.header('range') ?? null;

  // Need the total size before we can decide how to slice. `head()` is
  // cheap (metadata only).
  if (rangeHeader) {
    const head = await c.env.MEDIA.head(path);
    if (!head) return new Response('Not found', { status: 404 });
    const total = head.size;
    const range = parseRange(rangeHeader, total);

    if (range == null) {
      // Malformed or unsatisfiable range → 416.
      const h = new Headers();
      h.set('Content-Range', `bytes */${total}`);
      h.set('Access-Control-Allow-Origin', '*');
      h.set('Accept-Ranges', 'bytes');
      return new Response('Range Not Satisfiable', { status: 416, headers: h });
    }

    const obj = await c.env.MEDIA.get(path, { range });
    if (!obj) return new Response('Not found', { status: 404 });

    const headers = new Headers();
    obj.writeHttpMetadata(headers);
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Accept-Ranges', 'bytes');
    headers.set('Content-Length', String(range.length));
    headers.set(
      'Content-Range',
      `bytes ${range.offset}-${range.offset + range.length - 1}/${total}`
    );
    return new Response(obj.body, { status: 206, headers });
  }

  // No Range header → full body, but still advertise byte-range support
  // so the next request from the same client can use it.
  const obj = await c.env.MEDIA.get(path);
  if (!obj) return new Response('Not found', { status: 404 });

  const headers = new Headers();
  obj.writeHttpMetadata(headers);
  headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Accept-Ranges', 'bytes');
  headers.set('Content-Length', String(obj.size));
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
