'use client'

import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

/**
 * Wraps the public site chrome (Header / Footer / cookie banner) so each
 * piece can be rendered server-side but hidden when the visitor is inside
 * the admin (`/admin/*`). The admin has its own nav and layout — showing
 * the public Header on top of it produces a duplicated, misaligned menu.
 *
 * Header, footer and cookieBanner come in as JSX props so they remain
 * Server Components and pay zero client cost on public pages. The wrapper
 * only decides which of them to mount based on `usePathname()`.
 */
interface PublicChromeProps {
  children: ReactNode
  header: ReactNode
  footer: ReactNode
  cookieBanner: ReactNode
}

export function PublicChrome({ children, header, footer, cookieBanner }: PublicChromeProps) {
  const pathname = usePathname() ?? ''
  const isAdmin = pathname.startsWith('/admin')

  return (
    <>
      {!isAdmin && header}
      <main>{children}</main>
      {!isAdmin && footer}
      {!isAdmin && cookieBanner}
    </>
  )
}
