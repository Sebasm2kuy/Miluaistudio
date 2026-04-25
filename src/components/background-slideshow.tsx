'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

const BACKGROUND_PHOTOS = ['/Miluaistudio/fotos/foto1.jpg', '/Miluaistudio/fotos/foto2.jpg']

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
      <div className="relative w-[70vw] h-[75vh] overflow-hidden rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,0.8),0_0_30px_rgba(184,134,11,0.3)] border border-goldLight/20">
        {BACKGROUND_PHOTOS.map((src, idx) => (
          <div
            key={idx}
            className="absolute inset-0 bg-cover bg-center transition-opacity duration-[3000ms] ease-in-out"
            style={{
              backgroundImage: `url('${src}')`,
              opacity: currentIdx === idx ? 1 : 0,
              filter: 'contrast(1.1) brightness(0.85)',
              animation: currentIdx === idx ? 'kenBurns 30s ease-in-out infinite alternate' : 'none',
            }}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
      </div>
    </div>
  )
}
