'use client'

import { openCookiePreferences } from '@/lib/cookie-consent'

export function CookiePreferencesLink() {
  return (
    <button
      type="button"
      onClick={openCookiePreferences}
      style={{
        background: 'none',
        border: 'none',
        padding: 0,
        margin: 0,
        fontFamily: 'var(--font-space-mono)',
        fontSize: '10px',
        letterSpacing: '0.1em',
        color: 'var(--text-muted)',
        textTransform: 'uppercase',
        textAlign: 'left',
        cursor: 'pointer',
        textDecoration: 'none',
        lineHeight: 1,
      }}
    >
      Cookies
    </button>
  )
}
