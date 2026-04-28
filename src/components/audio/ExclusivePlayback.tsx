'use client'

import { useEffect } from 'react'

/**
 * Mounts a single document-level listener: when any <audio> element starts
 * playing, every other <audio> in the document is paused. Each player's
 * own onPause handler keeps its React state in sync with the DOM.
 *
 * Mount once in the root layout. Safe with multiple AudioPlayer /
 * AudioPlayerMini instances on the same page (works/list page).
 */
export function ExclusivePlayback() {
  useEffect(() => {
    function onPlay(e: Event) {
      const target = e.target
      if (!(target instanceof HTMLAudioElement)) return
      const audios = document.querySelectorAll('audio')
      audios.forEach((el) => {
        if (el !== target && !el.paused) el.pause()
      })
    }
    // Capture phase — `play` does not bubble, so we listen on the way down.
    document.addEventListener('play', onPlay, true)
    return () => document.removeEventListener('play', onPlay, true)
  }, [])

  return null
}
