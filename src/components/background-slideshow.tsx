'use client'
import { useEffect, useState, useRef } from 'react'

const BACKGROUND_PHOTOS = [
  '/Miluaistudio/gallery/gallery1.webp',
  '/Miluaistudio/gallery/gallery2.webp',
  '/Miluaistudio/gallery/gallery3.webp',
  '/Miluaistudio/gallery/gallery4.webp',
]

export default function BackgroundSlideshow() {
  const [currentIdx, setCurrentIdx] = useState(0)
  const [visible, setVisible] = useState(false)
  const [imageReady, setImageReady] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  // Precargar primera imagen, cuando este lista arrancar la animacion
  useEffect(() => {
    const img = new Image()
    img.onload = () => {
      // Esperar a que el envelope termine de salir + margen
      setTimeout(() => setImageReady(true), 600)
      setTimeout(() => setVisible(true), 1200)
    }
    img.src = BACKGROUND_PHOTOS[0]
  }, [])

  // Ciclo del slideshow
  useEffect(() => {
    if (!visible) return
    const interval = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setCurrentIdx((prev) => (prev + 1) % BACKGROUND_PHOTOS.length)
        setTimeout(() => setVisible(true), 200)
      }, 600)
    }, 9000)
    return () => clearInterval(interval)
  }, [visible])

  return (
    <div className="fixed inset-0 z-[-10] flex items-center justify-center bg-black">
      <img
        key={currentIdx}
        ref={imgRef}
        src={BACKGROUND_PHOTOS[currentIdx]}
        alt=""
        draggable={false}
        className="max-w-[95vw] sm:max-w-[90vw] max-h-[80vh] sm:max-h-[85vh] object-contain rounded-2xl sm:rounded-3xl md:rounded-[3rem]"
        style={{
          filter: 'contrast(1.05) brightness(0.75) saturate(0.85)',
          opacity: visible ? 1 : 0,
          transform: visible ? 'scale(1)' : 'scale(1.02)',
          transition: 'opacity 1s ease, transform 1s ease',
          boxShadow: '0 0 80px rgba(0,0,0,0.9)',
          border: '1px solid rgba(212, 175, 55, 0.06)',
        }}
      />
      {/* Bottom gradient */}
      <div className="fixed bottom-0 left-0 right-0 h-40 sm:h-56 bg-gradient-to-t from-black via-black/60 to-transparent pointer-events-none" />
      {/* Top gradient */}
      <div className="fixed top-0 left-0 right-0 h-32 sm:h-48 bg-gradient-to-b from-black/50 to-transparent pointer-events-none" />
      {/* Vignette */}
      <div className="fixed inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.6) 100%)'
      }} />
    </div>
  )
}
