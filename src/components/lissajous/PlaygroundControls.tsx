'use client'

import type { BlendKey } from '@/lib/lissajous-config'
import { S } from '@/lib/strings'

/**
 * Curated subset of the admin Lissajous controls, exposed publicly for
 * the /lissajous playground. We deliberately ship fewer knobs than the
 * admin form (no ratios textbox, no centerX/Y, no segments, etc.) to
 * keep the UI legible for casual visitors. The full param surface is
 * still available to the operator via the admin Settings page.
 */

export type PresetKey =
  | 'academico'
  | 'denso'
  | 'minimal'
  | 'psicodelico'
  | 'elisina'

export interface PlaygroundState {
  count: number
  lineWidth: number
  speed: number
  drift: number
  rotation: number
  trails: number
  multicolor: boolean
  glow: number
  blend: BlendKey
  /** Hex stroke colour (ignored when multicolor is on). */
  lineColor: string
  /** Hex canvas background. */
  bgColor: string
}

interface PlaygroundControlsProps {
  state: PlaygroundState
  onChange: (patch: Partial<PlaygroundState>) => void
  activePreset: PresetKey | null
  onPreset: (key: PresetKey) => void
  onRandomize: () => void
  onReset: () => void
}

const PRESETS: PresetKey[] = [
  'academico',
  'denso',
  'minimal',
  'psicodelico',
  'elisina',
]

export function PlaygroundControls({
  state,
  onChange,
  activePreset,
  onPreset,
  onRandomize,
  onReset,
}: PlaygroundControlsProps) {
  return (
    <div className="lis-controls">
      <section aria-labelledby="lis-presets-h">
        <h2 id="lis-presets-h" className="t-label lis-group-label">
          {S.lissajous.presetsLabel}
        </h2>
        <div className="lis-preset-row">
          {PRESETS.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => onPreset(key)}
              data-active={activePreset === key ? 'true' : undefined}
              className="lis-preset-btn"
            >
              {S.lissajous.presets[key]}
            </button>
          ))}
        </div>
      </section>

      <div className="lis-grid">
        <section aria-labelledby="lis-form-h">
          <h2 id="lis-form-h" className="t-label lis-group-label">
            {S.lissajous.formLabel}
          </h2>
          <Slider
            label={S.lissajous.count}
            min={1}
            max={7}
            step={1}
            value={state.count}
            display={String(state.count)}
            onChange={(v) => onChange({ count: v })}
          />
          <Slider
            label={S.lissajous.lineWidth}
            min={0.2}
            max={4}
            step={0.1}
            value={state.lineWidth}
            display={state.lineWidth.toFixed(1)}
            onChange={(v) => onChange({ lineWidth: v })}
          />
        </section>

        <section aria-labelledby="lis-motion-h">
          <h2 id="lis-motion-h" className="t-label lis-group-label">
            {S.lissajous.motionLabel}
          </h2>
          <Slider
            label={S.lissajous.speed}
            min={0.05}
            max={5}
            step={0.05}
            value={state.speed}
            display={state.speed.toFixed(2)}
            onChange={(v) => onChange({ speed: v })}
          />
          <Slider
            label={S.lissajous.drift}
            min={0}
            max={3}
            step={0.05}
            value={state.drift}
            display={state.drift.toFixed(2)}
            onChange={(v) => onChange({ drift: v })}
          />
          <Slider
            label={S.lissajous.rotation}
            min={0}
            max={0.005}
            step={0.0001}
            value={state.rotation}
            display={state.rotation.toFixed(4)}
            onChange={(v) => onChange({ rotation: v })}
          />
          <Slider
            label={S.lissajous.trails}
            min={0.01}
            max={1}
            step={0.01}
            value={state.trails}
            display={state.trails.toFixed(2)}
            onChange={(v) => onChange({ trails: v })}
          />
        </section>

        <section aria-labelledby="lis-color-h">
          <h2 id="lis-color-h" className="t-label lis-group-label">
            {S.lissajous.colorLabel}
          </h2>
          <label className="lis-toggle">
            <input
              type="checkbox"
              checked={state.multicolor}
              onChange={(e) => onChange({ multicolor: e.target.checked })}
            />
            <span>{S.lissajous.multicolor}</span>
          </label>
          <ColorField
            label={S.lissajous.lineColor}
            id="lis-line-color"
            value={state.lineColor}
            disabled={state.multicolor}
            onChange={(v) => onChange({ lineColor: v })}
          />
          <ColorField
            label={S.lissajous.bgColor}
            id="lis-bg-color"
            value={state.bgColor}
            onChange={(v) => onChange({ bgColor: v })}
          />
          <Slider
            label={S.lissajous.glow}
            min={0}
            max={60}
            step={1}
            value={state.glow}
            display={String(state.glow)}
            onChange={(v) => onChange({ glow: v })}
          />
          <div className="lis-field">
            <label className="lis-field-label" htmlFor="lis-blend">
              {S.lissajous.blend}
            </label>
            <select
              id="lis-blend"
              className="lis-select"
              value={state.blend}
              onChange={(e) =>
                onChange({ blend: e.target.value as BlendKey })
              }
            >
              <option value="source-over">
                {S.lissajous.blendModes['source-over']}
              </option>
              <option value="lighter">
                {S.lissajous.blendModes.lighter}
              </option>
              <option value="screen">
                {S.lissajous.blendModes.screen}
              </option>
            </select>
          </div>
        </section>
      </div>

      <div className="lis-actions">
        <button type="button" className="lis-action-btn" onClick={onRandomize}>
          {S.lissajous.randomize}
        </button>
        <button type="button" className="lis-action-btn" onClick={onReset}>
          {S.lissajous.reset}
        </button>
      </div>
    </div>
  )
}

interface SliderProps {
  label: string
  min: number
  max: number
  step: number
  value: number
  display: string
  onChange: (value: number) => void
}

function Slider({ label, min, max, step, value, display, onChange }: SliderProps) {
  const id = `lis-slider-${label.toLowerCase().replace(/\s+/g, '-')}`
  return (
    <div className="lis-field">
      <label htmlFor={id} className="lis-field-label">
        <span>{label}</span>
        <span className="lis-field-value">{display}</span>
      </label>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="lis-range"
      />
    </div>
  )
}

interface ColorFieldProps {
  label: string
  id: string
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

function ColorField({ label, id, value, onChange, disabled }: ColorFieldProps) {
  return (
    <div className="lis-field" data-disabled={disabled || undefined}>
      <label htmlFor={id} className="lis-field-label">
        <span>{label}</span>
        <span className="lis-field-value">{value.toUpperCase()}</span>
      </label>
      <input
        id={id}
        type="color"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="lis-color"
      />
    </div>
  )
}
