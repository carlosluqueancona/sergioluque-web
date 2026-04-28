/**
 * Detect a human-readable audio format label from a URL/filename.
 * Maps file extensions to the canonical short names we display in the
 * orange format tag on /works.
 *
 * Returns null when the URL doesn't end in a recognised audio extension
 * (so the UI can hide the tag rather than show a confusing fallback).
 */
const FORMAT_BY_EXT: Record<string, string> = {
  flac: 'FLAC',
  mp3: 'MP3',
  m4a: 'M4A',
  mp4: 'M4A',
  aac: 'AAC',
  wav: 'WAV',
  ogg: 'OGG',
  oga: 'OGG',
  opus: 'OPUS',
}

export function detectAudioFormat(url: string | undefined | null): string | null {
  if (!url) return null
  // Strip query string and fragment, then take the extension after the last dot.
  const clean = url.split(/[?#]/)[0] ?? ''
  const dotIndex = clean.lastIndexOf('.')
  if (dotIndex === -1) return null
  const ext = clean.slice(dotIndex + 1).toLowerCase()
  return FORMAT_BY_EXT[ext] ?? null
}
