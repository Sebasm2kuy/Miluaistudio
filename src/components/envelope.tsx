'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

interface EnvelopeProps {
  onOpen: () => void
}

export default function Envelope({ onOpen }: EnvelopeProps) {
  const [closing, setClosing] = useState(false)

  const handleOpen = () => {
    setClosing(true)
    setTimeout(onOpen, 1800)
  }

  return (
    <AnimatePresence>
      {!closing ? (
        <motion.div
          key="envelope"
          exit={{ scale: 5, opacity: 0, filter: 'blur(40px)' }}
          transition={{ duration: 1.8, ease: [0.19, 1, 0.22, 1] }}
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center p-6 text-center bg-ivory overflow-hidden"
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            <p className="text-gold uppercase tracking-[1em] text-[10px] mb-10 font-bold italic opacity-60">
              Invitación Especial
            </p>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.6, ease: [0.19, 1, 0.22, 1] }}
            className="font-cursive text-8xl md:text-[14rem] text-bordeaux mb-16 drop-shadow-2xl"
          >
            Milagros
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 1.2, ease: [0.19, 1, 0.22, 1] }}
            className="relative group cursor-pointer"
            onClick={handleOpen}
          >
            <div className="absolute inset-0 bg-goldLight rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity animate-pulse" />
            <button className="relative w-36 h-36 md:w-56 md:h-56 rounded-full border-8 border-white flex items-center justify-center text-6xl md:text-9xl font-serif italic text-white transition-all duration-500 hover:scale-110 hover:shadow-2xl"
              style={{
                background: 'linear-gradient(135deg, #8a6b0d 0%, #b8860b 50%, #d4af37 100%)',
                boxShadow: '0 10px 30px rgba(138, 107, 13, 0.4)',
              }}
            >
              M
            </button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 2 }}
            className="mt-16 text-bordeaux/40 text-[10px] uppercase tracking-[0.6em] font-bold animate-bounce"
          >
            Toca para descubrir
          </motion.p>
        </motion.div>
      ) : (
        <motion.div
          key="envelope-closing"
          initial={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
          animate={{ scale: 5, opacity: 0, filter: 'blur(40px)' }}
          transition={{ duration: 1.8, ease: [0.19, 1, 0.22, 1] }}
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center p-6 text-center bg-ivory overflow-hidden"
        >
          <h1 className="font-cursive text-8xl md:text-[14rem] text-bordeaux mb-16 drop-shadow-2xl">
            Milagros
          </h1>
          <div
            className="relative w-36 h-36 md:w-56 md:h-56 rounded-full border-8 border-white flex items-center justify-center text-6xl md:text-9xl font-serif italic text-white"
            style={{
              background: 'linear-gradient(135deg, #8a6b0d 0%, #b8860b 50%, #d4af37 100%)',
              boxShadow: '0 10px 30px rgba(138, 107, 13, 0.4)',
            }}
          >
            M
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
