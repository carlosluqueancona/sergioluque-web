// ── Locale ───────────────────────────────────────────────────────────────────
export type Locale = 'es' | 'en'

// ── D1-backed domain types ───────────────────────────────────────────────────

export interface Obra {
  id: number
  title: string
  slug: string
  year?: number
  instrumentation?: string
  duration?: string
  description?: string
  audioUrl?: string
  imageUrl?: string
  premiereDate?: string
  premiereVenue?: string
  premiereCity?: string
  commissions?: string
  ensembles?: string
  /** Studio/venue where the recording was made — surfaces as "Recorded at" on /listen/[slug]. */
  recordedAt?: string
  isFeatured: boolean
}

export interface Post {
  id: number
  title: string
  slug: string
  body?: string
  excerpt?: string
  tags?: string[]
  publishedAt?: string
  imageUrl?: string
  isFeatured: boolean
}

export interface Proyecto {
  id: number
  title: string
  slug: string
  year?: number
  description?: string
  images?: string[]
  links?: Array<{ label: string; url: string }>
  isFeatured: boolean
}

export interface Evento {
  id: number
  title: string
  eventDate: string
  venue?: string
  city?: string
  country?: string
  /** Short description rendered inline on the news listing. */
  description?: string
  /** Long-form free text rendered below the description via PostBody. */
  body?: string
  externalLink?: string
  imageUrl?: string
}

export interface Publicacion {
  id: number
  title: string
  journal?: string
  year?: number
  abstract?: string
  pdfUrl?: string
  doi?: string
  imageUrl?: string
}

export type CatalogueCategory = 'vocal_instrumental_mixed' | 'electroacoustic'

export interface CatalogueEntry {
  id: number
  category: CatalogueCategory
  title: string
  /** Operator-authored year string ("2020 – 2021", "2014, rev. 2019"). */
  yearText?: string
  /** Numeric end-year used for ordering. */
  yearSort?: number
  instrumentation?: string
  /** Commissions, prizes, multi-movement notes — anything below the
   *  instrumentation line in the catalogue source. */
  notes?: string
  /** Body text shown in the featured-work block above the catalogue list. */
  description?: string
  /** Cover image used in the featured-work block. */
  imageUrl?: string
  scoreUrl?: string
  listenUrl?: string
  patchUrl?: string
  videoUrl?: string
  losslessUrl?: string
  /** When true, this entry is highlighted in the featured-work block at
   *  the top of /catalogue. Only the most-recent featured one wins. */
  isFeatured: boolean
  sortOrder: number
}

export interface Settings {
  bio?: string
  bioShort?: string
  email?: string
  cvPdfUrl?: string
  profileImageUrl?: string
  /**
   * Default cover image used on /listen cards when an obra has no
   * image_url of its own. Picked from the media library in admin →
   * Settings.
   */
  worksFallbackCoverUrl?: string
  /**
   * Open Graph image used by WhatsApp / Twitter / Facebook / iMessage
   * etc. when the site URL is shared. Per-work pages override with
   * their own image (or the works fallback cover) when available;
   * any other page falls back to this site-wide value.
   */
  socialShareImageUrl?: string
  /**
   * Public social profiles surfaced in the footer + contact page when a
   * URL is set. Empty / unset entries are skipped.
   */
  socialTwitter?: string
  socialInstagram?: string
  socialYoutube?: string
  socialSoundcloud?: string
  socialBandcamp?: string
  socialFacebook?: string
  socialLinkedin?: string
  ctaOrange?: boolean
  /**
   * Custom accent colour applied when ctaOrange is on. Two values so the
   * operator can fine-tune for light + dark themes (the bright-on-dark
   * orange tends to wash out against a near-white bg). Empty values fall
   * back to the static orange defaults baked into globals.css.
   */
  accentColorDark?: string
  accentColorLight?: string
  /**
   * Optional headings override — when enabled, h2 / h3 / card titles
   * pick these colours instead of following --accent. Useful when the
   * operator wants headings to read as a separate hierarchy layer
   * (e.g. accent for links/buttons but neutral white for headings).
   */
  headingsCustomEnabled?: boolean
  headingColorDark?: string
  headingColorLight?: string
  /**
   * Raw `lis_*` keys passed through verbatim from the settings table.
   * The Hero component parses this with parseLissajousConfig() so the
   * Worker doesn't need to know the canvas semantics.
   */
  lissajous?: Record<string, string>
}
