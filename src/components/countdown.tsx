'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { CalendarPlus } from 'lucide-react'
import { useConfig } from '@/hooks/useConfig'

// Simple digit display — no flip animation, no perspective, no layout recalc
function FlipUnit({ value, label }: { value: number; label: string }) {
  const display = String(value).padStart(2, '0')
  const ref = useRef<HTMLSpanElement>(null)

  // Direct DOM update — skip React re-render entirely
  useEffect(() => {
    if (ref.current) {
      ref.current.textContent = display
    }
  }, [display])

  return (
    <div className="flex flex-col items-center">
      <div
        className="px-2 py-2 sm:px-3 sm:py-2.5 md:px-6 md:py-4 lg:px-8 lg:py-5 rounded-xl sm:rounded-[1.5rem] md:rounded-[2.5rem] border relative overflow-hidden"
        style={{
          background: 'var(--theme-card-bg)',
          borderColor: 'var(--theme-card-border)',
          boxShadow: 'var(--theme-card-shadow)',
        }}
      >
        <div className="absolute left-1 sm:left-2 right-1 sm:right-2 top-1/2 h-px z-10" style={{ background: 'color-mix(in srgb, var(--theme-card-strong, #3d0202) 12%, transparent)', boxShadow: '0 1px 0 rgba(255,255,255,0.35)' }} />
        <span
          ref={ref}
          className="font-light tracking-tight tabular-nums leading-none select-none text-xl sm:text-3xl md:text-4xl lg:text-5xl"
          style={{ color: 'var(--theme-card-strong)' }}
        >
          {display}
        </span>
      </div>
      <div className="text-xs sm:text-sm md:text-xs uppercase text-gold tracking-[0.15em] sm:tracking-[0.3em] md:tracking-[0.4em] font-bold mt-2 sm:mt-2 md:mt-4">
        {label}
      </div>
    </div>
  )
}

// Minimal style
function MinimalUnit({ value, label }: { value: number; label: string }) {
  const display = String(value).padStart(2, '0')
  return (
    <div className="flex flex-col items-center">
      <span className="font-light text-ivory tracking-tight tabular-nums leading-none select-none text-3xl sm:text-5xl md:text-6xl lg:text-7xl">
        {display}
      </span>
      <div className="text-[9px] sm:text-xs uppercase text-goldLight/60 tracking-[0.2em] sm:tracking-[0.3em] font-bold mt-1 sm:mt-2">
        {label}
      </div>
    </div>
  )
}

// Gold glass style
function GoldGlassUnit({ value, label }: { value: number; label: string }) {
  const display = String(value).padStart(2, '0')
  return (
    <div className="flex flex-col items-center">
      <div
        className="px-2 py-2 sm:px-4 sm:py-3 md:px-6 md:py-4 rounded-xl sm:rounded-2xl border relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(184,134,11,0.15) 0%, rgba(212,175,55,0.1) 100%)',
          borderColor: 'rgba(212,175,55,0.3)',
          boxShadow: '0 4px 24px rgba(212,175,55,0.1), inset 0 1px 0 rgba(255,255,255,0.1)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <span className="font-light text-goldLight tracking-tight tabular-nums leading-none select-none text-xl sm:text-3xl md:text-4xl lg:text-5xl">
          {display}
        </span>
      </div>
      <div className="text-[9px] sm:text-xs md:text-xs uppercase text-goldLight/70 tracking-[0.1em] sm:tracking-[0.15em] font-bold mt-1 sm:mt-2">
        {label}
      </div>
    </div>
  )
}

// Dark luxury style
function DarkLuxuryUnit({ value, label }: { value: number; label: string }) {
  const display = String(value).padStart(2, '0')
  return (
    <div className="flex flex-col items-center">
      <div
        className="px-2 py-2 sm:px-4 sm:py-3 md:px-6 md:py-4 rounded-xl sm:rounded-2xl border relative overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, rgba(30,30,30,0.95) 0%, rgba(15,15,15,0.98) 100%)',
          borderColor: 'rgba(212,175,55,0.25)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(212,175,55,0.1)',
        }}
      >
        <span className="font-light text-gold tracking-tight tabular-nums leading-none select-none text-xl sm:text-3xl md:text-4xl lg:text-5xl"
          style={{ textShadow: '0 0 20px rgba(212,175,55,0.3)' }}
        >
          {display}
        </span>
      </div>
      <div className="text-[9px] sm:text-xs md:text-xs uppercase text-gold/50 tracking-[0.1em] sm:tracking-[0.15em] font-bold mt-1 sm:mt-2">
        {label}
      </div>
    </div>
  )
}

