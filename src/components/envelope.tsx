'use client'
import { useState, useCallback } from 'react'

interface EnvelopeProps { onOpen: () => void }

export default function Envelope({ onOpen }: EnvelopeProps) {
  const [exiting, setExiting] = useState(false)

  const handleOpen = useCallback(() => {
    if (exiting) return
    setExiting(true)
    onOpen()
  }, [exiting, onOpen])

  return (
    <div
      onClick={handleOpen}
      className="fixed inset-0 z-[200] cursor-pointer bg-black flex items-center justify-center"
      style={{
        opacity: exiting ? 0 : 1,
        transition: 'opacity 0.6s ease',
        padding: 'clamp(12px, 3vw, 48px)',
      }}
    >
      <div
        className="relative"
        style={{ animation: 'fadeIn 1.5s ease forwards' }}
      >
        {/* Glow dorado pulsante detras de la imagen */}
        <div
          className="absolute rounded-2xl"
          style={{
            inset: '-20px',
            background: 'radial-gradient(ellipse, rgba(212,175,55,0.15) 0%, transparent 60%)',
            animation: 'breathe 3s ease-in-out infinite',
          }}
        />

        <img
          src="/Miluaistudio/invitacion-vertical.png"
          alt="Invitación XV Años - Milagros"
          draggable={false}
          className="object-contain rounded-lg relative z-10"
          style={{
            display: 'block',
            maxWidth: 'calc(100vw - 24px)',
            maxHeight: 'calc(100vh - 24px)',
            boxShadow: '0 0 40px rgba(212,175,55,0.15), 0 8px 32px rgba(0,0,0,0.4)',
            border: '1px solid rgba(212,175,55,0.1)',
          }}
        />
      </div>

      <p
        className="fixed bottom-6 sm:bottom-12 left-0 right-0 text-center text-goldLight/60 text-[10px] sm:text-xs uppercase tracking-[0.3em] sm:tracking-[0.5em] font-light"
        style={{ opacity: 0, animation: 'fadeIn 1s ease 2s both, slideHint 2.5s ease-in-out 3s infinite' }}
      >
        Toca para abrir
      </p>
    </div>
  )
}
