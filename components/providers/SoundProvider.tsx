'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'

const SOUND_STORAGE_KEY = 'conceptbridge-sound'

type SoundContextValue = {
  enabled: boolean
  toggle: () => void
  playCorrect: () => void
  playWrong: () => void
  playClick: () => void
  playScore: () => void
}

const SoundContext = createContext<SoundContextValue | null>(null)

/**
 * Soft game-like tones via Web Audio API (no asset files).
 * Volumes kept low so sounds stay subtle, not startling.
 */
function playTone(options: {
  frequency: number
  duration: number
  type?: OscillatorType
  volume?: number
  rampTo?: number
}): void {
  if (typeof window === 'undefined') return

  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext

  if (!AudioCtx) return

  const ctx = new AudioCtx()
  const oscillator = ctx.createOscillator()
  const gain = ctx.createGain()

  oscillator.type = options.type ?? 'sine'
  oscillator.frequency.setValueAtTime(options.frequency, ctx.currentTime)
  if (options.rampTo !== undefined) {
    oscillator.frequency.linearRampToValueAtTime(
      options.rampTo,
      ctx.currentTime + options.duration
    )
  }

  const volume = options.volume ?? 0.08
  gain.gain.setValueAtTime(0.0001, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(volume, ctx.currentTime + 0.01)
  gain.gain.exponentialRampToValueAtTime(
    0.0001,
    ctx.currentTime + options.duration
  )

  oscillator.connect(gain)
  gain.connect(ctx.destination)
  oscillator.start(ctx.currentTime)
  oscillator.stop(ctx.currentTime + options.duration + 0.02)

  oscillator.onended = () => {
    void ctx.close()
  }
}

/**
 * Provides muteable game sounds (correct, wrong, click, score).
 * Preference stored in localStorage under `conceptbridge-sound`.
 *
 * @example
 * <SoundProvider>{children}</SoundProvider>
 */
export function SoundProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(true)
  const enabledRef = useRef(true)

  useEffect(() => {
    const stored = window.localStorage.getItem(SOUND_STORAGE_KEY)
    const next = stored === null ? true : stored === 'true'
    setEnabled(next)
    enabledRef.current = next
  }, [])

  const toggle = useCallback(() => {
    setEnabled((prev) => {
      const next = !prev
      enabledRef.current = next
      window.localStorage.setItem(SOUND_STORAGE_KEY, String(next))
      return next
    })
  }, [])

  const playIfEnabled = useCallback((fn: () => void) => {
    if (!enabledRef.current) return
    try {
      fn()
    } catch {
      // Ignore audio autoplay / context errors
    }
  }, [])

  const playCorrect = useCallback(() => {
    playIfEnabled(() =>
      playTone({ frequency: 800, duration: 0.1, volume: 0.07, type: 'sine' })
    )
  }, [playIfEnabled])

  const playWrong = useCallback(() => {
    playIfEnabled(() =>
      playTone({ frequency: 200, duration: 0.15, volume: 0.06, type: 'triangle' })
    )
  }, [playIfEnabled])

  const playClick = useCallback(() => {
    playIfEnabled(() =>
      playTone({ frequency: 600, duration: 0.03, volume: 0.04, type: 'square' })
    )
  }, [playIfEnabled])

  const playScore = useCallback(() => {
    playIfEnabled(() =>
      playTone({
        frequency: 600,
        rampTo: 900,
        duration: 0.18,
        volume: 0.07,
        type: 'sine',
      })
    )
  }, [playIfEnabled])

  const value = useMemo(
    () => ({
      enabled,
      toggle,
      playCorrect,
      playWrong,
      playClick,
      playScore,
    }),
    [enabled, toggle, playCorrect, playWrong, playClick, playScore]
  )

  return (
    <SoundContext.Provider value={value}>{children}</SoundContext.Provider>
  )
}

/**
 * Access sound context.
 *
 * @example
 * const { playCorrect, enabled, toggle } = useSound()
 */
export function useSound(): SoundContextValue {
  const ctx = useContext(SoundContext)
  if (!ctx) {
    throw new Error('useSound must be used within SoundProvider')
  }
  return ctx
}
