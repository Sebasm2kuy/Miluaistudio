'use client'
import { useState, useCallback } from 'react'

interface EnvelopeProps { onOpen: () => void }

export default function Envelope({ onOpen }: EnvelopeProps) {
  const [exiting, setExiting] = useState(false)

  const handleOpen = useCallback(() => {
    if (exiting) return
    setExiting(true)
    setTimeout(onOpen, 600)
  }, [exiting, onOpen])

  return (
    <div
      onClick={handleOpen}
      className="fixed inset-0 z-[200] cursor-pointer bg-black flex items-center justify-center p-5 sm:p-8 md:p-12"
      style={{ opacity: exiting ? 0 : 1, transition: 'opacity 0.6s ease' }}
    >
      {/* Imagen centrada por flex, sin transforms */}
      <img
        src="/Miluaistudio/invitacion-vertical.png"
        alt="Invitación XV Años - Milagros"
        draggable={false}
        className="max-w-full max-h-full object-contain rounded-lg"
        style={{ animation: 'fadeIn 1.8s ease forwards' }}
      />

      {/* Hint */}
      <p
        className="fixed bottom-8 sm:bottom-12 left-0 right-0 text-center text-goldLight/60 text-[10px] sm:text-xs uppercase tracking-[0.3em] sm:tracking-[0.5em] font-light animate-slide-hint"
        style={{ animation: 'fadeIn 1s ease 2.5s both' }}
      >
        Toca para abrir
      </p>
    </div>
  )
}
