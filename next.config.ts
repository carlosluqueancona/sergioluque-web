import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'media.sergioluque.com' },
      { protocol: 'https', hostname: 'pub-*.r2.dev' },
      { protocol: 'https', hostname: 'sergioluque-cms.carlosluque-095.workers.dev' },
      { protocol: 'https', hostname: 'api.sergioluque.com' },
      { protocol: 'https', hostname: 'upload.wikimedia.org' },
    ],
  },
  // Permanent redirects after public-route renames. The earlier
  // public/_redirects file was kept around but Cloudflare Pages with
  // @cloudflare/next-on-pages routes everything through the generated
  // _worker.js, which never consults the static _redirects file — so
  // those rules silently 404'd in production. next.config.ts redirects()
  // are baked into the worker bundle and DO fire. permanent: true emits
  // a 308 (preserves the request method).
  async redirects() {
    return [
      { source: '/works', destination: '/listen', permanent: true },
      { source: '/works/:slug', destination: '/listen/:slug', permanent: true },
      { source: '/concerts', destination: '/news', permanent: true },
      { source: '/publications', destination: '/stochastics', permanent: true },
    ]
  },
}

export default nextConfig
