/**
 * Apple-Music-style codec pill shown above the audio player. For lossless
 * formats (FLAC / WAV / AIFF / ALAC) it renders a waveform glyph and the
 * word "Lossless"; for lossy formats it renders just the codec short name
 * (MP3, AAC, M4A, …). Pill is a fixed dark surface so it reads the same
 * in light and dark themes — same approach Apple takes with audio-quality
 * badges. Glyph and text share `currentColor` (#A8A8AC) so the pill stays
 * within the project's monochrome palette — no off-brand mint.
 */
import type { AudioFormatInfo } from '@/lib/audio-format'

interface AudioFormatTagProps {
  format: AudioFormatInfo
}

const PILL: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  background: '#2A2A2E',
  color: '#A8A8AC',
  borderRadius: '6px',
  fontFamily: 'var(--font-ibm-plex-sans), system-ui, sans-serif',
  fontSize: '11px',
  fontWeight: 500,
  letterSpacing: '0.01em',
  padding: '4px 10px',
  lineHeight: 1,
  userSelect: 'none',
}

function LosslessWaveformGlyph() {
  // Three-period sine drawn as a single stroked path. `stroke="currentColor"`
  // means the glyph inherits the pill's text colour — keeps everything in
  // the same neutral grey of the rest of the badge.
  return (
    <svg
      width="14"
      height="10"
      viewBox="0 0 14 10"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      style={{ flexShrink: 0 }}
    >
      <path d="M0.5 5 C 1.5 1.5, 3 1.5, 4 5 S 6.5 8.5, 7.5 5 S 10 1.5, 11 5 S 13 8.5, 13.5 5" />
    </svg>
  )
}

export function AudioFormatTag({ format }: AudioFormatTagProps) {
  if (format.isLossless) {
    return (
      <span style={PILL} aria-label={`Audio format: ${format.codec} (Lossless)`}>
        <LosslessWaveformGlyph />
        Lossless
      </span>
    )
  }
  return (
    <span style={PILL} aria-label={`Audio format: ${format.codec}`}>
      {format.codec}
    </span>
  )
}
