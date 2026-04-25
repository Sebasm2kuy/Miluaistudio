'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useCallback } from 'react'

interface EnvelopeProps { onOpen: () => void }

export default function Envelope({ onOpen }: EnvelopeProps) {
  const [opened, setOpened] = useState(false)

  const handleOpen = useCallback(() => {
    if (opened) return
    setOpened(true)
    // Esperar a que termine completamente el exit antes de mostrar contenido
    setTimeout(onOpen, 1200)
  }, [opened, onOpen])

  return (
    <AnimatePresence>
      {!opened && (
        <motion.div
          key="envelope"
          exit={{ opacity: 0, scale: 1.03, filter: 'blur(8px)' }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          className="fixed inset-0 z-[200] cursor-pointer overflow-hidden"
          onClick={handleOpen}
        >
          {/* Fondo negro limpio */}
          <div className="absolute inset-0 bg-black" />

          {/* Imagen de invitacion */}
          <motion.div
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.19, 1, 0.22, 1] }}
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
            transition={{ duration: 1, delay: 2.5, ease: 'easeOut' }}
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
