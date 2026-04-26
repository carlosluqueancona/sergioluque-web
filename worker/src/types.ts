export interface Env {
  DB: D1Database;
  MEDIA: R2Bucket;
  JWT_SECRET: string;
  ALLOWED_ORIGINS?: string;
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
  audioDuration?: number;
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
}
