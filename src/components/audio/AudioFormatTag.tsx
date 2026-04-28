/**
 * Small orange pill that names the codec of the audio file currently being
 * played (FLAC, MP3, AAC, M4A, …). Useful editorial cue for listeners who
 * care about lossless vs lossy. Always renders with the brand orange so it
 * keeps reading the same in light + dark themes regardless of the orange-
 * CTA toggle elsewhere.
 */
interface AudioFormatTagProps {
  format: string
}

export function AudioFormatTag({ format }: AudioFormatTagProps) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        background: '#FF6A1E',
        color: '#0A0A0A',
        fontFamily: 'var(--font-space-mono)',
        fontSize: '9px',
        fontWeight: 700,
        letterSpacing: '0.12em',
        padding: '3px 7px',
        textTransform: 'uppercase',
        lineHeight: 1,
        userSelect: 'none',
      }}
      aria-label={`Audio format: ${format}`}
    >
      {format}
    </span>
  )
}
