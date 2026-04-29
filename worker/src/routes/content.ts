import { Hono } from 'hono';
import type { Env, Obra, Post, Proyecto, Evento, Publicacion, Settings } from '../types';
import { json, jsonError, corsHeaders, getAllowedOrigins } from '../lib/shared';

const content = new Hono<{ Bindings: Env }>();

// ── Row mappers ───────────────────────────────────────────────────────────
// Tolerant by design: read the flat column first, then fall back to *_en
// and *_es. That way the mappers work both pre- and post-migration to a
// monolingual schema. Once the legacy columns are dropped the COALESCE
// chain returns the flat value directly.

const pick = (row: Record<string, unknown>, base: string): string | undefined => {
  return (
    (row[base] as string) ||
    (row[`${base}_en`] as string) ||
    (row[`${base}_es`] as string) ||
    undefined
  )
}

function mapObra(row: Record<string, unknown>, _locale: string): Obra {
  return {
    id: row['id'] as number,
    title: pick(row, 'title') ?? '',
    slug: pick(row, 'slug') ?? '',
    year: (row['year'] as number) || undefined,
    instrumentation: pick(row, 'instrumentation'),
    duration: (row['duration'] as string) || undefined,
    description: pick(row, 'description'),
    audioUrl: (row['audio_url'] as string) || undefined,
    imageUrl: (row['image_url'] as string) || undefined,
    premiereDate: (row['premiere_date'] as string) || undefined,
    premiereVenue: (row['premiere_venue'] as string) || undefined,
    premiereCity: (row['premiere_city'] as string) || undefined,
    commissions: (row['commissions'] as string) || undefined,
    ensembles: (row['ensembles'] as string) || undefined,
    isFeatured: Boolean(row['is_featured']),
  };
}

function mapPost(row: Record<string, unknown>, _locale: string): Post {
  let tags: string[] = [];
  try {
    const raw = row['tags'] as string;
    if (raw) tags = JSON.parse(raw) as string[];
  } catch {
    // ignore malformed JSON
  }
  return {
    id: row['id'] as number,
    title: pick(row, 'title') ?? '',
    slug: pick(row, 'slug') ?? '',
    body: pick(row, 'body'),
    excerpt: pick(row, 'excerpt'),
    tags,
    publishedAt: (row['published_at'] as string) || undefined,
    imageUrl: (row['image_url'] as string) || undefined,
    isFeatured: Boolean(row['is_featured']),
  };
}

function mapProyecto(row: Record<string, unknown>, _locale: string): Proyecto {
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
    title: pick(row, 'title') ?? '',
    slug: pick(row, 'slug') ?? '',
    year: (row['year'] as number) || undefined,
    description: pick(row, 'description'),
    images,
    links,
    isFeatured: Boolean(row['is_featured']),
  };
}

function mapEvento(row: Record<string, unknown>, _locale: string): Evento {
  return {
    id: row['id'] as number,
    title: pick(row, 'title') ?? '',
    eventDate: row['event_date'] as string,
    venue: (row['venue'] as string) || undefined,
    city: (row['city'] as string) || undefined,
    country: (row['country'] as string) || undefined,
    description: pick(row, 'description'),
    externalLink: (row['external_link'] as string) || undefined,
    imageUrl: (row['image_url'] as string) || undefined,
  };
}

function mapPublicacion(row: Record<string, unknown>, _locale: string): Publicacion {
  return {
    id: row['id'] as number,
    title: pick(row, 'title') ?? '',
    journal: (row['journal'] as string) || undefined,
    year: (row['year'] as number) || undefined,
    abstract: pick(row, 'abstract'),
    pdfUrl: (row['pdf_url'] as string) || undefined,
    doi: (row['doi'] as string) || undefined,
    imageUrl: (row['image_url'] as string) || undefined,
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
  const locale = c.req.query('locale') ?? 'en';
  const { slug } = c.req.param();
  const cors = getCors(c);

  try {
    const row = await c.env.DB.prepare('SELECT * FROM obras WHERE slug = ?1 LIMIT 1')
      .bind(slug)
      .first<Record<string, unknown>>();

    if (!row) return jsonError('Not found', 404, cors);
    return json(mapObra(row, locale), 200, cors);
  } catch (err) {
    console.error('obras slug error', err);
    return jsonError('Internal server error', 500, cors);
  }
});

// ── Catalogue ─────────────────────────────────────────────────────────────

