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
  return Promise.race([
    document.fonts?.ready?.() ?? Promise.resolve(),
    new Promise<void>((r) => setTimeout(r, timeoutMs)),
  ])
}

export default function LoadingScreen({ onDone }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0)
  const [fading, setFading] = useState(false)
  const doneRef = useRef(false)

  useEffect(() => {
    let cancelled = false
    let current = 0
    let imagesReady = false
    let fontsReady = false
    let finished = false
    let lastTime = performance.now()

    // Lanzar cargas en paralelo
    preloadImages(ASSETS).then(() => { imagesReady = true })
    waitForFonts(5000).then(() => { fontsReady = true })

    const TICK = 40 // ms entre updates (25 fps suficiente para una barra)

    const interval = setInterval(() => {
      if (cancelled || finished) return

      const now = performance.now()
      const dt = Math.min((now - lastTime) / 1000, 0.2) // clamp para evitar saltos
      lastTime = now

      // Cálculo de velocidad basado en tiempo, NO en eventos
      // Normal: 16%/s → ~6s total | Lento: 2%/s | Rápido: 25%/s
      let speed = 16

      if (!imagesReady) {
        // Frenado suave: empieza a frenar en 50%, casi se detiene en 80%
        const zone = Math.min(1, Math.max(0, (current - 50) / 35))
        speed = 16 - 13.5 * zone // 16 → 2.5%/s
      } else if (!fontsReady) {
        // Frenado suave para fonts: empieza en 82%, casi se detiene en 93%
        const zone = Math.min(1, Math.max(0, (current - 82) / 13))
        speed = 16 - 13.5 * zone
      } else {
        // Todo cargado → acelerar para terminar
        speed = 25
      }

      current = Math.min(current + speed * dt, 100)
      setProgress(Math.round(current))

      if (current >= 100 && imagesReady && fontsReady) {
        finished = true
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
      const t1 = setTimeout(() => setFading(true), 500)
      const t2 = setTimeout(onDone, 1300)
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
              transition: 'width 0.25s linear',
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
