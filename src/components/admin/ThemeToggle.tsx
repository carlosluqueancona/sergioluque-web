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
        background: 'var(--text-primary)',
        border: 'none',
        color: 'var(--bg)',
        fontFamily: 'monospace',
        fontSize: '11px',
        fontWeight: 700,
        padding: '5px 13px',
        cursor: 'pointer',
        letterSpacing: '0.1em',
        transition: 'background 150ms ease, color 150ms ease',
      }}
    >
      {theme === 'dark' ? '☀  LIGHT' : '☾  DARK'}
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
