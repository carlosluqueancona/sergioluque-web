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
  // Security headers (Cyber Neo CN-010). Same delivery story as
  // redirects(): with @cloudflare/next-on-pages a static public/_headers
  // file is bypassed by the generated _worker.js, but headers() entries
  // are baked into the worker and DO fire on every response. Applied to
  // every route via source: '/(.*)'.
  //
  // The CSP keeps 'unsafe-inline' for script-src because the layout has
  // three legitimate inline blocks (theme bootstrap, the Lissajous
  // window.__LIS_CFG__ JSON, and the per-theme accent style override),
  // plus the Google Tag Manager bootstrap. Migrating those to nonce-
  // based external scripts is a follow-up. Even with 'unsafe-inline',
  // the CSP still blocks injection of EXTERNAL scripts from non-allowed
  // hosts — defence in depth against any future XSS sink.
  //
  // img-src includes data: for the inline shadcn icons + every remote
  // host listed in images.remotePatterns above. media-src covers the
  // worker's /media/* audio proxy and the SoundCloud iframe player on
  // /stochastics. frame-ancestors 'none' kills clickjacking.
  async headers() {
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' data: https://fonts.gstatic.com",
      "img-src 'self' data: https://media.sergioluque.com https://*.r2.dev https://sergioluque-cms.carlosluque-095.workers.dev https://api.sergioluque.com https://upload.wikimedia.org https://www.googletagmanager.com https://www.google-analytics.com",
      "media-src 'self' https://*.r2.dev https://sergioluque-cms.carlosluque-095.workers.dev https://media.sergioluque.com https://w.soundcloud.com",
      "connect-src 'self' https://sergioluque-cms.carlosluque-095.workers.dev https://www.google-analytics.com https://www.googletagmanager.com https://api.sergioluque.com https://*.r2.dev",
      "frame-src https://w.soundcloud.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
      "upgrade-insecure-requests",
    ].join('; ')

    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=(), browsing-topics=()' },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Content-Security-Policy', value: csp },
        ],
      },
    ]
  },
}

export default nextConfig
