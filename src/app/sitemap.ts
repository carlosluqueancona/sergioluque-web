export const runtime = 'edge'

import { getObras, getPosts, getProyectos } from '@/lib/db/queries'
import type { MetadataRoute } from 'next'

const BASE_URL = 'https://sergioluque.com'
const locales = ['es', 'en'] as const

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

  const staticEntries: MetadataRoute.Sitemap = locales.flatMap((locale) =>
    staticPaths.map((path) => ({
      url: `${BASE_URL}/${locale}${path}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: path === '' ? 1 : 0.8,
    }))
  )

  const [obrasEs, postsEs, proyectosEs] = await Promise.allSettled([
    getObras('es'),
    getPosts('es'),
    getProyectos('es'),
  ])

  const dynamicEntries: MetadataRoute.Sitemap = []

  if (obrasEs.status === 'fulfilled') {
    for (const obra of obrasEs.value) {
      if (obra.slug) {
        for (const locale of locales) {
          dynamicEntries.push({
            url: `${BASE_URL}/${locale}/obras/${obra.slug}`,
            lastModified: new Date(),
            changeFrequency: 'monthly' as const,
            priority: 0.7,
          })
        }
      }
    }
  }

  if (postsEs.status === 'fulfilled') {
    for (const post of postsEs.value) {
      if (post.slug) {
        for (const locale of locales) {
          dynamicEntries.push({
            url: `${BASE_URL}/${locale}/blog/${post.slug}`,
            lastModified: post.publishedAt ? new Date(post.publishedAt) : new Date(),
            changeFrequency: 'never' as const,
            priority: 0.6,
          })
        }
      }
    }
  }

  if (proyectosEs.status === 'fulfilled') {
    for (const proyecto of proyectosEs.value) {
      if (proyecto.slug) {
        for (const locale of locales) {
          dynamicEntries.push({
            url: `${BASE_URL}/${locale}/proyectos/${proyecto.slug}`,
            lastModified: new Date(),
            changeFrequency: 'monthly' as const,
            priority: 0.6,
          })
        }
      }
    }
  }

  return [...staticEntries, ...dynamicEntries]
}
