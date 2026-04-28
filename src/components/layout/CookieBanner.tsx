'use client'

import { useEffect, useState } from 'react'
import {
  OPEN_PREFERENCES_EVENT,
  readConsent,
  writeConsent,
} from '@/lib/cookie-consent'

type Mode = 'hidden' | 'banner' | 'preferences'

const COPY = {
  title: 'Cookies & privacy',
  body:
    'This site uses cookies and local storage to remember your preferences (theme) and, if you allow it, to measure traffic. You can change your choice at any time from the footer.',
  acceptAll: 'Accept all',
  rejectOptional: 'Reject optional',
  customize: 'Customize',
  save: 'Save preferences',
  close: 'Close',
  prefsTitle: 'Cookie preferences',
  prefsIntro:
    'Necessary items keep the site working. Optional categories are off by default and only load when you grant consent.',
  necessaryLabel: 'Strictly necessary',
  necessaryDesc:
    'Theme preference, admin authentication when signed in. The site cannot function without these.',
  analyticsLabel: 'Analytics',
  analyticsDesc:
    'Anonymous usage data to understand which works and pages get visited. No personal profile is built.',
  marketingLabel: 'Marketing',
  marketingDesc:
    'Embeds from third parties (e.g. social sharing, ads). Currently unused — kept here so future additions respect your choice.',
}

const styles = {
  bannerWrap: {
    position: 'fixed',
    left: '16px',
    right: '16px',
    bottom: '16px',
    zIndex: 1000,
    maxWidth: '640px',
    margin: '0 auto',
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    padding: '20px',
    fontFamily: 'var(--font-space-mono), monospace',
    boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
  } as React.CSSProperties,
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.55)',
    backdropFilter: 'blur(2px)',
    zIndex: 1001,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px',
  } as React.CSSProperties,
  modalCard: {
    width: '100%',
    maxWidth: '560px',
    maxHeight: '85vh',
    overflow: 'auto',
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    padding: '24px',
    fontFamily: 'var(--font-space-mono), monospace',
  } as React.CSSProperties,
  title: {
    fontSize: '13px',
    fontWeight: 700,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: 'var(--text-primary)',
    margin: '0 0 12px',
  } as React.CSSProperties,
  body: {
    fontSize: '12px',
    lineHeight: 1.6,
    color: 'var(--text-secondary)',
    margin: '0 0 16px',
  } as React.CSSProperties,
  btnRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    justifyContent: 'flex-end',
  } as React.CSSProperties,
  btnPrimary: {
    background: 'var(--text-primary)',
    color: 'var(--bg)',
    border: '1px solid var(--text-primary)',
    fontFamily: 'monospace',
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.1em',
    padding: '8px 16px',
    cursor: 'pointer',
    textTransform: 'uppercase',
  } as React.CSSProperties,
  btnGhost: {
    background: 'none',
    color: 'var(--text-secondary)',
    border: '1px solid var(--border)',
    fontFamily: 'monospace',
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.1em',
    padding: '8px 16px',
    cursor: 'pointer',
    textTransform: 'uppercase',
  } as React.CSSProperties,
  category: {
    borderTop: '1px solid var(--border)',
    padding: '16px 0',
  } as React.CSSProperties,
  categoryHead: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
  } as React.CSSProperties,
  categoryLabel: {
    fontSize: '12px',
    fontWeight: 700,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: 'var(--text-primary)',
  } as React.CSSProperties,
  categoryDesc: {
    fontSize: '11px',
    lineHeight: 1.6,
    color: 'var(--text-muted)',
    margin: '8px 0 0',
  } as React.CSSProperties,
  toggle: {
    appearance: 'none' as const,
    WebkitAppearance: 'none' as const,
    width: '36px',
    height: '20px',
    background: 'var(--border)',
    border: '1px solid var(--border)',
    cursor: 'pointer',
    position: 'relative' as const,
    transition: 'background 150ms ease',
    flexShrink: 0,
  } as React.CSSProperties,
}

function Toggle({
  checked,
  disabled,
  onChange,
  label,
}: {
  checked: boolean
  disabled?: boolean
  onChange?: (next: boolean) => void
  label: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => !disabled && onChange?.(!checked)}
      style={{
        ...styles.toggle,
        background: checked ? 'var(--accent)' : 'var(--border)',
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: '1px',
          left: checked ? '17px' : '1px',
          width: '16px',
          height: '16px',
          background: checked ? 'var(--bg)' : 'var(--text-muted)',
          transition: 'left 150ms ease, background 150ms ease',
        }}
      />
    </button>
  )
}

