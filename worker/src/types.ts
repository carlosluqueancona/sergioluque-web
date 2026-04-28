export interface Env {
  DB: D1Database;
  MEDIA: R2Bucket;
  JWT_SECRET: string;
  ALLOWED_ORIGINS?: string;
  MEDIA_PUBLIC_URL?: string;
  // R2 S3-compatible API credentials, used to sign presigned PUT URLs so
  // the browser can upload files larger than the 100 MB Worker request
  // body limit directly to R2. Configure with:
  //   wrangler secret put R2_ACCOUNT_ID
  //   wrangler secret put R2_ACCESS_KEY_ID
  //   wrangler secret put R2_SECRET_ACCESS_KEY
  //   wrangler secret put R2_BUCKET_NAME   (or set in wrangler.toml [vars])
  R2_ACCOUNT_ID?: string;
  R2_ACCESS_KEY_ID?: string;
  R2_SECRET_ACCESS_KEY?: string;
  R2_BUCKET_NAME?: string;
}

export interface Obra {
  id: number;
  title: string;
  slug: string;
  year?: number;
  instrumentation?: string;
  duration?: string;
  description?: string;
  audioUrl?: string;
  imageUrl?: string;
  premiereDate?: string;
  premiereVenue?: string;
  premiereCity?: string;
  commissions?: string;
  ensembles?: string;
  isFeatured: boolean;
}

export interface Post {
  id: number;
  title: string;
  slug: string;
  body?: string;
  excerpt?: string;
  tags?: string[];
  publishedAt?: string;
}

export interface Proyecto {
  id: number;
  title: string;
  slug: string;
  year?: number;
  description?: string;
  images?: string[];
  links?: Array<{ label: string; url: string }>;
  isFeatured: boolean;
}

export interface Evento {
  id: number;
  title: string;
  eventDate: string;
  venue?: string;
  city?: string;
  country?: string;
  description?: string;
  externalLink?: string;
}

export interface Publicacion {
  id: number;
  title: string;
  journal?: string;
  year?: number;
  abstract?: string;
  pdfUrl?: string;
  doi?: string;
}

export interface Settings {
  bio?: string;
  bioShort?: string;
  email?: string;
  cvPdfUrl?: string;
  profileImageUrl?: string;
  ctaOrange?: boolean;
  /**
   * Raw `lis_*` keys passed through verbatim from the settings table so
   * the Hero canvas can parse them client-side. The Worker stays dumb
   * about Lissajous semantics — it just forwards the strings.
   */
  lissajous?: Record<string, string>;
}
