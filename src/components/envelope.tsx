'use client'
import { useState, useCallback } from 'react'

interface EnvelopeProps { onOpen: () => void }

export default function Envelope({ onOpen }: EnvelopeProps) {
  const [exiting, setExiting] = useState(false)

  const handleOpen = useCallback(() => {
    if (exiting) return
    setExiting(true)
    setTimeout(onOpen, 500)
  }, [exiting, onOpen])

  return (
    <div
      onClick={handleOpen}
      className="fixed inset-0 z-[200] cursor-pointer bg-black flex items-center justify-center p-5 sm:p-8 md:p-12"
      style={{ opacity: exiting ? 0 : 1, transition: 'opacity 0.5s ease' }}
    >
      <img
        src="/Miluaistudio/invitacion-vertical.png"
        alt="Invitación XV Años - Milagros"
        draggable={false}
        className="max-w-full max-h-full object-contain rounded-lg"
        style={{ animation: 'fadeIn 1.5s ease forwards' }}
      />

      <p
        className="fixed bottom-8 sm:bottom-12 left-0 right-0 text-center text-goldLight/60 text-[10px] sm:text-xs uppercase tracking-[0.3em] sm:tracking-[0.5em] font-light animate-slide-hint"
        style={{ animationDelay: '2s', opacity: 0, animation: 'fadeIn 1s ease 2s both, slideHint 2.5s ease-in-out 3s infinite' }}
      >
        Toca para abrir
      </p>
    </div>
  )
}
