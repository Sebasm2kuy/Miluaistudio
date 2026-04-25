'use client'
import { motion } from 'framer-motion'

export default function Footer() {
  return (
    <footer className="text-center py-16 sm:py-24 md:py-36 flex flex-col items-center relative z-10">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2 }}
        className="flex flex-col items-center"
      >
        <p
          className="font-cursive text-4xl sm:text-6xl md:text-8xl mb-4 sm:mb-6"
          style={{
            background: 'linear-gradient(90deg, #bf953f, #fcf6ba, #b38728, #fcf6ba, #bf953f)',
            backgroundSize: '200% auto',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            animation: 'shimmer 6s ease-in-out 1',
            filter: 'drop-shadow(0 4px 20px rgba(0,0,0,0.8))',
          }}
        >
          Milu
        </p>

        <div className="flex items-center gap-3 sm:gap-4 mb-5 sm:mb-6">
          <div className="h-px w-8 sm:w-12 md:w-16" style={{ background: 'linear-gradient(90deg, transparent, #b8860b)' }} />
          <div className="w-1.5 h-1.5 rotate-45 bg-goldLight/40" />
          <div className="h-px w-8 sm:w-12 md:w-16" style={{ background: 'linear-gradient(90deg, #b8860b, transparent)' }} />
        </div>

        <p className="text-[8px] sm:text-[9px] md:text-[11px] uppercase tracking-[0.4em] sm:tracking-[0.6em] md:tracking-[0.8em] text-gold/50 font-bold">
          Montevideo &bull; Uruguay &bull; 2026
        </p>

        <p className="mt-4 sm:mt-5 md:mt-6 text-[9px] sm:text-[10px] md:text-xs text-gold/25 italic font-serif">
          Con amor, para un día inolvidable
        </p>
      </motion.div>
    </footer>
  )
}
