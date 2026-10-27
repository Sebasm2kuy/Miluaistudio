'use client'
import { useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useConfig } from '@/hooks/useConfig'

export default function Footer() {
  const cfg = useConfig()
  const router = useRouter()
  const clickCount = useRef(0)
  const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleFraseClick = useCallback(() => {
    if (cfg.modoDemo) return
    clickCount.current++
    if (clickTimer.current) clearTimeout(clickTimer.current)
    clickTimer.current = setTimeout(() => { clickCount.current = 0 }, 2000)

    if (clickCount.current >= 5) {
      clickCount.current = 0
      router.push('/Miluaistudio/admin/')
    }
  }, [cfg.modoDemo])

  const light = cfg.estilos.modoClaro === true
  const shimmer = light ? '' : ' text-shimmer text-shimmer-once'
  const glow = light
    ? { textShadow: '0 1px 8px rgba(255,255,255,0.6)', color: 'var(--theme-accent)' }
    : { textShadow: '0 0 30px rgba(0,0,0,0.95)' }
  const glowSoft = light
    ? { textShadow: '0 1px 6px rgba(255,255,255,0.6)', color: 'var(--theme-accent-soft, var(--theme-accent))' }
    : { textShadow: '0 0 20px rgba(0,0,0,0.95)' }

  return (
    <footer className="text-center py-16 sm:py-24 md:py-36 flex flex-col items-center relative z-10">
      {/* Overlay semitransparente para legibilidad (oscuro u claro según tema) */}
      <div
        className="absolute inset-0"
        style={{
          background: light
            ? 'linear-gradient(180deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.55) 50%, rgba(255,255,255,0.7) 100%)'
            : 'linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.75) 50%, rgba(0,0,0,0.9) 100%)',
        }}
      />
      <div className={`css-fade-up flex flex-col items-center relative z-10`}>
        <p
          className={`font-cursive text-5xl sm:text-7xl md:text-8xl mb-4 sm:mb-6${shimmer}`}
          style={glow}
        >
          {cfg.footer.apodo}
        </p>

        <div className="flex items-center gap-3 sm:gap-4 mb-5 sm:mb-6">
          <div className="h-px w-12 sm:w-16 md:w-20" style={{ background: 'linear-gradient(90deg, transparent, var(--theme-highlight, #fcf6ba), var(--theme-accent-light, #d4af37))' }} />
          <div className="w-1.5 h-1.5 rotate-45 bg-goldLight/70" />
          <div className="h-px w-12 sm:w-16 md:w-20" style={{ background: 'linear-gradient(90deg, var(--theme-accent-light, #d4af37), var(--theme-highlight, #fcf6ba), transparent)' }} />
        </div>

        <p
          className={`uppercase tracking-[0.4em] sm:tracking-[0.6em] md:tracking-[0.8em] text-sm sm:text-sm md:text-base font-bold${shimmer}`}
          style={glowSoft}
        >
          {cfg.footer.ubicacion}
        </p>

        <p
          className={`mt-5 sm:mt-6 md:mt-8 text-base sm:text-base md:text-lg font-serif italic cursor-default select-none${shimmer}`}
          style={glowSoft}
          onClick={handleFraseClick}
        >
          {cfg.footer.frase}
        </p>

        <a
          href={cfg.evento.hashtagUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 sm:mt-10 md:mt-14 flex items-center gap-2 sm:gap-3 group"
        >
          {/* Elegant Instagram icon */}
          <svg
            viewBox="0 0 24 24"
            className="w-5 h-5 sm:w-6 sm:h-6 text-goldLight/80 group-hover:text-goldLight transition-colors duration-300"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="2" y="2" width="20" height="20" rx="5" />
            <circle cx="12" cy="12" r="5" />
            <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none" />
          </svg>
          <p className={`font-cursive text-xl sm:text-xl md:text-2xl tracking-[0.15em] sm:tracking-[0.25em] group-hover:opacity-90 transition-opacity duration-300${shimmer}`} style={light ? { color: 'var(--theme-accent)' } : undefined}>
            {cfg.evento.hashtag}
          </p>
        </a>
      </div>
    </footer>
  )
}
