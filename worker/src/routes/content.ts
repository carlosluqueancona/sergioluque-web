import { Hono } from 'hono';
import type { Env, Obra, Post, Proyecto, Evento, Publicacion, Settings } from '../types';
import { json, jsonError, corsHeaders, getAllowedOrigins } from '../lib/shared';

const content = new Hono<{ Bindings: Env }>();

// ── Row mappers ───────────────────────────────────────────────────────────

function mapObra(row: Record<string, unknown>, locale: string): Obra {
  return {
    id: row['id'] as number,
    title: ((locale === 'en' ? row['title_en'] : row['title_es']) as string) || (row['title_es'] as string),
    slug: ((locale === 'en' ? row['slug_en'] : row['slug_es']) as string) || (row['slug_es'] as string),
    year: (row['year'] as number) || undefined,
    instrumentation:
      ((locale === 'en' ? row['instrumentation_en'] : row['instrumentation_es']) as string) || undefined,
    duration: (row['duration'] as string) || undefined,
    description:
      ((locale === 'en' ? row['description_en'] : row['description_es']) as string) || undefined,
    audioUrl: (row['audio_url'] as string) || undefined,
    audioDuration: (row['audio_duration'] as number) || undefined,
    imageUrl: (row['image_url'] as string) || undefined,
    premiereDate: (row['premiere_date'] as string) || undefined,
    premiereVenue: (row['premiere_venue'] as string) || undefined,
    premiereCity: (row['premiere_city'] as string) || undefined,
    commissions: (row['commissions'] as string) || undefined,
    ensembles: (row['ensembles'] as string) || undefined,
    isFeatured: Boolean(row['is_featured']),
  };
}

function mapPost(row: Record<string, unknown>, locale: string): Post {
  let tags: string[] = [];
  try {
    const raw = row['tags'] as string;
    if (raw) tags = JSON.parse(raw) as string[];
  } catch {
    // ignore malformed JSON
  }
  return {
    id: row['id'] as number,
    title: ((locale === 'en' ? row['title_en'] : row['title_es']) as string) || (row['title_es'] as string),
    slug: ((locale === 'en' ? row['slug_en'] : row['slug_es']) as string) || (row['slug_es'] as string),
    body: ((locale === 'en' ? row['body_en'] : row['body_es']) as string) || undefined,
    excerpt: ((locale === 'en' ? row['excerpt_en'] : row['excerpt_es']) as string) || undefined,
    tags,
    publishedAt: (row['published_at'] as string) || undefined,
  };
}

function mapProyecto(row: Record<string, unknown>, locale: string): Proyecto {
  let images: string[] = [];
  let links: Array<{ label: string; url: string }> = [];
  try {
    if (row['images']) images = JSON.parse(row['images'] as string) as string[];
  } catch { /* ignore */ }
  try {
    if (row['links']) links = JSON.parse(row['links'] as string) as Array<{ label: string; url: string }>;
  } catch { /* ignore */ }

  return {
    id: row['id'] as number,
    title: ((locale === 'en' ? row['title_en'] : row['title_es']) as string) || (row['title_es'] as string),
    slug: ((locale === 'en' ? row['slug_en'] : row['slug_es']) as string) || (row['slug_es'] as string),
    year: (row['year'] as number) || undefined,
    description:
      ((locale === 'en' ? row['description_en'] : row['description_es']) as string) || undefined,
    images,
    links,
    isFeatured: Boolean(row['is_featured']),
  };
}

function mapEvento(row: Record<string, unknown>, locale: string): Evento {
  return {
    id: row['id'] as number,
    title: ((locale === 'en' ? row['title_en'] : row['title_es']) as string) || (row['title_es'] as string),
    eventDate: row['event_date'] as string,
    venue: (row['venue'] as string) || undefined,
    city: (row['city'] as string) || undefined,
    country: (row['country'] as string) || undefined,
    description:
      ((locale === 'en' ? row['description_en'] : row['description_es']) as string) || undefined,
    externalLink: (row['external_link'] as string) || undefined,
  };
}

