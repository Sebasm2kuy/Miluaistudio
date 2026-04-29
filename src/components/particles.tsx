'use client'
import { useState, useEffect } from 'react'

/**
 * Ambient Glow — lightweight CSS radial gradients that slowly shift.
 * On mobile or when the user prefers reduced motion, the component
 * renders nothing to save GPU work.
 */
export default function Particles() {
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    const isMobile = window.innerWidth < 768
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (isMobile || prefersReducedMotion) {
      // Skip rendering entirely — no timers, no DOM
      return
    }

    // Desktop: show after a short delay to let critical content paint first
    const t = setTimeout(() => setEnabled(true), 0)
    return () => clearTimeout(t)
  }, [])

  if (!enabled) return null

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
