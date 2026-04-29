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
  const [bgUrl, setBgUrl] = useState(PHOTOS[0])
  const [fading, setFading] = useState(false)

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
      setFading(true)
    }
  }, [visible])

  // Auto-cycle on all devices
  useEffect(() => {
    if (!visible || !fading) return

    const interval = setInterval(() => {
      // Fade out
      setFading(false)
      setTimeout(() => {
        setIdx(i => (i + 1) % PHOTOS.length)
        setBgUrl(PHOTOS[(idx + 1) % PHOTOS.length])
        // Fade in
        setTimeout(() => setFading(true), 50)
      }, 700)
    }, 7000)

    return () => clearInterval(interval)
  }, [visible, fading, idx])

  return (
    <div
      className="fixed inset-0 z-[-10]"
      style={{
        backgroundColor: '#000',
        transform: 'translateZ(0)', // Force GPU compositing — prevents iOS scroll shift
        // Use background-image instead of <img> — more stable on mobile scroll
        backgroundImage: `url(${bgUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center 20%', // Center horizontally, offset up to focus on face
        backgroundRepeat: 'no-repeat',
        opacity: fading && visible ? 1 : 0,
        transition: 'opacity 800ms ease',
        filter: 'brightness(0.65) saturate(0.75)',
      }}
    >
      {/* Gradient overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          transform: 'translateZ(0)',
          background: `
            linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, transparent 15%, transparent 70%, rgba(0,0,0,0.8) 100%),
            radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)
          `,
        }}
      />
    </div>
  )
}
