'use client'

import { useEffect, useRef } from 'react'

/**
 * Slowly evolving Lissajous figures, drawn on canvas 2D.
 *
 * Lissajous: x = R·sin(a·u + δ), y = R·sin(b·u). When a/b is rational the
 * curve closes; when irrational it never repeats. Three figures share a
 * common centre, each starting from a small-integer ratio (3:2, 4:3, 5:4
 * — perfect fifth, perfect fourth, major third) and drifting through
 * irrational neighbourhoods so the curves morph continuously.
 *
 * Pure canvas 2D, no library. Reads --text-primary so the strokes follow
 * the active theme; a MutationObserver re-reads when data-theme flips.
 * Caps at devicePixelRatio 2 to keep mobile GPUs honest. Honours
 * prefers-reduced-motion (renders one static frame, then stops).
 */
export function HeroLissajous() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    type Fig = {
      cx: number
      cy: number
      rx: number
      ry: number
      a0: number
      b0: number
      rot: number
      speed: number
      alpha: number
      phase0: number
      lineWidth: number
    }

    let W = 0
    let H = 0
    let dpr = 1
    let figures: Fig[] = []
    let raf = 0
    let t = 0
    let strokeRGB: [number, number, number] = [240, 240, 240]

    function readStrokeRGB(): [number, number, number] {
      const raw = getComputedStyle(document.documentElement)
        .getPropertyValue('--text-primary')
        .trim()
      const hex = raw.replace('#', '')
      if (hex.length !== 6) return [240, 240, 240]
      return [
        parseInt(hex.substring(0, 2), 16),
        parseInt(hex.substring(2, 4), 16),
        parseInt(hex.substring(4, 6), 16),
      ]
    }
    strokeRGB = readStrokeRGB()

    const observer = new MutationObserver(() => {
      strokeRGB = readStrokeRGB()
    })
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    })

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      W = canvas.clientWidth
      H = canvas.clientHeight
      canvas.width = Math.floor(W * dpr)
      canvas.height = Math.floor(H * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    function setupFigures() {
      const min = Math.min(W, H)
      figures = [
        // Perfect fifth (3:2) — outer figure, biggest, slowest drift
        {
          cx: W * 0.5,
          cy: H * 0.5,
          rx: min * 0.42,
          ry: min * 0.42,
          a0: 3,
          b0: 2,
          rot: 0,
          speed: 0.0008,
          alpha: 0.22,
          phase0: 0,
          lineWidth: 0.7,
        },
        // Perfect fourth (4:3) — middle, medium speed, rotated π/5
        {
          cx: W * 0.5,
          cy: H * 0.5,
          rx: min * 0.32,
          ry: min * 0.32,
          a0: 4,
          b0: 3,
          rot: Math.PI / 5,
          speed: 0.00111,
          alpha: 0.16,
          phase0: 0.7,
          lineWidth: 0.6,
        },
        // Major third (5:4) — inner, faster, rotated π/8
        {
          cx: W * 0.5,
          cy: H * 0.5,
          rx: min * 0.22,
          ry: min * 0.22,
          a0: 5,
          b0: 4,
          rot: Math.PI / 8,
          speed: 0.00141,
          alpha: 0.12,
          phase0: 1.5,
          lineWidth: 0.6,
        },
      ]
    }

    function onResize() {
      resize()
      setupFigures()
    }
    onResize()
    window.addEventListener('resize', onResize, { passive: true })

    const reduce =
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false

    function frame() {
      ctx.clearRect(0, 0, W, H)
      const [r, g, bb] = strokeRGB
      for (const f of figures) {
        // Slow non-commensurate drift on a and b around their integer base.
        const a = f.a0 + Math.sin(t * f.speed) * 0.55
        const b = f.b0 + Math.cos(t * f.speed * 1.13) * 0.5
        const phase = f.phase0 + t * 0.0008
        const wobble = Math.sin(t * f.speed * 0.3) * 0.04

        ctx.save()
        ctx.translate(f.cx, f.cy)
        ctx.rotate(f.rot + wobble)
        ctx.beginPath()
        const N = 540
        for (let i = 0; i <= N; i++) {
          const u = (i / N) * Math.PI * 2
          const x = f.rx * Math.sin(a * u + phase)
          const y = f.ry * Math.sin(b * u)
          if (i === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.strokeStyle = `rgba(${r},${g},${bb},${f.alpha})`
        ctx.lineWidth = f.lineWidth
        ctx.stroke()
        ctx.restore()
      }
      t++
      if (!reduce) raf = requestAnimationFrame(frame)
    }

    if (reduce) frame()
    else raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      observer.disconnect()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  )
}
