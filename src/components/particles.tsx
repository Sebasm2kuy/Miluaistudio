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
  type: 'dot' | 'sparkle'
}

function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    width: Math.random() * 3 + 0.5,
    height: Math.random() * 3 + 0.5,
    left: Math.random() * 100,
    top: Math.random() * 100,
    opacity: Math.random() * 0.4 + 0.05,
    duration: Math.random() * 12 + 6,
    delay: Math.random() * 12,
    type: Math.random() > 0.8 ? 'sparkle' : 'dot',
  }))
}

export default function Particles() {
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    const count = window.innerWidth < 768 ? 15 : 35
    setParticles(generateParticles(count))
  }, [])

  if (particles.length === 0) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-[-5] overflow-hidden">
      {particles.map((p) => (
        p.type === 'sparkle' ? (
          <div
            key={p.id}
            className="absolute"
            style={{
              width: `${p.width + 2}px`,
              height: `${p.height + 2}px`,
              left: `${p.left}%`,
              top: `${p.top}%`,
              opacity: p.opacity,
              background: '#fcf6ba',
              clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
              filter: 'blur(0.5px)',
              animation: `float ${p.duration}s linear infinite, breathe ${p.duration * 0.8}s ease-in-out infinite`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ) : (
          <div
            key={p.id}
            className="absolute rounded-full"
            style={{
              width: `${p.width}px`,
              height: `${p.height}px`,
              left: `${p.left}%`,
              top: `${p.top}%`,
              opacity: p.opacity,
              background: 'radial-gradient(circle, #fcf6ba 0%, transparent 80%)',
              filter: 'blur(0.5px)',
              animation: `float ${p.duration}s linear infinite`,
              animationDelay: `${p.delay}s`,
            }}
          />
        )
      ))}
    </div>
  )
}
