'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useCallback } from 'react'

interface EnvelopeProps { onOpen: () => void }

export default function Envelope({ onOpen }: EnvelopeProps) {
  const [opened, setOpened] = useState(false)

  const handleOpen = useCallback(() => {
    if (opened) return
    setOpened(true)
    setTimeout(onOpen, 1000)
  }, [opened, onOpen])

  return (
    <AnimatePresence>
      {!opened && (
        <motion.div
          key="envelope"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="fixed inset-0 z-[200] cursor-pointer overflow-hidden"
          onClick={handleOpen}
        >
          {/* Fondo negro */}
          <div className="absolute inset-0 bg-black" />

          {/* Imagen de invitacion — entrada cinematica lenta */}
          <motion.div
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 2, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 flex items-center justify-center p-4 sm:p-8 md:p-12"
          >
            <picture>
              <source media="(max-width: 767px)" srcSet="/Miluaistudio/invitacion-vertical.webp" type="image/webp" />
              <source media="(max-width: 767px)" srcSet="/Miluaistudio/invitacion-vertical.png" />
              <source media="(min-width: 768px) and (max-width: 1023px)" srcSet="/Miluaistudio/invitacion-vertical.webp" type="image/webp" />
              <source media="(min-width: 768px) and (max-width: 1023px)" srcSet="/Miluaistudio/invitacion-vertical.png" />
              <source srcSet="/Miluaistudio/invitacion.webp" type="image/webp" />
              <img
                src="/Miluaistudio/invitacion.png"
                alt="Invitación XV Años - Milagros"
                className="max-w-full max-h-full object-contain rounded-lg"
                draggable={false}
              />
            </picture>
          </motion.div>

          {/* Hint "Toca para abrir" */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 3, ease: 'easeOut' }}
            className="absolute bottom-8 sm:bottom-12 md:bottom-16 left-1/2 -translate-x-1/2 text-center"
          >
            <p className="text-goldLight/60 text-[10px] sm:text-xs md:text-sm uppercase tracking-[0.3em] sm:tracking-[0.5em] font-light animate-slide-hint">
              Toca para abrir
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
