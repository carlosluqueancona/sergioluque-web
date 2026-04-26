'use client'

import Link from 'next/link'

interface NavLinkProps {
  href: string
  label: string
}

export function NavLink({ href, label }: NavLinkProps) {
  return (
    <Link
      href={href}
      style={{
        fontFamily: 'var(--font-space-mono)',
        fontSize: '11px',
        letterSpacing: '0.1em',
        color: 'var(--text-secondary)',
        textDecoration: 'none',
        textTransform: 'uppercase' as const,
        transition: 'color 150ms ease-out',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)' }}
      onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)' }}
    >
      {label}
    </Link>
  )
}