// Neon style
function NeonUnit({ value, label }: { value: number; label: string }) {
  const display = String(value).padStart(2, '0')
  return (
    <div className="flex flex-col items-center">
      <div
        className="px-2 py-2 sm:px-4 sm:py-3 md:px-6 md:py-4 rounded-xl sm:rounded-2xl border relative overflow-hidden"
        style={{
          background: 'rgba(0,0,0,0.6)',
          borderColor: 'rgba(212,175,55,0.15)',
          boxShadow: '0 0 20px rgba(212,175,55,0.08), 0 0 40px rgba(212,175,55,0.04)',
        }}
      >
        <span
          className="font-light text-goldLight tracking-tight tabular-nums leading-none select-none text-xl sm:text-3xl md:text-4xl lg:text-5xl"
          style={{ textShadow: '0 0 8px rgba(212,175,55,0.8), 0 0 20px rgba(212,175,55,0.4), 0 0 40px rgba(212,175,55,0.2)' }}
        >
          {display}
        </span>
      </div>
      <div className="text-[9px] sm:text-xs md:text-xs uppercase text-goldLight/60 tracking-[0.1em] sm:tracking-[0.15em] font-bold mt-1 sm:mt-2"
        style={{ textShadow: '0 0 6px rgba(212,175,55,0.3)' }}
      >
        {label}
      </div>
    </div>
  )
}


function CircleUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full border sm:h-20 sm:w-20 md:h-24 md:w-24" style={{ borderColor: 'var(--theme-accent, var(--theme-accent, #b8860b))', background: 'color-mix(in srgb, var(--theme-accent, var(--theme-accent, #b8860b)) 10%, transparent)' }}>
        <span className="font-light tabular-nums leading-none text-lg sm:text-2xl md:text-3xl" style={{ color: "var(--theme-ivory, #fdfcfb)" }}>{String(value).padStart(2, '0')}</span>
      </div>
      <span className="mt-2 text-[9px] uppercase tracking-[0.18em] sm:text-xs" style={{ color: 'var(--theme-accent, var(--theme-accent, #b8860b))' }}>{label}</span>
    </div>
  )
}

function OutlineUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex min-w-0 flex-col items-center border-y py-3 sm:py-4" style={{ borderColor: 'color-mix(in srgb, var(--theme-accent, var(--theme-accent, #b8860b)) 55%, transparent)' }}>
      <span className="font-light tabular-nums leading-none text-2xl sm:text-4xl md:text-5xl" style={{ color: "var(--theme-ivory, #fdfcfb)" }}>{String(value).padStart(2, '0')}</span>
      <span className="mt-2 text-[9px] uppercase tracking-[0.18em] sm:text-xs" style={{ color: 'var(--theme-accent, var(--theme-accent, #b8860b))' }}>{label}</span>
    </div>
  )
}

const CLOCK_COMPONENTS: Record<string, React.FC<{ value: number; label: string }>> = {
  classic: FlipUnit,
  minimal: MinimalUnit,
  'gold-glass': GoldGlassUnit,
  'dark-luxury': DarkLuxuryUnit,
  neon: NeonUnit,
  circles: CircleUnit,
  outline: OutlineUnit,
}

