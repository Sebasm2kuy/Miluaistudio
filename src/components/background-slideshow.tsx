'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

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
      <div
        key={currentIdx}
        className="relative overflow-hidden rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,0.8),0_0_30px_rgba(184,134,11,0.3)] border border-goldLight/20 transition-all duration-[3000ms] ease-in-out max-w-[90vw] max-h-[85vh]"
        style={{ filter: 'contrast(1.1) brightness(0.85)' }}
      >
        <Image
          src={BACKGROUND_PHOTOS[currentIdx]}
          alt=""
          fill
          sizes="90vw"
          className="object-contain transition-opacity duration-[3000ms] ease-in-out"
          priority={false}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none rounded-[3rem]" />
      </div>
    </div>
  )
}