function mapPublicacion(row: Record<string, unknown>, locale: string): Publicacion {
  return {
    id: row['id'] as number,
    title: ((locale === 'en' ? row['title_en'] : row['title_es']) as string) || (row['title_es'] as string),
    journal: (row['journal'] as string) || undefined,
    year: (row['year'] as number) || undefined,
    abstract: ((locale === 'en' ? row['abstract_en'] : row['abstract_es']) as string) || undefined,
    pdfUrl: (row['pdf_url'] as string) || undefined,
    doi: (row['doi'] as string) || undefined,
  };
}

// ── Helper: get CORS headers from request ────────────────────────────────

function getCors(c: { req: { raw: Request }; env: Env }, methods?: string): Record<string, string> {
  const origin = c.req.raw.headers.get('origin') ?? '';
  return corsHeaders(origin, getAllowedOrigins(c.env), methods);
}

// ── Obras ─────────────────────────────────────────────────────────────────

content.get('/obras', async (c) => {
  const locale = c.req.query('locale') ?? 'es';
  const featured = c.req.query('featured');
  const cors = getCors(c);

  try {
    let stmt: D1PreparedStatement;
    if (featured === '1') {
      stmt = c.env.DB.prepare(
        'SELECT * FROM obras WHERE is_featured = 1 ORDER BY sort_order ASC, year DESC'
      );
    } else {
      stmt = c.env.DB.prepare('SELECT * FROM obras ORDER BY sort_order ASC, year DESC');
    }
    const { results } = await stmt.all<Record<string, unknown>>();
    const obras = (results ?? []).map((r) => mapObra(r, locale));
    return json(obras, 200, cors);
  } catch (err) {
    console.error('obras list error', err);
    return jsonError('Internal server error', 500, cors);
  }
});

content.get('/obras/:slug', async (c) => {
  const locale = c.req.query('locale') ?? 'es';
  const { slug } = c.req.param();
  const cors = getCors(c);

  try {
    // Try locale slug first, then fall back to the other locale
    const row = await c.env.DB.prepare(
      `SELECT * FROM obras WHERE slug_${locale === 'en' ? 'en' : 'es'} = ?1
       OR slug_${locale === 'en' ? 'es' : 'en'} = ?1
       LIMIT 1`
    )
      .bind(slug)
      .first<Record<string, unknown>>();

    if (!row) return jsonError('Not found', 404, cors);
    return json(mapObra(row, locale), 200, cors);
  } catch (err) {
    console.error('obras slug error', err);
    return jsonError('Internal server error', 500, cors);
  }
});

// ── Posts ─────────────────────────────────────────────────────────────────

content.get('/posts', async (c) => {
  const locale = c.req.query('locale') ?? 'es';
  const cors = getCors(c);

  try {
    const { results } = await c.env.DB.prepare(
      "SELECT * FROM posts WHERE status = 'published' ORDER BY published_at DESC"
    ).all<Record<string, unknown>>();
    return json((results ?? []).map((r) => mapPost(r, locale)), 200, cors);
  } catch (err) {
    console.error('posts list error', err);
    return jsonError('Internal server error', 500, cors);
  }
});

content.get('/posts/:slug', async (c) => {
  const locale = c.req.query('locale') ?? 'es';
  const { slug } = c.req.param();
  const cors = getCors(c);

  try {
    const row = await c.env.DB.prepare(
      `SELECT * FROM posts WHERE status = 'published' AND (
         slug_${locale === 'en' ? 'en' : 'es'} = ?1
         OR slug_${locale === 'en' ? 'es' : 'en'} = ?1
       ) LIMIT 1`
    )
      .bind(slug)
      .first<Record<string, unknown>>();

    if (!row) return jsonError('Not found', 404, cors);
    return json(mapPost(row, locale), 200, cors);
  } catch (err) {
    console.error('posts slug error', err);
    return jsonError('Internal server error', 500, cors);
  }
});

