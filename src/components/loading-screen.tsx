'use client'
import { useEffect, useState, useRef } from 'react'

interface LoadingScreenProps { onDone: () => void }

const CRITICAL_IMAGE = '/Miluaistudio/gallery/gallery1.webp'

export default function LoadingScreen({ onDone }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0)
  const [fading, setFading] = useState(false)
  const doneRef = useRef(false)

  useEffect(() => {
    let imageReady = false

    const img = new Image()
    img.onload = () => { imageReady = true }
    img.onerror = () => { imageReady = true }
    img.src = CRITICAL_IMAGE

    let current = 0
    const interval = setInterval(() => {
      current += 1
      if (imageReady && current >= 85) {
        current = 100
        clearInterval(interval)
        // Dar tiempo al browser de terminar de componer el hero
        // antes de hacer la transición — 3 frames de RAF + 500ms extra
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              setTimeout(() => {
                if (doneRef.current) return
                doneRef.current = true
                setProgress(100)
              }, 500)
            })
          })
        })
      } else if (current > 84) {
        current = 84
      }
      setProgress(Math.min(current, 100))
    }, 40)

    return () => { clearInterval(interval) }
  }, [])

  useEffect(() => {
    if (progress >= 100) {
      const t1 = setTimeout(() => setFading(true), 300)
      const t2 = setTimeout(onDone, 1000)
      return () => { clearTimeout(t1); clearTimeout(t2) }
    }
  }, [progress, onDone])

  return (
    <div
      className="fixed inset-0 z-[300] bg-black flex flex-col items-center justify-center"
      style={{
        opacity: fading ? 0 : 1,
        transition: 'opacity 0.7s ease',
        left: '-5px',
        right: '-5px',
        top: '-5px',
        bottom: '-5px',
        width: 'calc(100% + 10px)',
        height: 'calc(100% + 10px)',
      }}
    >
      {/* Loading text — sin drop-shadow, sin shimmer animation */}
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
              transition: 'width 0.1s linear',
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
