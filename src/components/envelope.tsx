'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useCallback } from 'react'

interface EnvelopeProps { onOpen: () => void }

export default function Envelope({ onOpen }: EnvelopeProps) {
  const [loaded, setLoaded] = useState(false)
  const [opened, setOpened] = useState(false)

  const handleOpen = useCallback(() => {
    if (opened) return
    setOpened(true)
    setTimeout(onOpen, 800)
  }, [opened, onOpen])

  return (
    <AnimatePresence>
      {!opened && (
        <motion.div
          key="envelope"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="fixed inset-0 z-[200] cursor-pointer overflow-hidden"
          onClick={handleOpen}
        >
          {/* Fondo negro */}
          <div className="absolute inset-0 bg-black" />

          {/* Imagen — centrada con absolute desde el frame 1, sin transforms */}
          <div className="absolute inset-0 p-4 sm:p-8 md:p-12">
            <picture>
              <source media="(max-width: 767px)" srcSet="/Miluaistudio/invitacion-vertical.webp" type="image/webp" />
              <source media="(max-width: 767px)" srcSet="/Miluaistudio/invitacion-vertical.png" />
              <source media="(min-width: 768px) and (max-width: 1023px)" srcSet="/Miluaistudio/invitacion-vertical.webp" type="image/webp" />
              <source media="(min-width: 768px) and (max-width: 1023px)" srcSet="/Miluaistudio/invitacion-vertical.png" />
              <source srcSet="/Miluaistudio/invitacion.webp" type="image/webp" />
              <img
                src="/Miluaistudio/invitacion.png"
                alt=""
                draggable={false}
                onLoad={() => setLoaded(true)}
                className="absolute left-1/2 top-1/2 max-w-[calc(100%-2rem)] sm:max-w-[calc(100%-4rem)] md:max-w-[calc(100%-6rem)] max-h-[calc(100%-2rem)] sm:max-h-[calc(100%-4rem)] md:max-h-[calc(100%-6rem)] object-contain rounded-lg"
                style={{
                  transform: 'translate(-50%, -50%)',
                  opacity: loaded ? 1 : 0,
                  transition: 'opacity 1.5s ease',
                }}
              />
            </picture>
          </div>

          {/* Hint "Toca para abrir" */}
          <div
            style={{
              opacity: loaded ? 1 : 0,
              transition: 'opacity 1s ease 2.5s',
            }}
            className="absolute bottom-8 sm:bottom-12 md:bottom-16 left-0 right-0 text-center"
          >
            <p className="text-goldLight/60 text-[10px] sm:text-xs md:text-sm uppercase tracking-[0.3em] sm:tracking-[0.5em] font-light animate-slide-hint">
              Toca para abrir
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
