'use client'

import { useEffect, useRef } from 'react'
import {
  parseLissajousConfig,
  type LissajousConfig,
} from '@/lib/lissajous-config'

/**
 * Slowly evolving Lissajous figures, drawn on canvas 2D.
 *
 * Lissajous: x = R·sin(a·u + δ), y = R·sin(b·u). When a/b is rational the
 * curve closes; when irrational it never repeats. The canvas hosts N
 * concentric figures (1–7), each with its own (a:b) ratio drawn from the
 * `ratios` list and shared global parameters (drift, phase, speed, …).
 *
 * Configuration comes from `window.__LIS_CFG__`, a flat string map
 * populated server-side by layout.tsx from the settings table. Defaults
 * (when the global is absent or empty) match the original look that
 * shipped before the customisation panel — so a fresh DB renders
 * exactly like the v1 hero.
 *
 * Reads --accent (or a custom hex) for the stroke colour. A
 * MutationObserver re-reads when data-theme or data-cta flips on <html>.
 * Caps at devicePixelRatio 2 to keep mobile GPUs honest. Honours
 * prefers-reduced-motion (renders one static frame, then stops).
 */

declare global {
  interface Window {
    __LIS_CFG__?: Record<string, string>
  }
}

export function HeroLissajous() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const cfg: LissajousConfig = parseLissajousConfig(
      typeof window !== 'undefined' ? window.__LIS_CFG__ : undefined
    )

    type Fig = {
      ratioA: number
      ratioB: number
      rot: number
      speedScale: number
      phase0: number
      // alpha and lineWidth scaled per-figure so concentric stack reads
      // as a hierarchy (outer biggest/most visible).
      alphaScale: number
      radiusScale: number
    }

    let W = 0
    let H = 0
    let dpr = 1
    let figures: Fig[] = []
    let raf = 0
    let t = 0
    let strokeRGB: [number, number, number] = [212, 212, 212]

    const hexToRGB = (hex: string): [number, number, number] | null => {
      const cleaned = hex.replace('#', '').trim()
      if (cleaned.length !== 6) return null
      const r = parseInt(cleaned.substring(0, 2), 16)
      const g = parseInt(cleaned.substring(2, 4), 16)
      const b = parseInt(cleaned.substring(4, 6), 16)
      if ([r, g, b].some((n) => Number.isNaN(n))) return null
      return [r, g, b]
    }

    const readStrokeRGB = (): [number, number, number] => {
      // Custom mode → pick the dark or light hex from settings depending
      // on the active theme. The MutationObserver below already watches
      // data-theme, so flipping themes re-runs this and the colour
      // updates without a remount.
      if (cfg.colorMode === 'custom') {
        const theme = document.documentElement.getAttribute('data-theme')
        const hex = theme === 'light' ? cfg.colorLight : cfg.colorDark
        return hexToRGB(hex) ?? [212, 212, 212]
      }
      // Accent mode → follow --accent (which itself flips with the
      // orange CTA toggle and the light/dark theme).
      const raw = getComputedStyle(document.documentElement)
        .getPropertyValue('--accent')
        .trim()
      return hexToRGB(raw) ?? [212, 212, 212]
    }

    strokeRGB = readStrokeRGB()

    const observer = new MutationObserver(() => {
      strokeRGB = readStrokeRGB()
    })
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'data-cta'],
    })

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      W = canvas.clientWidth
      H = canvas.clientHeight
      canvas.width = Math.floor(W * dpr)
      canvas.height = Math.floor(H * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const setupFigures = () => {
      const ratios = cfg.ratios.length ? cfg.ratios : [{ a: 3, b: 2 }]
      figures = []
      // Distribute radius scales between 0.42 (outermost) and 0.18
      // (innermost) so even with 7 figures they remain readable.
      // Linear distribution; easy to tweak later if needed.
      const N = cfg.count
      for (let i = 0; i < N; i++) {
        const r = ratios[i % ratios.length]
        // Radius interpolated between 0.42 (i=0) and 0.18 (i=N-1).
        const radiusScale = N === 1 ? 0.36 : 0.42 - (0.24 * i) / (N - 1)
        // Outer figures slightly more visible; inner taper to ~half.
        const alphaScale = 0.22 - (0.14 * i) / Math.max(1, N - 1)
        // Slight per-figure speed variation so they don't tick in unison
        // (audibly: they detune relative to one another).
        const speedScale = 1 + i * 0.13
        figures.push({
          ratioA: r.a,
          ratioB: r.b,
          rot: (i * Math.PI) / 5,
          speedScale,
          phase0: i * 0.7,
          alphaScale,
          radiusScale,
        })
      }
    }

    const onResize = () => {
      resize()
      setupFigures()
    }
    onResize()
    window.addEventListener('resize', onResize, { passive: true })

    const reduce =
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false

    // The "trails" parameter is the alpha of a fade rect drawn each frame
    // instead of a full clear. trails = 1 → full clear (no trails);
    // trails < 1 → previous frames persist proportional to (1 - trails).
    const fadeAlpha = cfg.trails

    const frame = () => {
      if (fadeAlpha >= 0.999) {
        // No trails: hard clear each frame.
        ctx.globalCompositeOperation = 'source-over'
        ctx.clearRect(0, 0, W, H)
      } else {
        // Trails: fade existing pixels towards transparent (NOT towards
        // the bg colour) using destination-out. This way the fade behaves
        // the same in light and dark themes, and works correctly with the
        // additive blend modes (lighter / screen) which would otherwise
        // wash the strokes out when fillRect painted the bg colour over
        // them on a light background.
        ctx.globalCompositeOperation = 'destination-out'
        ctx.fillStyle = `rgba(0, 0, 0, ${fadeAlpha})`
        ctx.fillRect(0, 0, W, H)
      }

      ctx.globalCompositeOperation = cfg.blend
      ctx.lineCap = cfg.lineCap

      const [r, g, bb] = strokeRGB
      const cx = W * cfg.centerX
      const cy = H * cfg.centerY
      const minDim = Math.min(W, H) * cfg.size

      for (const f of figures) {
        // Slow non-commensurate drift on a and b around their integer base.
        const speedT = t * 0.0008 * cfg.speed * f.speedScale
        const a = f.ratioA + Math.sin(speedT) * cfg.drift
        const b = f.ratioB + Math.cos(speedT * 1.13) * (cfg.drift * 0.91)
        const phase = f.phase0 + cfg.phase + speedT
        const wobble = Math.sin(speedT * 0.3) * 0.04
        const continuous = t * cfg.rotation

        const rx = minDim * f.radiusScale
        const ry = minDim * f.radiusScale

        ctx.save()
        ctx.translate(cx, cy)
        ctx.rotate(f.rot + wobble + continuous)

        if (cfg.glow > 0) {
          ctx.shadowBlur = cfg.glow
          ctx.shadowColor = `rgba(${r},${g},${bb},${(f.alphaScale * cfg.opacity).toFixed(3)})`
        } else {
          ctx.shadowBlur = 0
        }

        ctx.setLineDash(cfg.dash)
        ctx.beginPath()
        const N = cfg.segments
        for (let i = 0; i <= N; i++) {
          const u = (i / N) * Math.PI * 2
          const x = rx * Math.sin(a * u + phase)
          const y = ry * Math.sin(b * u)
          if (i === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        const alpha = Math.max(0, Math.min(1, f.alphaScale * cfg.opacity))
        ctx.strokeStyle = `rgba(${r},${g},${bb},${alpha.toFixed(3)})`
        ctx.lineWidth = cfg.lineWidth
        ctx.stroke()
        ctx.restore()
      }
      // Reset state outside the per-figure loop so subsequent draws on
      // this canvas (none today, but cheap insurance) start clean.
      ctx.shadowBlur = 0
      ctx.setLineDash([])
      ctx.globalCompositeOperation = 'source-over'

      t++
      if (!reduce && !cfg.static) raf = requestAnimationFrame(frame)
    }

    if (reduce || cfg.static) frame()
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
