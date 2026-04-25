'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useCallback } from 'react'

interface EnvelopeProps { onOpen: () => void }

export default function Envelope({ onOpen }: EnvelopeProps) {
  const [opened, setOpened] = useState(false)

  const handleOpen = useCallback(() => {
    if (opened) return
    setOpened(true)
    setTimeout(onOpen, 900)
  }, [opened, onOpen])

  return (
    <AnimatePresence>
      {!opened && (
        <motion.div
          key="envelope"
          exit={{ opacity: 0, scale: 1.08, filter: 'blur(8px)' }}
          transition={{ duration: 0.9, ease: 'easeInOut' }}
          className="fixed inset-0 z-[200] cursor-pointer overflow-hidden"
          onClick={handleOpen}
        >
          {/* Background with subtle golden vignette */}
          <div className="absolute inset-0 bg-black">
            <div className="absolute inset-0" style={{
              background: 'radial-gradient(ellipse at center, transparent 40%, rgba(184, 134, 11, 0.08) 100%)'
            }} />
          </div>

          {/* Invitation images */}
          <motion.div
            initial={{ opacity: 0, scale: 1.08, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 1.8, delay: 0.3, ease: [0.19, 1, 0.22, 1] }}
            className="absolute inset-0 flex items-center justify-center p-4 sm:p-8 md:p-12"
          >
            <img
              src="/Miluaistudio/invitacion.png"
              alt="Invitación XV Años - Milagros"
              className="invitacion-h max-w-full max-h-full object-contain rounded-lg animate-golden-pulse"
              draggable={false}
            />
            <img
              src="/Miluaistudio/invitacion-vertical.png"
              alt="Invitación XV Años - Milagros"
              className="invitacion-v max-w-full max-h-full object-contain rounded-lg animate-golden-pulse"
              draggable={false}
            />
          </motion.div>

          {/* Subtle light sweep effect */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.08, 0] }}
            transition={{ duration: 3, delay: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-0 bg-white pointer-events-none"
          />

          {/* "Toca para abrir" hint */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 2.5, ease: 'easeOut' }}
            className="absolute bottom-8 sm:bottom-12 md:bottom-16 left-1/2 -translate-x-1/2 text-center"
          >
            <p className="text-goldLight/70 text-[10px] sm:text-xs md:text-sm uppercase tracking-[0.3em] sm:tracking-[0.5em] font-light animate-slide-hint">
              Toca para abrir
            </p>
            <div className="mt-3 sm:mt-4 flex justify-center">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-goldLight/50 animate-slide-hint" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
