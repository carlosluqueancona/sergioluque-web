export const runtime = 'edge'

import { getObras, getPosts, getProyectos } from '@/lib/db/queries'
import { PUBLIC_SECTIONS } from '@/lib/feature-flags'
import type { MetadataRoute } from 'next'

// Canonical site URL. Override via the `NEXT_PUBLIC_SITE_URL` build var
// when the canonical hostname changes (e.g., during DNS migration). The
// fallback assumes the long-term canonical — Google Search Console only
// trusts the property the sitemap is hosted under, so the value here
// MUST match the host visitors actually reach.
//
// Use `||` (not `??`) — when the workflow Variable is unset, GitHub
// Actions still injects the env var with an empty string, which `??`
// treats as a real value and skips the fallback. `||` correctly falls
// through on empty.
const BASE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://sergioluque.com').replace(/\/$/, '')

// `lastModified` for the static section. Lazy-initialized on first
// request because Cloudflare Workers gate `Date` during top-level
// module evaluation — `new Date()` at the module scope returns
// `new Date(0)` (Unix epoch) to prevent timing side-channels. After
// the first request, the timestamp is stable for the lifetime of
// this isolate, so each cold start reports a single value across
// every entry while crawls don't see "everything changed at this
// exact second" the way per-request `new Date()` would.
let cachedBuildTime: Date | null = null
function getBuildTime(): Date {
  if (cachedBuildTime == null) cachedBuildTime = new Date()
  return cachedBuildTime
}

type ChangeFreq = NonNullable<MetadataRoute.Sitemap[number]['changeFrequency']>
type StaticEntry = { path: string; changeFrequency: ChangeFreq; priority: number }

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const buildTime = getBuildTime()

  // Static paths, sorted from most-changing to least.
  // Hidden sections drop out of the sitemap entirely so search engines
  // don't try to index pages that 404 behind the feature flag.
  const rawStatic: (StaticEntry | null)[] = [
    { path: '', changeFrequency: 'daily', priority: 1.0 },
    { path: '/news', changeFrequency: 'weekly', priority: 0.9 },
    { path: '/listen', changeFrequency: 'weekly', priority: 0.9 },
    { path: '/catalogue', changeFrequency: 'weekly', priority: 0.9 },
    { path: '/bio', changeFrequency: 'monthly', priority: 0.7 },
    { path: '/stochastics', changeFrequency: 'monthly', priority: 0.6 },
    { path: '/contact', changeFrequency: 'yearly', priority: 0.5 },
    { path: '/privacy', changeFrequency: 'yearly', priority: 0.3 },
    PUBLIC_SECTIONS.projects
      ? { path: '/projects', changeFrequency: 'monthly', priority: 0.6 }
      : null,
    PUBLIC_SECTIONS.blog
      ? { path: '/blog', changeFrequency: 'weekly', priority: 0.6 }
      : null,
  ]
  const staticEntries: MetadataRoute.Sitemap = rawStatic
    .filter((e): e is StaticEntry => e !== null)
    .map(({ path, changeFrequency, priority }) => ({
      url: `${BASE_URL}${path}`,
      lastModified: buildTime,
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
          lastModified: buildTime,
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
          lastModified: post.publishedAt ? new Date(post.publishedAt) : buildTime,
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
          lastModified: buildTime,
          changeFrequency: 'yearly',
          priority: 0.6,
        })
      }
    }
  }

  return [...staticEntries, ...dynamicEntries]
}