// ── Proyectos ─────────────────────────────────────────────────────────────

content.get('/proyectos', async (c) => {
  const locale = c.req.query('locale') ?? 'es';
  const cors = getCors(c);

  try {
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM proyectos ORDER BY year DESC'
    ).all<Record<string, unknown>>();
    return json((results ?? []).map((r) => mapProyecto(r, locale)), 200, cors);
  } catch (err) {
    console.error('proyectos list error', err);
    return jsonError('Internal server error', 500, cors);
  }
});

content.get('/proyectos/:slug', async (c) => {
  const locale = c.req.query('locale') ?? 'es';
  const { slug } = c.req.param();
  const cors = getCors(c);

  try {
    const row = await c.env.DB.prepare(
      `SELECT * FROM proyectos WHERE slug_${locale === 'en' ? 'en' : 'es'} = ?1
       OR slug_${locale === 'en' ? 'es' : 'en'} = ?1
       LIMIT 1`
    )
      .bind(slug)
      .first<Record<string, unknown>>();

    if (!row) return jsonError('Not found', 404, cors);
    return json(mapProyecto(row, locale), 200, cors);
  } catch (err) {
    console.error('proyectos slug error', err);
    return jsonError('Internal server error', 500, cors);
  }
});

// ── Eventos ───────────────────────────────────────────────────────────────

content.get('/eventos', async (c) => {
  const locale = c.req.query('locale') ?? 'es';
  const filter = c.req.query('filter') ?? 'upcoming';
  const cors = getCors(c);

  try {
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    let stmt: D1PreparedStatement;

    if (filter === 'past') {
      stmt = c.env.DB.prepare(
        "SELECT * FROM eventos WHERE event_date < ?1 ORDER BY event_date DESC"
      ).bind(today);
    } else {
      // upcoming (default)
      stmt = c.env.DB.prepare(
        "SELECT * FROM eventos WHERE event_date >= ?1 ORDER BY event_date ASC"
      ).bind(today);
    }

    const { results } = await stmt.all<Record<string, unknown>>();
    return json((results ?? []).map((r) => mapEvento(r, locale)), 200, cors);
  } catch (err) {
    console.error('eventos list error', err);
    return jsonError('Internal server error', 500, cors);
  }
});

// ── Publicaciones ─────────────────────────────────────────────────────────

content.get('/publicaciones', async (c) => {
  const locale = c.req.query('locale') ?? 'es';
  const cors = getCors(c);

  try {
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM publicaciones ORDER BY year DESC'
    ).all<Record<string, unknown>>();
    return json((results ?? []).map((r) => mapPublicacion(r, locale)), 200, cors);
  } catch (err) {
    console.error('publicaciones list error', err);
    return jsonError('Internal server error', 500, cors);
  }
});

// ── Settings ──────────────────────────────────────────────────────────────

content.get('/settings', async (c) => {
  const locale = c.req.query('locale') ?? 'es';
  const cors = getCors(c);

  try {
    const { results } = await c.env.DB.prepare(
      'SELECT key, value FROM settings'
    ).all<{ key: string; value: string }>();

    const kvMap: Record<string, string> = Object.fromEntries(
      (results ?? []).map((r) => [r.key, r.value])
    );

    // Long bio is stored under bio_long_*; legacy bio_* still accepted as fallback.
    const settings: Settings = {
      bio:
        (locale === 'en' ? kvMap['bio_long_en'] : kvMap['bio_long_es']) ||
        (locale === 'en' ? kvMap['bio_en'] : kvMap['bio_es']),
      bioShort: locale === 'en' ? kvMap['bio_short_en'] : kvMap['bio_short_es'],
      email: kvMap['email'],
      cvPdfUrl: kvMap['cv_pdf_url'],
      profileImageUrl: kvMap['profile_image_url'],
    };

    return json(settings, 200, cors);
  } catch (err) {
    console.error('settings error', err);
    return jsonError('Internal server error', 500, cors);
  }
});

export { content };
