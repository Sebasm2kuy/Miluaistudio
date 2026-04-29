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
  const [isMobile, setIsMobile] = useState(false)

  // Detect viewport once on mount (no resize listener — avoids re-renders)
  useEffect(() => {
    setIsMobile(window.innerWidth < 768)
  }, [])

  // Initial reveal
  useEffect(() => {
    if (visible) {
      const t = setTimeout(() => setShow(true), 300)
      return () => clearTimeout(t)
    }
  }, [visible])

  // Auto-cycle — desktop only. On mobile the image stays static.
  useEffect(() => {
    if (!show || !visible || isMobile) return

    const interval = setInterval(() => {
      setShow(false)
      const swapTimer = setTimeout(() => {
        setIdx(i => (i + 1) % PHOTOS.length)
        const revealTimer = setTimeout(() => setShow(true), 100)
        return () => clearTimeout(revealTimer)
      }, 600)
      return () => clearTimeout(swapTimer)
    }, 9000)

    return () => clearInterval(interval)
  }, [show, visible, isMobile])

  return (
    <div className="fixed inset-0 z-[-10] bg-black overflow-hidden">
      <img
        key={idx}
        src={PHOTOS[idx]}
        alt=""
        draggable={false}
        className="absolute inset-0 w-full h-full object-cover object-top"
        style={{
          opacity: (show && visible) ? 1 : 0,
          transition: isMobile
            ? 'opacity 300ms linear'
            : 'opacity 800ms ease',
          filter: 'brightness(0.7) saturate(0.8)',
          willChange: isMobile ? 'auto' : 'opacity',
        }}
      />
      {/* Single combined gradient overlay */}
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
