'use client'
import { useEffect, useRef, useState } from 'react'
import { useConfig } from '@/hooks/useConfig'
import { Music, VolumeX } from 'lucide-react'

/**
 * Música de fondo de la invitación: suena en loop cuando el invitado abre
 * (aprovecha el toque sobre la apertura como activación de audio) y queda
 * con un botón flotante para pausar/reactivar. Si la config no tiene
 * `musicaFondo` no renderiza nada.
 */
export default function MusicaFondo({ visible = true }: { visible?: boolean }) {
  const cfg = useConfig()
  const url = cfg.musicaFondo?.url
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [sonando, setSonando] = useState(false)

  useEffect(() => {
    if (!url) return
    const audio = new Audio(url)
    audio.loop = true
    audio.volume = 0.5
    audio.preload = 'auto'
    audioRef.current = audio

    const intentar = () => {
      audio
        .play()
        .then(() => setSonando(true))
        .catch(() => setSonando(false))
    }
    // El toque sobre la apertura animada dispara este evento dentro del gesto del usuario
    const onAbrir = () => intentar()
    // Red de seguridad: primer toque en cualquier lado (cuando la invitación abre sin apertura)
    const onPrimerToque = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null
      if (target?.closest?.('[data-milua-musica]')) return
      intentar()
      document.removeEventListener('pointerdown', onPrimerToque)
    }
    window.addEventListener('milua:abrir', onAbrir)
    document.addEventListener('pointerdown', onPrimerToque)
    return () => {
      window.removeEventListener('milua:abrir', onAbrir)
      document.removeEventListener('pointerdown', onPrimerToque)
      audio.pause()
      audio.src = ''
      audioRef.current = null
    }
  }, [url])

  if (!url) return null

  const toggle = () => {
    const audio = audioRef.current
    if (!audio) return
    if (audio.paused) {
      audio
        .play()
        .then(() => setSonando(true))
        .catch(() => setSonando(false))
    } else {
      audio.pause()
      setSonando(false)
    }
  }

  return (
    <button
      type="button"
      data-milua-musica=""
      onClick={toggle}
      aria-label={sonando ? 'Pausar la música de fondo' : 'Reproducir la música de fondo'}
      title={sonando ? 'Pausar la música' : 'Reproducir la música'}
      className="fixed bottom-[88px] left-3.5 z-[160] flex h-11 w-11 items-center justify-center rounded-full border transition-all duration-300 sm:bottom-[104px] sm:left-5 sm:h-12 sm:w-12"
      style={{
        borderColor: 'color-mix(in srgb, var(--theme-accent, #d4af37) 45%, transparent)',
        background: 'color-mix(in srgb, var(--theme-accent, #d4af37) 14%, rgba(10,10,10,0.55))',
        backdropFilter: 'blur(8px)',
        color: 'var(--theme-accent-light, #d4af37)',
        boxShadow: '0 6px 20px rgba(0,0,0,0.35)',
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? 'auto' : 'none',
        transform: visible ? 'none' : 'translateY(12px)',
        transitionProperty: 'opacity, transform',
        transitionDelay: visible ? '0.9s' : '0s',
      }}
    >
      {/* disco girando mientras suena */}
      <span
        aria-hidden="true"
        className="flex h-7 w-7 items-center justify-center rounded-full"
        style={{
          border: '1px solid color-mix(in srgb, var(--theme-accent-light, #d4af37) 40%, transparent)',
          animation: sonando ? 'miluaSpin 3.2s linear infinite' : 'none',
        }}
      >
        {sonando ? <Music size={14} strokeWidth={1.8} /> : <VolumeX size={14} strokeWidth={1.8} />}
      </span>
    </button>
  )
}
