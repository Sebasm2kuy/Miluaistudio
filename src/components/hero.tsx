'use client'
import { motion } from 'framer-motion'

function OrnamentalFlourish({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 20"
      className={`w-32 sm:w-48 md:w-72 ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0 10 C30 10, 40 3, 70 3 C90 3, 95 10, 100 10 C105 10, 110 3, 130 3 C160 3, 170 10, 200 10"
        stroke="url(#goldGrad)"
        strokeWidth="0.5"
        fill="none"
        opacity="0.4"
      />
      <circle cx="100" cy="10" r="2" fill="#d4af37" opacity="0.5" />
      <circle cx="70" cy="3" r="1" fill="#d4af37" opacity="0.3" />
      <circle cx="130" cy="3" r="1" fill="#d4af37" opacity="0.3" />
      <defs>
        <linearGradient id="goldGrad" x1="0" y1="0" x2="200" y2="0">
          <stop offset="0%" stopColor="transparent" />
          <stop offset="30%" stopColor="#d4af37" />
          <stop offset="50%" stopColor="#fcf6ba" />
          <stop offset="70%" stopColor="#d4af37" />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export default function Hero() {
  return (
    <header className="h-screen flex flex-col items-center justify-center text-center px-4 sm:px-6 relative z-10">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 50, filter: 'blur(10px)' }}
        animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 1.8, ease: [0.19, 1, 0.22, 1], delay: 0.3 }}
        className="flex flex-col items-center"
      >
        {/* Top flourish */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 1.2, delay: 1.2, ease: 'easeOut' }}
        >
          <OrnamentalFlourish className="mb-6 sm:mb-10 md:mb-14" />
        </motion.div>

        {/* Mis XV Años label */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
          className="text-goldLight uppercase tracking-[0.3em] sm:tracking-[0.5em] md:tracking-[1.5em] text-[10px] sm:text-xs md:text-lg mb-4 sm:mb-6 md:mb-8 font-bold drop-shadow-lg"
        >
          Mis XV Años
        </motion.p>

        {/* Decorative diamond */}
        <motion.div
          initial={{ opacity: 0, rotate: 0 }}
          animate={{ opacity: 0.5, rotate: 45 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 bg-goldLight mb-5 sm:mb-8 md:mb-10"
        />

        {/* Name */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.4, delay: 0.6, ease: [0.19, 1, 0.22, 1] }}
          className="font-cursive text-6xl sm:text-8xl md:text-[10rem] lg:text-[13rem] leading-none mb-4 sm:mb-6 drop-shadow-2xl"
        >
          <span
            className="gold-shimmer"
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
        </motion.h1>

        {/* Decorative diamond */}
        <motion.div
          initial={{ opacity: 0, rotate: 0 }}
          animate={{ opacity: 0.5, rotate: 45 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 bg-goldLight mb-5 sm:mb-8 md:mb-10"
        />

        {/* Bottom flourish */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 1.2, delay: 1.4, ease: 'easeOut' }}
        >
          <OrnamentalFlourish className="mb-6 sm:mb-10 md:mb-14" />
        </motion.div>

        {/* Date */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1, ease: 'easeOut' }}
          className="font-serif italic text-sm sm:text-lg md:text-3xl lg:text-4xl text-goldLight tracking-[0.08em] sm:tracking-[0.12em] md:tracking-[0.25em] drop-shadow-lg"
        >
          Sábado 22 de Agosto
          <span className="mx-2 sm:mx-3 md:mx-4 text-goldLight/40">|</span>
          2026
        </motion.p>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ duration: 1.5, delay: 1.8 }}
          className="mt-3 sm:mt-4 md:mt-6 text-[9px] sm:text-[10px] md:text-xs uppercase tracking-[0.25em] sm:tracking-[0.4em] md:tracking-[0.6em] text-goldLight/70 font-light"
        >
          Salón My Father &bull; Montevideo
        </motion.p>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 2.8 }}
        className="absolute bottom-8 sm:bottom-12"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="w-5 h-8 sm:w-6 sm:h-9 border border-goldLight/30 rounded-full flex justify-center pt-1.5">
            <div className="w-1 h-2 bg-goldLight/60 rounded-full" />
          </div>
        </motion.div>
      </motion.div>
    </header>
  )
}
