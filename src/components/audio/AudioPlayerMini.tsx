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

  // Pointer-event scrub on the waveform — mouse, touch and pen go through
  // the same path with `setPointerCapture` so a drag started on the bar
  // keeps tracking even if the cursor leaves it. Mirrors AudioPlayer.tsx.
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
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
        aria-label="Posición"
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
          flex: 1,
          height: '24px',
          cursor: isDragging ? 'grabbing' : 'pointer',
          position: 'relative',
          touchAction: 'none',
        }}
      >
        <WaveformBars
          getAnalyser={getAnalyser}
          isPlaying={isPlaying}
          bars={32}
          height={24}
          barWidth={2}
          gap={2}
          progress={progress}
        />
      </div>

      {/* Apple-Music-style remaining counter — at 0:00 it reads as the
          full duration (e.g. "−7:29"), then ticks down. Tabular numerals
          so the digits don't jitter as the value changes. */}
      <div
        style={{
          fontFamily: 'var(--font-space-mono)',
          fontSize: '11px',
          color: 'var(--text-secondary)',
          flexShrink: 0,
          fontVariantNumeric: 'tabular-nums',
          minWidth: '40px',
          textAlign: 'right',
        }}
      >
        −{formatTime(remaining)}
      </div>
    </div>
  )
}
