export const runtime = 'edge'

import { getObras, getPosts, getProyectos } from '@/lib/db/queries'
import { PUBLIC_SECTIONS } from '@/lib/feature-flags'
import type { MetadataRoute } from 'next'

const BASE_URL = 'https://sergioluque.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Hidden sections drop out of the sitemap entirely so search engines
  // don't try to index pages that 404 behind the feature flag.
  const staticPaths = [
    '',
    '/listen',
    '/catalogue',
    PUBLIC_SECTIONS.projects ? '/projects' : null,
    PUBLIC_SECTIONS.blog ? '/blog' : null,
    '/bio',
    '/stochastics',
    '/news',
    '/contact',
  ].filter((p): p is string => p !== null)

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
          url: `${BASE_URL}/listen/${obra.slug}`,
          lastModified: new Date(),
          changeFrequency: 'monthly' as const,
          priority: 0.7,
        })
      }
    }
  }

  if (PUBLIC_SECTIONS.blog && postsR.status === 'fulfilled') {
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

  if (PUBLIC_SECTIONS.projects && proyectosR.status === 'fulfilled') {
    for (const proyecto of proyectosR.value) {
      if (proyecto.slug) {
        dynamicEntries.push({
          url: `${BASE_URL}/projects/${proyecto.slug}`,
          lastModified: new Date(),
          changeFrequency: 'monthly' as const,
          priority: 0.6,
        })
      }
    }
  }

  return [...staticEntries, ...dynamicEntries]
}
