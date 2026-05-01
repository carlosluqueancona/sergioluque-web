'use client'

import { useRef, useState, useCallback } from 'react'
import { S } from '@/lib/strings'
import { WaveformBars } from './WaveformBars'
import { formatTime } from '@/lib/utils'
import { useAudioGraph } from '@/lib/audio/useAudioGraph'

interface AudioPlayerMiniProps {
  audioUrl: string
  title: string
  duration?: number
}

/**
 * Compact card-sized player. Mirrors the full AudioPlayer used on
 * /listen/[slug] (waveform decoration up top, thin scrub line below
 * with elapsed | −remaining), but shrunk to fit inside a WorkCard
 * — needed because the card-wide click target that linked to the
 * detail page is currently disabled, so users never see the full
 * player and the Mini has to carry the same affordances.
 */
export function AudioPlayerMini({ audioUrl, title: _title, duration }: AudioPlayerMiniProps) {
  const t = S.audio
  const audioRef = useRef<HTMLAudioElement>(null)
  const { unlock, getAnalyser } = useAudioGraph(audioRef)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [audioDuration, setAudioDuration] = useState(duration ?? 0)
  const [isLoading, setIsLoading] = useState(false)

  const togglePlay = useCallback(async () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
    } else {
      unlock() // iOS WebAudio unlock — must run inside the click gesture.
      setIsLoading(true)
      try {
        await audio.play()
        setIsPlaying(true)
      } catch {
        setIsPlaying(false)
      } finally {
        setIsLoading(false)
      }
    }
  }, [isPlaying, unlock])

  const handleTimeUpdate = useCallback(() => {
    setCurrentTime(audioRef.current?.currentTime ?? 0)
  }, [])

  const handleLoadedMetadata = useCallback(() => {
    setAudioDuration(audioRef.current?.duration ?? 0)
  }, [])

  const handleEnded = useCallback(() => {
    setIsPlaying(false)
    setCurrentTime(0)
  }, [])

  // Keep React state in sync if the audio is paused externally — e.g. when
  // ExclusivePlayback pauses this player because another player just started.
  const handlePause = useCallback(() => {
    setIsPlaying(false)
  }, [])

  const progress = audioDuration > 0 ? currentTime / audioDuration : 0
  const remaining = Math.max(0, audioDuration - currentTime)

  // Pointer-event scrub on the thin line. The WaveformBars on top is
  // purely decorative now (kept showing the progress fill via the
  // `progress` prop) — only the line is the slider, mirroring the
  // full AudioPlayer's interaction model.
  const [isDragging, setIsDragging] = useState(false)

  const seekFromPointer = useCallback(
    (target: HTMLDivElement, clientX: number) => {
      const audio = audioRef.current
      if (!audio || audioDuration === 0) return
      const rect = target.getBoundingClientRect()
      const x = Math.max(0, Math.min(rect.width, clientX - rect.left))
      const ratio = rect.width > 0 ? x / rect.width : 0
      const newTime = ratio * audioDuration
      audio.currentTime = newTime
      setCurrentTime(newTime)
    },
    [audioDuration]
  )

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.currentTarget.setPointerCapture(e.pointerId)
      setIsDragging(true)
      seekFromPointer(e.currentTarget, e.clientX)
    },
    [seekFromPointer]
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isDragging) return
      seekFromPointer(e.currentTarget, e.clientX)
    },
    [isDragging, seekFromPointer]
  )

  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId)
    }
    setIsDragging(false)
  }, [])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const audio = audioRef.current
      if (!audio || audioDuration === 0) return
      let next: number | null = null
      if (e.key === 'ArrowLeft') next = audio.currentTime - 5
      else if (e.key === 'ArrowRight') next = audio.currentTime + 5
      else if (e.key === 'Home') next = 0
      else if (e.key === 'End') next = audioDuration
      if (next === null) return
      e.preventDefault()
      next = Math.max(0, Math.min(audioDuration, next))
      audio.currentTime = next
      setCurrentTime(next)
    },
    [audioDuration]
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <audio
        ref={audioRef}
        src={audioUrl}
        preload="metadata"
        crossOrigin="anonymous"
        hidden
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onPause={handlePause}
      />

      {/* Decorative waveform — animates from AnalyserNode while playing,
          fills with the accent color up to `progress`. No pointer events
          here; scrubbing happens on the thin line below. */}
      <div style={{ height: '32px', position: 'relative' }}>
        <WaveformBars
          getAnalyser={getAnalyser}
          isPlaying={isPlaying}
          bars={48}
          height={32}
          barWidth={2}
          gap={2}
          progress={progress}
        />
      </div>

      {/* Play button + thin scrub line. 14px-tall hit area wraps a 4px
          visible bar, same affordance as the full AudioPlayer. */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={togglePlay}
          disabled={isLoading}
          aria-label={isPlaying ? t.pause : t.play}
          style={{
            width: '32px',
            height: '32px',
            border: '1px solid var(--border)',
            background: 'none',
            color: 'var(--text-primary)',
            cursor: isLoading ? 'wait' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {isLoading ? (
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" strokeDasharray="20" strokeDashoffset="20">
                <animateTransform attributeName="transform" type="rotate" from="0 8 8" to="360 8 8" dur="1s" repeatCount="indefinite" />
              </circle>
            </svg>
          ) : isPlaying ? (
            <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
              <rect x="3" y="2" width="4" height="12" />
              <rect x="9" y="2" width="4" height="12" />
            </svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
              <polygon points="3,1 14,8 3,15" />
            </svg>
          )}
        </button>

        <div
          role="slider"
          tabIndex={0}
          aria-label="Posición de reproducción"
          aria-valuemin={0}
          aria-valuemax={Math.round(audioDuration)}
          aria-valuenow={Math.round(currentTime)}
          aria-valuetext={`${formatTime(currentTime)} de ${formatTime(audioDuration)}`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onKeyDown={handleKeyDown}
          style={{
            position: 'relative',
            flex: 1,
            height: '14px',
            display: 'flex',
            alignItems: 'center',
            cursor: isDragging ? 'grabbing' : 'pointer',
            touchAction: 'none',
            outlineOffset: '2px',
          }}
        >
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '4px',
              background: 'var(--border)',
              borderRadius: '2px',
            }}
          >
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                height: '100%',
                width: `${progress * 100}%`,
                background: 'var(--accent)',
                borderRadius: '2px',
                transition: isDragging ? 'none' : 'width 100ms linear',
              }}
            />
          </div>
        </div>
      </div>

      {/* Time row — elapsed left, −remaining right. Tabular-nums so
          the digits don't jitter as the value changes. */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontFamily: 'var(--font-space-mono)',
          fontSize: '11px',
          color: 'var(--text-secondary)',
          fontVariantNumeric: 'tabular-nums',
          letterSpacing: '0.02em',
          paddingLeft: '44px', // align elapsed under the slider, past the play button + gap (32 + 12)
        }}
      >
        <span>{formatTime(currentTime)}</span>
        <span>−{formatTime(remaining)}</span>
      </div>
    </div>
  )
}
