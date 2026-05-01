'use client'

import { trackEvent } from '@/components/layout/GoogleAnalytics'

/**
 * Drop-in replacement for `<a target="_blank">` that fires a GA event
 * on click. Lets a server component (e.g. /bio, /news, /stochastics)
 * include outbound-link tracking without flipping the whole page to
 * `'use client'` — only this leaf is hydrated.
 *
 * Why a wrapper instead of a global click listener: a single delegated
 * handler couldn't see `link_type` semantics ("cv_download" vs
 * "news_external" vs "publication_pdf") and would emit a single
 * `external_link_click` for everything. Per-callsite call signatures
 * keep the GA dimension space useful.
 *
 * The event payload deliberately drops the URL hostname only (not the
 * full path) — so the operator can see "soundcloud.com got 12 clicks
 * from /news" without GA collecting query strings that may carry PII
 * from the destination's tracking links.
 */

interface TrackedExternalLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string
  /**
   * GA event name. Stays a free string so the call site documents
   * what's being tracked. Examples: 'download_cv',
   * 'news_external_click', 'publication_pdf_click', 'social_click'.
   */
  eventName: string
  /**
   * Optional extra params merged into the event payload. Keep these
   * non-PII — anything that ends up in a GA dimension is visible to
   * anyone with read access to the property.
   */
  eventParams?: Record<string, string | number | boolean>
}

function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname
  } catch {
    return ''
  }
}

export function TrackedExternalLink({
  href,
  eventName,
  eventParams,
  onClick,
  children,
  ...rest
}: TrackedExternalLinkProps) {
  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    trackEvent(eventName, {
      destination: hostnameOf(href),
      ...(eventParams ?? {}),
    })
    onClick?.(e)
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      {...rest}
    >
      {children}
    </a>
  )
}
