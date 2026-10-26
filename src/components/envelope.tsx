'use client'
import { useState, useCallback } from 'react'
import { useConfig } from '@/hooks/useConfig'
import MiniInvitation, { miniFromConfig } from '@/components/mini-invitation'

interface EnvelopeProps { onOpen: () => void }

export default function Envelope({ onOpen }: EnvelopeProps) {
  const cfg = useConfig()
  const [exiting, setExiting] = useState(false)
  const light = cfg.estilos.modoClaro === true

  // Las demos renderizan la invitación en vivo; la invitación real conserva su imagen configurada
  const useLiveCover = Boolean(cfg.estilos.adorno)

  const handleOpen = useCallback(() => {
    if (exiting) return
    setExiting(true)
    onOpen()
  }, [exiting, onOpen])

  return (
    <div
      onClick={handleOpen}
      className="fixed inset-0 z-[200] cursor-pointer flex items-center justify-center"
      style={{
        background: light ? cfg.colores.fondo : '#000',
        opacity: exiting ? 0 : 1,
        transition: 'opacity 0.6s ease',
        padding: 'clamp(12px, 3vw, 48px)',
      }}
    >
      <div
        className="relative"
        style={{ animation: 'fadeIn 1.5s ease forwards' }}
      >
        {/* Glow detrás de la invitación */}
        <div
          className="absolute rounded-2xl"
          style={{
            inset: '-20px',
            background: 'radial-gradient(ellipse, color-mix(in srgb, var(--theme-accent-light, var(--theme-accent-light, #d4af37)) 15%, transparent) 0%, transparent 60%)',
            animation: 'breathe 3s ease-in-out infinite',
          }}
        />

        {useLiveCover ? (
          <div
            className="relative z-10 overflow-hidden rounded-lg"
            style={{
              width: 'min(78vw, 58vh, 420px)',
              aspectRatio: '10 / 16.5',
              boxShadow: '0 0 44px color-mix(in srgb, var(--theme-accent-light, #d4af37) 16%, transparent), 0 10px 36px rgba(0,0,0,0.30)',
              border: '1px solid color-mix(in srgb, var(--theme-accent-light, #d4af37) 12%, transparent)',
            }}
          >
            <MiniInvitation data={miniFromConfig(cfg)} variant="cover" />
          </div>
        ) : (
          <picture>
            {cfg.invitacion.imagen.toLowerCase().endsWith(".webp") && <source srcSet={cfg.invitacion.imagen} type="image/webp" />}
            <img
              src={cfg.invitacion.imagenFallback}
              alt={`Invitación de ${cfg.evento.tipo} - ${cfg.evento.nombre}`}
              draggable={false}
              className="object-contain rounded-lg relative z-10"
              style={{
                display: 'block',
                maxWidth: 'calc(100vw - 24px)',
                maxHeight: 'calc(100vh - 24px)',
                boxShadow: '0 0 40px color-mix(in srgb, var(--theme-accent-light, var(--theme-accent-light, #d4af37)) 15%, transparent), 0 8px 32px rgba(0,0,0,0.4)',
                border: '1px solid color-mix(in srgb, var(--theme-accent-light, var(--theme-accent-light, #d4af37)) 10%, transparent)',
              }}
            />
          </picture>
        )}
      </div>

      <p
        className="fixed bottom-6 sm:bottom-12 left-0 right-0 text-center text-[10px] sm:text-xs uppercase tracking-[0.3em] sm:tracking-[0.5em] font-light"
        style={{
          color: light ? 'color-mix(in srgb, var(--theme-accent) 75%, var(--theme-ivory))' : 'color-mix(in srgb, var(--theme-accent-light, #d4af37) 60%, transparent)',
          opacity: 0,
          animation: 'fadeIn 1s ease 2s both, slideHint 2.5s ease-in-out 3s infinite',
        }}
      >
        {cfg.invitacion.textoAbrir}
      </p>
    </div>
  )
}
