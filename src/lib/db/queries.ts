import { apiFetch } from './client'
import type { Locale, Obra, Proyecto, Post, Evento, Publicacion, Settings } from '@/types'

export async function getObras(locale: Locale): Promise<Obra[]> {
  return (await apiFetch<Obra[]>(`/content/obras?locale=${locale}`)) ?? []
}

export async function getObraBySlug(slug: string, locale: Locale): Promise<Obra | null> {
  return apiFetch<Obra>(`/content/obras/${slug}?locale=${locale}`)
}

export async function getObrasDestacadas(locale: Locale): Promise<Obra[]> {
  return (await apiFetch<Obra[]>(`/content/obras?locale=${locale}&featured=1`)) ?? []
}

export async function getPosts(locale: Locale): Promise<Post[]> {
  return (await apiFetch<Post[]>(`/content/posts?locale=${locale}`)) ?? []
}

export async function getPostBySlug(slug: string, locale: Locale): Promise<Post | null> {
  return apiFetch<Post>(`/content/posts/${slug}?locale=${locale}`)
}

export async function getProyectos(locale: Locale): Promise<Proyecto[]> {
  return (await apiFetch<Proyecto[]>(`/content/proyectos?locale=${locale}`)) ?? []
}

export async function getProyectoBySlug(slug: string, locale: Locale): Promise<Proyecto | null> {
  return apiFetch<Proyecto>(`/content/proyectos/${slug}?locale=${locale}`)
}

export async function getEventosProximos(locale: Locale): Promise<Evento[]> {
  return (await apiFetch<Evento[]>(`/content/eventos?locale=${locale}&filter=upcoming`)) ?? []
}

export async function getEventosPasados(locale: Locale): Promise<Evento[]> {
  return (await apiFetch<Evento[]>(`/content/eventos?locale=${locale}&filter=past`)) ?? []
}

export async function getPublicaciones(locale: Locale = 'es'): Promise<Publicacion[]> {
  return (await apiFetch<Publicacion[]>(`/content/publicaciones?locale=${locale}`)) ?? []
}

export async function getSettings(): Promise<Settings> {
  return (await apiFetch<Settings>(`/content/settings`)) ?? {}
}
