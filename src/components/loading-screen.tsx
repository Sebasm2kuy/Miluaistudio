'use client'
import { useState, useEffect, useRef, useCallback } from 'react'

interface LoadingScreenProps { onReady: () => void }

// Todas las imagenes que hay que precargar
const IMAGES_TO_PRELOAD = [
  '/Miluaistudio/gallery/gallery1.webp',
  '/Miluaistudio/gallery/gallery2.webp',
  '/Miluaistudio/gallery/gallery3.webp',
  '/Miluaistudio/gallery/gallery4.webp',
  '/Miluaistudio/invitacion-vertical.webp',
  '/Miluaistudio/invitacion.webp',
]

export default function LoadingScreen({ onReady }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0)
  const [fading, setFading] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const startLoading = useCallback(() => {
    let loaded = 0
    const total = IMAGES_TO_PRELOAD.length

    // Precargar imagenes
    IMAGES_TO_PRELOAD.forEach((src) => {
      const img = new Image()
      img.onload = img.onerror = () => {
        loaded++
        setProgress(Math.round((loaded / total) * 100))
        if (loaded >= total && intervalRef.current) {
          clearInterval(intervalRef.current)
        }
      }
      img.src = src
    })

    // Progreso visual suave — avanza de a 1 aunque las imagenes no carguen todavia
    // para que nunca se quede trabado
    intervalRef.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 98) return prev
        // Avanza pero nunca por delante de las imagenes reales
        return Math.min(prev + 1, 98)
      })
    }, 60)
  }, [])

  useEffect(() => {
    startLoading()
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [startLoading])

  // Cuando llega a 100%, esperar un momento y desvanecer
  useEffect(() => {
    if (progress >= 100) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      const t = setTimeout(() => {
        setFading(true)
        setTimeout(onReady, 700)
      }, 400)
      return () => clearTimeout(t)
    }
  }, [progress, onReady])

  return (
    <div
      className="fixed inset-0 z-[300] bg-black flex flex-col items-center justify-center"
      style={{ opacity: fading ? 0 : 1, transition: 'opacity 0.7s ease' }}
    >
      {/* Nombre */}
      <p
        className="font-cursive text-3xl sm:text-5xl mb-8 sm:mb-10"
        style={{
          background: 'linear-gradient(90deg, #bf953f, #fcf6ba, #b38728, #fcf6ba, #bf953f)',
          backgroundSize: '200% auto',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          animation: 'shimmer 4s ease-in-out infinite',
          filter: 'drop-shadow(0 0 20px rgba(184,134,11,0.3))',
        }}
      >
        Milagros
      </p>

      {/* Barra de progreso */}
      <div className="w-48 sm:w-64 md:w-72">
        {/* Track */}
        <div
          className="h-[2px] rounded-full overflow-hidden"
          style={{ background: 'rgba(184,134,11,0.15)' }}
        >
          {/* Fill */}
          <div
            className="h-full rounded-full"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #b38728, #d4af37, #fcf6ba)',
              transition: 'width 0.15s ease-out',
              boxShadow: '0 0 8px rgba(212,175,55,0.4)',
            }}
          />
        </div>

        {/* Porcentaje */}
        <p className="text-center mt-3 sm:mt-4 text-[10px] sm:text-xs text-gold/50 tracking-[0.3em] font-light tabular-nums">
          {progress}%
        </p>
      </div>
    </div>
  )
}
