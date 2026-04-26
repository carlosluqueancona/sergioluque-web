'use client'

import { useEffect, useState } from 'react'

const STORAGE_KEY = 'sl-admin-theme'

type Theme = 'light' | 'dark'

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('dark')

  useEffect(() => {
    const root = document.documentElement
    const current = (root.getAttribute('data-admin-theme') as Theme) || 'dark'
    setTheme(current)
  }, [])

  function toggle() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    document.documentElement.setAttribute('data-admin-theme', next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // ignore quota / privacy mode
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      style={{
        background: 'none',
        border: '1px solid var(--border)',
        color: 'var(--text-muted)',
        fontFamily: 'monospace',
        fontSize: '11px',
        padding: '4px 12px',
        cursor: 'pointer',
        letterSpacing: '0.1em',
      }}
    >
      {theme === 'dark' ? '☾  DARK' : '☀  LIGHT'}
    </button>
  )
}

// Inline script string that runs before React hydrates — prevents flash of wrong theme
export const themeBootstrapScript = `
(function() {
  try {
    var t = localStorage.getItem('${STORAGE_KEY}');
    if (t !== 'light' && t !== 'dark') t = 'dark';
    document.documentElement.setAttribute('data-admin-theme', t);
  } catch (e) {
    document.documentElement.setAttribute('data-admin-theme', 'dark');
  }
})();
`.trim()
