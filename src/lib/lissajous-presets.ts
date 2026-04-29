/**
 * Lissajous configuration presets.
 *
 * Each preset is a snapshot of every `lis_*` settings key as a string —
 * the same shape the admin form sends to the Worker, so applying a preset
 * is just spreading these into the form state.
 *
 * The "academico" preset matches the original hand-tuned defaults that
 * shipped with the site, so picking it (or saving with no `lis_*` keys
 * at all) reproduces the look the codebase had before the customisation
 * panel existed.
 */
export const LISSAJOUS_PRESETS: Record<string, Record<string, string>> = {
  academico: {
    lis_color_mode: 'accent',
    lis_color_dark: '#D4D4D4',
    lis_color_light: '#1A1A1A',
    lis_count: '3',
    lis_ratios: '3:2,4:3,5:4',
    lis_segments: '540',
    lis_line_width: '0.7',
    lis_dash: 'solid',
    lis_line_cap: 'butt',
    lis_drift: '0.55',
    lis_phase: '0',
    lis_speed: '1',
    lis_rotation: '0',
    lis_trails: '1',
    lis_blend: 'source-over',
    lis_size: '1',
    lis_center_x: '0.5',
    lis_center_y: '0.5',
    lis_opacity: '1',
    lis_glow: '0',
    lis_alpha_base: '0.42',
    lis_alpha_decay: '0.22',
    lis_static: '',
  },

  denso: {
    lis_color_mode: 'accent',
    lis_color_dark: '#D4D4D4',
    lis_color_light: '#1A1A1A',
    lis_count: '6',
    lis_ratios: '3:2,4:3,5:4,7:5,8:5,φ',
    lis_segments: '1024',
    lis_line_width: '0.5',
    lis_dash: 'solid',
    lis_line_cap: 'round',
    lis_drift: '0.4',
    lis_phase: '20',
    lis_speed: '1.2',
    lis_rotation: '0.0008',
    lis_trails: '1',
    lis_blend: 'lighter',
    lis_size: '1.1',
    lis_center_x: '0.5',
    lis_center_y: '0.5',
    lis_opacity: '0.7',
    lis_glow: '0',
    lis_alpha_base: '0.36',
    lis_alpha_decay: '0.20',
    lis_static: '',
  },

  minimal: {
    lis_color_mode: 'accent',
    lis_color_dark: '#D4D4D4',
    lis_color_light: '#1A1A1A',
    lis_count: '1',
    lis_ratios: '3:2',
    lis_segments: '800',
    lis_line_width: '1.5',
    lis_dash: 'dash-long',
    lis_line_cap: 'round',
    lis_drift: '0.2',
    lis_phase: '0',
    lis_speed: '0.5',
    lis_rotation: '0',
    lis_trails: '1',
    lis_blend: 'source-over',
    lis_size: '0.9',
    lis_center_x: '0.5',
    lis_center_y: '0.5',
    lis_opacity: '1.5',
    lis_glow: '0',
    lis_alpha_base: '0.45',
    lis_alpha_decay: '0',
    lis_static: '',
  },

  // Psicodélico — orange burst on dark, calmer charcoal stroke on light
  // (a brighter orange washes out the white background of the light theme).
  // Bumped alpha_base to 0.4 after dialling in the canvas live; combined
  // with the 1.3× opacity multiplier this gives the outer figure ~0.52
  // effective alpha and tapers down to ~0.34 on the inner one.
  psicodelico: {
    lis_color_mode: 'custom',
    lis_color_dark: '#FF6A1E',
    lis_color_light: '#404040',
    lis_count: '5',
    lis_ratios: '5:4,7:5,φ,3:2,4:3',
    lis_segments: '1600',
    lis_line_width: '0.4',
    lis_dash: 'dotted',
    lis_line_cap: 'round',
    lis_drift: '1.1',
    lis_phase: '60',
    lis_speed: '2',
    lis_rotation: '0.0025',
    lis_trails: '0.05',
    lis_blend: 'lighter',
    lis_size: '1.2',
    lis_center_x: '0.5',
    lis_center_y: '0.5',
    lis_opacity: '1.3',
    lis_glow: '12',
    lis_alpha_base: '0.4',
    lis_alpha_decay: '0.14',
    lis_static: '',
  },

  // Elisiña — multicolour Psicodélico. Same dotted curves, same trails,
  // but each figure picks a different slice of the colour wheel via the
  // 'multicolor' colour mode. Hue distribution + 90% saturation / 58%
  // lightness gives a vibrant rainbow that reads on both light and dark
  // themes. lis_color_dark / lis_color_light are kept for safety in case
  // the runtime ever falls back to the per-theme hex (e.g. on an unknown
  // colour mode), but the canvas ignores them under 'multicolor'.
  elisina: {
    lis_color_mode: 'multicolor',
    lis_color_dark: '#FF6A1E',
    lis_color_light: '#404040',
    lis_count: '5',
    lis_ratios: '5:4,7:5,φ,3:2,4:3',
    lis_segments: '1600',
    lis_line_width: '0.4',
    lis_dash: 'dotted',
    lis_line_cap: 'round',
    lis_drift: '1.1',
    lis_phase: '60',
    lis_speed: '2',
    lis_rotation: '0.0025',
    lis_trails: '0.05',
    lis_blend: 'lighter',
    lis_size: '1.2',
    lis_center_x: '0.5',
    lis_center_y: '0.5',
    lis_opacity: '1.3',
    lis_glow: '12',
    lis_alpha_base: '0.4',
    lis_alpha_decay: '0.14',
    lis_static: '',
  },
}

/** The default config (also = `academico` preset). */
export const LISSAJOUS_DEFAULTS = LISSAJOUS_PRESETS.academico
