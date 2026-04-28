/**
 * Cookie consent storage + read API.
 *
 * Categories:
 * - necessary: theme localStorage, admin auth cookie. Always granted.
 * - analytics: reserved for future GA4 / similar.
 * - marketing: reserved for future ad pixels / social trackers.
 *
 * Anything outside `necessary` MUST gate on `hasConsent('analytics' | 'marketing')`
 * before loading scripts or sending data.
 */

export type ConsentCategory = 'necessary' | 'analytics' | 'marketing'

export interface ConsentState {
  necessary: true
  analytics: boolean
  marketing: boolean
  timestamp: number
}

export const CONSENT_STORAGE_KEY = 'sl-cookie-consent'
export const CONSENT_EVENT = 'sl-cookie-consent-changed'

const DEFAULT_PRE_CONSENT: ConsentState = {
  necessary: true,
  analytics: false,
  marketing: false,
  timestamp: 0,
}

export function readConsent(): ConsentState | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(CONSENT_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<ConsentState>
    if (typeof parsed !== 'object' || parsed === null) return null
    return {
      necessary: true,
      analytics: parsed.analytics === true,
      marketing: parsed.marketing === true,
      timestamp: typeof parsed.timestamp === 'number' ? parsed.timestamp : 0,
    }
  } catch {
    return null
  }
}

export function writeConsent(next: Omit<ConsentState, 'necessary' | 'timestamp'>): ConsentState {
  const state: ConsentState = {
    necessary: true,
    analytics: next.analytics,
    marketing: next.marketing,
    timestamp: Date.now(),
  }
  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(state))
    window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: state }))
  } catch {
    /* storage unavailable / quota — ignore */
  }
  return state
}

export function hasConsent(category: ConsentCategory): boolean {
  if (category === 'necessary') return true
  const state = readConsent() ?? DEFAULT_PRE_CONSENT
  return state[category] === true
}

/**
 * Subscribe to consent changes. Fires for both same-tab updates (via
 * CustomEvent) and cross-tab updates (via storage event). Returns an
 * unsubscribe function.
 */
export function onConsentChange(callback: (state: ConsentState) => void): () => void {
  if (typeof window === 'undefined') return () => {}
  const handler = (e: Event) => {
    const detail = (e as CustomEvent<ConsentState>).detail
    if (detail) callback(detail)
    else {
      const fresh = readConsent()
      if (fresh) callback(fresh)
    }
  }
  const storageHandler = (e: StorageEvent) => {
    if (e.key === CONSENT_STORAGE_KEY) {
      const fresh = readConsent()
      if (fresh) callback(fresh)
    }
  }
  window.addEventListener(CONSENT_EVENT, handler)
  window.addEventListener('storage', storageHandler)
  return () => {
    window.removeEventListener(CONSENT_EVENT, handler)
    window.removeEventListener('storage', storageHandler)
  }
}

/**
 * Open the cookie preferences modal. Used by the footer link and
 * any "manage cookies" surface elsewhere in the app.
 */
export const OPEN_PREFERENCES_EVENT = 'sl-cookie-open-preferences'
export function openCookiePreferences(): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(OPEN_PREFERENCES_EVENT))
}
