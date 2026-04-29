'use client'
import { useEffect, useState, useRef } from 'react'

interface LoadingScreenProps { onDone: () => void }

const ASSETS = [
  '/Miluaistudio/gallery/gallery1.webp',
  '/Miluaistudio/gallery/gallery2.webp',
  '/Miluaistudio/gallery/gallery3.webp',
  '/Miluaistudio/gallery/gallery4.webp',
  '/Miluaistudio/invitacion-vertical.webp',
]

function preloadImages(urls: string[]): Promise<void> {
  return Promise.all(
    urls.map(
      (url) =>
        new Promise<void>((resolve) => {
          const img = new Image()
          img.onload = () => resolve()
          img.onerror = () => resolve()
          img.src = url
        }),
    ),
  ).then(() => {})
}

function waitForFonts(timeoutMs = 5000): Promise<void> {
  if (typeof document === 'undefined') return Promise.resolve()
  const fontsReady: Promise<void> = document.fonts?.ready ?? Promise.resolve()
  return Promise.race([
    fontsReady,
    new Promise<void>((r) => setTimeout(r, timeoutMs)),
  ])
}

export default function LoadingScreen({ onDone }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0)
  const [fading, setFading] = useState(false)
  const doneRef = useRef(false)

  useEffect(() => {
    let cancelled = false

    let target = 0       // where the bar WANTS to be
    let displayed = 0    // where the bar actually is
    let lastTick = performance.now()
    let imagesLoaded = false
    let fontsLoaded = false

    // Real asset loading — these confirm real progress
    preloadImages(ASSETS).then(() => {
      if (!cancelled) imagesLoaded = true
    })
    waitForFonts(5000).then(() => {
      if (!cancelled) fontsLoaded = true
    })

    const TICK = 50

    const interval = setInterval(() => {
      if (cancelled) return

      const now = performance.now()
      const dt = Math.min((now - lastTick) / 1000, 0.15)
      lastTick = now

      // --- Update target based on real load state ---

      if (!imagesLoaded) {
        // Images still loading: ramp slowly (10%/s)
        target = Math.min(target + 10 * dt, 82)
      } else if (!fontsLoaded) {
        // Images done, fonts pending: ramp moderately (8%/s)
        target = Math.max(target, 85)
        target = Math.min(target + 8 * dt, 92)
      } else {
        // Everything loaded: sprint to 100 (20%/s)
        target = Math.max(target, 93)
        target = Math.min(target + 20 * dt, 100)
      }

      // --- Smooth display: catch up to target without jumping ---
      // Per-tick: min 0.08%, proportional to gap (4%), max 2%
      // CSS transition (0.2s) smooths these into fluid visual movement

      const gap = target - displayed
      if (gap > 0) {
        const catchUp = Math.max(0.08, Math.min(gap * 0.04, 2))
        displayed = Math.min(displayed + catchUp, target)
      }

      setProgress(Math.min(Math.round(displayed), 100))

      // Done?
      if (displayed >= 99.5 && imagesLoaded && fontsLoaded) {
        setProgress(100)
        clearInterval(interval)
      }
    }, TICK)

    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    if (progress >= 100 && !doneRef.current) {
      doneRef.current = true
      const t1 = setTimeout(() => setFading(true), 600)
      const t2 = setTimeout(onDone, 1500)
      return () => {
        clearTimeout(t1)
        clearTimeout(t2)
      }
    }
  }, [progress, onDone])

  return (
    <div
      className="fixed inset-0 z-[300] bg-black flex flex-col items-center justify-center"
      style={{
        opacity: fading ? 0 : 1,
        transition: 'opacity 0.8s ease',
        left: '-5px',
        right: '-5px',
        top: '-5px',
        bottom: '-5px',
        width: 'calc(100% + 10px)',
        height: 'calc(100% + 10px)',
      }}
    >
      <p
        className="font-cursive text-3xl sm:text-5xl mb-8 sm:mb-10"
        style={{ color: '#d4af37' }}
      >
        Milagros
      </p>
      <div className="w-48 sm:w-64 md:w-72">
        <div
          className="h-[2px] rounded-full overflow-hidden"
          style={{ background: 'rgba(184,134,11,0.15)' }}
        >
          <div
            className="h-full rounded-full"
            style={{
              width: `${progress}%`,
              background:
                'linear-gradient(90deg, #b38728, #d4af37, #fcf6ba)',
              transition: 'width 0.2s linear',
            }}
          />
        </div>
        <p className="text-center mt-3 sm:mt-4 text-[10px] sm:text-xs text-gold/50 tracking-[0.3em] font-light tabular-nums">
          {progress}%
        </p>
      </div>
    </div>
  )
}
