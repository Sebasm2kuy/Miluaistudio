'use client'
import { useEffect, useState } from 'react'

const BACKGROUND_PHOTOS = [
  '/Miluaistudio/gallery/gallery1.jpg',
  '/Miluaistudio/gallery/gallery2.jpg',
  '/Miluaistudio/gallery/gallery3.jpg',
  '/Miluaistudio/gallery/gallery4.jpg',
]

export default function BackgroundSlideshow() {
  const [currentIdx, setCurrentIdx] = useState(0)
  const [fadeIn, setFadeIn] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setFadeIn(false)
      setTimeout(() => {
        setCurrentIdx((prev) => (prev + 1) % BACKGROUND_PHOTOS.length)
        setFadeIn(true)
      }, 600)
    }, 9000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed inset-0 z-[-10] flex items-center justify-center bg-black">
      <img
        key={currentIdx}
        src={BACKGROUND_PHOTOS[currentIdx]}
        alt=""
        draggable={false}
        className="max-w-[95vw] sm:max-w-[90vw] max-h-[80vh] sm:max-h-[85vh] object-contain rounded-2xl sm:rounded-3xl md:rounded-[3rem] shadow-[0_0_80px_rgba(0,0,0,0.9),0_0_30px_rgba(184,134,11,0.15)] transition-all duration-[600ms]"
        style={{
          filter: 'contrast(1.05) brightness(0.8) saturate(0.9)',
          opacity: fadeIn ? 1 : 0,
          transform: fadeIn ? 'scale(1)' : 'scale(1.02)',
          border: '1px solid rgba(212, 175, 55, 0.08)',
        }}
      />
      {/* Bottom gradient */}
      <div className="fixed bottom-0 left-0 right-0 h-40 sm:h-56 bg-gradient-to-t from-black via-black/60 to-transparent pointer-events-none" />
      {/* Top gradient */}
      <div className="fixed top-0 left-0 right-0 h-32 sm:h-48 bg-gradient-to-b from-black/50 to-transparent pointer-events-none" />
      {/* Side vignette */}
      <div className="fixed inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.6) 100%)'
      }} />
    </div>
  )
}
