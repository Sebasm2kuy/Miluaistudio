'use client'
import { useState, useEffect } from 'react'

/**
 * Ambient Glow — replaces 28 individual particle elements with a single
 * lightweight CSS radial gradient that slowly shifts. Zero DOM overhead.
 */
export default function Particles() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const isMobile = window.innerWidth < 768
    const delay = isMobile ? 3000 : 0
    const t = setTimeout(() => setReady(true), delay)
    return () => clearTimeout(t)
  }, [])

  if (!ready) return null

  return (
    <div
      className="fixed inset-0 pointer-events-none z-[-5] overflow-hidden"
      aria-hidden="true"
    >
      {/* Primary warm glow */}
      <div
        style={{
          position: 'absolute',
          top: '20%',
          left: '30%',
          width: '40vw',
          height: '40vw',
          maxWidth: '500px',
          maxHeight: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(212,175,55,0.08) 0%, transparent 70%)',
          animation: 'ambientShift 20s ease-in-out infinite',
        }}
      />
      {/* Secondary accent glow */}
      <div
        style={{
          position: 'absolute',
          bottom: '25%',
          right: '15%',
          width: '30vw',
          height: '30vw',
          maxWidth: '400px',
          maxHeight: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(252,246,186,0.05) 0%, transparent 70%)',
          animation: 'ambientShift 25s ease-in-out infinite reverse',
        }}
      />
    </div>
  )
}
