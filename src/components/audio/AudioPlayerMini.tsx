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

  const handleSeek = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const audio = audioRef.current
      if (!audio || audioDuration === 0) return
      const rect = e.currentTarget.getBoundingClientRect()
      audio.currentTime = ((e.clientX - rect.left) / rect.width) * audioDuration
      setCurrentTime(audio.currentTime)
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
        onClick={handleSeek}
        role="slider"
        aria-label="Posición"
        aria-valuemin={0}
        aria-valuemax={Math.round(audioDuration)}
        aria-valuenow={Math.round(currentTime)}
        style={{
          flex: 1,
          height: '24px',
          cursor: 'pointer',
          position: 'relative',
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

      <div
        style={{
          fontFamily: 'var(--font-space-mono)',
          fontSize: '11px',
          color: 'var(--text-secondary)',
          flexShrink: 0,
        }}
      >
        {formatTime(audioDuration)}
      </div>
    </div>
  )
}
