'use client'

import { useEffect, useRef, useState } from 'react'

interface WaveformBarsProps {
  getAnalyser: () => AnalyserNode | null
  isPlaying: boolean
  /** Initial bar count (used for SSR + before the first measurement).
   *  After mount, the bar count is recomputed to fit the container width. */
  bars?: number
  height?: number
  barWidth?: number
  gap?: number
  /** 0..1 — fraction of bars at the left that count as "played" (dimmed bars to the right). */
  progress?: number
}

// Idle scale so the viz feels alive even when paused (0..1 of full bar height).
function idleScale(i: number): number {
  return 0.14 + ((i * 17) % 26) / 100
}

export function WaveformBars({
  getAnalyser,
  isPlaying,
  bars: initialBars = 48,
  height = 48,
  barWidth = 3,
  gap = 2,
  progress,
}: WaveformBarsProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number | null>(null)
  const bufRef = useRef<Uint8Array<ArrayBuffer> | null>(null)
  const progressRef = useRef<number | null>(progress ?? null)
  progressRef.current = progress ?? null

  // Bar count derived from the container width — `space-between` left
  // huge gaps when the bar count was fixed at 48 and the container was
  // hundreds of px wide. Recompute on mount and on every resize so the
  // density stays roughly `barWidth + gap` per slot regardless of where
  // the player is rendered (Mini in a card, full on the obra page, etc).
  const [bars, setBars] = useState(initialBars)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const slot = barWidth + gap
    const recompute = () => {
      const w = el.clientWidth
      if (w <= 0) return
      // +gap because there's no trailing gap after the last bar — keeps
      // the math symmetric: N bars need N×barWidth + (N-1)×gap of space.
      const fit = Math.max(1, Math.floor((w + gap) / slot))
      setBars((prev) => (prev === fit ? prev : fit))
    }
    recompute()
    const ro = new ResizeObserver(recompute)
    ro.observe(el)
    return () => ro.disconnect()
  }, [barWidth, gap])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const els = Array.from(container.children) as HTMLElement[]
    const readProgress = () => progressRef.current
    const playedCountIdle =
      readProgress() != null ? Math.floor((readProgress() as number) * bars) : bars

    const setIdle = () => {
      els.forEach((el, i) => {
        el.style.transform = `scaleY(${idleScale(i)})`
        el.style.opacity = i < playedCountIdle ? '0.32' : '0.18'
      })
    }

    if (!isPlaying) {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
      setIdle()
      return
    }

    const analyser = getAnalyser()
    if (!analyser) {
      // No WebAudio — animated CSS fallback.
      let t = 0
      const fallback = () => {
        t += 0.06
        for (let i = 0; i < els.length; i++) {
          const el = els[i]
          if (!el) continue
          const phase = Math.sin(t + i * 0.4)
          el.style.transform = `scaleY(${0.18 + (phase + 1) * 0.32})`
          el.style.opacity = String(0.4 + (phase + 1) * 0.25)
        }
        rafRef.current = requestAnimationFrame(fallback)
      }
      rafRef.current = requestAnimationFrame(fallback)
      return
    }

    if (!bufRef.current || bufRef.current.length !== analyser.frequencyBinCount) {
      bufRef.current = new Uint8Array(analyser.frequencyBinCount)
    }
    const buf = bufRef.current
    // Drop the very top of the spectrum (often empty for music) for nicer mapping.
    const lastBin = Math.max(bars, Math.floor(buf.length * 0.7))
    const binsPerBar = Math.max(1, Math.floor(lastBin / bars))

    const tick = () => {
      analyser.getByteFrequencyData(buf)
      const p = readProgress()
      const playedBars = p != null ? Math.floor(p * bars) : bars
      for (let i = 0; i < bars; i++) {
        const el = els[i]
        if (!el) continue
        let sum = 0
        let count = 0
        for (let j = 0; j < binsPerBar; j++) {
          const v = buf[i * binsPerBar + j]
          if (v !== undefined) {
            sum += v
            count++
          }
        }
        const norm = count > 0 ? sum / count / 255 : 0
        // sqrt curve emphasizes low/mid bands; floor keeps a resting silhouette.
        const scale = Math.max(0.08, Math.pow(norm, 0.55))
        el.style.transform = `scaleY(${scale})`
        const baseOp = Math.max(0.42, Math.min(1, norm + 0.25))
        el.style.opacity = String(p != null && i >= playedBars ? baseOp * 0.5 : baseOp)
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
    }
  }, [getAnalyser, isPlaying, bars])

  return (
    <div
      ref={containerRef}
      aria-hidden
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: `${gap}px`,
        height: `${height}px`,
        width: '100%',
      }}
    >
      {Array.from({ length: bars }, (_, i) => (
        <div
          key={i}
          style={{
            flex: '0 0 auto',
            width: `${barWidth}px`,
            height: '100%',
            background: 'var(--accent)',
            opacity: 0.18,
            transformOrigin: 'bottom',
            transform: `scaleY(${idleScale(i)})`,
            transition: 'transform 80ms linear, opacity 120ms linear',
            willChange: 'transform, opacity',
          }}
        />
      ))}
    </div>
  )
}
