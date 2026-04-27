'use client'

import { useLocale } from 'next-intl'
import { usePathname, useRouter } from '@/lib/i18n/navigation'
import type { Locale } from '@/types'

export function LanguageSwitcher() {
  const locale = useLocale() as Locale
  const router = useRouter()
  const pathname = usePathname()

  function switchLocale(newLocale: Locale) {
    router.replace(pathname, { locale: newLocale })
  }

  return (
    <div
      style={{
        fontFamily: 'var(--font-space-mono)',
        fontSize: '12px',
        letterSpacing: '0.1em',
        display: 'flex',
        gap: '4px',
        alignItems: 'center',
      }}
    >
      <button
        onClick={() => switchLocale('es')}
        className="lang-btn"
        style={{
          color: locale === 'es' ? 'var(--text-primary)' : 'var(--text-muted)',
          textDecoration: locale === 'es' ? 'underline' : 'none',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '4px',
          fontFamily: 'inherit',
          fontSize: 'inherit',
          letterSpacing: 'inherit',
        }}
        aria-label="Cambiar a español"
      >
        ES
      </button>
      <span style={{ color: 'var(--text-muted)' }}>/</span>
      <button
        onClick={() => switchLocale('en')}
        className="lang-btn"
        style={{
          color: locale === 'en' ? 'var(--text-primary)' : 'var(--text-muted)',
          textDecoration: locale === 'en' ? 'underline' : 'none',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '4px',
          fontFamily: 'inherit',
          fontSize: 'inherit',
          letterSpacing: 'inherit',
        }}
        aria-label="Switch to English"
      >
        EN
      </button>
    </div>
  )
}
