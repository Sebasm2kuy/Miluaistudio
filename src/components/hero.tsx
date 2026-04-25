'use client'

import { motion } from 'framer-motion'

export default function Hero() {
  return (
    <header className="h-screen flex flex-col items-center justify-center text-center px-4 sm:px-6 relative z-10">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 50, filter: 'blur(10px)' }}
        animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 1.8, ease: [0.19, 1, 0.22, 1], delay: 0.3 }}
      >
        <p className="text-goldLight uppercase tracking-[0.3em] sm:tracking-[0.6em] md:tracking-[1.8em] text-xs sm:text-sm md:text-2xl mb-6 sm:mb-8 font-bold drop-shadow-lg">
          Mis XV Años
        </p>

        <h1 className="font-cursive text-5xl sm:text-7xl md:text-9xl lg:text-[12rem] text-white leading-none mb-4 sm:mb-6 drop-shadow-2xl">
          <span
            style={{
              background: 'linear-gradient(90deg, #bf953f, #fcf6ba, #b38728, #fcf6ba, #bf953f)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: 'shimmer 4s linear infinite',
            }}
          >
            Milagros
          </span>
        </h1>

        <div className="w-32 sm:w-48 md:w-96 h-px mx-auto my-6 sm:my-10 md:my-16 opacity-60"
          style={{
            background: 'linear-gradient(90deg, transparent, #b8860b, transparent)',
          }}
        />

        <p className="font-serif italic text-base sm:text-xl md:text-3xl lg:text-5xl text-goldLight tracking-[0.1em] sm:tracking-[0.15em] md:tracking-[0.3em] drop-shadow-lg uppercase">
          Sábado 22 de Agosto • 2026
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 2.5 }}
        className="absolute bottom-8 sm:bottom-12"
      >
        <div className="w-px h-12 sm:h-16 mx-auto mb-3 sm:mb-4"
          style={{
            background: 'linear-gradient(180deg, transparent, #d4af37, transparent)',
          }}
        />
        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-goldLight animate-bounce mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </motion.div>
    </header>
  )
}
