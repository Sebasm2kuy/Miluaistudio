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

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % BACKGROUND_PHOTOS.length)
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
        className="max-w-[95vw] sm:max-w-[90vw] max-h-[80vh] sm:max-h-[85vh] object-contain rounded-2xl sm:rounded-3xl md:rounded-[3rem] shadow-[0_0_60px_rgba(0,0,0,0.8),0_0_20px_rgba(184,134,11,0.3)] border border-goldLight/20 animate-fade-in"
        style={{ filter: 'contrast(1.1) brightness(0.85)' }}
      />
      <div className="fixed bottom-0 left-0 right-0 h-32 sm:h-48 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
    </div>
  )
}
