'use client'

import { useMemo, useState } from 'react'
import {
  parseLissajousConfig,
  type LissajousConfig,
} from '@/lib/lissajous-config'
import { LISSAJOUS_PRESETS } from '@/lib/lissajous-presets'
import { LissajousCanvas } from './LissajousCanvas'
import {
  PlaygroundControls,
  type PlaygroundState,
  type PresetKey,
} from './PlaygroundControls'

/**
 * Public Lissajous playground.
 *
 * Owns the parsed LissajousConfig that drives the canvas plus the
 * curated playground state exposed in the UI. Preset clicks load a
 * full preset (including the params we don't expose in the UI, e.g.
 * ratios and segments) so each preset still looks the way it was
 * designed in the admin; subsequent slider changes patch only the
 * fields the user can see.
 */

const DEFAULT_PRESET: PresetKey = 'elisina'

const DEFAULT_BG = '#0A0A0A'

function presetToState(preset: Record<string, string>): PlaygroundState {
  const cfg = parseLissajousConfig(preset)
  return {
    count: cfg.count,
    lineWidth: cfg.lineWidth,
    speed: cfg.speed,
    drift: cfg.drift,
    rotation: cfg.rotation,
    trails: cfg.trails,
    multicolor: cfg.colorMode === 'multicolor',
    glow: cfg.glow,
    blend: cfg.blend,
    // The preset's stroke colour seeds the line picker. Falls back to
    // the dark-theme default if the preset didn't pin one.
    lineColor: cfg.colorDark || '#D4D4D4',
    // Background isn't part of the preset — start from the site's
    // dark-theme bg so the canvas matches the page on first paint.
    bgColor: DEFAULT_BG,
  }
}

function applyStateToConfig(
  baseKv: Record<string, string>,
  state: PlaygroundState
): LissajousConfig {
  // Re-parse the full preset (covers the params we don't expose), then
  // override the user-visible fields directly on the typed config so we
  // don't have to round-trip everything through the string KV layer.
  const cfg = parseLissajousConfig(baseKv)
  // Multicolor wins over a custom line colour (mutually exclusive in
  // the UI). Otherwise: any line-colour pick promotes the canvas into
  // 'custom' mode so it stops following --accent.
  const colorMode = state.multicolor
    ? 'multicolor'
    : 'custom'
  return {
    ...cfg,
    count: state.count,
    lineWidth: state.lineWidth,
    speed: state.speed,
    drift: state.drift,
    rotation: state.rotation,
    trails: state.trails,
    colorMode,
    colorDark: state.lineColor,
    colorLight: state.lineColor,
    glow: state.glow,
    blend: state.blend,
  }
}

const randInRange = (min: number, max: number, step: number) => {
  const steps = Math.floor((max - min) / step)
  const n = min + step * Math.floor(Math.random() * (steps + 1))
  return Math.round(n / step) * step
}

export function LissajousPlayground() {
  const [presetKey, setPresetKey] = useState<PresetKey>(DEFAULT_PRESET)
  const [baseKv, setBaseKv] = useState<Record<string, string>>(
    LISSAJOUS_PRESETS[DEFAULT_PRESET]
  )
  const [state, setState] = useState<PlaygroundState>(() =>
    presetToState(LISSAJOUS_PRESETS[DEFAULT_PRESET])
  )
  const [activePreset, setActivePreset] = useState<PresetKey | null>(
    DEFAULT_PRESET
  )
  const [controlsVisible, setControlsVisible] = useState(true)

  const config = useMemo(
    () => applyStateToConfig(baseKv, state),
    [baseKv, state]
  )

  const handleChange = (patch: Partial<PlaygroundState>) => {
    setState((prev) => ({ ...prev, ...patch }))
    setActivePreset(null)
  }

  const handlePreset = (key: PresetKey) => {
    const preset = LISSAJOUS_PRESETS[key]
    setPresetKey(key)
    setBaseKv(preset)
    setState(presetToState(preset))
    setActivePreset(key)
  }

  const handleRandomize = () => {
    const randHex = () => {
      const c = Math.floor(Math.random() * 0xffffff).toString(16)
      return '#' + c.padStart(6, '0')
    }
    setState({
      count: Math.floor(Math.random() * 7) + 1,
      lineWidth: randInRange(0.3, 2.5, 0.1),
      speed: randInRange(0.3, 3, 0.05),
      drift: randInRange(0.1, 2, 0.05),
      rotation: randInRange(0, 0.004, 0.0001),
      trails: randInRange(0.05, 1, 0.05),
      multicolor: Math.random() > 0.5,
      glow: Math.random() > 0.5 ? Math.floor(Math.random() * 30) : 0,
      blend: Math.random() > 0.5 ? 'lighter' : 'source-over',
      lineColor: randHex(),
      // Bias background toward dark hex (each component < 0x40) so the
      // strokes still read.
      bgColor:
        '#' +
        [0, 0, 0]
          .map(() => Math.floor(Math.random() * 0x40).toString(16).padStart(2, '0'))
          .join(''),
    })
    setActivePreset(null)
  }

  const handleReset = () => {
    handlePreset(presetKey)
  }

  return (
    <div className="lis-playground">
      <div className="lis-canvas-frame" style={{ background: state.bgColor }}>
        <LissajousCanvas config={config} bgColor={state.bgColor} />
      </div>
      {controlsVisible && (
        <PlaygroundControls
          state={state}
          onChange={handleChange}
          activePreset={activePreset}
          onPreset={handlePreset}
          onRandomize={handleRandomize}
          onReset={handleReset}
        />
      )}
      <button
        type="button"
        className="lis-floating-toggle"
        aria-pressed={controlsVisible}
        aria-label={controlsVisible ? 'Hide controls' : 'Show controls'}
        onClick={() => setControlsVisible((v) => !v)}
      >
        {controlsVisible ? 'Hide controls' : 'Show controls'}
      </button>
    </div>
  )
}
