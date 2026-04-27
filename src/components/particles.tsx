'use client'
import { useState, useEffect } from 'react'

interface Particle {
  id: number
  width: number
  height: number
  left: number
  top: number
  opacity: number
  duration: number
  delay: number
  glow: boolean
}

function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    width: Math.random() * 3 + 1,
    height: Math.random() * 3 + 1,
    left: Math.random() * 100,
    top: Math.random() * 100,
    opacity: Math.random() * 0.4 + 0.15,
    duration: Math.random() * 16 + 10,
    delay: Math.random() * 16,
    glow: i < Math.ceil(count * 0.35), // 35% con glow brillante
  }))
}

export default function Particles() {
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    const isMobile = window.innerWidth < 768
    const delay = isMobile ? 3000 : 0
    const t = setTimeout(() => {
      setParticles(generateParticles(isMobile ? 15 : 35))
    }, delay)
    return () => clearTimeout(t)
  }, [])

  if (particles.length === 0) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-[-5] overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            width: `${p.width}px`,
            height: `${p.height}px`,
            left: `${p.left}%`,
            top: `${p.top}%`,
            opacity: p.opacity,
            background: p.glow
              ? 'radial-gradient(circle, #fcf6ba 0%, rgba(212,175,55,0.6) 40%, transparent 80%)'
              : 'radial-gradient(circle, #fcf6ba 0%, transparent 80%)',
            boxShadow: p.glow
              ? '0 0 6px 1px rgba(212,175,55,0.3), 0 0 12px rgba(252,246,186,0.15)'
              : 'none',
            animation: `float ${p.duration}s linear infinite`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  )
}
