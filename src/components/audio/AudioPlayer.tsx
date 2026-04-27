'use client'

import { useRef, useState, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { WaveformBars } from './WaveformBars'
import { formatTime } from '@/lib/utils'
import { useAudioGraph } from '@/lib/audio/useAudioGraph'

interface AudioPlayerProps {
  audioUrl: string
  title: string
  duration?: number
}

export function AudioPlayer({ audioUrl, title, duration }: AudioPlayerProps) {
  const t = useTranslations('audio')
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

  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current
    if (!audio || audioDuration === 0) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const ratio = x / rect.width
    audio.currentTime = ratio * audioDuration
    setCurrentTime(audio.currentTime)
  }, [audioDuration])

  const progress = audioDuration > 0 ? (currentTime / audioDuration) * 100 : 0

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
          aria-label={isPlaying ? t('pause') : t('play')}
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
          <div
            role="slider"
            aria-label="Posición de reproducción"
            aria-valuemin={0}
            aria-valuemax={Math.round(audioDuration)}
            aria-valuenow={Math.round(currentTime)}
            onClick={handleSeek}
            style={{
              height: '4px',
              background: 'var(--border)',
              cursor: 'pointer',
              position: 'relative',
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
                transition: 'width 100ms linear',
              }}
            />
          </div>
        </div>

        <div
          style={{
            fontFamily: 'var(--font-space-mono)',
            fontSize: '12px',
            color: 'var(--text-secondary)',
            flexShrink: 0,
            minWidth: '90px',
            textAlign: 'right',
          }}
        >
          {formatTime(currentTime)} / {formatTime(audioDuration)}
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
