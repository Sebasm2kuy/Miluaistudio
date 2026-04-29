'use client'
import { useEffect, useState, useRef } from 'react'

const PHOTOS = [
  '/Miluaistudio/gallery/gallery1.webp',
  '/Miluaistudio/gallery/gallery2.webp',
  '/Miluaistudio/gallery/gallery3.webp',
  '/Miluaistudio/gallery/gallery4.webp',
]

export default function BackgroundSlideshow({ visible = true }: { visible?: boolean }) {
  const [idx, setIdx] = useState(0)
  const [fading, setFading] = useState(false)
  const nextRef = useRef(0)

  // Preload all images on mount
  useEffect(() => {
    PHOTOS.forEach(url => {
      const img = new Image()
      img.src = url
    })
  }, [])

  // Initial reveal
  useEffect(() => {
    if (visible) {
      const t = setTimeout(() => setFading(true), 300)
      return () => clearTimeout(t)
    }
  }, [visible])

  // Auto-cycle on all devices
  useEffect(() => {
    if (!visible || !fading) return

    const interval = setInterval(() => {
      // Fade out
      setFading(false)
      setTimeout(() => {
        nextRef.current = (nextRef.current + 1) % PHOTOS.length
        setIdx(nextRef.current)
        // Fade in
        setTimeout(() => setFading(true), 50)
      }, 700)
    }, 7000)

    return () => clearInterval(interval)
  }, [visible, fading])

  return (
    <div
      className="fixed inset-0 z-[-10]"
      style={{
        backgroundColor: '#000',
        // GPU compositing for stable positioning
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
        // Use background-image for most reliable fixed positioning
        backgroundImage: `url(${PHOTOS[idx]})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center 25%',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
        opacity: fading && visible ? 1 : 0,
        transition: 'opacity 800ms ease',
        filter: 'brightness(0.65) saturate(0.75)',
      }}
    >
      {/* Gradient overlay — also GPU composited */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
          background: `
            linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, transparent 15%, transparent 70%, rgba(0,0,0,0.8) 100%),
            radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)
          `,
        }}
      />
    </div>
  )
}
