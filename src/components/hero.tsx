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

/* Drop shadows para la entrada — simple, sin shimmer */
const goldGlow: React.CSSProperties = {
  color: '#fcf6ba',
  textShadow: '0 0 30px rgba(0,0,0,0.95), 0 0 60px rgba(0,0,0,0.5), 0 0 80px rgba(184,134,11,0.2)',
}

const textGlow: React.CSSProperties = {
  color: '#e8d48b',
  textShadow: '0 0 20px rgba(0,0,0,0.9), 0 0 40px rgba(184,134,11,0.3)',
}

export default function Hero() {
  const [shimmerOn, setShimmerOn] = useState(false)

  useEffect(() => {
    // Activar shimmer despues de que termine la entrada (2.5s de delay + 1s de anim)
    const t = setTimeout(() => setShimmerOn(true), 3500)
    return () => clearTimeout(t)
  }, [])

  return (
    <header className="h-screen flex flex-col items-center justify-center text-center px-4 sm:px-6 relative z-10"
      style={{ willChange: 'auto' }}
    >
      {/* Dark radial vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 70% at center, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.6) 35%, rgba(0,0,0,0.3) 60%, transparent 80%)',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: [0.19, 1, 0.22, 1], delay: 0.5 }}
        className="flex flex-col items-center relative z-10"
      >
        {/* Mis XV Años */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8, ease: 'easeOut' }}
          className="uppercase tracking-[0.5em] sm:tracking-[0.7em] md:tracking-[1.4em] text-xs sm:text-base md:text-xl mb-5 sm:mb-8 md:mb-10 font-bold"
          style={shimmerOn ? { ...goldShimmer, animation: 'shimmer 6s ease-in-out 1', filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.9))' } : textGlow}
        >
          Mis XV Años
        </motion.p>

        {/* Nombre */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 1, ease: [0.19, 1, 0.22, 1] }}
          className="font-cursive text-6xl sm:text-8xl md:text-9xl lg:text-[11rem] leading-none mb-5 sm:mb-8 md:mb-10"
          style={{ willChange: 'transform, opacity' }}
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

        {/* Linea decorativa */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.8, delay: 1.5, ease: 'easeOut' }}
          className="w-28 sm:w-44 md:w-72 h-px mx-auto mb-5 sm:mb-8 md:mb-10"
          style={{
            background: 'linear-gradient(90deg, transparent, #fcf6ba, #d4af37, #fcf6ba, transparent)',
            boxShadow: '0 0 12px rgba(252,246,186,0.4), 0 0 24px rgba(212,175,55,0.2)',
          }}
        />

        {/* Fecha */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.8, ease: 'easeOut' }}
          className="font-serif italic text-base sm:text-xl md:text-2xl lg:text-4xl tracking-[0.08em] sm:tracking-[0.12em] md:tracking-[0.2em]"
          style={shimmerOn ? { ...goldShimmer, animation: 'shimmer 6s ease-in-out 1', filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.9)) drop-shadow(0 0 20px rgba(184,134,11,0.3))' } : textGlow}
        >
          Sábado 22 de Agosto
          <span className="mx-2 sm:mx-3 md:mx-4" style={{ WebkitTextFillColor: 'rgba(252,246,186,0.4)' }}>&bull;</span>
          2026
        </motion.p>

        {/* Subtitulo */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.85 }}
          transition={{ duration: 1, delay: 2.2 }}
          className="mt-3 sm:mt-5 md:mt-6 text-[11px] sm:text-sm md:text-base uppercase tracking-[0.35em] sm:tracking-[0.55em] md:tracking-[0.7em] font-bold"
          style={shimmerOn ? { ...goldShimmer, animation: 'shimmer 6s ease-in-out 1', filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.9)) drop-shadow(0 0 16px rgba(184,134,11,0.3))' } : textGlow}
        >
          Salón My Father &bull; Montevideo
        </motion.p>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 3 }}
        className="absolute bottom-8 sm:bottom-12"
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="w-5 h-8 sm:w-6 sm:h-9 border border-goldLight/40 rounded-full flex justify-center pt-1.5"
            style={{ boxShadow: '0 0 12px rgba(0,0,0,0.6), 0 0 6px rgba(212,175,55,0.15)' }}>
            <div className="w-1 h-2 bg-goldLight/80 rounded-full" />
          </div>
        </motion.div>
      </motion.div>
    </header>
  )
}