export function CookieBanner() {
  const [mode, setMode] = useState<Mode>('hidden')
  const [analytics, setAnalytics] = useState(false)
  const [marketing, setMarketing] = useState(false)

  // Decide initial mode after mount (we need localStorage which is browser-only).
  useEffect(() => {
    const existing = readConsent()
    if (existing) {
      setAnalytics(existing.analytics)
      setMarketing(existing.marketing)
      setMode('hidden')
    } else {
      setMode('banner')
    }

    function openPrefs() {
      const fresh = readConsent()
      if (fresh) {
        setAnalytics(fresh.analytics)
        setMarketing(fresh.marketing)
      }
      setMode('preferences')
    }
    window.addEventListener(OPEN_PREFERENCES_EVENT, openPrefs)
    return () => window.removeEventListener(OPEN_PREFERENCES_EVENT, openPrefs)
  }, [])

  // Close preferences modal on Escape.
  useEffect(() => {
    if (mode !== 'preferences') return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setMode('hidden')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [mode])

  function commit(next: { analytics: boolean; marketing: boolean }) {
    setAnalytics(next.analytics)
    setMarketing(next.marketing)
    writeConsent(next)
    setMode('hidden')
  }

  function acceptAll() {
    commit({ analytics: true, marketing: true })
  }

  function rejectOptional() {
    commit({ analytics: false, marketing: false })
  }

  function saveCustom() {
    commit({ analytics, marketing })
  }

  if (mode === 'hidden') return null

  if (mode === 'banner') {
    return (
      <div role="dialog" aria-labelledby="cookie-banner-title" style={styles.bannerWrap}>
        <h2 id="cookie-banner-title" style={styles.title}>
          {COPY.title}
        </h2>
        <p style={styles.body}>{COPY.body}</p>
        <div style={styles.btnRow}>
          <button type="button" style={styles.btnGhost} onClick={() => setMode('preferences')}>
            {COPY.customize}
          </button>
          <button type="button" style={styles.btnGhost} onClick={rejectOptional}>
            {COPY.rejectOptional}
          </button>
          <button type="button" style={styles.btnPrimary} onClick={acceptAll}>
            {COPY.acceptAll}
          </button>
        </div>
      </div>
    )
  }

  // mode === 'preferences'
  return (
    <div
      role="dialog"
      aria-labelledby="cookie-prefs-title"
      style={styles.modalOverlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) setMode('hidden')
      }}
    >
      <div style={styles.modalCard}>
        <h2 id="cookie-prefs-title" style={styles.title}>
          {COPY.prefsTitle}
        </h2>
        <p style={styles.body}>{COPY.prefsIntro}</p>

        <div style={styles.category}>
          <div style={styles.categoryHead}>
            <span style={styles.categoryLabel}>{COPY.necessaryLabel}</span>
            <Toggle checked disabled label={COPY.necessaryLabel} />
          </div>
          <p style={styles.categoryDesc}>{COPY.necessaryDesc}</p>
        </div>

        <div style={styles.category}>
          <div style={styles.categoryHead}>
            <span style={styles.categoryLabel}>{COPY.analyticsLabel}</span>
            <Toggle
              checked={analytics}
              onChange={setAnalytics}
              label={COPY.analyticsLabel}
            />
          </div>
          <p style={styles.categoryDesc}>{COPY.analyticsDesc}</p>
        </div>

        <div style={styles.category}>
          <div style={styles.categoryHead}>
            <span style={styles.categoryLabel}>{COPY.marketingLabel}</span>
            <Toggle
              checked={marketing}
              onChange={setMarketing}
              label={COPY.marketingLabel}
            />
          </div>
          <p style={styles.categoryDesc}>{COPY.marketingDesc}</p>
        </div>

        <div style={{ ...styles.btnRow, marginTop: '20px' }}>
          <button type="button" style={styles.btnGhost} onClick={() => setMode('hidden')}>
            {COPY.close}
          </button>
          <button type="button" style={styles.btnGhost} onClick={rejectOptional}>
            {COPY.rejectOptional}
          </button>
          <button type="button" style={styles.btnPrimary} onClick={saveCustom}>
            {COPY.save}
          </button>
        </div>
      </div>
    </div>
  )
}

