'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

/* Estilos del shimmer dorado compartidos */
const goldShimmer: React.CSSProperties = {
  background: 'linear-gradient(90deg, #bf953f, #fcf6ba, #b38728, #fcf6ba, #bf953f)',
  backgroundSize: '200% auto',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
}

const goldGlow: React.CSSProperties = {
  color: '#fcf6ba',
  textShadow: '0 0 30px rgba(0,0,0,0.95), 0 0 60px rgba(0,0,0,0.5), 0 0 80px rgba(184,134,11,0.2)',
}

const textGlow: React.CSSProperties = {
  color: '#e8d48b',
  textShadow: '0 0 20px rgba(0,0,0,0.9), 0 0 40px rgba(184,134,11,0.3)',
}

/* Easing elegante */
const E = [0.22, 1, 0.36, 1] as const

interface HeroProps { active: boolean }

export default function Hero({ active }: HeroProps) {
  const [shimmerOn, setShimmerOn] = useState(false)

  useEffect(() => {
    if (!active) return
    // Activar shimmer despues de la ultima linea
    const t = setTimeout(() => setShimmerOn(true), 5500)
    return () => clearTimeout(t)
  }, [active])

  return (
    <header className="h-screen flex flex-col items-center justify-center text-center px-4 sm:px-6 relative z-10"
    >
      {/* Dark radial vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 70% at center, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.6) 35%, rgba(0,0,0,0.3) 60%, transparent 80%)',
        }}
      />

      <div className="flex flex-col items-center relative z-10">

        {/* LINEA 1: Mis XV Años */}
        <motion.p
          initial={{ opacity: 0, y: -20 }}
          animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
          transition={{ duration: 1.2, delay: 0.3, ease: E }}
          className="uppercase tracking-[0.5em] sm:tracking-[0.7em] md:tracking-[1.4em] text-xs sm:text-base md:text-xl mb-5 sm:mb-8 md:mb-10 font-bold"
          style={shimmerOn ? { ...goldShimmer, animation: 'shimmer 6s ease-in-out 1', filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.9))' } : textGlow}
        >
          Mis XV Años
        </motion.p>

        {/* LINEA 2: Milagros */}
        <motion.h1
          initial={{ opacity: 0, y: 25, scale: 0.92 }}
          animate={active ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 25, scale: 0.92 }}
          transition={{ duration: 1.4, delay: 1.3, ease: E }}
          className="font-cursive text-6xl sm:text-8xl md:text-9xl lg:text-[11rem] leading-none mb-5 sm:mb-8 md:mb-10"
        >
          <span
            style={
              shimmerOn
                ? { ...goldShimmer, animation: 'shimmer 6s ease-in-out 1', filter: 'drop-shadow(0 0 30px rgba(0,0,0,0.95)) drop-shadow(0 0 60px rgba(0,0,0,0.6)) drop-shadow(0 0 80px rgba(184,134,11,0.25))' }
                : goldGlow
            }
          >
            Milagros
          </span>
        </motion.h1>

        {/* LINEA 3: Linea decorativa */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={active ? { opacity: 1, scaleX: 1 } : { opacity: 0, scaleX: 0 }}
          transition={{ duration: 1.2, delay: 2.3, ease: E }}
          className="w-28 sm:w-44 md:w-72 h-px mx-auto mb-5 sm:mb-8 md:mb-10"
          style={{
            background: 'linear-gradient(90deg, transparent, #fcf6ba, #d4af37, #fcf6ba, transparent)',
            boxShadow: '0 0 12px rgba(252,246,186,0.4), 0 0 24px rgba(212,175,55,0.2)',
          }}
        />

        {/* LINEA 4: Fecha */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
          transition={{ duration: 1.2, delay: 3.0, ease: E }}
          className="font-serif italic text-base sm:text-xl md:text-2xl lg:text-4xl tracking-[0.08em] sm:tracking-[0.12em] md:tracking-[0.2em]"
          style={shimmerOn ? { ...goldShimmer, animation: 'shimmer 6s ease-in-out 1', filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.9)) drop-shadow(0 0 20px rgba(184,134,11,0.3))' } : textGlow}
        >
          Sábado 22 de Agosto
          <span className="mx-2 sm:mx-3 md:mx-4" style={{ WebkitTextFillColor: 'rgba(252,246,186,0.4)' }}>&bull;</span>
          2026
        </motion.p>

        {/* LINEA 5: Salón My Father */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={active ? { opacity: 0.85, y: 0 } : { opacity: 0, y: 12 }}
          transition={{ duration: 1.2, delay: 3.8, ease: E }}
          className="mt-3 sm:mt-5 md:mt-6 text-[11px] sm:text-sm md:text-base uppercase tracking-[0.35em] sm:tracking-[0.55em] md:tracking-[0.7em] font-bold"
          style={shimmerOn ? { ...goldShimmer, animation: 'shimmer 6s ease-in-out 1', filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.9)) drop-shadow(0 0 16px rgba(184,134,11,0.3))' } : textGlow}
        >
          Salón My Father &bull; Montevideo
        </motion.p>
      </div>

      {/* Scroll indicator + texto */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={active ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 1.5, delay: 5.5 }}
        className="absolute bottom-32 sm:bottom-36 flex flex-col items-center gap-2.5"
      >
        <motion.p
          animate={active ? { opacity: [0.4, 0.85, 0.4] } : { opacity: 0 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="text-[10px] sm:text-xs uppercase tracking-[0.35em] sm:tracking-[0.45em] font-light"
          style={{ color: '#e8d48b' }}
        >
          Desliza
        </motion.p>
        <motion.div
          animate={active ? { y: [0, 6, 0] } : { y: 0 }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="w-5 h-8 sm:w-6 sm:h-9 border border-goldLight/40 rounded-full flex justify-center pt-1.5"
            style={{ boxShadow: '0 0 12px rgba(0,0,0,0.6), 0 0 6px rgba(212,175,55,0.15)' }}>
            <motion.div
              animate={active ? { opacity: [0.3, 1, 0.3] } : { opacity: 0 }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
              className="w-1 h-2 bg-goldLight/80 rounded-full"
            />
          </div>
        </motion.div>
      </motion.div>
    </header>
  )
}
