'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

interface NavLink {
  href: string
  label: string
}

interface MobileNavProps {
  links: NavLink[]
  menuLabel: string
}

export function MobileNav({ links, menuLabel }: MobileNavProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close when clicking outside or pressing Escape.
  useEffect(() => {
    if (!open) return
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={ref} className="site-nav-mobile">
      <button
        type="button"
        aria-expanded={open}
        aria-label={menuLabel}
        onClick={() => setOpen((v) => !v)}
        className="icon-toggle"
        style={{
          background: 'none',
          border: '1px solid var(--border)',
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-space-mono)',
          fontSize: '14px',
          width: '32px',
          height: '32px',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          padding: 0,
          lineHeight: 1,
        }}
      >
        {open ? '×' : '☰'}
      </button>

      {open && (
        <nav className="site-nav-mobile-panel" aria-label={menuLabel}>
          {links.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)}>
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </div>
  )
}
