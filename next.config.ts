import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/lib/i18n/request.ts')

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'media.sergioluque.com',
      },
      {
        protocol: 'https',
        hostname: 'pub-*.r2.dev',
      },
      {
        protocol: 'https',
        hostname: 'sergioluque-cms.carlosluque-095.workers.dev',
      },
      {
        protocol: 'https',
        hostname: 'api.sergioluque.com',
      },
    ],
  },
}

export default withNextIntl(nextConfig)
