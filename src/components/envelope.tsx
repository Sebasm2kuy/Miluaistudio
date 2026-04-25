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
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          className="fixed inset-0 z-[200] cursor-pointer overflow-hidden"
          onClick={handleOpen}
        >
          <motion.div
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.4, delay: 0.2, ease: [0.19, 1, 0.22, 1] }}
            className="absolute inset-0 flex items-center justify-center bg-black"
          >
            <img
              src="/Miluaistudio/invitacion.png"
              alt="Invitación XV Años - Milagros"
              className="w-full h-full object-contain"
              draggable={false}
            />
          </motion.div>

          {/* Subtle pulse hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.15, 0] }}
            transition={{ duration: 2.5, delay: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-0 bg-white pointer-events-none"
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
