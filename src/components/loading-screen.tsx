'use client'
import { useEffect, useState, useRef } from 'react'

interface LoadingScreenProps { onDone: () => void }

// Solo pre-cargamos las imágenes que realmente usa la página (sin duplicados JPG)
const ASSETS_TO_PRELOAD = [
  '/Miluaistudio/gallery/gallery1.webp',
  '/Miluaistudio/gallery/gallery2.webp',
  '/Miluaistudio/gallery/gallery3.webp',
  '/Miluaistudio/gallery/gallery4.webp',
  '/Miluaistudio/invitacion-vertical.webp',
]

/**
 * Pre-carga imágenes y reporta progreso por cada una.
 */
function preloadImages(
  urls: string[],
  onProgress: (loaded: number) => void,
): Promise<void> {
  return new Promise((resolve) => {
    let loaded = 0
    const total = urls.length
    if (total === 0) { resolve(); return }

    const next = () => {
      loaded++
      onProgress(loaded)
      if (loaded >= total) resolve()
    }

    for (const url of urls) {
      const img = new Image()
      img.onload = next
      img.onerror = next // si falla una, seguimos
      img.src = url
    }
  })
}

/**
 * Espera a que las fuentes estén listas, con timeout de seguridad.
 */
function waitForFonts(timeoutMs = 5000): Promise<void> {
  if (typeof document === 'undefined') return Promise.resolve()
  const fontsReady = document.fonts?.ready?.() ?? Promise.resolve()
  return Promise.race([
    fontsReady,
    new Promise<void>((r) => setTimeout(r, timeoutMs)),
  ])
}

/**
 * Espera un frame de render del browser.
 */
function nextPaint(): Promise<void> {
  return new Promise((r) => {
    requestAnimationFrame(() => requestAnimationFrame(r))
  })
}

export default function LoadingScreen({ onDone }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0)
  const [fading, setFading] = useState(false)
  const doneRef = useRef(false)
  const targetRef = useRef(0)
  const animRef = useRef(0)

  useEffect(() => {
    let cancelled = false

    /**
     * Suaviza el valor mostrado hacia el target.
     * Nunca baja, solo sube lentamente hacia donde debería estar.
     */
    const easeTo = (target: number) => {
      targetRef.current = Math.max(targetRef.current, target)
      if (animRef.current) return // ya está animando

      const step = () => {
        if (cancelled) return
        setProgress((prev) => {
          const goal = targetRef.current
          if (prev >= goal) {
            animRef.current = 0
            return goal
          }
          // Sube al menos 0.4% por frame, o el 6% de lo que falta
          const increment = Math.max(0.4, (goal - prev) * 0.06)
          const next = Math.min(prev + increment, goal)
          if (next < goal) {
            animRef.current = requestAnimationFrame(step)
          } else {
            animRef.current = 0
          }
          return Math.round(next)
        })
      }
      animRef.current = requestAnimationFrame(step)
    }

    const run = async () => {
      const totalAssets = ASSETS_TO_PRELOAD.length

      // Ramp suave de fondo: sube 0.3% cada 120ms → tarda ~35s en llegar a 88%
      // Esto evita que la barra parezca muerta mientras cargan imágenes grandes
      let ramp = 0
      const rampTimer = setInterval(() => {
        if (cancelled) return
        ramp = Math.min(ramp + 0.3, 82)
        easeTo(ramp)
      }, 120)

      // Fase 1: Cargar imágenes (0% → 85%)
      await preloadImages(ASSETS_TO_PRELOAD, (loaded) => {
        if (cancelled) return
        // Cada imagen = 17% (5 imágenes × 17 = 85%)
        const imageTarget = (loaded / totalAssets) * 85
        easeTo(imageTarget)
      })

      clearInterval(rampTimer)
      if (cancelled) return

      // Fase 2: Fuentes (85% → 95%)
      easeTo(88)
      await waitForFonts(5000)
      if (cancelled) return
      easeTo(96)

      // Fase 3: Dar tiempo al browser para pintar (96% → 100%)
      await nextPaint()
      await new Promise<void>((r) => setTimeout(r, 300))
      if (cancelled) return

      easeTo(100)
    }

    run()

    return () => {
      cancelled = true
      if (animRef.current) cancelAnimationFrame(animRef.current)
    }
  }, [])

  useEffect(() => {
    if (progress >= 100 && !doneRef.current) {
      doneRef.current = true
      const t1 = setTimeout(() => setFading(true), 500)
      const t2 = setTimeout(onDone, 1300)
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
              transition: 'width 0.3s ease-out',
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