export default function Countdown() {
  const cfg = useConfig()
  const eventMs = new Date(cfg.evento.fechaEvento + ' GMT-0300').getTime()
  const labels: Record<string, string> = cfg.countdown.labels
  const clockStyle = cfg.estilos?.modeloReloj || 'classic'
  const ClockUnit = CLOCK_COMPONENTS[clockStyle] || FlipUnit

  function calcTimeLeft() {
    const diff = eventMs - Date.now()
    if (diff <= 0) return { D: 0, H: 0, M: 0, S: 0 }
    return {
      D: Math.floor(diff / 86400000),
      H: Math.floor((diff / 3600000) % 24),
      M: Math.floor((diff / 60000) % 60),
      S: Math.floor((diff / 1000) % 60),
    }
  }

  const [timeLeft, setTimeLeft] = useState<{ D: number; H: number; M: number; S: number }>({ D: 0, H: 0, M: 0, S: 0 })

  // Update after mount to avoid SSR/hydration mismatch (React error #418).
  // Server and client must render the same initial text; Date.now() differs.
  useEffect(() => {
    setTimeLeft(calcTimeLeft())
    const timer = setInterval(() => setTimeLeft(calcTimeLeft()), 1000)
    return () => clearInterval(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventMs])

  const addToCalendar = useCallback(() => {
    const url = new URL('https://www.google.com/calendar/render')
    url.searchParams.set('action', 'TEMPLATE')
    url.searchParams.set('text', cfg.countdown.calendarioTitulo)
    const start = new Date(cfg.evento.fechaEvento.replace(' ', 'T') + ':00')
    const end = new Date(start.getTime() + 5 * 60 * 60 * 1000)
    const formatDate = (date: Date) => date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')
    url.searchParams.set('dates', `${formatDate(start)}/${formatDate(end)}`)
    url.searchParams.set('location', cfg.countdown.calendarioLocation)
    url.searchParams.set('details', cfg.countdown.calendarioDetalles)
    window.open(url.toString(), '_blank')
  }, [cfg])

  // Choose background based on clock style
  const cardBg =
    clockStyle === 'neon'
      ? 'linear-gradient(180deg, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.98) 100%)'
      : clockStyle === 'dark-luxury' || clockStyle === 'minimal'
        ? 'linear-gradient(180deg, rgba(61,2,2,0.92) 0%, rgba(30,1,1,0.95) 100%)'
        : undefined

  const cardBorder = clockStyle === 'dark-luxury' || clockStyle === 'neon'
    ? '1px solid rgba(212,175,55,0.2)'
    : undefined

  // Title color per clock style
  const titleColor =
    clockStyle === 'neon' || clockStyle === 'dark-luxury'
      ? 'var(--theme-accent-light, #d4af37)'
      : clockStyle === 'minimal'
        ? 'var(--theme-ivory, #f5f0e8)'
        : undefined

  const titleStyle = titleColor
    ? { color: titleColor, ...(clockStyle === 'neon' ? { textShadow: '0 0 10px rgba(212,175,55,0.6), 0 0 30px rgba(212,175,55,0.3)' } : {}) }
    : undefined

  return (
    <section id="detalles" className="max-w-4xl mx-auto px-3 sm:px-4 relative z-10">
      <div
        className={`css-fade-up rounded-[1.5rem] sm:rounded-[2rem] md:rounded-[4rem] p-4 sm:p-6 md:p-20 text-center relative overflow-hidden ${clockStyle === 'classic' || clockStyle === 'gold-glass' ? 'glass-card' : ''}`}
        style={{ background: cardBg, border: cardBorder }}
      >
        <h2 className="font-serif italic text-3xl sm:text-4xl md:text-5xl text-bordeaux mb-8 sm:mb-12 md:mb-16" style={titleStyle}>
          {cfg.countdown.titulo}
        </h2>
        <div className="grid grid-cols-4 gap-1 sm:gap-2 md:gap-4 stagger">
          {Object.entries(timeLeft).map(([label, val]) => (
            <div key={label} className="css-fade-up">
              <ClockUnit value={val} label={labels[label]} />
            </div>
          ))}
        </div>
        <div className={`css-fade-up mt-8 sm:mt-12 md:mt-16`}>
          <button
            onClick={addToCalendar}
            className="inline-flex items-center gap-2.5 sm:gap-3 text-gold font-bold text-sm sm:text-sm md:text-xs uppercase tracking-widest border-2 px-6 sm:px-7 md:px-10 py-3 sm:py-3 md:py-4 rounded-full hover:bg-gold/5 active:scale-95 transition-[background-color,transform] duration-200"
            style={{ borderColor: 'rgba(184, 134, 11, 0.25)' }}
          >
            <CalendarPlus size={16} strokeWidth={1.5} />
            {cfg.countdown.botonCalendario}
          </button>
        </div>
      </div>
    </section>
  )
}
