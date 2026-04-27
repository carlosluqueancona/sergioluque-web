export const runtime = 'edge'

import { getObras, getPosts, getProyectos } from '@/lib/db/queries'
import type { MetadataRoute } from 'next'

const BASE_URL = 'https://sergioluque.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPaths = [
    '',
    '/obras',
    '/proyectos',
    '/blog',
    '/bio',
    '/publicaciones',
    '/conciertos',
    '/contacto',
  ]

  const staticEntries: MetadataRoute.Sitemap = staticPaths.map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: path === '' ? 1 : 0.8,
  }))

  const [obrasR, postsR, proyectosR] = await Promise.allSettled([
    getObras(),
    getPosts(),
    getProyectos(),
  ])

  const dynamicEntries: MetadataRoute.Sitemap = []

  if (obrasR.status === 'fulfilled') {
    for (const obra of obrasR.value) {
      if (obra.slug) {
        dynamicEntries.push({
          url: `${BASE_URL}/obras/${obra.slug}`,
          lastModified: new Date(),
          changeFrequency: 'monthly' as const,
          priority: 0.7,
        })
      }
    }
  }

  if (postsR.status === 'fulfilled') {
    for (const post of postsR.value) {
      if (post.slug) {
        dynamicEntries.push({
          url: `${BASE_URL}/blog/${post.slug}`,
          lastModified: post.publishedAt ? new Date(post.publishedAt) : new Date(),
          changeFrequency: 'never' as const,
          priority: 0.6,
        })
      }
    }
  }

  if (proyectosR.status === 'fulfilled') {
    for (const proyecto of proyectosR.value) {
      if (proyecto.slug) {
        dynamicEntries.push({
          url: `${BASE_URL}/proyectos/${proyecto.slug}`,
          lastModified: new Date(),
          changeFrequency: 'monthly' as const,
          priority: 0.6,
        })
      }
    }
  }

  return [...staticEntries, ...dynamicEntries]
}
