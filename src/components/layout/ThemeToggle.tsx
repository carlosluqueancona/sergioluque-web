'use client'

import { useEffect, useState } from 'react'

export const THEME_STORAGE_KEY = 'sl-theme'

type Theme = 'light' | 'dark'

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('dark')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const root = document.documentElement
    const current = (root.getAttribute('data-theme') as Theme) || 'dark'
    setTheme(current)
    setMounted(true)
  }, [])

  function toggle() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    document.documentElement.setAttribute('data-theme', next)
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next)
    } catch {
      // ignore quota / privacy mode
    }
  }

  // Render an inert placeholder server-side so the layout never shifts;
  // swap to the real label once we know which theme is active.
  const label = mounted ? (theme === 'dark' ? '☀' : '☾') : '·'
  const ariaLabel = mounted
    ? theme === 'dark'
      ? 'Cambiar a modo claro'
      : 'Cambiar a modo oscuro'
    : 'Cambiar tema'

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={ariaLabel}
      style={{
        background: 'none',
        border: '1px solid var(--border)',
        color: 'var(--text-primary)',
        fontFamily: 'var(--font-space-mono)',
        fontSize: '13px',
        width: '28px',
        height: '28px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        padding: 0,
        lineHeight: 1,
        transition: 'border-color 150ms ease, background-color 150ms ease',
      }}
    >
      {label}
    </button>
  )
}

/**
 * Inline script that runs before React hydrates so the chosen theme is applied
 * to <html> on first paint — prevents a flash of the wrong theme.
 * Also falls back to the OS preference when no choice is stored yet.
 */
export const themeBootstrapScript = `
(function() {
  try {
    // Clear any leftover admin theme attribute so admin's CSS doesn't bleed
    // into the public site after navigating away from /admin.
    document.documentElement.removeAttribute('data-admin-theme');
    var stored = localStorage.getItem('${THEME_STORAGE_KEY}');
    var theme;
    if (stored === 'light' || stored === 'dark') {
      theme = stored;
    } else {
      theme = (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) ? 'light' : 'dark';
    }
    document.documentElement.setAttribute('data-theme', theme);
  } catch (e) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
})();
`.trim()
