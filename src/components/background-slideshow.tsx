'use client'
import { useEffect, useState } from 'react'

const BACKGROUND_PHOTOS = [
  '/Miluaistudio/gallery/gallery1.webp',
  '/Miluaistudio/gallery/gallery2.webp',
  '/Miluaistudio/gallery/gallery3.webp',
  '/Miluaistudio/gallery/gallery4.webp',
]

export default function BackgroundSlideshow() {
  const [currentIdx, setCurrentIdx] = useState(0)
  const [visible, setVisible] = useState(false)

  // Precargar + esperar a que termine la transicion del envelope
  useEffect(() => {
    const img = new Image()
    img.onload = () => {
      setTimeout(() => setVisible(true), 1500)
    }
    img.src = BACKGROUND_PHOTOS[0]
  }, [])

  // Ciclo
  useEffect(() => {
    if (!visible) return
    const interval = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setCurrentIdx((prev) => (prev + 1) % BACKGROUND_PHOTOS.length)
        // Esperar un poco a que la nueva imagen decodifique
        const nextImg = new Image()
        nextImg.onload = () => setVisible(true)
        nextImg.onerror = () => setVisible(true)
        nextImg.src = BACKGROUND_PHOTOS[(currentIdx + 1) % BACKGROUND_PHOTOS.length]
        // Fallback por si ya estaba en cache
        setTimeout(() => setVisible(true), 400)
      }, 600)
    }, 9000)
    return () => clearInterval(interval)
  }, [visible, currentIdx])

  return (
    <div className="fixed inset-0 z-[-10] bg-black">
      {/* Imagen centrada con absolute desde el frame 1 */}
      <img
        key={currentIdx}
        src={BACKGROUND_PHOTOS[currentIdx]}
        alt=""
        draggable={false}
        decoding="async"
        className="absolute left-1/2 top-1/2 w-[92vw] sm:w-[85vw] max-h-[78vh] sm:max-h-[84vh] object-contain rounded-2xl sm:rounded-3xl md:rounded-[3rem]"
        style={{
          transform: 'translate(-50%, -50%)',
          filter: 'contrast(1.05) brightness(0.75) saturate(0.85)',
          opacity: visible ? 1 : 0,
          transition: 'opacity 800ms ease',
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
