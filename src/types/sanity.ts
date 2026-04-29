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
  description?: string
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

export interface Settings {
  bio?: string
  bioShort?: string
  email?: string
  cvPdfUrl?: string
  profileImageUrl?: string
  /**
   * Default cover image used on /works cards when an obra has no
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
   * Raw `lis_*` keys passed through verbatim from the settings table.
   * The Hero component parses this with parseLissajousConfig() so the
   * Worker doesn't need to know the canvas semantics.
   */
  lissajous?: Record<string, string>
}
