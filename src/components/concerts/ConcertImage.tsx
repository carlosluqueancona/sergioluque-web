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
          className="concert-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={alt}
          onClick={() => setOpen(false)}
        >
          <button
            type="button"
            className="concert-lightbox__close"
            onClick={(e) => {
              e.stopPropagation()
              setOpen(false)
            }}
            aria-label="Close"
          >
            ×
          </button>
          {/* Plain <img> here on purpose — next/image with
              unoptimized: true and a flex parent occasionally renders
              with zero box. The src is already a full R2 URL. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            className="concert-lightbox__image"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  )
}
