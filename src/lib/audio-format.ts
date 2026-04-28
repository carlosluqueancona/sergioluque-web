/**
 * Detect audio codec metadata from a URL/filename. Returns both the codec
 * short name (FLAC, MP3, M4A, AAC, …) and whether the format is lossless,
 * so the UI can swap to a "Lossless" badge with a different glyph for
 * FLAC / WAV / AIFF / ALAC.
 *
 * Returns null when the URL doesn't end in a recognised audio extension —
 * the UI hides the tag rather than show a confusing fallback.
 */
const FORMAT_BY_EXT: Record<string, string> = {
  flac: 'FLAC',
  mp3: 'MP3',
  m4a: 'M4A',
  mp4: 'M4A',
  aac: 'AAC',
  wav: 'WAV',
  aif: 'AIFF',
  aiff: 'AIFF',
  alac: 'ALAC',
  ogg: 'OGG',
  oga: 'OGG',
  opus: 'OPUS',
}

const LOSSLESS_EXTS = new Set(['flac', 'wav', 'aif', 'aiff', 'alac'])

export interface AudioFormatInfo {
  /** Short codec name, e.g. "FLAC" or "MP3". */
  codec: string
  /** True for FLAC / WAV / AIFF / ALAC. */
  isLossless: boolean
}

export function detectAudioFormat(url: string | undefined | null): AudioFormatInfo | null {
  if (!url) return null
  const clean = url.split(/[?#]/)[0] ?? ''
  const dotIndex = clean.lastIndexOf('.')
  if (dotIndex === -1) return null
  const ext = clean.slice(dotIndex + 1).toLowerCase()
  const codec = FORMAT_BY_EXT[ext]
  if (!codec) return null
  return { codec, isLossless: LOSSLESS_EXTS.has(ext) }
}
