'use client'

import { useEffect, useRef } from 'react'

/**
 * Replaces each character with random glyphs from POOL until each slot
 * settles on its target. rAF-driven, no library. Spaces are preserved
 * verbatim so word boundaries are visible during the scramble.
 *
 * SSR-safe: the server renders the final text; the client overrides on
 * mount. If JS is disabled, the user just sees the final text.
 */
const POOL = '!<>-_\\/[]{}—=+*^?#@ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

interface ScrambleTextProps {
  children: string
  /** Frames to wait before this element starts scrambling. */
  delay?: number
  /** Per-character stagger between target frames. Lower = faster reveal. */
  charStep?: number
  className?: string
  style?: React.CSSProperties
  as?: 'span' | 'div' | 'p'
}

export function ScrambleText({
  children,
  delay = 0,
  charStep = 1.6,
  className,
  style,
  as = 'span',
}: ScrambleTextProps) {
  const ref = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Respect prefers-reduced-motion: just show the final text.
    if (
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    ) {
      return
    }

    const text = children
    type Slot = { to: string; start: number; end: number; char: string }
    const queue: Slot[] = []
    for (let i = 0; i < text.length; i++) {
      const ch = text[i]
      const start = Math.floor(i * charStep) + delay
      queue.push({
        to: ch,
        start,
        end: start + 8 + Math.floor(Math.random() * 6),
        char: '',
      })
    }

    let frame = 0
    let raf = 0
    let mounted = true

    const update = () => {
      if (!mounted) return
      let html = ''
      let complete = 0
      for (const item of queue) {
        if (frame >= item.end) {
          complete++
          html += item.to
        } else if (frame >= item.start) {
          // Spaces and dots stay readable; otherwise pull a glyph from the pool.
          if (item.to === ' ' || item.to === '·' || item.to === '—') {
            html += item.to
          } else {
            if (!item.char || Math.random() < 0.3) {
              item.char = POOL[Math.floor(Math.random() * POOL.length)]
            }
            html += item.char
          }
        } else {
          // Reserve space without leaking the target text.
          html += `<span style="opacity:0">${item.to === ' ' ? ' ' : item.to}</span>`
        }
      }
      el.innerHTML = html
      if (complete === queue.length) return
      frame++
      raf = requestAnimationFrame(update)
    }
    raf = requestAnimationFrame(update)

    return () => {
      mounted = false
      cancelAnimationFrame(raf)
    }
  }, [children, delay, charStep])

  const Tag = as
  return (
    <Tag ref={ref as React.Ref<HTMLElement>} className={className} style={style}>
      {children}
    </Tag>
  )
}
