'use client'
import { useEffect, useState } from 'react'

const PHOTOS = [
  '/Miluaistudio/gallery/gallery1.webp',
  '/Miluaistudio/gallery/gallery2.webp',
  '/Miluaistudio/gallery/gallery3.webp',
  '/Miluaistudio/gallery/gallery4.webp',
]

export default function BackgroundSlideshow({ visible }: { visible: boolean }) {
  const [idx, setIdx] = useState(0)
  const [show, setShow] = useState(false)

  // Cuando se hace visible, mostrar la primera imagen
  useEffect(() => {
    if (visible) {
      setTimeout(() => setShow(true), 300)
    }
  }, [visible])

  // Ciclo
  useEffect(() => {
    if (!show || !visible) return
    const t = setInterval(() => {
      setShow(false)
      setTimeout(() => {
        setIdx(i => (i + 1) % PHOTOS.length)
        setTimeout(() => setShow(true), 100)
      }, 600)
    }, 9000)
    return () => clearInterval(t)
  }, [show, visible])

  return (
    <div className="fixed inset-0 z-[-10] bg-black flex items-center justify-center">
      <img
        key={idx}
        src={PHOTOS[idx]}
        alt=""
        draggable={false}
        className="w-[90vw] sm:w-[85vw] max-h-[78vh] sm:max-h-[84vh] object-contain rounded-2xl"
        style={{
          opacity: (show && visible) ? 1 : 0,
          transition: 'opacity 800ms ease',
          filter: 'brightness(0.75) saturate(0.85)',
          boxShadow: '0 0 80px rgba(0,0,0,0.9)',
          border: '1px solid rgba(212,175,55,0.06)',
        }}
      />
      <div className="fixed bottom-0 left-0 right-0 h-40 sm:h-56 bg-gradient-to-t from-black via-black/60 to-transparent pointer-events-none" />
      <div className="fixed top-0 left-0 right-0 h-32 sm:h-48 bg-gradient-to-b from-black/50 to-transparent pointer-events-none" />
      <div className="fixed inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.6) 100%)' }} />
    </div>
  )
}
