'use client'
import { useState, useEffect } from 'react'

interface HeroProps { active: boolean }

export default function Hero({ active }: HeroProps) {
  const [shimmerOn, setShimmerOn] = useState(false)

  useEffect(() => {
    if (!active) return
    const t = setTimeout(() => setShimmerOn(true), 5500)
    return () => clearTimeout(t)
  }, [active])

  return (
    <header className={`h-screen flex flex-col items-center justify-center text-center px-4 sm:px-6 relative z-10 ${active ? 'hero-active' : ''}`}>
      {/* Dark radial vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 70% at center, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.6) 35%, rgba(0,0,0,0.3) 60%, transparent 80%)',
        }}
      />

      <div className="flex flex-col items-center relative z-10">

        {/* LINEA 1: Mis XV Años */}
        <p
          className="hero-line hero-line-1 uppercase tracking-[0.5em] sm:tracking-[0.7em] md:tracking-[1.4em] text-xs sm:text-base md:text-xl mb-5 sm:mb-8 md:mb-10 font-bold"
          style={shimmerOn ? { color: '#e8d48b', WebkitTextFillColor: undefined, filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.9))' } : { color: '#e8d48b', textShadow: '0 0 20px rgba(0,0,0,0.9), 0 0 40px rgba(184,134,11,0.3)' }}
        >
          {shimmerOn ? (
            <span className="text-shimmer text-shimmer-once" style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.9))' }}>Mis XV Años</span>
          ) : 'Mis XV Años'}
        </p>

        {/* LINEA 2: Milagros */}
        <h1 className="hero-line hero-line-2 font-cursive text-6xl sm:text-8xl md:text-9xl lg:text-[11rem] leading-none mb-5 sm:mb-8 md:mb-10">
          {shimmerOn ? (
            <span className="text-shimmer text-shimmer-once" style={{ filter: 'drop-shadow(0 0 30px rgba(0,0,0,0.95)) drop-shadow(0 0 60px rgba(0,0,0,0.6)) drop-shadow(0 0 80px rgba(184,134,11,0.25))' }}>Milagros</span>
          ) : (
            <span style={{ color: '#fcf6ba', textShadow: '0 0 30px rgba(0,0,0,0.95), 0 0 60px rgba(0,0,0,0.5), 0 0 80px rgba(184,134,11,0.2)' }}>Milagros</span>
          )}
        </h1>

        {/* LINEA 3: Línea decorativa */}
        <div
          className="hero-line hero-line-3 w-28 sm:w-44 md:w-72 h-px mx-auto mb-5 sm:mb-8 md:mb-10"
          style={{
            background: 'linear-gradient(90deg, transparent, #fcf6ba, #d4af37, #fcf6ba, transparent)',
            boxShadow: '0 0 12px rgba(252,246,186,0.4), 0 0 24px rgba(212,175,55,0.2)',
          }}
        />

        {/* LINEA 4: Fecha */}
        <p
          className="hero-line hero-line-4 font-serif italic text-base sm:text-xl md:text-2xl lg:text-4xl tracking-[0.08em] sm:tracking-[0.12em] md:tracking-[0.2em]"
          style={shimmerOn ? undefined : { color: '#e8d48b', textShadow: '0 0 20px rgba(0,0,0,0.9), 0 0 40px rgba(184,134,11,0.3)' }}
        >
          {shimmerOn ? (
            <span className="text-shimmer text-shimmer-once" style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.9)) drop-shadow(0 0 20px rgba(184,134,11,0.3))' }}>
              Sábado 22 de Agosto<span className="mx-2 sm:mx-3 md:mx-4" style={{ WebkitTextFillColor: 'rgba(252,246,186,0.4)' }}>&bull;</span>2026
            </span>
          ) : (
            <>Sábado 22 de Agosto<span className="mx-2 sm:mx-3 md:mx-4" style={{ color: 'rgba(252,246,186,0.4)' }}>&bull;</span>2026</>
          )}
        </p>

        {/* LINEA 5: Salón My Father */}
        <p
          className="hero-line hero-line-5 mt-3 sm:mt-5 md:mt-6 text-[11px] sm:text-sm md:text-base uppercase tracking-[0.35em] sm:tracking-[0.55em] md:tracking-[0.7em] font-bold"
          style={shimmerOn ? undefined : { color: '#e8d48b', textShadow: '0 0 20px rgba(0,0,0,0.9), 0 0 40px rgba(184,134,11,0.3)' }}
        >
          {shimmerOn ? (
            <span className="text-shimmer text-shimmer-once" style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.9)) drop-shadow(0 0 16px rgba(184,134,11,0.3))' }}>
              Salón My Father &bull; Montevideo
            </span>
          ) : (
            'Salón My Father \u2022 Montevideo'
          )}
        </p>
      </div>

      {/* Scroll indicator */}
      <div className="hero-scroll absolute bottom-32 sm:bottom-36 flex flex-col items-center gap-2.5">
        <p
          className="text-[10px] sm:text-xs uppercase tracking-[0.35em] sm:tracking-[0.45em] font-light animate-slide-hint"
          style={{ color: '#e8d48b' }}
        >
          Desliza
        </p>
        <div style={{ animation: 'mouseWheelBounce 2.2s ease-in-out infinite' }}>
          <div className="w-5 h-8 sm:w-6 sm:h-9 border border-goldLight/40 rounded-full flex justify-center pt-1.5"
            style={{ boxShadow: '0 0 12px rgba(0,0,0,0.6), 0 0 6px rgba(212,175,55,0.15)' }}>
            <div className="w-1 h-2 bg-goldLight/80 rounded-full animate-breathe" />
          </div>
        </div>
      </div>
    </header>
  )
}
