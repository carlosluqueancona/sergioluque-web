'use client'

import { useRef, useState, useCallback } from 'react'
import { WaveformBars } from './WaveformBars'
import { formatTime } from '@/lib/utils'
import { useAudioGraph } from '@/lib/audio/useAudioGraph'
import { S } from '@/lib/strings'

interface AudioPlayerProps {
  audioUrl: string
  title: string
  duration?: number
}

export function AudioPlayer({ audioUrl, title, duration }: AudioPlayerProps) {
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
      // Synchronously inside the user gesture so iOS unlocks WebAudio.
      unlock()
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
    const audio = audioRef.current
    if (!audio) return
    setCurrentTime(audio.currentTime)
  }, [])

  const handleLoadedMetadata = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    setAudioDuration(audio.duration)
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

  // Pointer-event-based scrub. Used for both initial click and drag.
  // Pointer events normalise mouse + touch + pen, and `setPointerCapture`
  // means the drag keeps tracking even if the cursor leaves the bar.
  const [isDragging, setIsDragging] = useState(false)

  const seekFromPointer = useCallback((target: HTMLDivElement, clientX: number) => {
    const audio = audioRef.current
    if (!audio || audioDuration === 0) return
    const rect = target.getBoundingClientRect()
    const x = Math.max(0, Math.min(rect.width, clientX - rect.left))
    const ratio = rect.width > 0 ? x / rect.width : 0
    const newTime = ratio * audioDuration
    audio.currentTime = newTime
    setCurrentTime(newTime)
  }, [audioDuration])

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    setIsDragging(true)
    seekFromPointer(e.currentTarget, e.clientX)
  }, [seekFromPointer])

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return
    seekFromPointer(e.currentTarget, e.clientX)
  }, [isDragging, seekFromPointer])

  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId)
    }
    setIsDragging(false)
  }, [])

  // Keyboard-driven scrubbing for accessibility (slider role).
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
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
  }, [audioDuration])

  const progress = audioDuration > 0 ? (currentTime / audioDuration) * 100 : 0
  const remaining = Math.max(0, audioDuration - currentTime)

  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        padding: '24px',
      }}
    >
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

      <WaveformBars
        getAnalyser={getAnalyser}
        isPlaying={isPlaying}
        bars={56}
        height={56}
      />

      <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={togglePlay}
          disabled={isLoading}
          aria-label={isPlaying ? t.pause : t.play}
          style={{
            width: '40px',
            height: '40px',
            border: '1px solid var(--border)',
            background: 'none',
            color: 'var(--text-primary)',
            cursor: isLoading ? 'wait' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: 'border-color 150ms ease-out',
          }}
        >
          {isLoading ? (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" strokeDasharray="20" strokeDashoffset="20">
                <animateTransform attributeName="transform" type="rotate" from="0 8 8" to="360 8 8" dur="1s" repeatCount="indefinite" />
              </circle>
            </svg>
          ) : isPlaying ? (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <rect x="3" y="2" width="4" height="12" />
              <rect x="9" y="2" width="4" height="12" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <polygon points="3,1 14,8 3,15" />
            </svg>
          )}
        </button>

        <div style={{ flex: 1 }}>
          {/* 14px-tall hit area wraps the 4px visible bar, so the drag /
              tap target is touch-friendly without the visual getting bulky. */}
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
                  width: `${progress}%`,
                  background: 'var(--accent)',
                  borderRadius: '2px',
                  transition: isDragging ? 'none' : 'width 100ms linear',
                }}
              />
            </div>
          </div>

          {/* Time row — elapsed left, remaining right, mirrors the
              Apple Music / iOS Now Playing layout. */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: '6px',
              fontFamily: 'var(--font-space-mono)',
              fontSize: '11px',
              color: 'var(--text-secondary)',
              fontVariantNumeric: 'tabular-nums',
              letterSpacing: '0.02em',
            }}
          >
            <span>{formatTime(currentTime)}</span>
            <span>−{formatTime(remaining)}</span>
          </div>
        </div>
      </div>

      <div
        style={{
          marginTop: '12px',
          fontFamily: 'var(--font-space-mono)',
          fontSize: '11px',
          color: 'var(--text-muted)',
          letterSpacing: '0.05em',
        }}
      >
        {title}
      </div>
    </div>
  )
}
