'use client'
import { useEffect, useState, useRef } from 'react'

interface LoadingScreenProps { onDone: () => void }

// ALL assets the page needs — the bar doesn't reach 100% until these are loaded
const ASSETS_TO_PRELOAD = [
  // Slideshow images (the big ones)
  '/Miluaistudio/gallery/gallery1.webp',
  '/Miluaistudio/gallery/gallery2.webp',
  '/Miluaistudio/gallery/gallery3.webp',
  '/Miluaistudio/gallery/gallery4.webp',
  // Fallback JPGs for older browsers
  '/Miluaistudio/gallery/gallery1.jpg',
  '/Miluaistudio/gallery/gallery2.jpg',
  '/Miluaistudio/gallery/gallery3.jpg',
  '/Miluaistudio/gallery/gallery4.jpg',
  // Envelope image
  '/Miluaistudio/invitacion-vertical.webp',
  '/Miluaistudio/invitacion-vertical.png',
]

/**
 * Returns a Promise that resolves when ALL images are loaded (or errored).
 * Tracks progress as each image finishes.
 */
function preloadImages(
  urls: string[],
  onProgress: (loaded: number) => void,
): Promise<void> {
  return new Promise((resolve) => {
    let loaded = 0
    const total = urls.length

    if (total === 0) { resolve(); return }

    const done = () => {
      loaded++
      onProgress(loaded)
      if (loaded >= total) resolve()
    }

    for (const url of urls) {
      const img = new Image()
      img.onload = done
      img.onerror = done // continue even if one fails
      img.src = url
    }
  })
}

/**
 * Returns a Promise that resolves when all fonts are loaded.
 * Falls back to resolving after 3s if the API isn't available.
 */
function waitForFonts(): Promise<void> {
  if (typeof document === 'undefined') return Promise.resolve()
  return document.fonts?.ready?.() ?? new Promise((r) => setTimeout(r, 3000))
}

export default function LoadingScreen({ onDone }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0)
  const [fading, setFading] = useState(false)
  const doneRef = useRef(false)

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      // Phase 1: Load images (accounts for 0-90% of the bar)
      const totalAssets = ASSETS_TO_PRELOAD.length
      let imagesLoaded = 0

      // Start a gentle progress ramp while images load
      let ramp = 0
      const rampInterval = setInterval(() => {
        if (cancelled) return
        ramp = Math.min(ramp + 0.5, 88) // never exceed 88 on ramp alone
        setProgress(Math.round(ramp))
      }, 100)

      await preloadImages(ASSETS_TO_PRELOAD, (loaded) => {
        if (cancelled) return
        imagesLoaded = loaded
        // Image-based progress: each image = ~9% (9 images × ~9 = ~81)
        const imageProgress = (loaded / totalAssets) * 81
        setProgress(Math.round(Math.max(ramp, imageProgress)))
      })

      clearInterval(rampInterval)

      if (cancelled) return

      // Phase 2: Wait for fonts (90-97%)
      setProgress(90)
      await waitForFonts()
      if (cancelled) return
      setProgress(97)

      // Phase 3: Give the browser time to paint everything (97-100%)
      await new Promise<void>((r) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              setTimeout(r, 400)
            })
          })
        })
      })

      if (cancelled) return
      setProgress(100)
    }

    run()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (progress >= 100 && !doneRef.current) {
      doneRef.current = true
      const t1 = setTimeout(() => setFading(true), 400)
      const t2 = setTimeout(onDone, 1200)
      return () => { clearTimeout(t1); clearTimeout(t2) }
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
        <div className="h-[2px] rounded-full overflow-hidden" style={{ background: 'rgba(184,134,11,0.15)' }}>
          <div
            className="h-full rounded-full"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #b38728, #d4af37, #fcf6ba)',
              transition: 'width 0.15s linear',
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
