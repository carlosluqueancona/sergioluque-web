'use client'

import { useCallback, useEffect, useRef } from 'react'

interface AudioGraph {
  /**
   * Lazily creates the AudioContext + MediaElementSource + Analyser graph
   * and resumes a suspended context. MUST be called inside a user gesture
   * (e.g. a click handler) so iOS Safari unlocks WebAudio. Idempotent.
   */
  unlock: () => AnalyserNode | null
  /** Returns the analyser if the graph has been initialized, else null. */
  getAnalyser: () => AnalyserNode | null
}

type LegacyWindow = Window & { webkitAudioContext?: typeof AudioContext }

export function useAudioGraph(
  audioRef: React.RefObject<HTMLAudioElement | null>
): AudioGraph {
  const ctxRef = useRef<AudioContext | null>(null)
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)

  const unlock = useCallback<AudioGraph['unlock']>(() => {
    const audio = audioRef.current
    if (!audio) return null

    try {
      if (!ctxRef.current) {
        const w = window as LegacyWindow
        const AC = window.AudioContext ?? w.webkitAudioContext
        if (!AC) return null
        ctxRef.current = new AC()
      }
      const ctx = ctxRef.current

      if (!sourceRef.current) {
        sourceRef.current = ctx.createMediaElementSource(audio)
        analyserRef.current = ctx.createAnalyser()
        // 1024 → 512 frequency bins. Previous 256 (128 bins) was not
        // enough resolution: with ~80 bars and a log-spaced bin map,
        // floor() at the low end collapsed many adjacent bars onto
        // the same bin and they moved as a block. 1024 gives enough
        // headroom for hundreds of bars to each pick up a unique
        // slice.
        analyserRef.current.fftSize = 1024
        analyserRef.current.smoothingTimeConstant = 0.78
        sourceRef.current.connect(analyserRef.current)
        analyserRef.current.connect(ctx.destination)
      }

      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {})
      }
      return analyserRef.current
    } catch {
      return null
    }
  }, [audioRef])

  const getAnalyser = useCallback(() => analyserRef.current, [])

  useEffect(() => {
    return () => {
      const ctx = ctxRef.current
      if (ctx && ctx.state !== 'closed') {
        ctx.close().catch(() => {})
      }
    }
  }, [])

  return { unlock, getAnalyser }
}
