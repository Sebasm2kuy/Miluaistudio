'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface EnvelopeProps {
  isOpen: boolean
  onOpen: () => void
}

export default function Envelope({ isOpen, onOpen }: EnvelopeProps) {
  const [isAnimating, setIsAnimating] = useState(false)

  const handleOpen = () => {
    if (isAnimating) return
    setIsAnimating(true)
    onOpen()
  }

  return (
    <AnimatePresence>
      {!isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden"
          style={{ background: '#fdfcfb' }}
          exit={{
            scale: 5,
            opacity: 0,
            filter: 'blur(20px)',
          }}
          transition={{ duration: 1.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          {/* Decorative border lines */}
          <div className="absolute inset-6 sm:inset-12 border border-gold/20 rounded-sm pointer-events-none" />
          <div className="absolute inset-8 sm:inset-14 border border-gold/10 rounded-sm pointer-events-none" />

          {/* Decorative corner flourishes */}
          <div className="absolute top-8 left-8 w-12 h-12 border-t-2 border-l-2 border-gold/30" />
          <div className="absolute top-8 right-8 w-12 h-12 border-t-2 border-r-2 border-gold/30" />
          <div className="absolute bottom-8 left-8 w-12 h-12 border-b-2 border-l-2 border-gold/30" />
          <div className="absolute bottom-8 right-8 w-12 h-12 border-b-2 border-r-2 border-gold/30" />

          {/* Content */}
          <motion.div
            className="flex flex-col items-center gap-6 px-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            {/* Top text */}
            <motion.p
              className="font-[family-name:var(--font-montserrat)] text-gold text-xs sm:text-sm uppercase tracking-[0.35em] font-light"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              Invitación Especial
            </motion.p>

            {/* Decorative line */}
            <motion.div
              className="w-16 gold-line"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            />

            {/* Name */}
            <motion.h1
              className="font-[family-name:var(--font-alex-brush)] text-bordeaux text-6xl sm:text-7xl md:text-8xl lg:text-9xl text-center leading-tight"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1, duration: 1, ease: 'easeOut' }}
            >
              Milagros
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              className="font-[family-name:var(--font-playfair)] text-bordeaux/60 text-sm sm:text-base italic text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.3, duration: 0.8 }}
            >
              Te invita a celebrar
            </motion.p>

            {/* Decorative line */}
            <motion.div
              className="w-16 gold-line"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 1.5, duration: 0.6 }}
            />
          </motion.div>

          {/* Gold circle button */}
          <motion.button
            onClick={handleOpen}
            className="mt-12 w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-gold flex items-center justify-center cursor-pointer bg-transparent hover:bg-gold/5 transition-colors animate-pulse-gold"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.8, duration: 0.6, type: 'spring' }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="font-[family-name:var(--font-playfair)] text-gold text-3xl sm:text-4xl font-bold">
              M
            </span>
          </motion.button>

          {/* Bouncing CTA text */}
          <motion.p
            className="absolute bottom-10 font-[family-name:var(--font-montserrat)] text-bordeaux/40 text-xs uppercase tracking-[0.2em] animate-gentle-bounce"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.2, duration: 0.8 }}
          >
            Toca para descubrir
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
