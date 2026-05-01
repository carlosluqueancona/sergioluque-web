export const runtime = 'edge'

import { getObras, getPosts, getProyectos } from '@/lib/db/queries'
import { PUBLIC_SECTIONS } from '@/lib/feature-flags'
import type { MetadataRoute } from 'next'

// Canonical site URL. Override via the `NEXT_PUBLIC_SITE_URL` build var
// when the canonical hostname changes (e.g., during DNS migration). The
// fallback assumes the long-term canonical — Google Search Console only
// trusts the property the sitemap is hosted under, so the value here
// MUST match the host visitors actually reach.
const BASE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sergioluque.com').replace(/\/$/, '')

// Captured at module load (worker cold start), so every entry in a given
// deploy reports the same `lastModified`. With per-request `new Date()`
// the sitemap told Google "everything changed at this exact second" on
// every crawl, which wastes crawl budget. The build-time stamp is good
// enough until we surface `updated_at` on the Obra/Post types.
const BUILD_TIME = new Date()

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static paths, sorted from most-changing to least.
  // Hidden sections drop out of the sitemap entirely so search engines
  // don't try to index pages that 404 behind the feature flag.
  const staticEntries: MetadataRoute.Sitemap = [
    { path: '', changeFrequency: 'daily' as const, priority: 1.0 },
    { path: '/news', changeFrequency: 'weekly' as const, priority: 0.9 },
    { path: '/listen', changeFrequency: 'weekly' as const, priority: 0.9 },
    { path: '/catalogue', changeFrequency: 'weekly' as const, priority: 0.9 },
    { path: '/bio', changeFrequency: 'monthly' as const, priority: 0.7 },
    { path: '/stochastics', changeFrequency: 'monthly' as const, priority: 0.6 },
    { path: '/contact', changeFrequency: 'yearly' as const, priority: 0.5 },
    { path: '/privacy', changeFrequency: 'yearly' as const, priority: 0.3 },
    PUBLIC_SECTIONS.projects
      ? { path: '/projects', changeFrequency: 'monthly' as const, priority: 0.6 }
      : null,
    PUBLIC_SECTIONS.blog
      ? { path: '/blog', changeFrequency: 'weekly' as const, priority: 0.6 }
      : null,
  ]
    .filter((e): e is { path: string; changeFrequency: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'always' | 'hourly' | 'never'; priority: number } => e !== null)
    .map(({ path, changeFrequency, priority }) => ({
      url: `${BASE_URL}${path}`,
      lastModified: BUILD_TIME,
      changeFrequency,
      priority,
    }))

  const [obrasR, postsR, proyectosR] = await Promise.allSettled([
    getObras(),
    getPosts(),
    getProyectos(),
  ])

  const dynamicEntries: MetadataRoute.Sitemap = []

  // Obras don't change after publication — `yearly` reflects reality and
  // saves Google's crawl budget for fresher pages.
  if (obrasR.status === 'fulfilled') {
    for (const obra of obrasR.value) {
      if (obra.slug) {
        dynamicEntries.push({
          url: `${BASE_URL}/listen/${obra.slug}`,
          lastModified: BUILD_TIME,
          changeFrequency: 'yearly',
          priority: 0.7,
        })
      }
    }
  }

  // Blog posts use `publishedAt` so each entry has its own freshness;
  // `never` is the right hint — once published, posts don't get edited.
  if (PUBLIC_SECTIONS.blog && postsR.status === 'fulfilled') {
    for (const post of postsR.value) {
      if (post.slug) {
        dynamicEntries.push({
          url: `${BASE_URL}/blog/${post.slug}`,
          lastModified: post.publishedAt ? new Date(post.publishedAt) : BUILD_TIME,
          changeFrequency: 'never',
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
          lastModified: BUILD_TIME,
          changeFrequency: 'yearly',
          priority: 0.6,
        })
      }
    }
  }

  return [...staticEntries, ...dynamicEntries]
}
