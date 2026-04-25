'use client'
import { motion } from 'framer-motion'

function FooterFlourish() {
  return (
    <svg viewBox="0 0 120 16" className="w-24 sm:w-36 md:w-52 mx-auto mb-6 sm:mb-8 md:mb-10" fill="none">
      <path
        d="M0 8 Q15 2, 30 8 Q45 14, 60 8 Q75 2, 90 8 Q105 14, 120 8"
        stroke="url(#footerGold)"
        strokeWidth="0.5"
        fill="none"
        opacity="0.3"
      />
      <circle cx="60" cy="8" r="1.5" fill="#d4af37" opacity="0.4" />
      <defs>
        <linearGradient id="footerGold" x1="0" y1="0" x2="120" y2="0">
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

export default function Footer() {
  return (
    <footer className="text-center py-16 sm:py-24 md:py-40 flex flex-col items-center relative z-10">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2 }}
        className="flex flex-col items-center"
      >
        <FooterFlourish />

        <p className="font-cursive text-4xl sm:text-6xl md:text-8xl text-goldLight mb-3 sm:mb-4 md:mb-6">
          Milu
        </p>

        <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="h-px w-8 sm:w-12 md:w-16" style={{ background: 'linear-gradient(90deg, transparent, #b8860b)' }} />
          <div className="w-1.5 h-1.5 rotate-45 bg-goldLight/40" />
          <div className="h-px w-8 sm:w-12 md:w-16" style={{ background: 'linear-gradient(90deg, #b8860b, transparent)' }} />
        </div>

        <p className="text-[8px] sm:text-[9px] md:text-[11px] uppercase tracking-[0.4em] sm:tracking-[0.6em] md:tracking-[0.8em] text-gold/60 font-bold">
          Montevideo &bull; Uruguay &bull; 2026
        </p>

        <p className="mt-4 sm:mt-6 md:mt-8 text-[9px] sm:text-[10px] md:text-xs text-gold/30 italic font-serif">
          Con amor, para un día inolvidable
        </p>
      </motion.div>
    </footer>
  )
}
