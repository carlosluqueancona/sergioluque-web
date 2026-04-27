import { apiFetch } from './client'
import type { Obra, Proyecto, Post, Evento, Publicacion, Settings } from '@/types'

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

export async function getPublicaciones(): Promise<Publicacion[]> {
  return (await apiFetch<Publicacion[]>(`/content/publicaciones?locale=${L}`)) ?? []
}

export async function getSettings(): Promise<Settings> {
  return (await apiFetch<Settings>(`/content/settings?locale=${L}`)) ?? {}
}
