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
}

function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    width: Math.random() * 2.5 + 0.5,
    height: Math.random() * 2.5 + 0.5,
    left: Math.random() * 100,
    top: Math.random() * 100,
    opacity: Math.random() * 0.25 + 0.05,
    duration: Math.random() * 14 + 8,
    delay: Math.random() * 14,
  }))
}

export default function Particles() {
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    const isMobile = window.innerWidth < 768
    // Retrasar en mobile para no afectar la carga inicial
    const delay = isMobile ? 2000 : 0
    const t = setTimeout(() => {
      setParticles(generateParticles(isMobile ? 8 : 30))
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
            background: 'radial-gradient(circle, #fcf6ba 0%, transparent 80%)',
            animation: `float ${p.duration}s linear infinite`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  )
}
