'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useCallback } from 'react'

interface EnvelopeProps {
  onOpen: () => void
}

export default function Envelope({ onOpen }: EnvelopeProps) {
  const [opened, setOpened] = useState(false)

  const handleOpen = useCallback(() => {
    if (opened) return
    setOpened(true)
    setTimeout(onOpen, 700)
  }, [opened, onOpen])

  return (
    <AnimatePresence>
      {!opened && (
        <motion.div
          key="envelope"
          exit={{ opacity: 0, scale: 1.08 }}
          transition={{ duration: 0.7, ease: 'easeInOut' }}
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center p-6 text-center bg-ivory overflow-hidden"
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            <p className="text-gold uppercase tracking-[1em] text-[10px] mb-10 font-bold italic opacity-60">
              Invitación Especial
            </p>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, delay: 0.6, ease: [0.19, 1, 0.22, 1] }}
            className="font-cursive text-8xl md:text-[14rem] text-bordeaux mb-16 drop-shadow-2xl"
          >
            Milagros
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.8, delay: 1.2, ease: [0.19, 1, 0.22, 1] }}
            className="relative group cursor-pointer"
            onClick={handleOpen}
          >
            <div className="absolute inset-0 bg-goldLight rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity animate-pulse" />
            <button
              className="relative w-36 h-36 md:w-56 md:h-56 rounded-full border-8 border-white flex items-center justify-center transition-transform duration-500 hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #8a6b0d 0%, #b8860b 50%, #d4af37 100%)',
                boxShadow: '0 10px 30px rgba(138, 107, 13, 0.4), inset 0 2px 4px rgba(255,255,255,0.3)',
              }}
            >
              <svg viewBox="0 0 100 100" className="w-28 h-28 md:w-44 md:h-44" aria-label="M">
                <defs>
                  <filter id="mShadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="rgba(0,0,0,0.35)" />
                  </filter>
                </defs>
                <text
                  x="50"
                  y="50"
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="white"
                  fontSize="58"
                  fontFamily="'Alex Brush', cursive"
                  dx="1"
                  filter="url(#mShadow)"
                >M</text>
              </svg>
            </button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, delay: 2 }}
            className="mt-16 text-bordeaux/40 text-[10px] uppercase tracking-[0.6em] font-bold animate-bounce"
          >
            Toca para descubrir
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
