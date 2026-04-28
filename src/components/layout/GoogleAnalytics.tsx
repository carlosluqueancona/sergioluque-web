'use client'

import Script from 'next/script'
import { useEffect, useRef, useState } from 'react'
import { hasConsent, onConsentChange, readConsent } from '@/lib/cookie-consent'

/**
 * Google Analytics 4 with Google Consent Mode v2.
 *
 * Set NEXT_PUBLIC_GA_ID (e.g. "G-XXXXXXXXXX") in env to activate. If the
 * env var is missing, this component renders nothing — safe to leave
 * mounted while you're still wiring up your GA property.
 *
 * Consent flow:
 * 1. The gtag stub + Consent Mode default ("denied" everywhere) is
 *    declared inline BEFORE the GA snippet runs. This lets GA queue
 *    pings as cookieless pings until the user grants consent — exactly
 *    how Google recommends in Consent Mode v2.
 * 2. The GA loader (gtag.js) loads on first paint regardless of
 *    consent. It reads the default "denied" and behaves accordingly:
 *    no GA cookies, only anonymised pings.
 * 3. When the user accepts analytics in our cookie banner, we send a
 *    `gtag('consent', 'update', { ... })` with `analytics_storage:
 *    'granted'`. GA upgrades to full measurement immediately.
 * 4. Marketing/ad consents map to ad_storage / ad_user_data /
 *    ad_personalization so future ad-related tags work too.
 */

const GA_ID = process.env.NEXT_PUBLIC_GA_ID

interface GtagWindow extends Window {
  dataLayer?: unknown[]
  gtag?: (...args: unknown[]) => void
}

export function GoogleAnalytics() {
  const [mounted, setMounted] = useState(false)
  const initialState = useRef<{ analytics: boolean; marketing: boolean } | null>(null)

  // Capture stored consent (if any) before the first script runs so the
  // inline default declaration matches the user's prior choice.
  if (initialState.current === null && typeof window !== 'undefined') {
    const c = readConsent()
    initialState.current = c
      ? { analytics: c.analytics, marketing: c.marketing }
      : { analytics: false, marketing: false }
  }

  useEffect(() => {
    setMounted(true)
    if (!GA_ID) return

    // Wire consent updates to gtag's consent API.
    const unsubscribe = onConsentChange((state) => {
      const w = window as GtagWindow
      if (!w.gtag) return
      w.gtag('consent', 'update', {
        analytics_storage: state.analytics ? 'granted' : 'denied',
        ad_storage: state.marketing ? 'granted' : 'denied',
        ad_user_data: state.marketing ? 'granted' : 'denied',
        ad_personalization: state.marketing ? 'granted' : 'denied',
      })
    })

    return unsubscribe
  }, [])

  if (!GA_ID || !mounted) return null

  const initial = initialState.current ?? { analytics: false, marketing: false }
  const consentDefaultScript = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    window.gtag = gtag;
    gtag('consent', 'default', {
      analytics_storage: '${initial.analytics ? 'granted' : 'denied'}',
      ad_storage: '${initial.marketing ? 'granted' : 'denied'}',
      ad_user_data: '${initial.marketing ? 'granted' : 'denied'}',
      ad_personalization: '${initial.marketing ? 'granted' : 'denied'}',
      wait_for_update: 500
    });
    gtag('js', new Date());
    gtag('config', '${GA_ID}', { anonymize_ip: true });
  `.trim()

  return (
    <>
      <Script
        id="ga-consent-default"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: consentDefaultScript }}
      />
      <Script
        id="ga-loader"
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
      />
    </>
  )
}

/**
 * Imperatively send a custom GA4 event. Respects current consent — if
 * analytics consent isn't granted, the event is dropped entirely
 * (Consent Mode handles the cookieless ping case server-side).
 *
 * Usage:
 *   trackEvent('play_audio', { work_id: '123', work_title: 'Sonata' })
 */
export function trackEvent(name: string, params?: Record<string, unknown>) {
  if (typeof window === 'undefined') return
  if (!hasConsent('analytics')) return
  const w = window as GtagWindow
  if (!w.gtag) return
  w.gtag('event', name, params ?? {})
}
