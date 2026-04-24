'use client'

import { motion } from 'framer-motion'

export default function Particles() {
  const particles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    width: Math.random() * 4 + 1,
    height: Math.random() * 4 + 1,
    left: Math.random() * 100,
    top: Math.random() * 100,
    opacity: Math.random() * 0.6,
    duration: Math.random() * 10 + 5,
    delay: Math.random() * 10,
  }))

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
            filter: 'blur(1px)',
            animation: `float ${p.duration}s linear infinite`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  )
}
