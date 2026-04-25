'use client'
import { motion } from 'framer-motion'

export default function Hero() {
  return (
    <header className="h-screen flex flex-col items-center justify-center text-center px-4 sm:px-6 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.6, ease: [0.19, 1, 0.22, 1], delay: 0.3 }}
        className="flex flex-col items-center"
      >
        {/* Mis XV Años */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6, ease: 'easeOut' }}
          className="text-goldLight uppercase tracking-[0.4em] sm:tracking-[0.6em] md:tracking-[1.2em] text-[10px] sm:text-xs md:text-base mb-5 sm:mb-8 md:mb-10 font-bold drop-shadow-lg"
        >
          Mis XV Años
        </motion.p>

        {/* Nombre — protagonista absoluto */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.6, delay: 0.8, ease: [0.19, 1, 0.22, 1] }}
          className="font-cursive text-6xl sm:text-8xl md:text-9xl lg:text-[11rem] leading-none mb-5 sm:mb-8 md:mb-10 drop-shadow-2xl"
        >
          <span
            style={{
              background: 'linear-gradient(90deg, #bf953f, #fcf6ba, #b38728, #fcf6ba, #bf953f)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: 'shimmer 6s ease-in-out 1', /* plays once, not infinite */
            }}
          >
            Milagros
          </span>
        </motion.h1>

        {/* Línea decorativa simple */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 0.4, scaleX: 1 }}
          transition={{ duration: 1, delay: 1.4, ease: 'easeOut' }}
          className="w-24 sm:w-40 md:w-64 h-px mx-auto mb-5 sm:mb-8 md:mb-10"
          style={{ background: 'linear-gradient(90deg, transparent, #d4af37, transparent)' }}
        />

        {/* Fecha */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.2, ease: 'easeOut' }}
          className="font-serif italic text-sm sm:text-lg md:text-2xl lg:text-3xl text-goldLight tracking-[0.08em] sm:tracking-[0.12em] md:tracking-[0.2em] drop-shadow-lg"
        >
          Sábado 22 de Agosto
          <span className="mx-2 sm:mx-3 md:mx-4 text-goldLight/30">&bull;</span>
          2026
        </motion.p>

        {/* Subtítulo */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ duration: 1.5, delay: 1.8 }}
          className="mt-3 sm:mt-4 md:mt-5 text-[9px] sm:text-[10px] md:text-xs uppercase tracking-[0.3em] sm:tracking-[0.5em] md:tracking-[0.6em] text-goldLight/60 font-light"
        >
          Salón My Father &bull; Montevideo
        </motion.p>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 2.5 }}
        className="absolute bottom-8 sm:bottom-12"
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="w-5 h-8 sm:w-6 sm:h-9 border border-goldLight/25 rounded-full flex justify-center pt-1.5">
            <div className="w-1 h-2 bg-goldLight/50 rounded-full" />
          </div>
        </motion.div>
      </motion.div>
    </header>
  )
}
