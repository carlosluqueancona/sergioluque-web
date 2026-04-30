'use client'

import { useEffect, useRef } from 'react'
import type { LissajousConfig } from '@/lib/lissajous-config'

/**
 * Canvas-only Lissajous renderer that takes a typed config as a prop.
 *
 * Mirrors the drawing logic in HeroLissajous, but instead of reading
 * window.__LIS_CFG__ once at mount, this component keeps a ref to the
 * latest `config` and re-reads it inside the requestAnimationFrame loop
 * so slider changes from the playground take effect on the next frame
 * without restarting the animation (no flicker, no reset of `t`).
 *
 * Figures are rebuilt every frame from the current config — cheap (≤7
 * objects, simple math) and avoids having to detect which fields changed.
 *
 * Container styling is left to the parent: this component fills its
 * positioning context with `position: absolute; inset: 0` and a
 * `var(--bg)` backdrop. Wrap it in a `position: relative` element of any
 * size.
 */
interface LissajousCanvasProps {
  config: LissajousConfig
}

export function LissajousCanvas({ config }: LissajousCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const cfgRef = useRef(config)

  useEffect(() => {
    cfgRef.current = config
  }, [config])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    type Fig = {
      ratioA: number
      ratioB: number
      rot: number
      speedScale: number
      phase0: number
      alphaScale: number
      radiusScale: number
      hue: number
    }

    let W = 0
    let H = 0
    let dpr = 1
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

    const buildFigures = (cfg: LissajousConfig): Fig[] => {
      const ratios = cfg.ratios.length ? cfg.ratios : [{ a: 3, b: 2 }]
      const figures: Fig[] = []
      const N = cfg.count
      for (let i = 0; i < N; i++) {
        const r = ratios[i % ratios.length]
        const radiusScale = N === 1 ? 0.36 : 0.42 - (0.24 * i) / (N - 1)
        const alphaScale =
          cfg.alphaBase - (cfg.alphaDecay * i) / Math.max(1, N - 1)
        const speedScale = 1 + i * 0.13
        figures.push({
          ratioA: r.a,
          ratioB: r.b,
          rot: (i * Math.PI) / 5,
          speedScale,
          phase0: i * 0.7,
          alphaScale,
          radiusScale,
          hue: ((i / Math.max(1, N)) * 360 + 15) % 360,
        })
      }
      return figures
    }

    resize()
    window.addEventListener('resize', resize, { passive: true })

    const reduce =
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false

    const frame = () => {
      const cfg = cfgRef.current
      const isLight =
        document.documentElement.getAttribute('data-theme') === 'light'
      const additive = cfg.blend === 'lighter' || cfg.blend === 'screen'
      const additiveActive = additive && !isLight

      const fadeAlpha = cfg.trails
      if (fadeAlpha >= 0.999) {
        ctx.globalCompositeOperation = 'source-over'
        ctx.clearRect(0, 0, W, H)
      } else {
        ctx.globalCompositeOperation = 'destination-out'
        ctx.fillStyle = `rgba(0, 0, 0, ${fadeAlpha})`
        ctx.fillRect(0, 0, W, H)
      }

      ctx.globalCompositeOperation = additiveActive ? cfg.blend : 'source-over'
      ctx.lineCap = cfg.lineCap

      const [r, g, bb] = strokeRGB
      const cx = W * cfg.centerX
      const cy = H * cfg.centerY
      const minDim = Math.min(W, H) * cfg.size

      const figures = buildFigures(cfg)

      for (const f of figures) {
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

        const alpha = Math.max(0, Math.min(1, f.alphaScale * cfg.opacity))
        const isMulti = cfg.colorMode === 'multicolor'
        const figStrokeStyle = isMulti
          ? `hsla(${f.hue}, 90%, 58%, ${alpha.toFixed(3)})`
          : `rgba(${r},${g},${bb},${alpha.toFixed(3)})`
        const figShadowStyle = isMulti
          ? `hsla(${f.hue}, 90%, 58%, ${(f.alphaScale * cfg.opacity).toFixed(3)})`
          : `rgba(${r},${g},${bb},${(f.alphaScale * cfg.opacity).toFixed(3)})`

        if (cfg.glow > 0) {
          ctx.shadowBlur = cfg.glow
          ctx.shadowColor = figShadowStyle
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
        ctx.strokeStyle = figStrokeStyle
        ctx.lineWidth = cfg.lineWidth
        ctx.stroke()
        ctx.restore()
      }

      ctx.shadowBlur = 0
      ctx.setLineDash([])
      ctx.globalCompositeOperation = 'source-over'

      t++
      if (!reduce && !cfgRef.current.static) raf = requestAnimationFrame(frame)
    }

    if (reduce || cfgRef.current.static) frame()
    else raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
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
        backgroundColor: 'var(--bg)',
      }}
    />
  )
}
