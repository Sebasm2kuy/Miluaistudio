'use client'
import { useEffect, useState, useRef, useCallback } from 'react'

interface LoadingScreenProps { onDone: () => void }

const IMAGES = [
  '/Miluaistudio/gallery/gallery1.webp',
  '/Miluaistudio/gallery/gallery2.webp',
  '/Miluaistudio/gallery/gallery3.webp',
  '/Miluaistudio/gallery/gallery4.webp',
  '/Miluaistudio/invitacion-vertical.webp',
  '/Miluaistudio/invitacion.webp',
]

export default function LoadingScreen({ onDone }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0)
  const [fading, setFading] = useState(false)
  const loadedRef = useRef(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    loadedRef.current = 0
    const total = IMAGES.length

    IMAGES.forEach((src) => {
      const img = new Image()
      img.onload = img.onerror = () => {
        loadedRef.current++
        // Solo actualizar progreso si esta por delante del auto-advance
        setProgress(prev => {
          const real = Math.round((loadedRef.current / total) * 100)
          return Math.max(prev, real)
        })
        if (loadedRef.current >= total && intervalRef.current) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
        }
      }
      img.src = src
    })

    // Auto-advance lento para que se vea elegante
    intervalRef.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) return prev
        const real = Math.round((loadedRef.current / IMAGES.length) * 100)
        return Math.min(prev + 1, real)
      })
    }, 55)

    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [])

  useEffect(() => {
    if (progress >= 100) {
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null }
      const t1 = setTimeout(() => setFading(true), 350)
      const t2 = setTimeout(onDone, 1000)
      return () => { clearTimeout(t1); clearTimeout(t2) }
    }
  }, [progress, onDone])

  return (
    <div
      className="fixed inset-0 z-[300] bg-black flex flex-col items-center justify-center"
      style={{ opacity: fading ? 0 : 1, transition: 'opacity 0.65s ease' }}
    >
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
      <div className="w-48 sm:w-64 md:w-72">
        <div className="h-[2px] rounded-full overflow-hidden" style={{ background: 'rgba(184,134,11,0.15)' }}>
          <div
            className="h-full rounded-full"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #b38728, #d4af37, #fcf6ba)',
              transition: 'width 0.12s linear',
              boxShadow: '0 0 8px rgba(212,175,55,0.4)',
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
