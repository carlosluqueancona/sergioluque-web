export const runtime = 'edge'

import type { Metadata } from 'next'
import { Space_Mono, IBM_Plex_Sans } from 'next/font/google'
import './globals.css'
import { themeBootstrapScript } from '@/components/layout/ThemeToggle'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { CookieBanner } from '@/components/layout/CookieBanner'
import { GoogleAnalytics } from '@/components/layout/GoogleAnalytics'
import { PublicChrome } from '@/components/layout/PublicChrome'
import { ExclusivePlayback } from '@/components/audio/ExclusivePlayback'
import { getSettings } from '@/lib/db/queries'

const spaceMono = Space_Mono({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-space-mono',
  display: 'swap',
})

const ibmPlexSans = IBM_Plex_Sans({
  weight: ['400', '500'],
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--font-ibm-plex-sans',
  display: 'swap',
})

// Site-wide metadata, including the OG image used by WhatsApp / Twitter
// / Facebook / iMessage previews. The image URL comes from admin →
// Settings → "Social share image" so the operator can swap it without
// a redeploy. Falls back to the static /og-default.jpg if no setting
// is configured.
export async function generateMetadata(): Promise<Metadata> {
  let socialImage: string | undefined
  try {
    const settings = await getSettings()
    socialImage = settings?.socialShareImageUrl
  } catch {
    /* tolerate worker outages — fall through to the static default */
  }
  const ogUrl = socialImage || '/og-default.jpg'
  return {
    title: {
      default: 'Sergio Luque — Composer',
      template: '%s — Sergio Luque',
    },
    description:
      'Composer Sergio Luque — instrumental, electroacoustic, and stochastic synthesis works. Listen, browse the catalogue, and read about the work.',
    // Default canonical for the home. Sub-pages override via their own
    // `alternates.canonical` (relative paths resolve against
    // metadataBase below).
    alternates: { canonical: '/' },
    openGraph: {
      type: 'website',
      locale: 'en_GB',
      siteName: 'Sergio Luque',
      images: [{ url: ogUrl, width: 1200, height: 630 }],
    },
    twitter: { card: 'summary_large_image', images: [ogUrl] },
    // src/app/favicon.ico is auto-detected by Next; the rest of the
    // icon set lives in /public and is wired up explicitly here so
    // browsers / iOS / Android pick the right asset for each surface.
    icons: {
      icon: [
        { url: '/favicon.svg', type: 'image/svg+xml' },
        { url: '/favicon-96x96.png', type: 'image/png', sizes: '96x96' },
      ],
      apple: '/apple-touch-icon.png',
    },
    manifest: '/site.webmanifest',
    metadataBase: new URL('https://sergioluque.com'),
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Read the global appearance toggle from settings so we can paint orange
  // CTAs server-side. Tolerant of Worker outages — falls through to the
  // default monochrome accent when the fetch fails.
  // Lissajous KV is also read here once and stuffed into a global the Hero
  // component picks up — saves a second fetch on the home page.
  let ctaOrange = false
  let lissajousJson = '{}'
  let accentDark: string | undefined
  let accentLight: string | undefined
  let headingsCustom = false
  let headingDark: string | undefined
  let headingLight: string | undefined
  // Social-profile URLs from Settings → injected into Person.sameAs
  // in the JSON-LD below. Operator manages these in admin → Settings;
  // unset entries are dropped (the JSON-LD only emits validated URLs).
  let sameAs: string[] = []
  let profileImageUrl: string | undefined
  try {
    const settings = await getSettings()
    ctaOrange = !!settings?.ctaOrange
    accentDark = settings?.accentColorDark
    accentLight = settings?.accentColorLight
    headingsCustom = !!settings?.headingsCustomEnabled
    headingDark = settings?.headingColorDark
    headingLight = settings?.headingColorLight
    profileImageUrl = settings?.profileImageUrl
    sameAs = [
      settings?.socialTwitter,
      settings?.socialInstagram,
      settings?.socialYoutube,
      settings?.socialSoundcloud,
      settings?.socialBandcamp,
      settings?.socialFacebook,
      settings?.socialLinkedin,
    ].filter(
      (u): u is string => typeof u === 'string' && /^https?:\/\//i.test(u)
    )
    if (settings?.lissajous) {
      // CN-014: escape every character that, inside a JSON literal
      // embedded in an HTML <script> block, can prematurely terminate
      // the script or be interpreted by the JS parser as a line
      // terminator:
      //   `<` (closes <script>; also handles `</script>`)
      //   U+2028, U+2029 (LINE/PARAGRAPH SEPARATOR — JSON allows
      //   them unescaped but JavaScript treats them as line breaks,
      //   ending a string literal)
      // All lis_* values are constrained (numbers, hex colours, enum
      // strings, CSV ratios) so none of these realistically appear
      // today, but defence in depth: if any user-influenced field
      // ever flows into lissajousJson, the escape keeps the inline
      // <script> well-formed.
      lissajousJson = JSON.stringify(settings.lissajous).replace(
        /[<\u2028\u2029]/g,
        (ch) => `\\u${ch.charCodeAt(0).toString(16).padStart(4, '0')}`
      )
    }
  } catch {
    /* ignore — keep default accent + default Lissajous look */
  }

  // Build per-theme overrides for --accent and --heading. Hex format
  // guarded with a regex so a malformed setting can't break out of
  // <style>. The heading rules are emitted AFTER the accent rules so
  // they take precedence within the same specificity layer when both
  // overrides are active.
  const isHex = (v?: string) => !!v && /^#[0-9a-fA-F]{3,8}$/.test(v.trim())
  const accentRules =
    ctaOrange && (isHex(accentDark) || isHex(accentLight))
      ? [
          isHex(accentDark)
            ? `html[data-cta="orange"][data-theme="dark"], html[data-cta="orange"]:not([data-theme="light"]) { --accent: ${accentDark}; --heading: ${accentDark}; }`
            : '',
          isHex(accentLight)
            ? `html[data-cta="orange"][data-theme="light"] { --accent: ${accentLight}; --heading: ${accentLight}; }`
            : '',
        ]
          .filter(Boolean)
          .join('\n')
      : ''
  const headingRules =
    headingsCustom && (isHex(headingDark) || isHex(headingLight))
      ? [
          isHex(headingDark)
            ? `html[data-headings="custom"][data-theme="dark"], html[data-headings="custom"]:not([data-theme="light"]) { --heading: ${headingDark}; }`
            : '',
          isHex(headingLight)
            ? `html[data-headings="custom"][data-theme="light"] { --heading: ${headingLight}; }`
            : '',
        ]
          .filter(Boolean)
          .join('\n')
      : ''
  const accentStyle = [accentRules, headingRules].filter(Boolean).join('\n')

  return (
    <html
      lang="en"
      data-cta={ctaOrange ? 'orange' : 'default'}
      data-headings={headingsCustom ? 'custom' : 'default'}
      suppressHydrationWarning
    >
      <head>
        {/* Runs before paint so the chosen theme is on <html> the first frame. */}
        <script dangerouslySetInnerHTML={{ __html: themeBootstrapScript }} />
        {/*
          Stash the Lissajous config on window before the Hero component
          mounts. Read by HeroLissajous which is a client component without
          access to server data otherwise. JSON-encoded literal — safe.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `window.__LIS_CFG__ = ${lissajousJson};`,
          }}
        />
        {accentStyle && (
          <style dangerouslySetInnerHTML={{ __html: accentStyle }} />
        )}
        {/*
          Site-wide JSON-LD. Two graphs:
            * Person — anchors the brand entity ("Sergio Luque is a
              composer") so Google can build a Knowledge Panel and
              link the right name to the right work, AI search engines
              can ground answers, and image searches return the right
              attribution.
            * WebSite — declares the canonical URL and lets Google
              show a sitelinks search box on SERPs.
          Both reference each other via @id so the graph is connected.
          JSON-encoded with the same `<` / U+2028 / U+2029 escape used
          for the Lissajous config above (see CN-014).
        */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@graph': [
                {
                  '@type': 'Person',
                  '@id': 'https://sergioluque.com/#person',
                  name: 'Sergio Luque',
                  jobTitle: 'Composer',
                  description:
                    'Composer of instrumental, electroacoustic, and stochastic synthesis works.',
                  url: 'https://sergioluque.com',
                  // image lets Google attach the right portrait when
                  // building a Knowledge Panel. Pulls from Settings →
                  // Profile image, same source as /bio's hero portrait.
                  ...(profileImageUrl ? { image: profileImageUrl } : {}),
                  // sameAs corroborates "this is the same person" to
                  // the Google Knowledge Graph. Populated dynamically
                  // from admin → Settings → Social, so the operator
                  // can add new platforms without a code change.
                  sameAs,
                },
                {
                  '@type': 'WebSite',
                  '@id': 'https://sergioluque.com/#website',
                  url: 'https://sergioluque.com',
                  name: 'Sergio Luque',
                  description:
                    'Composer Sergio Luque — instrumental, electroacoustic, and stochastic synthesis works.',
                  inLanguage: 'en-GB',
                  publisher: { '@id': 'https://sergioluque.com/#person' },
                },
              ],
            }).replace(
              /[<\u2028\u2029]/g,
              (ch) => `\\u${ch.charCodeAt(0).toString(16).padStart(4, '0')}`
            ),
          }}
        />
      </head>
      <body className={`${spaceMono.variable} ${ibmPlexSans.variable} antialiased`}>
        <ExclusivePlayback />
        <PublicChrome
          header={<Header />}
          footer={<Footer />}
          cookieBanner={<CookieBanner />}
        >
          {children}
        </PublicChrome>
        <GoogleAnalytics />
      </body>
    </html>
  )
}
