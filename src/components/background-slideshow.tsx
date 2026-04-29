'use client'
import { useEffect, useState } from 'react'

const PHOTOS = [
  '/Miluaistudio/gallery/gallery1.webp',
  '/Miluaistudio/gallery/gallery2.webp',
  '/Miluaistudio/gallery/gallery3.webp',
  '/Miluaistudio/gallery/gallery4.webp',
]

export default function BackgroundSlideshow({ visible = true }: { visible?: boolean }) {
  const [idx, setIdx] = useState(0)
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (visible) {
      setTimeout(() => setShow(true), 300)
    }
  }, [visible])

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
          border: '1px solid rgba(212,175,55,0.06)',
        }}
      />
      {/* Single combined gradient overlay instead of 3 separate divs */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: `
            linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, transparent 20%, transparent 75%, rgba(0,0,0,0.7) 100%),
            radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.5) 100%)
          `,
        }}
      />
    </div>
  )
}
