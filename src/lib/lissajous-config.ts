/**
 * Strongly-typed shape of the Hero Lissajous configuration.
 *
 * The settings pipeline stores everything as KV strings under `lis_*`
 * keys. parseLissajousConfig() consumes that flat string map (or a
 * partial Record from the Worker) and returns a typed config the
 * canvas component can use directly.
 *
 * Defaults match the original look that shipped with the site (see
 * lissajous-presets.ts → "academico"), so an empty config returns the
 * same visuals the codebase had before the customisation panel existed.
 */

export type DashKey = 'solid' | 'dotted' | 'dash-short' | 'dash-long' | 'dash-irregular'
export type BlendKey = 'source-over' | 'lighter' | 'screen'
export type LineCapKey = 'butt' | 'round'
export type ColorModeKey = 'accent' | 'custom'

export interface LissajousConfig {
  colorMode: ColorModeKey
  /** Stroke colour used when data-theme="dark" (the site default). */
  colorDark: string
  /** Stroke colour used when data-theme="light". */
  colorLight: string
  count: number
  /** Pre-parsed list of {a, b} numeric pairs derived from the comma string. */
  ratios: Array<{ a: number; b: number }>
  segments: number
  lineWidth: number
  dash: number[] // [] for solid
  lineCap: LineCapKey
  drift: number
  /** Phase offset in radians (admin form takes degrees). */
  phase: number
  speed: number
  rotation: number
  trails: number
  blend: BlendKey
  size: number
  centerX: number
  centerY: number
  opacity: number
  glow: number
  /**
   * Outer-figure base alpha (i = 0). Each subsequent inner figure decays
   * by `alphaDecay / (count − 1)` until it reaches `alphaBase − alphaDecay`.
   * The classic "academico" feel sat around (0.22, 0.14); the brighter
   * default lives at (0.42, 0.22).
   */
  alphaBase: number
  alphaDecay: number
  static: boolean
}

export const DASH_PATTERNS: Record<DashKey, number[]> = {
  solid: [],
  dotted: [1, 3],
  'dash-short': [3, 4],
  'dash-long': [8, 6],
  'dash-irregular': [12, 3, 2, 3],
}

export const PHI = (1 + Math.sqrt(5)) / 2 // 1.6180339887…

const num = (raw: string | undefined, fallback: number): number => {
  if (raw === undefined || raw === '') return fallback
  const n = Number(raw)
  return Number.isFinite(n) ? n : fallback
}

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n))

/** Parse "3:2, 4:3, φ, 5:4" → [{a:3,b:2}, {a:4,b:3}, {a:φ,b:1}, {a:5,b:4}]. */
function parseRatios(raw: string | undefined): Array<{ a: number; b: number }> {
  const fallback = [
    { a: 3, b: 2 },
    { a: 4, b: 3 },
    { a: 5, b: 4 },
  ]
  if (!raw || !raw.trim()) return fallback
  const out: Array<{ a: number; b: number }> = []
  for (const part of raw.split(',')) {
    const token = part.trim()
    if (!token) continue
    if (token === 'φ' || token.toLowerCase() === 'phi') {
      out.push({ a: PHI, b: 1 })
      continue
    }
    const [aStr, bStr] = token.split(':')
    const a = Number(aStr)
    const b = Number(bStr)
    if (Number.isFinite(a) && Number.isFinite(b) && a > 0 && b > 0) {
      out.push({ a, b })
    }
  }
  return out.length ? out : fallback
}

export function parseLissajousConfig(
  kv: Record<string, string | undefined> | undefined | null
): LissajousConfig {
  const k = kv ?? {}
  const colorModeRaw = (k['lis_color_mode'] ?? '').trim()
  const colorMode: ColorModeKey = colorModeRaw === 'custom' ? 'custom' : 'accent'
  const dashRaw = (k['lis_dash'] ?? 'solid') as DashKey
  const blendRaw = (k['lis_blend'] ?? 'source-over') as BlendKey
  const lineCapRaw = (k['lis_line_cap'] ?? 'butt') as LineCapKey

  // Backward compatibility: pre-light/dark databases stored a single
  // `lis_color`. If only that one exists, use it for both themes.
  const legacyColor = (k['lis_color'] ?? '').trim()
  const colorDark =
    (k['lis_color_dark'] ?? '').trim() || legacyColor || '#D4D4D4'
  const colorLight =
    (k['lis_color_light'] ?? '').trim() || legacyColor || '#1A1A1A'

  return {
    colorMode,
    colorDark,
    colorLight,
    count: clamp(Math.round(num(k['lis_count'], 3)), 1, 7),
    ratios: parseRatios(k['lis_ratios']),
    segments: clamp(Math.round(num(k['lis_segments'], 540)), 64, 4096),
    lineWidth: clamp(num(k['lis_line_width'], 0.7), 0.1, 8),
    dash: DASH_PATTERNS[dashRaw] ?? [],
    lineCap: lineCapRaw === 'round' ? 'round' : 'butt',
    drift: clamp(num(k['lis_drift'], 0.55), 0, 3),
    // admin form sends degrees; canvas wants radians
    phase: (clamp(num(k['lis_phase'], 0), 0, 360) * Math.PI) / 180,
    speed: clamp(num(k['lis_speed'], 1), 0.05, 5),
    rotation: clamp(num(k['lis_rotation'], 0), 0, 0.05),
    trails: clamp(num(k['lis_trails'], 1), 0.01, 1),
    blend: ['source-over', 'lighter', 'screen'].includes(blendRaw) ? blendRaw : 'source-over',
    size: clamp(num(k['lis_size'], 1), 0.2, 2),
    centerX: clamp(num(k['lis_center_x'], 0.5), 0, 1),
    centerY: clamp(num(k['lis_center_y'], 0.5), 0, 1),
    opacity: clamp(num(k['lis_opacity'], 1), 0.1, 4),
    glow: clamp(num(k['lis_glow'], 0), 0, 60),
    alphaBase: clamp(num(k['lis_alpha_base'], 0.42), 0.05, 1),
    alphaDecay: clamp(num(k['lis_alpha_decay'], 0.22), 0, 0.6),
    static: (k['lis_static'] ?? '') === '1',
  }
}