content.get('/catalogue', async (c) => {
  const cors = getCors(c);
  const category = c.req.query('category');
  try {
    let stmt: D1PreparedStatement;
    if (category === 'vocal_instrumental_mixed' || category === 'electroacoustic') {
      stmt = c.env.DB.prepare(
        'SELECT * FROM catalogue WHERE category = ?1 ORDER BY year_sort DESC, sort_order ASC, id ASC'
      ).bind(category);
    } else {
      stmt = c.env.DB.prepare(
        'SELECT * FROM catalogue ORDER BY year_sort DESC, sort_order ASC, id ASC'
      );
    }
    const { results } = await stmt.all<Record<string, unknown>>();
    const entries = (results ?? []).map((r) => ({
      id: r['id'] as number,
      category: (r['category'] as string) || 'vocal_instrumental_mixed',
      title: (r['title'] as string) || '',
      yearText: (r['year_text'] as string) || undefined,
      yearSort: (r['year_sort'] as number) || undefined,
      instrumentation: (r['instrumentation'] as string) || undefined,
      notes: (r['notes'] as string) || undefined,
      description: (r['description'] as string) || undefined,
      imageUrl: (r['image_url'] as string) || undefined,
      scoreUrl: (r['score_url'] as string) || undefined,
      listenUrl: (r['listen_url'] as string) || undefined,
      patchUrl: (r['patch_url'] as string) || undefined,
      videoUrl: (r['video_url'] as string) || undefined,
      losslessUrl: (r['lossless_url'] as string) || undefined,
      isFeatured: Boolean(r['is_featured']),
      sortOrder: (r['sort_order'] as number) ?? 0,
    }));
    return json(entries, 200, cors);
  } catch (err) {
    console.error('catalogue list error', err);
    return jsonError('Internal server error', 500, cors);
  }
});

// ── Posts ─────────────────────────────────────────────────────────────────

content.get('/posts', async (c) => {
  const locale = c.req.query('locale') ?? 'es';
  const featured = c.req.query('featured');
  const cors = getCors(c);

  try {
    let stmt: D1PreparedStatement;
    if (featured === '1') {
      stmt = c.env.DB.prepare(
        "SELECT * FROM posts WHERE status = 'published' AND is_featured = 1 ORDER BY published_at DESC"
      );
    } else {
      stmt = c.env.DB.prepare(
        "SELECT * FROM posts WHERE status = 'published' ORDER BY published_at DESC"
      );
    }
    const { results } = await stmt.all<Record<string, unknown>>();
    return json((results ?? []).map((r) => mapPost(r, locale)), 200, cors);
  } catch (err) {
    console.error('posts list error', err);
    return jsonError('Internal server error', 500, cors);
  }
});

content.get('/posts/:slug', async (c) => {
  const locale = c.req.query('locale') ?? 'en';
  const { slug } = c.req.param();
  const cors = getCors(c);

  try {
    const row = await c.env.DB.prepare(
      "SELECT * FROM posts WHERE status = 'published' AND slug = ?1 LIMIT 1"
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
  const locale = c.req.query('locale') ?? 'en';
  const { slug } = c.req.param();
  const cors = getCors(c);

  try {
    const row = await c.env.DB.prepare('SELECT * FROM proyectos WHERE slug = ?1 LIMIT 1')
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
    } else if (filter === 'latest') {
      // No date filter — most recent news first regardless of whether the
      // event is past or future. Used by the home page "Latest news" rail.
      stmt = c.env.DB.prepare(
        "SELECT * FROM eventos ORDER BY event_date DESC"
      );
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

    // Post-monolingual collapse the bio lives under flat 'bio' / 'bio_short'.
    // Legacy *_en / *_es keys still accepted as fallback.
    //
    // Forward every `lis_*` key verbatim under settings.lissajous so the
    // Hero canvas can parse them client-side. Worker stays dumb about
    // Lissajous semantics — it just hands back the raw strings.
    const lissajous: Record<string, string> = {};
    for (const [key, value] of Object.entries(kvMap)) {
      if (key.startsWith('lis_')) lissajous[key] = value;
    }

    const settings: Settings = {
      bio:
        kvMap['bio'] ||
        kvMap['bio_long_en'] ||
        kvMap['bio_long_es'] ||
        kvMap['bio_en'] ||
        kvMap['bio_es'],
      bioShort:
        kvMap['bio_short'] ||
        kvMap['bio_short_en'] ||
        kvMap['bio_short_es'],
      email: kvMap['email'],
      cvPdfUrl: kvMap['cv_pdf_url'],
      profileImageUrl: kvMap['profile_image_url'],
      worksFallbackCoverUrl: kvMap['works_fallback_cover_url'],
      socialShareImageUrl: kvMap['social_share_image_url'],
      socialTwitter: kvMap['social_twitter'],
      socialInstagram: kvMap['social_instagram'],
      socialYoutube: kvMap['social_youtube'],
      socialSoundcloud: kvMap['social_soundcloud'],
      socialBandcamp: kvMap['social_bandcamp'],
      socialFacebook: kvMap['social_facebook'],
      socialLinkedin: kvMap['social_linkedin'],
      ctaOrange: kvMap['cta_orange'] === '1',
      accentColorDark: kvMap['accent_color_dark'],
      accentColorLight: kvMap['accent_color_light'],
      headingsCustomEnabled: kvMap['headings_custom_enabled'] === '1',
      headingColorDark: kvMap['heading_color_dark'],
      headingColorLight: kvMap['heading_color_light'],
      lissajous: Object.keys(lissajous).length ? lissajous : undefined,
    };
    void locale;

    return json(settings, 200, cors);
  } catch (err) {
    console.error('settings error', err);
    return jsonError('Internal server error', 500, cors);
  }
});

export { content };
