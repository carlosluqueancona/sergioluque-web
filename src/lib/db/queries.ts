import { apiFetch } from './client'
import type {
  Obra,
  Proyecto,
  Post,
  Evento,
  Publicacion,
  Settings,
  CatalogueEntry,
  CatalogueCategory,
} from '@/types'

// Worker still supports a locale query param for legacy / admin use; site is
// English-only so every public query hardcodes locale=en.
const L = 'en'

export async function getObras(): Promise<Obra[]> {
  return (await apiFetch<Obra[]>(`/content/obras?locale=${L}`)) ?? []
}

export async function getObraBySlug(slug: string): Promise<Obra | null> {
  return apiFetch<Obra>(`/content/obras/${slug}?locale=${L}`)
}

export async function getObrasDestacadas(): Promise<Obra[]> {
  return (await apiFetch<Obra[]>(`/content/obras?locale=${L}&featured=1`)) ?? []
}

export async function getPosts(): Promise<Post[]> {
  return (await apiFetch<Post[]>(`/content/posts?locale=${L}`)) ?? []
}

export async function getPostsDestacados(): Promise<Post[]> {
  return (await apiFetch<Post[]>(`/content/posts?locale=${L}&featured=1`)) ?? []
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  return apiFetch<Post>(`/content/posts/${slug}?locale=${L}`)
}

export async function getProyectos(): Promise<Proyecto[]> {
  return (await apiFetch<Proyecto[]>(`/content/proyectos?locale=${L}`)) ?? []
}

export async function getProyectoBySlug(slug: string): Promise<Proyecto | null> {
  return apiFetch<Proyecto>(`/content/proyectos/${slug}?locale=${L}`)
}

export async function getEventosProximos(): Promise<Evento[]> {
  return (await apiFetch<Evento[]>(`/content/eventos?locale=${L}&filter=upcoming`)) ?? []
}

export async function getEventosPasados(): Promise<Evento[]> {
  return (await apiFetch<Evento[]>(`/content/eventos?locale=${L}&filter=past`)) ?? []
}

/**
 * Most-recent-first listing across both past and future entries. Used by
 * the home page "Latest news" rail so the freshest news always rises to
 * the top regardless of whether the event date has elapsed.
 */
export async function getEventosLatest(): Promise<Evento[]> {
  return (await apiFetch<Evento[]>(`/content/eventos?locale=${L}&filter=latest`)) ?? []
}

export async function getPublicaciones(): Promise<Publicacion[]> {
  return (await apiFetch<Publicacion[]>(`/content/publicaciones?locale=${L}`)) ?? []
}

export async function getSettings(): Promise<Settings> {
  return (await apiFetch<Settings>(`/content/settings?locale=${L}`)) ?? {}
}

export async function getCatalogue(
  category?: CatalogueCategory
): Promise<CatalogueEntry[]> {
  const qs = category ? `?category=${category}` : ''
  return (await apiFetch<CatalogueEntry[]>(`/content/catalogue${qs}`)) ?? []
}
