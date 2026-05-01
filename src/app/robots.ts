export const runtime = 'edge'

import type { MetadataRoute } from 'next'

// Same env-driven base URL as sitemap.ts — keeps the two sources in sync
// when the canonical host changes. Trailing slash trimmed so we don't
// end up with `https://example.com//sitemap.xml`.
const BASE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sergioluque.com').replace(/\/$/, '')

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Admin is JWT-gated and the API route handlers don't render any
      // content humans should land on from search. Disallow keeps them
      // out of search results without touching the auth layer.
      disallow: ['/admin/', '/api/'],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
