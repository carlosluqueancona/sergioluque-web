'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

interface ConcertImageProps {
  src: string
  alt: string
}

/**
 * Concert/news image with click-to-zoom lightbox on desktop.
 *
 * On phone (≤540px) the image already renders full-width, so the
 * trigger is disabled via CSS (pointer-events: none) and behaves as
 * a plain inline image. On tablet/desktop, clicking the image opens
 * a fullscreen overlay that lets the operator inspect a poster at
 * its native size. Closes on backdrop click, ESC, or the × button.
 */
export function ConcertImage({ src, alt }: ConcertImageProps) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    const prevOverflow = document.body.style.overflow
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [open])

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="concert-item__image-trigger"
        aria-label={`Open larger image: ${alt}`}
      >
        <Image
          src={src}
          alt={alt}
          width={1600}
          height={900}
          className="concert-item__image"
        />
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={alt}
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            background: 'rgba(0, 0, 0, 0.92)',
            cursor: 'zoom-out',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
          }}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setOpen(false)
            }}
            aria-label="Close"
            style={{
              position: 'fixed',
              top: 16,
              right: 16,
              width: 44,
              height: 44,
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-space-mono), monospace',
              fontSize: 22,
              lineHeight: 1,
              cursor: 'pointer',
              zIndex: 1001,
            }}
          >
            ×
          </button>
          {/* Plain <img> with inline styles to bypass any cached or
              conflicting CSS rules. The src is already a full R2/
              Worker URL — no Next image optimization needed. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: 'calc(100vw - 48px)',
              maxHeight: 'calc(100vh - 48px)',
              width: 'auto',
              height: 'auto',
              display: 'block',
              objectFit: 'contain',
              cursor: 'default',
            }}
          />
        </div>
      )}
    </>
  )
}
